import type {
  ConfiguratorSelection,
  QuoteBreakdownItem,
  QuotePreview,
} from "@/features/configurator/types/configurator";

const VERSION = "overwatch-wins-partner-v1.0";

const PRICE_PER_WIN: Record<string, number> = {
  unranked: 2.2,
  bronze: 2.2,
  silver: 2.2,
  gold: 2.85,
  platinum: 3.1,
  diamond: 3.35,
  master: 3.6,
  grandmaster: 4,
};

const SERVERS = new Set([
  "north-america",
  "europe",
  "asia",
  "middle-east",
]);

const PLATFORMS = new Set([
  "pc",
  "xbox",
  "playstation",
  "nintendo-switch",
]);

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function asInteger(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(number) ? number : Number.NaN;
}

export function isOverwatchWinsQuote(input: { gameSlug: string; serviceSlug: string }) {
  return input.gameSlug === "overwatch-2" && input.serviceSlug === "wins";
}

export function calculateOverwatchWinsQuote(
  selection: ConfiguratorSelection,
): QuotePreview {
  const currentRank = String(selection.currentRank ?? "");
  const wins = asInteger(selection.wins);
  const server = String(selection.server ?? "");
  const platform = String(selection.platform ?? "");

  const perWin = PRICE_PER_WIN[currentRank];
  if (!perWin) throw new Error("Select a valid Overwatch rank.");
  if (!Number.isFinite(wins) || wins < 1) {
    throw new Error("Number of wins must be a whole number of at least 1.");
  }
  if (!SERVERS.has(server)) throw new Error("Select a valid Overwatch server.");
  if (!PLATFORMS.has(platform)) throw new Error("Select a valid Overwatch platform.");

  const baseServicePrice = roundMoney(perWin * wins);
  const breakdown: QuoteBreakdownItem[] = [
    {
      label: `${wins} competitive win${wins === 1 ? "" : "s"} × $${perWin.toFixed(2)}`,
      amount: baseServicePrice,
    },
  ];

  return {
    currency: "USD",
    subtotal: baseServicePrice,
    discount: 0,
    total: baseServicePrice,
    breakdown,
    ruleSetVersion: VERSION,
  };
}
