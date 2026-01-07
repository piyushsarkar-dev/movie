const API_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL;
const BACKDROP_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BACKDROP_BASE_URL;
const VIDSRC_BASE_URL = process.env.NEXT_PUBLIC_VIDSRC_BASE_URL;

if (!API_BASE_URL || !API_KEY) {
	console.error(
		"⚠️ TMDB API configuration is missing. Please check your .env file."
	);
}

// Helper for robust fetching with retry logic
async function fetchWithRetry(
	url: string,
	options: RequestInit = {},
	retries = 3
) {
	if (!API_KEY) {
		console.error("❌ API Key is missing, skipping fetch.");
		throw new Error("API Key is missing");
	}

	try {
		const response = await fetch(url, {
			...options,
			headers: {
				...options.headers,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			// Handle specific HTTP errors
			if (response.status === 401) {
				throw new Error("Unauthorized: Invalid API Key");
			}
			if (response.status === 404) {
				throw new Error("Resource not found");
			}
			if (response.status === 429) {
				throw new Error("Rate limit exceeded");
			}
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return response;
	} catch (error) {
		if (retries > 0) {
			console.warn(
				`⚠️ Request failed, retrying... (${retries} attempts left). Error: ${error}`
			);
			await new Promise((resolve) => setTimeout(resolve, 1000));
			return fetchWithRetry(url, options, retries - 1);
		}
		console.error("❌ Fetch failed after retries:", error);
		throw error;
	}
}

export interface Movie {
	id: number;
	title: string;
	poster_path: string | null;
	backdrop_path: string | null;
	overview: string;
	release_date: string;
	genre_ids: number[];
	popularity: number;
	vote_average: number;
	vote_count: number;
}

export interface Genre {
	id: number;
	name: string;
}

export interface MovieDetails extends Movie {
	genres: Genre[];
	runtime: number;
	status: string;
	budget: number;
	revenue: number;
}

export async function getTrendingMovies(timeWindow: "day" | "week" = "week") {
	try {
		const response = await fetchWithRetry(
			`${API_BASE_URL}/trending/movie/${timeWindow}?api_key=${API_KEY}`,
			{
				next: { revalidate: 3600 },
			}
		);
		const data = await response.json();
		return data.results as Movie[];
	} catch (error) {
		console.error("Error fetching trending movies:", error);
		return [];
	}
}

export async function getLatestMovies() {
	try {
		const response = await fetchWithRetry(
			`${API_BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`,
			{
				next: { revalidate: 3600 },
			}
		);
		const data = await response.json();
		return data.results as Movie[];
	} catch (error) {
		console.error("Error fetching latest movies:", error);
		return [];
	}
}

export async function getPopularMovies(page: number = 1) {
	try {
		const response = await fetchWithRetry(
			`${API_BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`,
			{
				next: { revalidate: 3600 },
			}
		);
		const data = await response.json();
		return data.results as Movie[];
	} catch (error) {
		console.error("Error fetching popular movies:", error);
		return [];
	}
}

export async function getGenres() {
	try {
		const response = await fetchWithRetry(
			`${API_BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`,
			{
				next: { revalidate: 86400 },
			}
		);
		const data = await response.json();
		return data.genres as Genre[];
	} catch (error) {
		console.error("Error fetching genres:", error);
		return [];
	}
}

export async function searchMovies(query: string, page = 1) {
	if (!query.trim()) return [];
	try {
		const response = await fetchWithRetry(
			`${API_BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
				query
			)}&language=en-US&page=${page}`,
			{ next: { revalidate: 300 } }
		);
		const data = await response.json();
		return data.results as Movie[];
	} catch (error) {
		console.error("Error searching movies:", error);
		return [];
	}
}

export async function getMovieDetails(movieId: number) {
	if (!movieId || isNaN(movieId)) return null;
	try {
		const response = await fetchWithRetry(
			`${API_BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`,
			{
				next: { revalidate: 3600 },
			}
		);
		const data = await response.json();
		return data as MovieDetails;
	} catch (error) {
		console.error(`Error fetching movie details for ID ${movieId}:`, error);
		return null;
	}
}

export async function getMoviesByGenre(genreId: number, page = 1) {
	try {
		const response = await fetchWithRetry(
			`${API_BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=en-US&sort_by=popularity.desc&page=${page}`,
			{ next: { revalidate: 3600 } }
		);
		const data = await response.json();
		return data.results as Movie[];
	} catch (error) {
		console.error("Error fetching movies by genre:", error);
		return [];
	}
}

export function getImageUrl(path: string | null, size = "w500") {
	if (!path) return "/abstract-movie-poster.png";

	const envBase =
		process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL ||
		"https://image.tmdb.org/t/p/w500";

	// If the requested size matches the env var's implied size (w500), just use it.
	if (size === "w500" && envBase.endsWith("/w500")) {
		return `${envBase}${path}`;
	}

	// If envBase has a size at the end, replace it.
	const sizeRegex = /\/w\d+$/;
	if (sizeRegex.test(envBase)) {
		return `${envBase.replace(sizeRegex, "/" + size)}${path}`;
	}

	// Otherwise append size
	return `${envBase}/${size}${path}`;
}

export function getBackdropUrl(path: string | null) {
	if (!path) return "/movie-backdrop.png";
	const envBase =
		process.env.NEXT_PUBLIC_TMDB_BACKDROP_BASE_URL ||
		"https://image.tmdb.org/t/p/w1280";
	return `${envBase}${path}`;
}

export function getVidSrcUrl(
	mediaId: number,
	type: "movie" | "tv" = "movie",
	season?: number,
	episode?: number
) {
	const baseUrl =
		process.env.NEXT_PUBLIC_VIDSRC_BASE_URL || "https://vidsrc.cc";
	if (type === "movie") {
		return `${baseUrl}/v2/embed/movie/${mediaId}?autoPlay=true`;
	}
	if (type === "tv" && season && episode) {
		return `${baseUrl}/v2/embed/tv/${mediaId}/${season}/${episode}?autoPlay=true`;
	}
	return "#";
}
