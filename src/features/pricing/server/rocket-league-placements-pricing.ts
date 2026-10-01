import type { ConfiguratorSelection, QuotePreview } from "@/features/configurator/types/configurator";
import { calculateRocketLeagueReferenceQuote } from "./rocket-league-reference-pricing";

export function isRocketLeaguePlacementsQuote(input: { gameSlug: string; serviceSlug: string }) {
  return input.gameSlug === "rocket-league" && input.serviceSlug === "placements-boost";
}

export function calculateRocketLeaguePlacementsQuote(selection: ConfiguratorSelection): QuotePreview {
  return calculateRocketLeagueReferenceQuote("placements", selection);
}
