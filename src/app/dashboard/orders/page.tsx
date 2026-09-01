import Link from "next/link";
import { ArrowRight, PackageOpen } from "lucide-react";
import { listCurrentUserOrders } from "@/features/orders/server/order-repository";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";

export const metadata = { title: "Orders | BoostingPedia" };
export const dynamic = "force-dynamic";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function OrdersPage() {
  const orders = await listCurrentUserOrders();

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-200/60">
            Orders
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#F4F7F5] sm:text-3xl">
            Your services
          </h1>
          <p className="mt-2 text-sm text-[#A0AAA4]">
            Review active and previous orders from your account.
          </p>
        </div>
        <Link
          href="/games"
          className="rounded-xl border border-white/[0.08] bg-[#0E1411] px-4 py-2.5 text-xs font-semibold text-[#F4F7F5] transition-colors hover:bg-[#131B17]"
        >
          Browse services
        </Link>
      </div>

      {orders.length ? (
        <div className="mt-6 space-y-3">
          {orders.map((order) => {
            const item = order.items[0];
            return (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="group grid gap-4 rounded-2xl border border-white/[0.07] bg-[#0E1411] p-4 transition-colors hover:border-white/[0.14] hover:bg-[#101713] sm:p-5 md:grid-cols-[1fr_auto] md:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-gaming-value text-sm font-bold text-[#F4F7F5]">
                      {order.orderNumber}
                    </p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="mt-2 truncate text-sm font-medium text-[#F4F7F5]">
                    {item
                      ? `${item.gameName} · ${item.serviceName}`
                      : "Gaming service"}
                  </p>
                  <p className="mt-1 text-[10px] text-[#667069]">
                    Created {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-5 md:justify-end">
                  <p className="font-gaming-value text-lg font-bold text-[#F4F7F5]">
                    {formatMoney(order.total)}
                  </p>
                  <ArrowRight className="size-4 text-[#667069] transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-[1.4rem] border border-dashed border-white/[0.09] bg-[#0E1411] p-10 text-center">
          <PackageOpen className="mx-auto size-7 text-[#667069]" />
          <h2 className="mt-4 text-sm font-semibold text-[#F4F7F5]">
            No orders yet
          </h2>
          <p className="mt-2 text-xs text-[#A0AAA4]">
            Configure a gaming service to create your first order.
          </p>
          <Link
            href="/games"
            className="mt-5 inline-flex rounded-xl bg-[#39E56F] px-4 py-2.5 text-xs font-semibold text-[#050807] hover:bg-[#20C95A]"
          >
            Explore games
          </Link>
        </div>
      )}
    </div>
  );
}
