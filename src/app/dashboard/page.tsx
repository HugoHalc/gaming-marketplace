import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Clock3, Package } from "lucide-react";
import { requireUser } from "@/features/auth/server/auth";
import { listCurrentUserOrders } from "@/features/orders/server/order-repository";
import { createSecretServerClient } from "@/lib/supabase/server";
import {
  resolveRocketLeagueRank,
  RocketLeagueRankValue,
} from "@/components/orders/rocket-league-rank";

export const metadata = { title: "Dashboard | BoostingPedia" };
export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatLabel(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").replace(/^./, l => l.toUpperCase());
}

export default async function DashboardPage() {
  const identity = await requireUser();
  const orders = await listCurrentUserOrders();
  const supabase = createSecretServerClient();

  const activeOrders = orders.filter((order) => ["paid", "queued", "in_progress"].includes(order.status));
  const completedOrders = orders.filter((order) => order.status === "completed");
  const orderIds = orders.map((order) => order.id);

  const { data: operationalRows } = orderIds.length
    ? await supabase.from("order_operational_states").select("order_id, state").in("order_id", orderIds)
    : { data: [] };

  const operationalByOrder = new Map((operationalRows ?? []).map((row) => [row.order_id as string, row.state as string]));
  const highlighted = activeOrders[0] ?? orders[0] ?? null;
  const displayName = identity.profile?.gamer_tag || identity.profile?.full_name || identity.email.split("@")[0];

  function statusCopy(orderId: string, status: string) {
    const operational = operationalByOrder.get(orderId);
    if (operational === "delivered") return "Waiting for your confirmation";
    if (operational === "waiting_customer") return "Waiting for your response";
    if (operational === "issue") return "Under review";
    if (operational === "in_progress" || status === "in_progress") return "In progress";
    if (operational === "accepted") return "Booster assigned";
    if (status === "paid" || status === "queued") return "Ready for assignment";
    if (status === "completed") return "Completed";
    return formatLabel(status);
  }

  function nextStep(orderId: string, status: string) {
    const operational = operationalByOrder.get(orderId);
    if (operational === "delivered") return "Review the completion evidence and confirm your order.";
    if (operational === "waiting_customer") return "Your booster is waiting for your response.";
    if (operational === "issue") return "Your order is being reviewed by BoostingPedia.";
    if (operational === "in_progress" || status === "in_progress") return "Your booster is actively working on this service.";
    if (operational === "accepted") return "Your booster has accepted the order and is preparing to start.";
    if (status === "paid" || status === "queued") return "Waiting for a booster to accept your order.";
    if (status === "completed") return "This service has been completed.";
    return "Open the order for the latest details.";
  }

  const highlightedItem = highlighted?.items[0];
  const highlightedConfig = highlightedItem?.configuration ?? {};
  const currentValue = typeof highlightedConfig.currentRank !== "undefined" ? highlightedConfig.currentRank : highlightedConfig.previousRank;
  const targetValue = highlightedConfig.targetRank;
  const currentRank = resolveRocketLeagueRank(currentValue);
  const targetRank = resolveRocketLeagueRank(targetValue);
  const wins = typeof highlightedConfig.wins === "number" ? highlightedConfig.wins : null;
  const matches = typeof highlightedConfig.matches === "number" ? highlightedConfig.matches : null;

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <p className="font-gaming-label text-[10px] uppercase tracking-[0.15em] text-[#6F7A74]">Customer Dashboard</p>
        <h1 className="mt-1.5 text-[30px] font-bold tracking-[-0.045em] text-[#F4F7F5] sm:text-[34px]">Welcome back, {displayName}</h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#A0AAA4]">Track active boosts, follow your progress and stay connected with your booster.</p>
      </header>

      <section className="mt-8 grid grid-cols-3 border-y border-white/[0.06]">
        {[['Active Orders', activeOrders.length], ['Completed Orders', completedOrders.length], ['Total Orders', orders.length]].map(([label,value], index) => (
          <div key={String(label)} className={`py-4 ${index ? 'border-l border-white/[0.06] pl-5 sm:pl-7' : ''}`}>
            <p className="text-[11px] font-medium text-[#737E78]">{label}</p>
            <p className="font-gaming-value mt-1 text-[24px] font-bold text-[#F4F7F5] sm:text-[26px]">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-9">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-gaming-label text-[10px] uppercase tracking-[0.14em] text-[#667069]">Current Service</p>
            <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.025em] text-[#F4F7F5]">Active Order</h2>
          </div>
          <Link href="/dashboard/orders" className="text-[12px] font-semibold text-[#82F5A4] transition-colors hover:text-white">View all orders</Link>
        </div>

        {highlighted ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.075] bg-[#090E0B]">
            <div className="flex flex-col gap-4 border-b border-white/[0.055] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-white/[0.08]">
                  <Image src="/game-cards/rocket-league.webp" alt="" fill sizes="40px" className="object-cover" />
                </span>
                <div className="min-w-0">
                  <p className="font-gaming-label text-[9px] uppercase tracking-[0.15em] text-blue-200/50">{highlightedItem?.gameName ?? 'Gaming service'}</p>
                  <h3 className="mt-0.5 truncate text-[18px] font-semibold text-[#F4F7F5]">{highlightedItem?.serviceName ?? 'Order'}</h3>
                  <p className="font-gaming-value mt-1 text-[11px] text-[#6F7A74]">{highlighted.orderNumber}</p>
                </div>
              </div>
              <span className="self-start rounded-full border border-cyan-300/15 bg-cyan-300/[0.04] px-3 py-1.5 text-[10px] font-semibold text-cyan-100 sm:self-center">{statusCopy(highlighted.id, highlighted.status)}</span>
            </div>

            <div className="px-5 py-6 sm:px-7">
              {(currentRank || targetRank) ? (
                <div className="flex flex-wrap items-center gap-5 sm:gap-8">
                  {currentRank ? <RocketLeagueRankValue value={currentValue} label="Current" size="lg" /> : null}
                  {currentRank && targetRank ? <div className="flex min-w-10 flex-1 items-center sm:max-w-24"><span className="h-px flex-1 bg-blue-200/15"/><ArrowRight className="size-4 text-blue-200/35"/></div> : null}
                  {targetRank ? <RocketLeagueRankValue value={targetValue} label="Target" size="lg" /> : null}
                </div>
              ) : (
                <div className="flex flex-wrap gap-x-10 gap-y-3">
                  {wins !== null ? <div><p className="text-[11px] text-[#6F7A74]">Wins</p><p className="font-gaming-value mt-1 text-[22px] font-bold text-white">{wins}</p></div> : null}
                  {matches !== null ? <div><p className="text-[11px] text-[#6F7A74]">Matches</p><p className="font-gaming-value mt-1 text-[22px] font-bold text-white">{matches}</p></div> : null}
                  {typeof highlightedConfig.platform === 'string' ? <div><p className="text-[11px] text-[#6F7A74]">Platform</p><p className="mt-1 text-[13px] font-semibold text-white">{formatLabel(String(highlightedConfig.platform))}</p></div> : null}
                </div>
              )}

              <div className="mt-6 flex items-center overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {['Payment','Assignment','In Progress','Completed'].map((step, index) => {
                  const op = operationalByOrder.get(highlighted.id) as string | undefined;
                  const achieved = index === 0 ? highlighted.paymentStatus === 'paid' : index === 1 ? Boolean(op && op !== 'accepted' ? true : op === 'accepted') : index === 2 ? ['in_progress','waiting_customer','issue','delivered','completed'].includes(op ?? '') || highlighted.status === 'in_progress' || highlighted.status === 'completed' : op === 'completed' || highlighted.status === 'completed';
                  const current = !achieved && (index === 1 && highlighted.paymentStatus === 'paid') || (index === 2 && op === 'accepted') || (index === 3 && ['delivered','waiting_customer'].includes(op ?? ''));
                  return <div key={step} className="flex items-center"><div className="flex items-center gap-2"><span className={`grid size-5 place-items-center rounded-full border ${achieved ? 'border-[#39E56F]/20 bg-[#39E56F]/[0.05]' : current ? 'border-cyan-300/25 bg-cyan-300/[0.06]' : 'border-white/[0.08]'}`}>{achieved ? <Check className="size-3 text-[#82F5A4]"/> : <span className={`size-1.5 rounded-full ${current ? 'bg-cyan-300' : 'bg-white/15'}`}/>}</span><span className={`whitespace-nowrap text-[11px] ${current ? 'text-cyan-100' : achieved ? 'text-[#AAB5AF]' : 'text-[#59635E]'}`}>{step}</span></div>{index < 3 ? <span className="mx-3 h-px w-7 bg-white/[0.07] sm:mx-5 sm:w-12"/> : null}</div>
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/[0.055] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[12px] text-[#9AA59F]">{nextStep(highlighted.id, highlighted.status)}</p>
              <Link href={`/dashboard/orders/${highlighted.id}`} className="inline-flex h-10 items-center justify-center rounded-lg bg-[#39E56F] px-4 text-[11px] font-semibold text-[#050807] transition-colors hover:bg-[#55ED82]">View Order <ArrowRight className="ml-2 size-3.5"/></Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 border-y border-white/[0.06] py-10 text-center"><Package className="mx-auto size-5 text-[#667069]"/><h3 className="mt-3 text-[15px] font-semibold text-white">No orders yet</h3><p className="mt-1.5 text-[12px] text-[#A0AAA4]">Your active service will appear here after your first order.</p></div>
        )}
      </section>

      <section className="mt-9">
        <h2 className="text-[19px] font-semibold tracking-[-0.02em] text-[#F4F7F5]">Recent Orders</h2>
        <div className="mt-3 divide-y divide-white/[0.05] border-y border-white/[0.05]">
          {orders.slice(0, 5).map((order) => (
            <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="group flex items-center justify-between gap-4 py-4 transition-colors hover:bg-white/[0.015]">
              <div className="flex min-w-0 items-center gap-3"><span className="relative size-8 shrink-0 overflow-hidden rounded-md border border-white/[0.07]"><Image src="/game-cards/rocket-league.webp" alt="" fill sizes="32px" className="object-cover"/></span><div className="min-w-0"><p className="truncate text-[13px] font-semibold text-[#F4F7F5]">{order.items[0]?.serviceName ?? 'Gaming service'}</p><p className="mt-1 text-[11px] text-[#6F7A74]">{order.items[0]?.gameName ?? 'Game'} · {formatDate(order.createdAt)}</p></div></div>
              <div className="flex items-center gap-4"><span className="hidden text-[11px] text-[#9AA59F] sm:block">{statusCopy(order.id, order.status)}</span><ArrowRight className="size-4 text-[#667069] transition-transform group-hover:translate-x-0.5"/></div>
            </Link>
          ))}
          {!orders.length ? <p className="py-5 text-[12px] text-[#667069]">No recent orders yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
