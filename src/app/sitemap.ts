import type { MetadataRoute } from "next";
import { publicSeoPaths } from "@/features/catalog/data/public-seo-catalog";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicSeoPaths.map((path) => ({ url: absoluteUrl(path) }));
}
