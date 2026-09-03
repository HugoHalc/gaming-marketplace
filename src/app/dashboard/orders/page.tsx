import { requireUser } from "@/features/auth/server/auth";
import { listCurrentUserOrders } from "@/features/orders/server/order-repository";
import { createSecretServerClient } from "@/lib/supabase/server";
import { DashboardOrdersHub } from "@/components/dashboard/dashboard-orders-hub";

export const metadata = { title: "Orders | BoostingPedia" };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  await requireUser();
  const orders = await listCurrentUserOrders();

  const orderIds = orders.map((order) => order.id);
  const supabase = createSecretServerClient();

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

  const dashboardOrders = orders.map((order) => ({
    ...order,
    operationalState: operationalByOrder.get(order.id)?.state ?? null,
    autoCompleteAt: operationalByOrder.get(order.id)?.autoCompleteAt ?? null,
  }));

  return <DashboardOrdersHub orders={dashboardOrders} />;
}
