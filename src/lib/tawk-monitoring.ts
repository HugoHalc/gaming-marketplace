import {
  publicSeoGames,
  publicServicePaths,
} from "@/features/catalog/data/public-seo-catalog";

export const tawkMonitoringPaths = [
  "/",
  ...publicSeoGames.map((game) => `/games/${game.slug}` as const),
  ...publicServicePaths,
] as const;

const tawkMonitoringPathSet = new Set<string>(tawkMonitoringPaths);

export function isTawkMonitoringPath(pathname: string): boolean {
  const normalizedPathname =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  return tawkMonitoringPathSet.has(normalizedPathname);
}
