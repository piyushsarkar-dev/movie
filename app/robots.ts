import type { MetadataRoute } from "next";
import { isPublicSite, siteUrl } from "@/lib/seo";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: isPublicSite ? "/" : undefined, disallow: isPublicSite ? ["/api/"] : "/" }, ...(isPublicSite ? { sitemap: siteUrl + "/sitemap.xml" } : {}) };
}
