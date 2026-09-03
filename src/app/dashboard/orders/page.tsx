import Link from "next/link";
import { requireUser } from "@/features/auth/server/auth";
import { listCurrentUserOrders } from "@/features/orders/server/order-repository";
import { createSecretServerClient } from "@/lib/supabase/server";
import { DashboardOrdersHub } from "@/components/dashboard/dashboard-orders-hub";
import { BoosterOrdersHub } from "@/components/dashboard/booster-orders-hub";
import {
  listActiveBoosterOrders,
  listAvailableBoosterOrders,
  listCompletedBoosterOrders,
} from "@/features/booster/server/booster-orders";

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
    (query.mode === "booster" || identity.profile?.role === "booster");

  if (boosterMode) {
    const [available, active, completed] = await Promise.all([
      listAvailableBoosterOrders(),
      listActiveBoosterOrders(),
      listCompletedBoosterOrders(),
    ]);

    return (
      <BoosterOrdersHub
        available={available}
        active={active}
        completed={completed}
      />
    );
  }

  const orders = await listCurrentUserOrders();
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

  const dashboardOrders = orders.map((order) => ({
    ...order,
    operationalState: operationalByOrder.get(order.id)?.state ?? null,
    autoCompleteAt: operationalByOrder.get(order.id)?.autoCompleteAt ?? null,
  }));

  return (
    <>
      {canAccessBooster ? (
        <div className="mx-auto flex w-full max-w-[1520px] justify-end px-4 pt-5 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/orders?mode=booster"
            className="inline-flex h-9 items-center rounded-lg border border-[#39E56F]/20 bg-[#39E56F]/[0.06] px-3 text-[9px] font-semibold text-[#82F5A4] transition-colors hover:bg-[#39E56F]/[0.10]"
          >
            Booster Orders
          </Link>
        </div>
      ) : null}
      <DashboardOrdersHub orders={dashboardOrders} />
    </>
  );
}
