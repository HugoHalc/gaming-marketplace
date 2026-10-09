import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const privatePaths = [
    "/api/",
    "/auth/",
    "/admin/",
    "/dashboard/",
    "/booster/",
    "/checkout/",
    "/account/",
    "/orders/",
    "/login",
    "/register",
    "/forgot-password",
    "/update-password",
    "/become-a-booster",
  ];

  return {
    rules: siteConfig.allowIndexing
      ? {
          userAgent: "*",
          allow: "/",
          disallow: privatePaths,
        }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
