/** @type {import('next').NextConfig} */
const nextConfig = {
	// Prevent cross-origin warnings/errors when accessing dev server from a phone on LAN.
	// Add your machine's LAN origin here if it changes.
	allowedDevOrigins: [
		"http://localhost:3000",
		"http://127.0.0.1:3000",
		"http://192.168.0.109:3000",
	],
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "image.tmdb.org",
			},
		],
	},
};

export default nextConfig;
