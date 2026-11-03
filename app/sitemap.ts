import type { MetadataRoute } from "next";
import { getGenres, getTrendingMovies } from "@/lib/tmdb";
import { isPublicSite, siteUrl } from "@/lib/seo";
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isPublicSite) return [];
  const [genres, movies] = await Promise.all([getGenres(), getTrendingMovies("week")]);
  const paths = ["/", "/genres", ...genres.map(g => "/genres/" + g.id), ...movies.map(m => "/movie/" + m.id)];
  return [...new Set(paths)].map(path => ({ url: siteUrl + path }));
}
