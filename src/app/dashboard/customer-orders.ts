import { createAuthServerClient } from "@/lib/supabase/auth";
import { listCurrentUserOrders } from "@/features/orders/server/order-repository";

/** Scope the customer view even when this account also has administrative read access. */
export async function listDashboardCustomerOrders(userId: string) {
  const client = await createAuthServerClient();
  const { data, error } = await client.from("orders").select("id").eq("user_id", userId);
  if (error) throw new Error("Unable to load orders.");
  const ownedIds = new Set((data ?? []).map((row) => row.id as string));
  const orders = await listCurrentUserOrders();
  return orders.filter((order) => ownedIds.has(order.id));
}

/** Capture the server request time once; clients render the same snapshot. */
export function customerBoardTimestamp() { return Date.now(); }
