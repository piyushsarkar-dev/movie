import type { Movie } from "@/lib/tmdb";
import { getImageUrl } from "@/lib/tmdb";
import Image from "next/image";
import Link from "next/link";

interface MovieCardProps {
	movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
	return (
		<Link href={`/movie/${movie.id}`}>
			<div className="group cursor-pointer h-full">
				<div className="relative overflow-hidden rounded-lg aspect-[2/3] bg-card">
					<Image
						src={
							getImageUrl(movie.poster_path, "w342") ||
							"/placeholder.svg"
						}
						alt={movie.title}
						fill
						className="object-cover group-hover:scale-110 transition-all duration-300 ease-in-out"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					/>
					{/* Overlay on hover */}
					<div className="absolute inset-0 bg-gradient-overlay opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out flex flex-col justify-end p-4">
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="w-6 h-6 text-white ml-1">
									<path
										fillRule="evenodd"
										d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
						</div>
						<div className="space-y-2 w-full relative z-10">
							<h3 className="font-semibold text-foreground line-clamp-2">
								{movie.title}
							</h3>
							<div className="flex items-center gap-2">
								<span className="text-sm text-muted-foreground">
									★ {movie.vote_average.toFixed(1)}
								</span>
								<span className="text-sm text-muted-foreground">
									{new Date(movie.release_date).getFullYear()}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
}
