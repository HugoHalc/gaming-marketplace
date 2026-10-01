import type { ConfiguratorSelection, QuotePreview } from "@/features/configurator/types/configurator";
import { calculateRocketLeagueReferenceQuote } from "./rocket-league-reference-pricing";

export function isRocketLeagueTournamentQuote(input: { gameSlug: string; serviceSlug: string }) {
  return input.gameSlug === "rocket-league" && input.serviceSlug === "tournament-boost";
}

export function calculateRocketLeagueTournamentQuote(selection: ConfiguratorSelection): QuotePreview {
  return calculateRocketLeagueReferenceQuote("tournament", selection);
}
