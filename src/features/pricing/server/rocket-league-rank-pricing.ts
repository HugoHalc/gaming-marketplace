import type { ConfiguratorSelection, QuotePreview } from "@/features/configurator/types/configurator";
import { calculateRocketLeagueReferenceQuote } from "./rocket-league-reference-pricing";

export function isRocketLeagueRankQuote(input: { gameSlug: string; serviceSlug: string }) {
  return input.gameSlug === "rocket-league" && input.serviceSlug === "rank-boost";
}

export function calculateRocketLeagueRankQuote(selection: ConfiguratorSelection): QuotePreview {
  return calculateRocketLeagueReferenceQuote("rank", selection);
}
