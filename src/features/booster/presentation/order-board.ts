import type { BoosterOrderCard } from "@/features/booster/server/booster-orders";
import { publicGameNavigation } from "@/features/catalog/data/launch-games";
import { normalizedGameSlug } from "@/components/orders/game-order-presentation-data";

export type BoardBucket = "available" | "active" | "completed";
export type BoardOrder = {
  id: string; orderNumber: string; bucket: BoardBucket; payout: number;
  gameName: string; gameSlug: string; serviceName: string; serviceCategory?: string;
  createdAt: string; assignedAt: string | null;
  configuration: Record<string, string | number | boolean>;
  extras: string[];
};
export const boardGames = publicGameNavigation.filter((game) => game.ready);
export const gameLogos: Record<string, string> = {
  "rocket-league": "/game-cards/rocket-league-logo-transparent.png",
  "league-of-legends": "/game-cards/league-of-legends-home-logo.png",
  valorant: "/game-cards/valorant-home-logo.png",
  "marvel-rivals": "/game-cards/marvel-rivals-home-logo.png",
  "overwatch-2": "/game-cards/overwatch-home-logo-light.png",
  "dota-2": "/game-cards/dota-2-home-logo.png",
  "rainbow-six-siege": "/game-cards/rainbow-six-siege-logo.png",
};
const publicFields = new Set([
  "platform", "region", "server", "boostMethod", "gameMode", "queue", "role", "playlist",
  "currentRank", "previousRank", "targetRank", "desiredRank", "currentDivision", "previousDivision", "targetDivision",
  "wins", "matches", "games", "placements", "placementMatches", "netWins", "rewards", "rewardRank", "tournamentTier", "tournamentRank", "tournaments", "quantity",
  "currentMmr", "targetMmr", "currentMMR", "targetMMR", "currentLp", "lpGain", "rpGain", "eternityPoints",
  "hero", "champion", "currentProficiency", "targetProficiency", "currentLevel", "targetLevel", "currentMastery", "targetMastery", "clashTier", "boosters", "behaviorScore", "playPreference", "rolePreferences", "heroPreference", "drives", "rankConfidence", "masteryMode", "masteryPoints", "marks", "dotaPlusConfirmed",
]);
const extraLabels: Record<string, string> = {
  expressDelivery: "Express Delivery", streaming: "Streaming", liveStream: "Live Stream", playOffline: "Play Offline", specificHeroes: "Specific Heroes", championsPreferences: "Champion Preferences", soloQueueOnly: "Solo Queue Only", rankInsurance: "Rank Insurance", demotionShield: "Demotion Shield", extraWin: "Extra Win", bonusWin: "Bonus Win", specificOperators: "Specific Operators", highKillCount: "High Kill Count", privacyMode: "Privacy Mode",
};
// Map real service fields to the existing shared visual anatomy without changing snapshots.
const visualFields: Record<string, string> = {
  heroName: "hero", specificHero: "hero", desiredLevel: "targetLevel",
  currentHeroLevel: "currentLevel", desiredHeroLevel: "targetLevel",
  masteryCurrentLevel: "currentMastery", masteryTargetLevel: "targetMastery",
  previousSeasonRank: "previousRank", roles: "rolePreferences", preference: "playPreference",
};
/** Explicit public projection: no customer notes, total, identity, evidence or credentials. */
export function projectBoardOrders(entries: BoosterOrderCard[], bucket: BoardBucket): BoardOrder[] {
  return entries.flatMap(({ order, payout, assignedAt }) => {
    if (order.paymentStatus !== "paid" || !Number.isFinite(payout) || payout < 0) return [];
    if (bucket === "available" && !["paid", "queued"].includes(order.status)) return [];
    if (bucket === "active" && !["paid", "queued", "in_progress"].includes(order.status)) return [];
    if (bucket === "completed" && order.status !== "completed") return [];
    const item = order.items[0];
    if (!item) return [];
    const gameSlug = normalizedGameSlug(item.gameName);
    if (!boardGames.some((game) => game.slug === gameSlug)) return [];
    const publicConfiguration = { ...item.configuration };
    for (const [source, target] of Object.entries(visualFields)) {
      if (publicConfiguration[target] === undefined && publicConfiguration[source] !== undefined) publicConfiguration[target] = publicConfiguration[source];
    }
    const configuration = Object.fromEntries(Object.entries(publicConfiguration).filter(([key, value]) => publicFields.has(key) && ((typeof value === "string" && value !== "") || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value)))));
    const extras = Object.entries(extraLabels).filter(([key]) => item.configuration[key] === true).map(([, label]) => label);
    return [{ id: order.id, orderNumber: order.orderNumber, bucket, payout, gameName: item.gameName, gameSlug, serviceName: item.serviceName, serviceCategory: item.serviceCategory, createdAt: order.createdAt, assignedAt, configuration, extras }];
  });
}
export function filterBoardOrders(orders: BoardOrder[], bucket: BoardBucket, game: string, query: string) {
  const needle = query.trim().toLowerCase();
  return orders.filter((order) => order.bucket === bucket && (game === "all" || order.gameSlug === game) && (!needle || [order.id, order.orderNumber, order.gameName, order.serviceName, order.configuration.platform, order.configuration.region, order.configuration.server].filter((value) => typeof value === "string").join(" ").toLowerCase().includes(needle)))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
export function mergeConfirmedClaims(snapshot: BoardOrder[], confirmed: BoardOrder[]) {
  const byId = new Map(snapshot.map((order) => [order.id, order]));
  for (const order of confirmed) {
    if (!byId.has(order.id) || byId.get(order.id)?.bucket === "available") byId.set(order.id, order);
  }
  return [...byId.values()];
}

/** Prefer existing compact public numbers; shorten long public numbers without changing IDs. */
export function shortBoardOrderIds(orders: Pick<BoardOrder, "id" | "orderNumber">[]) {
  const unique = [...new Map(orders.map((order) => [order.id, order])).values()];
  const source = (order: Pick<BoardOrder, "id" | "orderNumber">) => (order.orderNumber || order.id).replace(/^VB-/, "");
  const labels = new Map(unique.map((order) => [order.id, order.orderNumber && order.orderNumber.length <= 8 ? order.orderNumber : `#${source(order).slice(-6)}`]));
  for (let width = 7; width <= Math.max(6, ...unique.map((order) => source(order).length)); width++) {
    const counts = new Map<string, number>();
    for (const label of labels.values()) counts.set(label, (counts.get(label) ?? 0) + 1);
    const collisions = unique.filter((order) => (counts.get(labels.get(order.id)!) ?? 0) > 1);
    if (!collisions.length) break;
    for (const order of collisions) labels.set(order.id, `#${source(order).slice(-width)}`);
  }
  const counts = new Map<string, number>();
  for (const label of labels.values()) counts.set(label, (counts.get(label) ?? 0) + 1);
  for (const order of unique) if ((counts.get(labels.get(order.id)!) ?? 0) > 1) labels.set(order.id, `#${order.id}`);
  return labels;
}
