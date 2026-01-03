import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type React from "react";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Free Streaming - Watch Movies Online",
	description:
		"Free Streaming: Watch unlimited movies online. Ad-free streaming with high quality video playback.",
	generator: "v0.app",
	openGraph: {
		title: "Free Streaming - Watch Movies Online",
		description: "Stream your favorite movies for free, no login required",
		type: "website",
		images: ["/logo.png"],
	},
	twitter: {
		card: "summary_large_image",
		title: "Free Streaming - Watch Movies Online",
		description: "Stream your favorite movies for free, no login required",
		images: ["/logo.png"],
	},
	icons: {
		icon: "/logo.png",
		shortcut: "/logo.png",
		apple: "/logo.png",
	},
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
