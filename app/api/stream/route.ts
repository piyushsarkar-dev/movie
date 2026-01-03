import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const movieId = searchParams.get("movieId");

	if (!movieId) {
		return new NextResponse("Missing Movie ID", { status: 400 });
	}

	const baseUrl =
		process.env.NEXT_PUBLIC_VIDSRC_BASE_URL || "https://vidsrc.xyz/embed";
	// Ensure no double slashes if env var has trailing slash
	const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
	const targetUrl = `${cleanBaseUrl}/movie/${movieId}`;

	try {
		const response = await fetch(targetUrl, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
				Referer: "https://vidsrc.xyz/",
			},
		});

		if (!response.ok) {
			return new NextResponse("Stream not found", { status: 404 });
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

		// 3. Set Security Headers
		const headers = new Headers();
		headers.set("Content-Type", "text/html");

		// CSP: Allow scripts/frames from vidsrc and self, but block others.
		// Note: We use * for media/connect because video CDNs vary and rotate.
		// We strictly limit scripts and frames to prevent ad networks.
		headers.set(
			"Content-Security-Policy",
			"default-src 'self' https://vidsrc.xyz https://vidsrc.to; " +
				"script-src 'self' 'unsafe-inline' https://vidsrc.xyz https://vidsrc.to; " +
				"style-src 'self' 'unsafe-inline' https://vidsrc.xyz https://vidsrc.to; " +
				"img-src 'self' data: https:; " +
				"media-src * blob:; " +
				"connect-src *; " +
				"frame-src 'self' https://vidsrc.xyz https://vidsrc.to; " +
				"frame-ancestors 'self';"
		);

		headers.set("X-Frame-Options", "SAMEORIGIN");
		headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
		headers.set("X-Content-Type-Options", "nosniff");

		return new NextResponse(html, {
			status: 200,
			headers: headers,
		});
	} catch (error) {
		console.error("Stream proxy error:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
