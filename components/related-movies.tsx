import type { Movie } from "@/lib/tmdb"
import { MovieCard } from "./movie-card"

interface RelatedMoviesProps {
  movies: Movie[]
}

export function RelatedMovies({ movies }: RelatedMoviesProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Related Movies</h2>
        <div className="h-1 w-12 bg-primary rounded mt-2" />
      </div>

      <div className="space-y-4">
        {movies.length > 0 ? (
          movies.map((movie) => (
            <div key={movie.id} className="group">
              <div className="relative overflow-hidden rounded-lg aspect-[2/3] bg-card">
                <MovieCard movie={movie} />
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm py-8 text-center">No related movies found.</p>
        )}
      </div>
    </div>
  )
}
