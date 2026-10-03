import { requireUser } from "@/features/auth/server/auth";
import { listDashboardCustomerOrders, customerBoardTimestamp } from "../customer-orders";
import { projectCustomerOrder } from "@/features/orders/presentation/customer-order-board";
import { createSecretServerClient } from "@/lib/supabase/server";
import { DashboardOrdersHub } from "@/components/dashboard/dashboard-orders-hub";
import { getBoosterOrderBoard } from "@/features/booster/server/order-board";
import { BoosterOrdersHub } from "@/components/dashboard/booster-orders-hub";


export const metadata = { title: "Orders | BoostingPedia" };
export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const identity = await requireUser();
  const query = await searchParams;
  const supabase = createSecretServerClient();

  const { data: boosterProfile } = await supabase
    .from("booster_profiles")
    .select("user_id")
    .eq("user_id", identity.id)
    .eq("is_active", true)
    .maybeSingle();

  const canAccessBooster = Boolean(boosterProfile);
  const boosterMode =
    canAccessBooster &&
    query.mode !== "customer" &&
    (query.mode === "booster" || identity.profile?.role === "booster");

  if (boosterMode) {
    const board = await getBoosterOrderBoard();
    return <BoosterOrdersHub key={board.viewerId} {...board} />;
  }

  const orders = await listDashboardCustomerOrders(identity.id);
  const orderIds = orders.map((order) => order.id);

  const { data: operationalRows } = orderIds.length
    ? await supabase
        .from("order_operational_states")
        .select("order_id, state, auto_complete_at")
        .in("order_id", orderIds)
    : { data: [] };

  const operationalByOrder = new Map(
    (operationalRows ?? []).map((row) => [
      row.order_id as string,
      {
        state: row.state as string,
        autoCompleteAt: (row.auto_complete_at as string | null) ?? null,
      },
    ]),
  );

  const dashboardOrders = orders.map((order) => projectCustomerOrder(order, operationalByOrder.get(order.id)?.state ?? null));

  return <DashboardOrdersHub orders={dashboardOrders} canAccessBooster={canAccessBooster} generatedAt={customerBoardTimestamp()} />;
}
