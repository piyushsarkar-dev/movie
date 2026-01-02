import { Navbar } from "@/components/navbar"
import { GenreGrid } from "@/components/genre-grid"
import { getGenres } from "@/lib/tmdb"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Browse Genres - Free Streaming",
  description: "Browse movies by genre. Find your favorite movies organized by category.",
}

export default async function GenresPage() {
  const genres = await getGenres()

  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-3">Browse Genres</h1>
            <p className="text-muted-foreground text-lg">
              Explore movies organized by genre. Click on any genre to see all available movies.
            </p>
          </div>

          {/* Genres Grid */}
          {genres.length > 0 ? (
            <GenreGrid genres={genres} />
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Unable to load genres. Please try again later.</p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
