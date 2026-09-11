import type { ConfiguratorSelection } from "@/features/configurator/types/configurator";
import { calculateOverwatchQuote } from "./overwatch-pricing";

export function isOverwatchWinsQuote(input: { gameSlug: string; serviceSlug: string }) {
  return input.gameSlug === "overwatch-2" && input.serviceSlug === "wins";
}

export function calculateOverwatchWinsQuote(selection: ConfiguratorSelection) {
  return calculateOverwatchQuote("wins", selection);
}
