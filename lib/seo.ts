import type { Metadata } from "next";

// Set this to the public production origin, never a preview deployment URL.
const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);
export const siteUrl = configuredUrl ? new URL(configuredUrl).origin : "http://localhost:3000";
export const isPublicSite = Boolean(configuredUrl) && !["localhost", "127.0.0.1"].includes(new URL(siteUrl).hostname);
export const siteName = "Free Streaming";
export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title, description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName, type: "website", images: [{ url: "/p-one.png", alt: "Free Streaming movie discovery homepage" }] },
    twitter: { card: "summary_large_image", title, description, images: ["/p-one.png"] },
  };
}
export function jsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
