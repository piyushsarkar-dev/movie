import { Navbar } from "@/components/navbar"
import { MovieCard } from "@/components/movie-card"
import { searchMovies } from "@/lib/tmdb"
import type { Metadata } from "next"

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
  }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams
  const query = params.q || ""
  return {
    title: `Search Results for "${query}" - Free Streaming`,
    description: `Search results for movies matching "${query}"`,
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q || ""
  const results = query ? await searchMovies(query) : []

  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {query ? `Search Results for "${query}"` : "Search Movies"}
            </h1>
            <p className="text-muted-foreground">
              {query
                ? `Found ${results.length} movie${results.length !== 1 ? "s" : ""}`
                : "Enter a search query to find movies"}
            </p>
          </div>

          {/* Results Grid */}
          {results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground mb-4">
                {query ? "No movies found matching your search." : "Enter a movie title to search."}
              </p>
              {query && (
                <p className="text-sm text-muted-foreground">
                  Try searching for a different title or browse our popular movies on the home page.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
