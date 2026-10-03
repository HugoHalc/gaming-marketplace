import type { OrderRecord } from "@/features/orders/types/orders";
import { normalizedGameSlug } from "@/components/orders/game-order-presentation-data";

export type CustomerBoardOrder = Pick<OrderRecord, "id" | "orderNumber" | "status" | "total" | "currency" | "createdAt"> & {
  operationalState: string | null;
  items: { gameName: string; serviceName: string; configuration: Record<string, string | number | boolean> }[];
};
export type CustomerFilter = "all" | "placed" | "active" | "delivered" | "completed";
const publicFields = new Set([
  "platform", "region", "server", "boostMethod", "gameMode", "queue", "role", "playlist", "currentRank", "previousRank", "targetRank", "desiredRank", "currentDivision", "previousDivision", "targetDivision",
  "wins", "matches", "games", "placements", "rewards", "tournamentTier", "tournaments", "quantity", "currentMmr", "targetMmr", "currentMMR", "targetMMR", "currentLp", "lpGain", "rpGain", "eternityPoints", "hero", "champion", "currentProficiency", "targetProficiency", "currentLevel", "targetLevel", "clashTier", "boosters", "currentMastery", "targetMastery", "playPreference", "rolePreferences", "heroPreference", "rewardRank", "tournamentRank", "placementMatches", "netWins", "drives", "driveRank", "currentDrive", "desiredDrive", "expressDelivery", "streaming", "playOffline", "specificHeroes", "championsPreferences", "soloQueueOnly", "rankInsurance", "demotionShield", "liveStream", "extraWin", "express", "appearOffline", "rankConfidence", "masteryMode", "masteryPoints", "marks", "dotaPlusConfirmed",
]);
const aliases: Record<string, string> = { heroName: "hero", specificHero: "hero", desiredLevel: "targetLevel", currentHeroLevel: "currentLevel", desiredHeroLevel: "targetLevel", masteryCurrentLevel: "currentMastery", masteryTargetLevel: "targetMastery", previousSeasonRank: "previousRank", roles: "rolePreferences", preference: "playPreference" };
/** Only public purchase fields cross the server/client boundary; no notes or credentials. */
export function projectCustomerOrder(order: OrderRecord, operationalState: string | null): CustomerBoardOrder {
  return { id: order.id, orderNumber: order.orderNumber, status: order.status, total: order.total, currency: order.currency, createdAt: order.createdAt, operationalState,
    items: order.items.map((item) => {
      const source = { ...item.configuration };
      for (const [from, to] of Object.entries(aliases)) if (source[to] === undefined && source[from] !== undefined) source[to] = source[from];
      const configuration = Object.fromEntries(Object.entries(source).filter(([key, value]) => publicFields.has(key) && ((typeof value === "string" && value !== "") || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value)))));
      return { gameName: item.gameName, serviceName: item.serviceName, configuration };
    }),
  };
}
export function customerOrderLabel(order: CustomerBoardOrder) {
  if (order.operationalState === "delivered") return "Delivered";
  if (order.operationalState === "waiting_customer") return "Waiting Customer";
  if (order.operationalState === "issue") return "Issue";
  if (order.operationalState === "accepted") return "Booster Assigned";
  if (order.operationalState === "in_progress") return "In Progress";
  if (order.operationalState === "completed" || order.status === "completed") return "Completed";
  if (order.status === "pending_payment") return "Placed";
  if (order.status === "paid" || order.status === "queued") return "Ready for Assignment";
  return order.status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
export function matchesCustomerFilter(order: CustomerBoardOrder, filter: CustomerFilter) {
  if (filter === "all") return true;
  if (filter === "placed") return ["pending_payment", "paid", "queued"].includes(order.status);
  if (filter === "active") return order.status === "in_progress" && order.operationalState !== "delivered" && order.operationalState !== "completed";
  if (filter === "delivered") return order.operationalState === "delivered";
  return order.status === "completed" || order.operationalState === "completed";
}
export function filterCustomerOrders(orders: CustomerBoardOrder[], filter: CustomerFilter, game: string, search: string) {
  const needle = search.trim().toLowerCase();
  return orders.filter((order) => matchesCustomerFilter(order, filter) && (game === "all" || order.items.some((item) => normalizedGameSlug(item.gameName) === game)) && (!needle || [order.id, order.orderNumber, ...order.items.flatMap((item) => [item.gameName, item.serviceName])].join(" ").toLowerCase().includes(needle)));
}
