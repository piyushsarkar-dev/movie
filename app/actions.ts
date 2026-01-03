"use server";

import { getMoviesByGenre } from "@/lib/tmdb";

export async function fetchMoreRelatedMovies(genreId: number, page: number) {
	return await getMoviesByGenre(genreId, page);
}

export async function fetchMoviesByGenreAction(genreId: number, page: number) {
	return await getMoviesByGenre(genreId, page);
}

import { getPopularMovies, searchMovies } from "@/lib/tmdb";

export async function fetchMoviesBySearchAction(query: string, page: number) {
	return await searchMovies(query, page);
}

export async function fetchPopularMoviesAction(page: number) {
	return await getPopularMovies(page);
}
