import "server-only";

import { requireBooster } from "@/features/auth/server/auth";
import { projectBoardOrders } from "@/features/booster/presentation/order-board";
import { listActiveBoosterOrders, listAvailableBoosterOrders, listCompletedBoosterOrders } from "./booster-orders";

/** Existing authenticated queries, projected before crossing the client boundary. */
export async function getBoosterOrderBoard() {
  const [booster, available, active, completed] = await Promise.all([
    requireBooster(), listAvailableBoosterOrders(), listActiveBoosterOrders(), listCompletedBoosterOrders(),
  ]);
  return {
    viewerId: booster.id,
    generatedAt: Date.now(),
    orders: [...projectBoardOrders(available, "available"), ...projectBoardOrders(active, "active"), ...projectBoardOrders(completed, "completed")],
  };
}
