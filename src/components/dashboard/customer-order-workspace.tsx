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
  KeyRound,
  MessageSquare,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import type { OrderRecord, OrderStatusEvent } from "@/features/orders/types/orders";
import {
  OrderStatusBadge,
  orderStatusLabel,
} from "@/features/orders/components/order-status-badge";

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

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function formatValue(value: string | number | boolean) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === "play-with-booster") return "Play With Booster";
  if (value === "account") return "Account Boost";
  return String(value)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function rankFamily(value: string) {
  if (value === "supersonic-legend") return value;
  return value.replace(/-\d$/, "");
}

function rankLabel(value: string) {
  if (value === "unrated") return "Unrated";
  if (value === "supersonic-legend") return "Supersonic Legend";

  const tier = value.match(/-(\d)$/)?.[1];
  const family = rankFamily(value)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const roman = tier === "1" ? "I" : tier === "2" ? "II" : tier === "3" ? "III" : "";
  return `${family}${roman ? ` ${roman}` : ""}`;
}

function isResolvableRank(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (value === "unrated" || value === "supersonic-legend") return true;
  return Boolean(rankAssets[rankFamily(value)] && /-\d$/.test(value));
}

function RankEditorial({
  rank,
  label,
}: {
  rank: string;
  label: string;
}) {
  const asset = rankAssets[rankFamily(rank)];

  return (
    <div className="flex items-center gap-3">
      {asset ? (
        <Image
          src={asset}
          alt=""
          width={50}
          height={50}
          className="size-12 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,.42)]"
        />
      ) : (
        <span className="grid size-12 place-items-center rounded-full border border-white/[0.08] text-[10px] font-bold text-[#667069]">
          ?
        </span>
      )}

      <div>
        <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.13em] text-[#667069]">
          {label}
        </p>
        <p className="font-gaming-value mt-0.5 text-lg font-bold text-[#F4F7F5]">
          {rankLabel(rank)}
        </p>
      </div>
    </div>
  );
}

function WorkspaceProgression({ order }: { order: OrderRecord }) {
  const item = order.items[0];
  if (!item) return null;

  const config = item.configuration;
  const currentCandidate =
    typeof config.currentRank !== "undefined" ? config.currentRank : config.previousRank;
  const targetCandidate = config.targetRank;
  const currentRank = isResolvableRank(currentCandidate) ? currentCandidate : null;
  const targetRank = isResolvableRank(targetCandidate) ? targetCandidate : null;

  if (currentRank && targetRank) {
    return (
      <div className="mt-5 flex flex-wrap items-center gap-5 sm:gap-7">
        <RankEditorial rank={currentRank} label="Current" />
        <ArrowRight className="size-4 shrink-0 text-blue-200/40" />
        <RankEditorial rank={targetRank} label="Target" />
      </div>
    );
  }

  const wins = typeof config.wins === "number" ? config.wins : null;
  const matches = typeof config.matches === "number" ? config.matches : null;

  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-4">
      {currentRank ? <RankEditorial rank={currentRank} label="Rank context" /> : null}
      {wins !== null || matches !== null ? (
        <div>
          <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.13em] text-[#667069]">
            {matches !== null ? "Placement Matches" : "Wins Selected"}
          </p>
          <p className="font-gaming-value mt-1 text-3xl font-bold leading-none text-[#F4F7F5]">
            {matches ?? wins}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function ProgressTimeline({
  history,
  currentStatus,
}: {
  history: OrderStatusEvent[];
  currentStatus: OrderRecord["status"];
}) {
  if (!history.length) {
    return (
      <div className="flex items-center gap-3 py-4">
        <span className="size-2 rounded-full bg-cyan-300" />
        <div>
          <p className="text-xs font-semibold text-[#F4F7F5]">
            {orderStatusLabel(currentStatus)}
          </p>
          <p className="mt-0.5 text-[10px] text-[#667069]">
            Current status. No additional history has been recorded yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ol aria-label="Order status history">
      {history.map((event, index) => {
        const current = index === history.length - 1;
        return (
          <li
            key={event.id}
            className="grid grid-cols-[24px_1fr_auto] gap-3 border-b border-white/[0.05] py-3.5 last:border-b-0"
          >
            <span
              className={`mt-0.5 grid size-6 place-items-center rounded-full border ${
                current
                  ? "border-cyan-300/[0.20] bg-cyan-400/[0.06] text-cyan-200"
                  : "border-white/[0.08] text-[#667069]"
              }`}
            >
              {current ? (
                <span className="size-1.5 rounded-full bg-cyan-300" />
              ) : (
                <Check className="size-2.5" strokeWidth={2.4} />
              )}
            </span>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#F4F7F5]">
                {orderStatusLabel(event.toStatus)}
              </p>
              {event.note ? (
                <p className="mt-1 text-[11px] leading-5 text-[#A0AAA4]">
                  {event.note}
                </p>
              ) : null}
            </div>

            <time className="pt-1 text-[9px] text-[#667069]">
              {formatShortDate(event.createdAt)}
            </time>
          </li>
        );
      })}
    </ol>
  );
}

function ConfigurationRows({ order }: { order: OrderRecord }) {
  const item = order.items[0];
  if (!item) {
    return <p className="py-4 text-xs text-[#A0AAA4]">No configuration data is available.</p>;
  }

  return (
    <dl className="divide-y divide-white/[0.05]">
      {Object.entries(item.configuration).map(([key, value]) => (
        <div
          key={key}
          className="grid grid-cols-[minmax(110px,.7fr)_minmax(0,1.3fr)] gap-4 py-3"
        >
          <dt className="text-xs text-[#667069]">{formatLabel(key)}</dt>
          <dd className="text-right text-xs font-medium text-[#F4F7F5]">
            {formatValue(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function SidebarSurface({
  order,
  canPay,
}: {
  order: OrderRecord;
  canPay: boolean;
}) {
  return (
    <aside className="overflow-hidden rounded-[1.25rem] border border-white/[0.08] bg-[#0E1411]">
      <section className="p-5">
        <div className="flex items-center gap-3">
          <UsersRound className="size-4 text-[#667069]" strokeWidth={1.8} />
          <div>
            <p className="text-xs text-[#667069]">Booster</p>
            <p className="mt-1 text-sm font-semibold text-[#F4F7F5]">
              {order.status === "paid" || order.status === "queued"
                ? "Waiting for assignment"
                : "Assignment details unavailable"}
            </p>
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-5 text-[#A0AAA4]">
          Booster identity will appear here when assignment data is connected to the customer workspace.
        </p>
      </section>

      <div className="h-px bg-white/[0.06]" />

      <section className="p-5">
        <div className="flex items-center gap-3">
          <MessageSquare className="size-4 text-[#667069]" strokeWidth={1.8} />
          <div>
            <p className="text-xs text-[#667069]">Conversation</p>
            <p className="mt-1 text-sm font-semibold text-[#F4F7F5]">
              No messages yet
            </p>
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-5 text-[#A0AAA4]">
          Chat will be available when the live order conversation system is implemented.
        </p>
      </section>

      <div className="h-px bg-white/[0.06]" />

      <section className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-[#667069]">Payment</p>
            <p className="font-gaming-value mt-1 text-2xl font-bold text-[#F4F7F5]">
              {formatMoney(order.total)}
            </p>
          </div>
          <span
            className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold ${
              order.paymentStatus === "paid"
                ? "border-[#39E56F]/20 bg-[#39E56F]/[0.06] text-[#82F5A4]"
                : "border-white/[0.08] text-[#A0AAA4]"
            }`}
          >
            {order.paymentStatus === "paid" ? "PAID" : "USD"}
          </span>
        </div>

        {order.paymentStatus === "paid" ? (
          <p className="mt-3 inline-flex items-center gap-2 text-[11px] text-[#A0AAA4]">
            <Check className="size-3.5 text-[#82F5A4]" strokeWidth={2.5} />
            Stripe confirmed
          </p>
        ) : null}

        {canPay ? (
          <form action="/api/checkout" method="post" className="mt-4">
            <input type="hidden" name="orderId" value={order.id} />
            <button className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#39E56F] px-4 text-xs font-semibold text-[#050807] transition-colors hover:bg-[#20C95A]">
              Complete secure payment
              <ArrowRight className="ml-2 size-3.5" strokeWidth={1.9} />
            </button>
          </form>
        ) : null}
      </section>

      <div className="h-px bg-white/[0.06]" />

      <section className="p-5">
        <div className="flex items-center gap-3">
          <KeyRound className="size-4 text-[#667069]" strokeWidth={1.8} />
          <div>
            <p className="text-xs text-[#667069]">Secure Account Access</p>
            <p className="mt-1 text-sm font-semibold text-[#F4F7F5]">
              Not active yet
            </p>
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-5 text-[#A0AAA4]">
          Credentials, verification and evidence remain outside this phase.
        </p>
      </section>
    </aside>
  );
}

interface CustomerOrderWorkspaceProps {
  order: OrderRecord;
  history: OrderStatusEvent[];
  checkoutState?: string;
  paymentError?: string;
}

export function CustomerOrderWorkspace({
  order,
  history,
  checkoutState,
  paymentError,
}: CustomerOrderWorkspaceProps) {
  const item = order.items[0];
  const canPay =
    order.status === "pending_payment" && order.paymentStatus !== "paid";

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center text-xs font-medium text-[#A0AAA4] hover:text-[#F4F7F5]"
      >
        ← Back to orders
      </Link>

      {checkoutState === "success" ? (
        <div className="mt-5 border-y border-[#39E56F]/15 py-3 text-sm text-[#82F5A4]">
          Payment submitted successfully. Stripe is confirming the payment and this page will reflect the verified status.
        </div>
      ) : null}

      {checkoutState === "cancelled" ? (
        <div className="mt-5 border-y border-amber-300/15 py-3 text-sm text-amber-100">
          Checkout was cancelled. Your order is still saved and you can try payment again.
        </div>
      ) : null}

      {paymentError ? (
        <div className="mt-5 border-y border-rose-300/15 py-3 text-sm text-rose-100">
          We could not start secure checkout. Please try again.
        </div>
      ) : null}

      <div className="mt-5 grid gap-7 xl:grid-cols-[minmax(0,1fr)_minmax(300px,31%)]">
        <main className="min-w-0">
          <header className="border-b border-white/[0.06] pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-blue-300/[0.12] bg-blue-400/[0.03] text-blue-200/75">
                    <Gamepad2 className="size-4" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.14em] text-blue-200/55">
                      {item?.gameName ?? "Gaming service"}
                    </p>
                    <h1 className="mt-0.5 truncate text-xl font-semibold tracking-[-0.025em] text-[#F4F7F5] sm:text-2xl">
                      {item?.serviceName ?? "Customer Order"}
                    </h1>
                  </div>
                </div>

                <p className="font-gaming-value mt-3 text-[11px] font-semibold text-[#667069]">
                  {order.orderNumber}
                  <span className="mx-2 text-white/[0.16]">·</span>
                  <span className="font-sans font-normal">
                    Created {formatDate(order.createdAt)}
                  </span>
                </p>
              </div>

              <div className="flex shrink-0 items-start gap-5 sm:flex-col sm:items-end sm:gap-2">
                <OrderStatusBadge status={order.status} />
                <p className="font-gaming-value text-2xl font-bold tracking-[-0.035em] text-[#F4F7F5]">
                  {formatMoney(order.total)}
                </p>
              </div>
            </div>

            <WorkspaceProgression order={order} />
          </header>

          <section className="border-b border-white/[0.06] py-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.13em] text-blue-200/55">
                  Order Progress
                </p>
                <h2 className="mt-1 text-base font-semibold text-[#F4F7F5]">
                  Progress
                </h2>
              </div>
              <span className="text-[10px] text-[#667069]">
                Recorded events only
              </span>
            </div>

            <div className="mt-3">
              <ProgressTimeline history={history} currentStatus={order.status} />
            </div>
          </section>

          <section className="border-b border-white/[0.06] py-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base font-semibold text-[#F4F7F5]">
                Configuration
              </h2>
              <span className="text-[10px] text-[#667069]">
                Order selections
              </span>
            </div>

            <div className="mt-3">
              <ConfigurationRows order={order} />
            </div>
          </section>

          <section className="border-b border-white/[0.06] py-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base font-semibold text-[#F4F7F5]">
                Price breakdown
              </h2>
            </div>

            {item ? (
              <div className="mt-3 divide-y divide-white/[0.05]">
                {item.priceBreakdown.map((line, index) => (
                  <div
                    key={`${line.label}-${index}`}
                    className="flex items-center justify-between gap-4 py-3 text-xs"
                  >
                    <span className="text-[#A0AAA4]">{line.label}</span>
                    <span
                      className={
                        line.amount < 0
                          ? "font-medium text-[#82F5A4]"
                          : "font-medium text-[#F4F7F5]"
                      }
                    >
                      {line.amount < 0 ? "−" : ""}
                      {formatMoney(Math.abs(line.amount))}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className="py-6">
            <div className="flex items-start gap-3">
              <MessageSquare className="mt-0.5 size-4 shrink-0 text-[#667069]" />
              <div>
                <h2 className="text-base font-semibold text-[#F4F7F5]">
                  Order conversation
                </h2>
                <p className="mt-1 max-w-xl text-xs leading-5 text-[#A0AAA4]">
                  This area is intentionally left open so Phase 16C can introduce a full-size live chat workspace without being constrained inside a small card.
                </p>
              </div>
            </div>
          </section>
        </main>

        <div className="min-w-0">
          <SidebarSurface order={order} canPay={canPay} />

          <Link
            href="/dashboard/notifications"
            className="group mt-4 flex items-center gap-3 border-t border-white/[0.05] pt-4"
          >
            <span className="grid size-8 shrink-0 place-items-center text-blue-200/65">
              <Bell className="size-4" strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-[#F4F7F5]">
                Order notifications
              </span>
              <span className="mt-0.5 block text-[10px] text-[#667069]">
                Review payment and fulfillment updates
              </span>
            </span>
            <ChevronRight className="size-4 text-[#667069] group-hover:text-[#A0AAA4]" />
          </Link>
        </div>
      </div>

      {canPay ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#050807]/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
            <div>
              <p className="text-[9px] uppercase tracking-[0.11em] text-[#667069]">
                Payment required
              </p>
              <p className="font-gaming-value mt-0.5 text-xl font-bold text-[#F4F7F5]">
                {formatMoney(order.total)}
              </p>
            </div>
            <form action="/api/checkout" method="post">
              <input type="hidden" name="orderId" value={order.id} />
              <button className="inline-flex h-11 items-center justify-center rounded-xl bg-[#39E56F] px-4 text-xs font-semibold text-[#050807] hover:bg-[#20C95A]">
                Pay securely
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
