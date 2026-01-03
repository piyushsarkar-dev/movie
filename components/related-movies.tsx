"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import type { Movie } from "@/lib/tmdb"
import { MovieCard } from "./movie-card"
import { fetchMoreRelatedMovies } from "@/app/actions"
import { Spinner } from "@/components/ui/spinner"

interface RelatedMoviesProps {
  initialMovies: Movie[]
  genreId: number
  currentMovieId: number
}

export function RelatedMovies({ initialMovies, genreId, currentMovieId }: RelatedMoviesProps) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies)
  const [page, setPage] = useState(2)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const newMovies = await fetchMoreRelatedMovies(genreId, page)
      
      if (newMovies.length === 0) {
        setHasMore(false)
      } else {
        // Filter out the current movie and duplicates
        const filteredNewMovies = newMovies.filter(
          (movie) => 
            movie.id !== currentMovieId && 
            !movies.some((existing) => existing.id === movie.id)
        )
        
        if (filteredNewMovies.length === 0 && newMovies.length > 0) {
             setPage((prev) => prev + 1)
        } else {
             setMovies((prev) => [...prev, ...filteredNewMovies])
             setPage((prev) => prev + 1)
        }
      }
    } catch (error) {
      console.error("Error loading more movies:", error)
    } finally {
      setLoading(false)
    }
  }, [genreId, page, loading, hasMore, currentMovieId, movies])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [loadMore])

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

      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-4">
          {loading && <Spinner className="size-6" />}
        </div>
      )}
    </div>
  )
}
