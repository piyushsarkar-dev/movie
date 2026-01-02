import { Navbar } from "@/components/navbar"
import { TermsModal } from "@/components/terms-modal"
import { MovieSection } from "@/components/movie-section"
import { HeroSection } from "@/components/hero-section"
import { getTrendingMovies, getPopularMovies, getLatestMovies } from "@/lib/tmdb"

export default async function Home() {
  const [trendingMovies, popularMovies, latestMovies] = await Promise.all([
    getTrendingMovies("week"),
    getPopularMovies(),
    getLatestMovies(),
  ])

  return (
    <>
      <Navbar />
      <TermsModal />

      <main className="bg-background">
        {/* Hero Section with Featured Movie */}
        {trendingMovies.length > 0 && <HeroSection movie={trendingMovies[0]} />}

        {/* Movie Sections */}
        <div className="space-y-12 px-4 py-12 max-w-7xl mx-auto">
          <MovieSection title="Trending This Week" movies={trendingMovies.slice(0, 12)} />
          <MovieSection title="Latest Releases" movies={latestMovies.slice(0, 12)} />
          <MovieSection title="Popular Movies" movies={popularMovies.slice(0, 12)} />
        </div>
      </main>
    </>
  )
}
