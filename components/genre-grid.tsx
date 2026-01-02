import Link from "next/link"
import type { Genre } from "@/lib/tmdb"

const GENRE_COLORS = {
  28: "#ef4444", // Action - Red
  12: "#f97316", // Adventure - Orange
  16: "#eab308", // Animation - Yellow
  35: "#84cc16", // Comedy - Lime
  80: "#22c55e", // Crime - Green
  99: "#06b6d4", // Documentary - Cyan
  18: "#3b82f6", // Drama - Blue
  10751: "#8b5cf6", // Family - Purple
  14: "#d946ef", // Fantasy - Fuchsia
  27: "#ec4899", // Horror - Pink
  10749: "#06b6d4", // Romance - Cyan
  878: "#0ea5e9", // Sci-Fi - Sky
  10770: "#f59e0b", // TV Movie - Amber
  53: "#f87171", // Thriller - Light Red
  10752: "#92400e", // War - Brown
  37: "#64748b", // Western - Slate
}

interface GenreGridProps {
  genres: Genre[]
}

export function GenreGrid({ genres }: GenreGridProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {genres.map((genre) => {
        const colorHex = GENRE_COLORS[genre.id as keyof typeof GENRE_COLORS] || "#6366f1"
        return (
          <Link key={genre.id} href={`/genres/${genre.id}`}>
            <div className="group relative overflow-hidden rounded-lg h-40 cursor-pointer">
              {/* Background with gradient */}
              <div
                className="absolute inset-0 bg-gradient-to-br opacity-80 group-hover:opacity-100 transition-all duration-300 ease-in-out"
                style={{
                  background: `linear-gradient(135deg, ${colorHex}20 0%, ${colorHex}40 100%)`,
                  borderColor: colorHex,
                }}
              />

              {/* Content */}
              <div className="relative h-full flex items-center justify-center p-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-all duration-300 ease-in-out">
                    {genre.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">Explore movies</p>
                </div>
              </div>

              {/* Border */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary rounded-lg transition-all duration-300 ease-in-out" />
            </div>
          </Link>
        )
      })}
    </div>
  )
}
