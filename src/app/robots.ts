import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: siteConfig.allowIndexing
      ? {
          userAgent: "*",
          allow: "/",
          disallow: ["/api/", "/auth/", "/admin/", "/dashboard/", "/booster/"],
        }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
