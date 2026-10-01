import type { ConfiguratorSelection, QuotePreview } from "@/features/configurator/types/configurator";
import { calculateRocketLeagueReferenceQuote } from "./rocket-league-reference-pricing";

export function isRocketLeagueWinsQuote(input: { gameSlug: string; serviceSlug: string }) {
  return input.gameSlug === "rocket-league" && input.serviceSlug === "wins";
}

export function calculateRocketLeagueWinsQuote(selection: ConfiguratorSelection): QuotePreview {
  return calculateRocketLeagueReferenceQuote("wins", selection);
}
