import { isPublicSite, pageMetadata, siteName, siteUrl } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type React from "react";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  ...pageMetadata("Discover Movies, Ratings & Genres", "Explore trending movies, new releases, ratings and movie details. Search the TMDB-powered catalogue and discover films by genre.", "/"),
  metadataBase: new URL(siteUrl),
  title: { default: "Discover Movies, Ratings & Genres | Free Streaming", template: "%s | " + siteName },
  robots: { index: isPublicSite, follow: true },
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export const viewport = {
	colorScheme: "dark",
	themeColor: "#0f1419",
	userScalable: true,
	width: "device-width",
	initialScale: 1,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className="dark">
			<body
				className={`font-sans antialiased bg-background text-foreground`}>
				{children}
				<Analytics />
			</body>
		</html>
	);
}
