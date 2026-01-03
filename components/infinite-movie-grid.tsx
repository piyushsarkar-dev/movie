"use client";

import { fetchMoviesByGenreAction } from "@/app/actions";
import { Spinner } from "@/components/ui/spinner";
import type { Movie } from "@/lib/tmdb";
import { useCallback, useEffect, useRef, useState } from "react";
import { MovieCard } from "./movie-card";

interface InfiniteMovieGridProps {
	initialMovies: Movie[];
	genreId: number;
}

export function InfiniteMovieGrid({
	initialMovies,
	genreId,
}: InfiniteMovieGridProps) {
	const [movies, setMovies] = useState<Movie[]>(initialMovies);
	const [page, setPage] = useState(2);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const observerTarget = useRef<HTMLDivElement>(null);

	const loadMore = useCallback(async () => {
		if (loading || !hasMore) return;

		setLoading(true);
		try {
			const newMovies = await fetchMoviesByGenreAction(genreId, page);

			if (newMovies.length === 0) {
				setHasMore(false);
			} else {
				// Filter out duplicates
				const uniqueNewMovies = newMovies.filter(
					(movie) =>
						!movies.some((existing) => existing.id === movie.id)
				);

				if (uniqueNewMovies.length === 0 && newMovies.length > 0) {
					setPage((prev) => prev + 1);
				} else {
					setMovies((prev) => [...prev, ...uniqueNewMovies]);
					setPage((prev) => prev + 1);
				}
			}
		} catch (error) {
			console.error("Error loading more movies:", error);
		} finally {
			setLoading(false);
		}
	}, [genreId, page, loading, hasMore, movies]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					loadMore();
				}
			},
			{ threshold: 0.1 }
		);

		if (observerTarget.current) {
			observer.observe(observerTarget.current);
		}

		return () => observer.disconnect();
	}, [loadMore]);

	return (
		<div className="space-y-8">
			{movies.length > 0 ? (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
					{movies.map((movie) => (
						<MovieCard
							key={movie.id}
							movie={movie}
						/>
					))}
				</div>
			) : (
				<div className="text-center py-16">
					<p className="text-muted-foreground">
						No movies found in this genre.
					</p>
				</div>
			)}

			{hasMore && (
				<div
					ref={observerTarget}
					className="flex justify-center py-8">
					{loading && <Spinner className="size-8" />}
				</div>
			)}
		</div>
	);
}
