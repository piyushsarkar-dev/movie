import { jsonLd, siteUrl } from "@/lib/seo";
import { MovieInfo } from "@/components/movie-info";
import { MoviePlayer } from "@/components/movie-player";
import { Navbar } from "@/components/navbar";
import { RelatedMovies } from "@/components/related-movies";
import { getImageUrl, getMovieDetails, getMoviesByGenre } from "@/lib/tmdb";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface MoviePageProps {
	params: Promise<{
		id: string;
	}>;
}

export async function generateMetadata({
	params,
}: MoviePageProps): Promise<Metadata> {
	const movieId = (await params).id;
	const movie = await getMovieDetails(Number(movieId));

	if (!movie) {
		return {
			title: "Movie Not Found",
		};
	}

	return {
		title: `${movie.title}${movie.release_date ? ` (${movie.release_date.slice(0, 4)})` : ""} — Movie Details`,
		alternates: { canonical: `/movie/${movie.id}` },
		description: movie.overview || "Watch this movie online for free",
		openGraph: {
			title: movie.title,
			description: movie.overview || undefined,
			images: movie.poster_path
				? [getImageUrl(movie.poster_path)]
				: undefined,
			type: "video.movie",
			url: `/movie/${movie.id}`,
		},
	};
}

export default async function MoviePage({ params }: MoviePageProps) {
	const movieId = Number((await params).id);
	const movie = await getMovieDetails(movieId);

	if (!movie) {
		notFound();
	}

	// Get related movies from the first genre
	const relatedMovies =
		movie.genres.length > 0
			? await getMoviesByGenre(movie.genres[0].id)
			: [];

	return (
		<>
			<Navbar />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ "@context": "https://schema.org", "@type": "Movie", name: movie.title, description: movie.overview, url: `${siteUrl}/movie/${movie.id}`, ...(movie.poster_path ? { image: getImageUrl(movie.poster_path) } : {}), ...(movie.release_date ? { datePublished: movie.release_date } : {}), genre: movie.genres.map(g => g.name), ...(movie.runtime > 0 ? { duration: `PT${movie.runtime}M` } : {}) }) }} />
			<main className="bg-background min-h-screen">
				{/* Video Player Section */}
				<MoviePlayer movie={movie} />

				{/* Movie Details Section */}
				<div className="max-w-7xl mx-auto px-4 py-12">
					<div className="grid md:grid-cols-3 gap-8">
						<div className="md:col-span-2 space-y-8">
							<MovieInfo movie={movie} />
						</div>

						{/* Sidebar - Related Movies */}
						<div className="md:col-span-1">
							<RelatedMovies
								initialMovies={relatedMovies.filter(
									(m) => m.id !== movieId
								)}
								genreId={movie.genres[0]?.id || 0}
								currentMovieId={movieId}
							/>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
