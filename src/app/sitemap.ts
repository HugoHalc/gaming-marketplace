import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const publicRoutes = [
  "/",
  "/games",
  "/games/rocket-league",
  "/games/rocket-league/rank-boost",
  "/games/rocket-league/wins",
  "/games/rocket-league/tournament-boost",
  "/games/rocket-league/rewards-boost",
  "/games/rocket-league/placements-boost",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((path) => ({
    url: path === "/" ? `${siteConfig.url}/` : `${siteConfig.url}${path}`,
  }));
}
