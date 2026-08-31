import { mockGames, mockServices } from "./mock-catalog";
import type { CatalogGame } from "../types/catalog";

export function getCatalogGames(): CatalogGame[] {
  return mockGames
    .filter((game) => game.status === "active")
    .map((game) => {
      const services = mockServices.filter(
        (service) => service.gameId === game.id && service.status === "active",
      );

      const startingPrice = services.length
        ? Math.min(...services.map((service) => service.startingPrice))
        : null;

      return {
        ...game,
        services,
        startingPrice,
      };
    });
}

export function getCatalogGameBySlug(slug: string): CatalogGame | undefined {
  return getCatalogGames().find((game) => game.slug === slug);
}
