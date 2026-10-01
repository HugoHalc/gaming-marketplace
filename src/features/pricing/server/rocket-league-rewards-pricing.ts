import type { ConfiguratorSelection, QuotePreview } from "@/features/configurator/types/configurator";
import { calculateRocketLeagueReferenceQuote } from "./rocket-league-reference-pricing";

export function isRocketLeagueRewardsQuote(input: { gameSlug: string; serviceSlug: string }) {
  return input.gameSlug === "rocket-league" && input.serviceSlug === "rewards-boost";
}

export function calculateRocketLeagueRewardsQuote(selection: ConfiguratorSelection): QuotePreview {
  return calculateRocketLeagueReferenceQuote("rewards", selection);
}
