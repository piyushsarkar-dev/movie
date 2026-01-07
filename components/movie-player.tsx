"use client";

import type { MovieDetails } from "@/lib/tmdb";
import { Play } from "lucide-react";
import { useState } from "react";

interface MoviePlayerProps {
	movie: MovieDetails;
}

export function MoviePlayer({ movie }: MoviePlayerProps) {
	const [showPlayer, setShowPlayer] = useState(false);

	// Use direct URL from environment variable
	const baseUrl =
		process.env.NEXT_PUBLIC_VIDSRC_BASE_URL || "https://vidsrc.xyz/embed";

	// Construct the correct stream URL
	const getStreamUrl = (base: string, id: number) => {
		const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;

		// Specific handling for vidsrc.cc which needs /v2/embed
		if (cleanBase.includes("vidsrc.cc") && !cleanBase.includes("embed")) {
			return `${cleanBase}/v2/embed/movie/${id}`;
		}

		// Default behavior: append /movie/{id}
		return `${cleanBase}/movie/${id}`;
	};

	const streamUrl = getStreamUrl(baseUrl, movie.id);

	return (
		<div className="relative w-full bg-card">
			<div className="max-w-7xl mx-auto px-4 py-8">
				<div className="aspect-video bg-black rounded-lg overflow-hidden">
					{!showPlayer ? (
						<div
							className="w-full h-full relative group cursor-pointer"
							onClick={() => setShowPlayer(true)}>
							{/* Placeholder with play button */}
							<div className="w-full h-full bg-gradient-to-b from-black/50 to-black/80 flex items-center justify-center">
								<button className="flex items-center justify-center w-20 h-20 rounded-full bg-primary hover:bg-primary/90 transition-all duration-300 ease-in-out group-hover:scale-110 shadow-lg">
									<Play
										size={40}
										className="text-white ml-1"
										fill="white"
									/>
								</button>
							</div>

							{/* Instructions */}
							<div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-overlay flex items-end">
								<div>
									<p className="text-white font-semibold text-lg">
										Click to Watch {movie.title}
									</p>
									<p className="text-gray-300 text-sm mt-1">
										Streaming from external source •{" "}
										{Math.round(movie.runtime)} minutes
									</p>
								</div>
							</div>
						</div>
					) : (
						<iframe
							src={streamUrl}
							className="w-full h-full border-0"
							allowFullScreen
							allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
							referrerPolicy="no-referrer"
							loading="eager"
							title={movie.title}
						/>
					)}
				</div>

				{/* Player Info */}
				<div className="mt-6 space-y-3">
					<h1 className="text-3xl font-bold text-foreground">
						{movie.title}
					</h1>
					<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
						<span>
							📅{" "}
							{new Date(movie.release_date).toLocaleDateString()}
						</span>
						<span>⏱️ {movie.runtime} minutes</span>
						<span className="flex items-center gap-1">
							<span className="text-primary">★</span>
							{movie.vote_average.toFixed(1)}/10
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
