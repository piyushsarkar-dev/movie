import Image from "next/image"
import Link from "next/link"
import type { Movie } from "@/lib/tmdb"
import { getImageUrl } from "@/lib/tmdb"

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/movie/${movie.id}`}>
      <div className="group cursor-pointer h-full">
        <div className="relative overflow-hidden rounded-lg aspect-[2/3] bg-card">
          <Image
            src={getImageUrl(movie.poster_path, "w342") || "/placeholder.svg"}
            alt={movie.title}
            fill
            className="object-cover group-hover:scale-110 transition-all duration-300 ease-in-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-overlay opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out flex items-end p-4">
            <div className="space-y-2 w-full">
              <h3 className="font-semibold text-foreground line-clamp-2">{movie.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">★ {movie.vote_average.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">{new Date(movie.release_date).getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
