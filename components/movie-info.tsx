import type { MovieDetails } from "@/lib/tmdb"

interface MovieInfoProps {
  movie: MovieDetails
}

export function MovieInfo({ movie }: MovieInfoProps) {
  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">Overview</h2>
        <p className="text-muted-foreground leading-relaxed text-lg">{movie.overview}</p>
      </section>

      {/* Details Grid */}
      <section className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Release Date</h3>
          <p className="text-foreground">
            {new Date(movie.release_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Runtime</h3>
          <p className="text-foreground">{movie.runtime} minutes</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Rating</h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl text-primary">★</span>
            <span className="text-foreground text-lg">{movie.vote_average.toFixed(1)}/10</span>
            <span className="text-muted-foreground">({movie.vote_count.toLocaleString()} votes)</span>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Status</h3>
          <p className="text-foreground capitalize">{movie.status}</p>
        </div>
      </section>

      {/* Genres */}
      {movie.genres.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Genres</h3>
          <div className="flex flex-wrap gap-2">
            {movie.genres.map((genre) => (
              <span
                key={genre.id}
                className="px-4 py-2 bg-card border border-border rounded-full text-foreground text-sm hover:bg-primary/10 transition-all duration-300 ease-in-out cursor-pointer"
              >
                {genre.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Budget & Revenue (if available) */}
      {(movie.budget > 0 || movie.revenue > 0) && (
        <section className="grid md:grid-cols-2 gap-6 pt-6 border-t border-border">
          {movie.budget > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Budget</h3>
              <p className="text-foreground">${(movie.budget / 1000000).toFixed(1)}M</p>
            </div>
          )}
          {movie.revenue > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Revenue</h3>
              <p className="text-foreground">${(movie.revenue / 1000000).toFixed(1)}M</p>
            </div>
          )}
        </section>
      )}

      {/* Content Source Notice */}
      <section className="bg-card border border-border rounded-lg p-4 mt-8">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Content Source</h3>
        <p className="text-sm text-muted-foreground">
          Movie data provided by The Movie Database (TMDB). Video content embedded from external streaming sources.
        </p>
      </section>
    </div>
  )
}
