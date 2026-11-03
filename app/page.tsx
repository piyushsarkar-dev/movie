import { HeroSection } from "@/components/hero-section";
import { InfiniteScrollMovies } from "@/components/infinite-scroll-movies";
import { MovieSection } from "@/components/movie-section";
import { Navbar } from "@/components/navbar";
import { TermsModal } from "@/components/terms-modal";
import {
	getLatestMovies,
	getPopularMovies,
	getTrendingMovies,
} from "@/lib/tmdb";

export default async function Home() {
	const [trendingMovies, popularMovies, latestMovies] = await Promise.all([
		getTrendingMovies("week"),
		getPopularMovies(),
		getLatestMovies(),
	]);

	return (
		<>
			<Navbar />
			<TermsModal />

			<main className="bg-background">
				<section className="max-w-7xl mx-auto px-4 pt-8 pb-6">
                  <h1 className="text-3xl font-bold">Discover your next movie</h1>
                  <p className="mt-2 text-muted-foreground">Explore trending films, new releases and popular movies. Find ratings, stories and genres in one place.</p>
                </section>
                {/* Hero Section with Featured Movie */}
				{trendingMovies.length > 0 && (
					<HeroSection movies={trendingMovies.slice(0, 10)} />
				)}

				{/* Movie Sections */}
				<div className="space-y-12 px-4 py-12 max-w-7xl mx-auto">
					<MovieSection
						title="Trending This Week"
						movies={trendingMovies.slice(0, 12)}
					/>
					<MovieSection
						title="Latest Releases"
						movies={latestMovies.slice(0, 12)}
					/>

					<div className="space-y-6">
						<h2 className="text-2xl font-bold text-foreground">
							Popular Movies
						</h2>
						<InfiniteScrollMovies initialMovies={popularMovies} />
					</div>
				</div>
			</main>
		</>
	);
}
