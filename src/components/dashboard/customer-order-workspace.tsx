"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Check,
  ChevronRight,
  CreditCard,
  Gamepad2,
  ImageIcon,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import type { OrderRecord, OrderStatusEvent } from "@/features/orders/types/orders";
import type {
  OrderBoosterAssignment,
  OrderWorkspaceMessage,
} from "@/features/orders/server/order-workspace-repository";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { OrderLiveChat } from "@/components/dashboard/order-live-chat";
import { OrderAccountDetails } from "@/components/dashboard/order-account-details";

const rankAssets: Record<string, string> = {
  bronze: "/ranks/rocket-league/bronze.png",
  silver: "/ranks/rocket-league/silver.png",
  gold: "/ranks/rocket-league/gold.png",
  platinum: "/ranks/rocket-league/platinum.png",
  diamond: "/ranks/rocket-league/diamond.png",
  champion: "/ranks/rocket-league/champion.png",
  "grand-champion": "/ranks/rocket-league/grand-champion.png",
  "supersonic-legend": "/ranks/rocket-league/supersonic-legend.png",
};

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
function formatLabel(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}
function formatValue(value: string | number | boolean) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === "play-with-booster") return "Play With Booster";
  if (value === "account") return "Account Boost";
  return String(value).split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
function rankFamily(value: string) {
  if (value === "supersonic-legend") return value;
  return value.replace(/-\d$/, "");
}
function rankLabel(value: string) {
  if (value === "unrated") return "Unrated";
  if (value === "supersonic-legend") return "Supersonic Legend";
  const tier = value.match(/-(\d)$/)?.[1];
  const family = rankFamily(value).split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  const roman = tier === "1" ? "I" : tier === "2" ? "II" : tier === "3" ? "III" : "";
  return `${family}${roman ? ` ${roman}` : ""}`;
}
function isResolvableRank(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (value === "unrated" || value === "supersonic-legend") return true;
  return Boolean(rankAssets[rankFamily(value)] && /-\d$/.test(value));
}

function RankEditorial({ rank, label }: { rank: string; label: string }) {
  const asset = rankAssets[rankFamily(rank)];
  return (
    <div className="flex items-center gap-3">
      {asset ? (
        <Image src={asset} alt="" width={52} height={52} className="size-12 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,.42)]" />
      ) : (
        <span className="grid size-12 place-items-center rounded-full border border-white/[0.08] text-[10px] font-bold text-[#667069]">?</span>
      )}
      <div>
        <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.13em] text-[#667069]">{label}</p>
        <p className="font-gaming-value mt-0.5 text-lg font-bold text-[#F4F7F5]">{rankLabel(rank)}</p>
      </div>
    </div>
  );
}

function Progression({ order }: { order: OrderRecord }) {
  const config = order.items[0]?.configuration ?? {};
  const currentValue = typeof config.currentRank !== "undefined" ? config.currentRank : config.previousRank;
  const targetValue = config.targetRank;
  const current = isResolvableRank(currentValue) ? currentValue : null;
  const target = isResolvableRank(targetValue) ? targetValue : null;
  const wins = typeof config.wins === "number" ? config.wins : null;
  const matches = typeof config.matches === "number" ? config.matches : null;

  if (current && target) {
    return (
      <div className="mt-5 flex flex-wrap items-center gap-5 sm:gap-7">
        <RankEditorial rank={current} label="Current" />
        <ArrowRight className="size-4 text-blue-200/40" />
        <RankEditorial rank={target} label="Target" />
      </div>
    );
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-8">
      {current ? <RankEditorial rank={current} label="Rank context" /> : null}
      {wins !== null || matches !== null ? (
        <div>
          <p className="font-gaming-label text-[9px] uppercase tracking-[0.13em] text-[#667069]">{matches !== null ? "Placement Matches" : "Wins Selected"}</p>
          <p className="font-gaming-value mt-1 text-3xl font-bold text-[#F4F7F5]">{matches ?? wins}</p>
        </div>
      ) : null}
    </div>
  );
}

interface Props {
  order: OrderRecord;
  history: OrderStatusEvent[];
  checkoutState?: string;
  paymentError?: string;
  currentUserId: string;
  currentUserRole: "customer" | "booster" | "admin";
  initialMessages: OrderWorkspaceMessage[];
  boosterAssignment: OrderBoosterAssignment | null;
  mode?: "customer" | "booster";
  boosterPayout?: number;
  backHref?: string;
  backLabel?: string;
}

export function CustomerOrderWorkspace({
  order,
  history,
  checkoutState,
  paymentError,
  currentUserId,
  currentUserRole,
  initialMessages,
  boosterAssignment,
  mode = "customer",
  boosterPayout,
  backHref = "/dashboard/orders",
  backLabel = "Back to orders",
}: Props) {
  const item = order.items[0];
  const isBoosterMode = mode === "booster";
  const canPay =
    !isBoosterMode &&
    order.status === "pending_payment" &&
    order.paymentStatus !== "paid";
  const isCustomerOwner = !isBoosterMode && currentUserRole === "customer";
  const displayAmount =
    isBoosterMode && typeof boosterPayout === "number"
      ? boosterPayout
      : order.total;

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <Link href={backHref} className="text-xs font-medium text-[#A0AAA4] hover:text-[#F4F7F5]">← {backLabel}</Link>

      {checkoutState === "success" ? <div className="mt-4 border-y border-[#39E56F]/15 py-3 text-sm text-[#82F5A4]">Payment submitted successfully. Stripe is confirming the payment.</div> : null}
      {checkoutState === "cancelled" ? <div className="mt-4 border-y border-amber-300/15 py-3 text-sm text-amber-100">Checkout was cancelled. Your order is still saved.</div> : null}
      {paymentError ? <div className="mt-4 border-y border-rose-300/15 py-3 text-sm text-rose-100">We could not start secure checkout. Please try again.</div> : null}

      <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(330px,32%)]">
        <main className="min-w-0">
          <header className="border-b border-white/[0.06] pb-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-blue-300/[0.12] bg-blue-400/[0.03] text-blue-200/75">
                  <Gamepad2 className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-gaming-label text-[9px] uppercase tracking-[0.14em] text-blue-200/55">{item?.gameName ?? "Gaming service"}</p>
                  <h1 className="mt-0.5 truncate text-xl font-semibold text-[#F4F7F5] sm:text-2xl">{item?.serviceName ?? "Customer Order"}</h1>
                  <p className="font-gaming-value mt-2 text-[11px] text-[#667069]">{order.orderNumber}<span className="mx-2 text-white/[0.16]">·</span><span className="font-sans">Created {formatDate(order.createdAt)}</span></p>
                </div>
              </div>
              <div className="flex shrink-0 items-start gap-5 sm:flex-col sm:items-end sm:gap-2">
                <OrderStatusBadge status={order.status} />
                <div className="text-right"><p className="text-[9px] text-[#667069]">{isBoosterMode ? "Your payout" : "Total"}</p><p className={`font-gaming-value mt-0.5 text-2xl font-bold ${isBoosterMode ? "text-[#82F5A4]" : "text-[#F4F7F5]"}`}>{formatMoney(displayAmount)}</p></div>
              </div>
            </div>
            <Progression order={order} />
          </header>

          <section className="border-b border-white/[0.06] py-4">
            <p className="font-gaming-label text-[9px] uppercase tracking-[0.13em] text-blue-200/55">Order Progress</p>
            <div className="mt-3 flex min-w-0 items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(history.length ? history.slice(-4) : []).map((event, index, list) => (
                <div key={event.id} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <span className={`grid size-5 place-items-center rounded-full border ${index === list.length - 1 ? "border-cyan-300/25 bg-cyan-400/[0.08]" : "border-white/[0.10]"}`}>
                      {index === list.length - 1 ? <span className="size-1.5 rounded-full bg-cyan-300" /> : <Check className="size-2.5 text-[#A0AAA4]" />}
                    </span>
                    <span className="whitespace-nowrap text-[10px] text-[#A0AAA4]">{formatLabel(event.toStatus)}</span>
                  </div>
                  {index < list.length - 1 ? <span className="mx-4 h-px w-12 bg-white/[0.08]" /> : null}
                </div>
              ))}
            </div>
          </section>

          <div className="py-5">
            <OrderLiveChat orderId={order.id} currentUserId={currentUserId} initialMessages={initialMessages} />
          </div>

          <section className={`border-t border-white/[0.06] pt-5 ${isBoosterMode ? "" : "grid gap-6 lg:grid-cols-2"}`}>
            <div>
              <h2 className="text-sm font-semibold text-[#F4F7F5]">Configuration</h2>
              <dl className="mt-2 divide-y divide-white/[0.05]">
                {item ? Object.entries(item.configuration).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-[minmax(110px,.72fr)_minmax(0,1.28fr)] gap-4 py-3">
                    <dt className="text-xs text-[#667069]">{formatLabel(key)}</dt>
                    <dd className="text-right text-xs font-medium text-[#F4F7F5]">{formatValue(value)}</dd>
                  </div>
                )) : null}
              </dl>
            </div>

            {!isBoosterMode ? (
              <div>
                <h2 className="text-sm font-semibold text-[#F4F7F5]">Price breakdown</h2>
                <div className="mt-2 divide-y divide-white/[0.05]">
                  {item?.priceBreakdown.map((line, index) => (
                    <div key={`${line.label}-${index}`} className="flex justify-between gap-4 py-3 text-xs">
                      <span className="text-[#A0AAA4]">{line.label}</span>
                      <span className={line.amount < 0 ? "text-[#82F5A4]" : "text-[#F4F7F5]"}>{line.amount < 0 ? "−" : ""}{formatMoney(Math.abs(line.amount))}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </main>

        <aside className="min-w-0">
          <div className="overflow-hidden rounded-[1.2rem] border border-white/[0.08] bg-[#0E1411]">
            <section className="p-5">
              <div className="flex items-center gap-2.5"><CreditCard className="size-4 text-[#667069]" /><h2 className="text-sm font-semibold text-[#F4F7F5]">Order Details</h2></div>
              <dl className="mt-4 divide-y divide-white/[0.05]">
                <div className="flex justify-between gap-4 py-2.5"><dt className="text-[11px] text-[#667069]">Order</dt><dd className="font-gaming-value text-xs text-[#F4F7F5]">{order.orderNumber}</dd></div>
                <div className="flex justify-between gap-4 py-2.5"><dt className="text-[11px] text-[#667069]">Payment</dt><dd className={`text-[11px] font-semibold ${order.paymentStatus === "paid" ? "text-[#82F5A4]" : "text-[#A0AAA4]"}`}>{order.paymentStatus === "paid" ? "Paid" : order.paymentStatus === "pending" ? "Pending" : "Not completed"}</dd></div>
                <div className="flex items-end justify-between gap-4 pt-3"><dt className="text-[11px] text-[#667069]">{isBoosterMode ? "Your payout" : "Total"}</dt><dd className={`font-gaming-value text-2xl font-bold ${isBoosterMode ? "text-[#82F5A4]" : "text-[#F4F7F5]"}`}>{formatMoney(displayAmount)}</dd></div>
              </dl>
              {canPay ? <form action="/api/checkout" method="post" className="mt-4"><input type="hidden" name="orderId" value={order.id} /><button className="h-11 w-full rounded-xl bg-[#39E56F] text-xs font-semibold text-[#050807] hover:bg-[#20C95A]">Complete secure payment</button></form> : null}
            </section>

            <div className="h-px bg-white/[0.06]" />

            <section className="p-5">
              <div className="flex items-center gap-2.5"><UsersRound className="size-4 text-[#667069]" /><h2 className="text-sm font-semibold text-[#F4F7F5]">Booster</h2></div>
              {boosterAssignment ? (
                <div className="mt-4 flex items-center gap-3">
                  <span className="grid size-10 place-items-center overflow-hidden rounded-full border border-white/[0.08] bg-[#090D0B] text-xs font-bold text-[#F4F7F5]">
                    {boosterAssignment.avatarUrl ? <img src={boosterAssignment.avatarUrl} alt="" className="h-full w-full object-cover" /> : boosterAssignment.displayName.slice(0, 2).toUpperCase()}
                  </span>
                  <div><p className="text-sm font-semibold text-[#F4F7F5]">{boosterAssignment.displayName}</p><p className="mt-0.5 text-[10px] text-[#667069]">Assigned booster</p></div>
                </div>
              ) : <p className="mt-4 text-sm font-semibold text-[#F4F7F5]">Waiting for assignment</p>}
            </section>

            <div className="h-px bg-white/[0.06]" />

            <section className="p-5">
              <OrderAccountDetails orderId={order.id} canEdit={isCustomerOwner} />
            </section>

            <div className="h-px bg-white/[0.06]" />

            <section className="p-5">
              <div className="flex items-center gap-2.5"><UserRoundCheck className="size-4 text-[#667069]" /><h2 className="text-sm font-semibold text-[#F4F7F5]">User Integrity Validation</h2></div>
              <div className="mt-4 flex items-center justify-between gap-4"><div><p className="text-sm font-semibold text-[#F4F7F5]">Not requested</p><p className="mt-1 text-[10px] text-[#667069]">Validation workflow is reserved for Phase 16E.</p></div><ShieldCheck className="size-5 text-[#667069]" /></div>
            </section>

            <div className="h-px bg-white/[0.06]" />

            {["Order Start Screenshot", "Order Final Screenshot"].map((title) => (
              <div key={title}>
                <section className="p-5">
                  <div className="flex items-center gap-2.5"><ImageIcon className="size-4 text-[#667069]" /><h2 className="text-sm font-semibold text-[#F4F7F5]">{title}</h2></div>
                  <div className="mt-4 flex min-h-20 items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-[#090D0B] px-4 text-center"><p className="text-[10px] text-[#667069]">Evidence upload is reserved for Phase 16E.</p></div>
                </section>
                {title === "Order Start Screenshot" ? <div className="h-px bg-white/[0.06]" /> : null}
              </div>
            ))}
          </div>

          <Link href="/dashboard/notifications" className="group mt-4 flex items-center gap-3 border-t border-white/[0.05] pt-4">
            <span className="grid size-8 place-items-center text-blue-200/65"><Bell className="size-4" /></span>
            <span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-[#F4F7F5]">Order notifications</span><span className="mt-0.5 block text-[10px] text-[#667069]">Review payment and fulfillment updates</span></span>
            <ChevronRight className="size-4 text-[#667069] group-hover:text-[#A0AAA4]" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
