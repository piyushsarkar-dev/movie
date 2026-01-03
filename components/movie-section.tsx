import type { Movie } from "@/lib/tmdb"
import { MovieCard } from "./movie-card"

interface MovieSectionProps {
  title: string
  movies: Movie[]
}

export function MovieSection({ title, movies }: MovieSectionProps) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">{title}</h2>
        <div className="h-1 w-16 bg-primary rounded mt-2" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  )
}
