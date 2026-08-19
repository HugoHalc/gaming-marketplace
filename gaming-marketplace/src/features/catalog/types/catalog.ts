export type GameStatus = "active" | "draft" | "archived";
export type ServiceStatus = "active" | "draft" | "archived";

export interface GameSummary {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  accent: string;
  status: GameStatus;
}

export interface ServiceSummary {
  id: string;
  gameId: string;
  slug: string;
  name: string;
  description: string;
  startingPrice: number;
  currency: "USD";
  status: ServiceStatus;
}
