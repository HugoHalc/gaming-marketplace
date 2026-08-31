export type GameStatus = "active" | "draft" | "archived";
export type ServiceStatus = "active" | "draft" | "archived";
export type GameAccent = "emerald" | "rose" | "violet" | "cyan" | "amber" | "blue";
export type ServiceCategory = "rank" | "wins" | "placements" | "coaching";

export interface GameSummary {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  accent: GameAccent;
  status: GameStatus;
  featured?: boolean;
}

export interface ServiceSummary {
  id: string;
  gameId: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  description: string;
  startingPrice: number;
  currency: "USD";
  status: ServiceStatus;
}

export interface CatalogGame extends GameSummary {
  services: ServiceSummary[];
  startingPrice: number | null;
}
