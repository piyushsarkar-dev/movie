import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { MovieCard } from "@/components/movie-card"
import { getMoviesByGenre, getGenres } from "@/lib/tmdb"
import type { Metadata } from "next"

interface GenrePageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
  const genreId = Number((await params).id)
  const genres = await getGenres()
  const genre = genres.find((g) => g.id === genreId)

  if (!genre) {
    return {
      title: "Genre Not Found",
    }
  }

  return {
    title: `${genre.name} Movies - Free Streaming`,
    description: `Browse all ${genre.name} movies available on Free Streaming`,
  }
}

export default async function GenreMoviesPage({ params }: GenrePageProps) {
  const genreId = Number((await params).id)
  const genres = await getGenres()
  const currentGenre = genres.find((g) => g.id === genreId)

  if (!currentGenre) {
    notFound()
  }

  const movies = await getMoviesByGenre(genreId)

  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Genre Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-3">{currentGenre.name}</h1>
            <p className="text-muted-foreground">
              Showing {movies.length} movies in the {currentGenre.name} genre
            </p>
          </div>

          {/* Movies Grid */}
          {movies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No movies found in this genre.</p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
