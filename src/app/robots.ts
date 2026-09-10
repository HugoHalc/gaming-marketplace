import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/", "/admin/", "/dashboard/", "/booster/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
