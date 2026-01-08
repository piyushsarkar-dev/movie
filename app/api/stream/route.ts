import { NextRequest, NextResponse } from "next/server";

type StreamHtmlResult = {
	status: number;
	html: string;
	origin: string;
};

const STREAM_DEBOUNCE_WINDOW_MS = Number.parseInt(
	process.env.STREAM_API_DEBOUNCE_MS ?? "750",
	10
);

const STREAM_CACHE_TTL_MS = Number.parseInt(
	process.env.STREAM_API_CACHE_TTL_MS ?? "3000",
	10
);

// In-memory dedupe/cache (best-effort; survives within same Node instance only)
const inFlightByKey = new Map<
	string,
	{ startedAt: number; promise: Promise<StreamHtmlResult> }
>();

const cacheByKey = new Map<
	string,
	{ storedAt: number; result: StreamHtmlResult }
>();

function cleanupMaps(now: number) {
	// Keep this intentionally lightweight.
	for (const [key, entry] of cacheByKey.entries()) {
		if (now - entry.storedAt > STREAM_CACHE_TTL_MS) cacheByKey.delete(key);
	}
	for (const [key, entry] of inFlightByKey.entries()) {
		// Safety: if something hangs, allow retries.
		if (
			now - entry.startedAt >
			Math.max(STREAM_DEBOUNCE_WINDOW_MS * 10, 15000)
		) {
			inFlightByKey.delete(key);
		}
	}
}

function buildHtmlResponse(result: StreamHtmlResult) {
	const headers = new Headers();
	headers.set("Content-Type", "text/html");

	// Very short-lived cache hint; this primarily exists to avoid immediate refresh storms.
	headers.set("Cache-Control", `private, max-age=0, must-revalidate`);

	// CSP: Allow scripts/frames from the configured provider origin and self.
	// Note: We use * for media/connect because video CDNs vary and rotate.
	headers.set(
		"Content-Security-Policy",
		"default-src 'self' " +
			result.origin +
			"; " +
			"script-src 'self' 'unsafe-inline' " +
			result.origin +
			"; " +
			"style-src 'self' 'unsafe-inline' " +
			result.origin +
			"; " +
			"img-src 'self' data: https:; " +
			"media-src * blob:; " +
			"connect-src *; " +
			"frame-src 'self' " +
			result.origin +
			"; " +
			"frame-ancestors 'self';"
	);

	headers.set("X-Frame-Options", "SAMEORIGIN");
	headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
	headers.set("X-Content-Type-Options", "nosniff");

	return new NextResponse(result.html, {
		status: result.status,
		headers,
	});
}

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const movieId = searchParams.get("movieId");

	if (!movieId) {
		return new NextResponse("Missing Movie ID", { status: 400 });
	}

	const baseUrl =
		process.env.NEXT_PUBLIC_VIDSRC_BASE_URL || "https://vidsrc.xyz/embed";

	const buildTargetUrl = (base: string, id: string) => {
		const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;

		// Support template-style envs, e.g. https://vidsrc.cc/v2/embed/movie/{id}
		if (cleanBase.includes("{id}")) {
			return cleanBase.replaceAll("{id}", id);
		}

		// vidsrc.cc: /movie/:id is 404; embed endpoints work.
		if (cleanBase.includes("vidsrc.cc")) {
			if (cleanBase.includes("/v2/embed/movie"))
				return `${cleanBase}/${id}`;
			if (cleanBase.includes("/v2/embed"))
				return `${cleanBase}/movie/${id}`;
			if (cleanBase.includes("/embed/movie")) return `${cleanBase}/${id}`;
			if (cleanBase.includes("/embed")) return `${cleanBase}/movie/${id}`;
			return `${cleanBase}/v2/embed/movie/${id}`;
		}

		// Generic handling
		if (cleanBase.endsWith("/movie")) return `${cleanBase}/${id}`;
		return `${cleanBase}/movie/${id}`;
	};

	const targetUrl = buildTargetUrl(baseUrl, movieId);
	const requestKey = targetUrl;

	const now = Date.now();
	cleanupMaps(now);

	const cached = cacheByKey.get(requestKey);
	if (cached && now - cached.storedAt <= STREAM_CACHE_TTL_MS) {
		return buildHtmlResponse(cached.result);
	}

	const existingInFlight = inFlightByKey.get(requestKey);
	if (
		existingInFlight &&
		now - existingInFlight.startedAt <= STREAM_DEBOUNCE_WINDOW_MS
	) {
		try {
			const result = await existingInFlight.promise;
			return buildHtmlResponse(result);
		} catch {
			// Fall through to try again.
		}
	}

	try {
		const promise = (async (): Promise<StreamHtmlResult> => {
			const response = await fetch(targetUrl, {
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
					Referer: new URL(targetUrl).origin + "/",
				},
			});

			if (!response.ok) {
				return {
					status: 404,
					html: "Stream not found",
					origin: new URL(targetUrl).origin,
				};
			}

			let html = await response.text();

			// 1. Inject Base Tag to resolve relative paths to the original domain
			const urlObj = new URL(targetUrl);
			const origin = `${urlObj.protocol}//${urlObj.host}`;

			if (!html.includes("<base")) {
				html = html.replace("<head>", `<head><base href="${origin}/">`);
			}

			// 2. Inject Anti-Ad/Popup Script
			// This script overrides window.open and other common ad triggers
			const antiAdScript = `
			<script>
				(function() {
					console.log('🔒 Secure Stream Loaded - Ads Blocked');
					
					// Block popups
					window.open = function() { console.log('🚫 Popup blocked'); return null; };
					
					// Block alerts/confirms often used by scam ads
					window.alert = function() { console.log('🚫 Alert blocked'); };
					window.confirm = function() { console.log('🚫 Confirm blocked'); return true; };
					
					// Prevent site from hijacking navigation
					window.onbeforeunload = null;
					
					// Monitor and kill suspicious elements
					const observer = new MutationObserver((mutations) => {
						mutations.forEach((mutation) => {
							mutation.addedNodes.forEach((node) => {
								if (node.tagName === 'SCRIPT' || node.tagName === 'IFRAME') {
									// Check for known ad patterns (simplified)
									if (node.src && (node.src.includes('ads') || node.src.includes('tracker') || node.src.includes('analytics'))) {
										node.remove();
										console.log('🚫 Ad script removed:', node.src);
									}
								}
							});
						});
					});
					
					observer.observe(document.documentElement, { childList: true, subtree: true });
				})();
			</script>
		`;
			html = html.replace("<head>", `<head>${antiAdScript}`);

			return { status: 200, html, origin };
		})();

		inFlightByKey.set(requestKey, { startedAt: now, promise });
		const result = await promise;
		inFlightByKey.delete(requestKey);

		if (result.status === 200) {
			cacheByKey.set(requestKey, { storedAt: Date.now(), result });
		}

		return buildHtmlResponse(result);
	} catch (error) {
		inFlightByKey.delete(requestKey);
		console.error("Stream proxy error:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
