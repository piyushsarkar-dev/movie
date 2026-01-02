import Image from "next/image"
import Link from "next/link"
import { Play, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Movie } from "@/lib/tmdb"
import { getBackdropUrl } from "@/lib/tmdb"

interface HeroSectionProps {
  movie: Movie
}

export function HeroSection({ movie }: HeroSectionProps) {
  const year = new Date(movie.release_date).getFullYear()

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/* Background Image */}
      <Image
        src={getBackdropUrl(movie.backdrop_path) || "/movie-backdrop.png"}
        alt={movie.title}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center px-4 sm:px-8">
        <div className="max-w-2xl space-y-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground text-balance">{movie.title}</h1>
            <div className="flex items-center gap-4 mt-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="text-primary">★</span>
                {movie.vote_average.toFixed(1)}/10
              </span>
              <span>{year}</span>
            </div>
          </div>

          <p className="text-lg text-muted-foreground line-clamp-3">{movie.overview}</p>

          <div className="flex gap-4 pt-4">
            <Link href={`/movie/${movie.id}`}>
              <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                <Play size={20} />
                Watch Now
              </Button>
            </Link>
            <Link href={`/movie/${movie.id}`}>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Info size={20} />
                More Info
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
