import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Free Streaming",
		short_name: "Free Streaming",
		description: "Stream your favorite movies for free, no login required",
		start_url: "/",
		display: "standalone",
		background_color: "#0f1419",
		theme_color: "#0f1419",
		icons: [
			{
				src: "/logo.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/logo.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
	};
}
