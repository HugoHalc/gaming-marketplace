"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Check,
  ChevronRight,
  Clock3,
  CreditCard,
  Gamepad2,
  KeyRound,
  MessageSquare,
  Monitor,
  Package,
  ShieldCheck,
  UserRound,
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
  const roman =
    tier === "1" ? "I" : tier === "2" ? "II" : tier === "3" ? "III" : "";
  return `${family}${roman ? ` ${roman}` : ""}`;
}

function RankBadge({ rank, size = "md" }: { rank: string; size?: "sm" | "md" }) {
  const asset = rankAssets[rankFamily(rank)];
  const dimension = size === "sm" ? 38 : 52;

  if (!asset) {
    return (
      <span
        className={`grid shrink-0 place-items-center rounded-full border border-white/[0.08] bg-[#090D0B] font-bold text-[#667069] ${
          size === "sm" ? "size-9 text-[9px]" : "size-12 text-[10px]"
        }`}
      >
        ?
      </span>
    );
  }

  return (
    <Image
      src={asset}
      alt=""
      width={dimension}
      height={dimension}
      className={`shrink-0 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,.42)] ${
        size === "sm" ? "size-9" : "size-12"
      }`}
    />
  );
}

function ServiceProgression({ order }: { order: OrderRecord }) {
  const item = order.items[0];
  if (!item) return null;

  const config = item.configuration;
  const currentRank =
    typeof config.currentRank === "string"
      ? config.currentRank
      : typeof config.previousRank === "string"
        ? config.previousRank
        : null;
  const targetRank =
    typeof config.targetRank === "string" ? config.targetRank : null;
  const wins = typeof config.wins === "number" ? config.wins : null;
  const matches = typeof config.matches === "number" ? config.matches : null;

  if (currentRank && targetRank) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-[150px] items-center gap-3 rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 py-3">
          <RankBadge rank={currentRank} />
          <div className="min-w-0">
            <p className="font-gaming-label text-[9px] uppercase tracking-[0.13em] text-[#667069]">
              Current
            </p>
            <p className="font-gaming-value mt-0.5 truncate text-base font-bold text-[#F4F7F5]">
              {rankLabel(currentRank)}
            </p>
          </div>
        </div>

        <ArrowRight className="size-4 shrink-0 text-blue-200/45" />

        <div className="flex min-w-[150px] items-center gap-3 rounded-xl border border-blue-300/[0.14] bg-blue-400/[0.025] px-3 py-3">
          <RankBadge rank={targetRank} />
          <div className="min-w-0">
            <p className="font-gaming-label text-[9px] uppercase tracking-[0.13em] text-blue-200/55">
              Target
            </p>
            <p className="font-gaming-value mt-0.5 truncate text-base font-bold text-[#F4F7F5]">
              {rankLabel(targetRank)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {currentRank ? (
        <div className="flex min-w-[150px] items-center gap-3 rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 py-3">
          <RankBadge rank={currentRank} />
          <div className="min-w-0">
            <p className="font-gaming-label text-[9px] uppercase tracking-[0.13em] text-[#667069]">
              Rank context
            </p>
            <p className="font-gaming-value mt-0.5 truncate text-base font-bold text-[#F4F7F5]">
              {rankLabel(currentRank)}
            </p>
          </div>
        </div>
      ) : null}

      {wins !== null || matches !== null ? (
        <div className="min-w-[145px] rounded-xl border border-blue-300/[0.14] bg-blue-400/[0.025] px-4 py-3">
          <p className="font-gaming-label text-[9px] uppercase tracking-[0.13em] text-blue-200/55">
            {matches !== null ? "Placement matches" : "Wins selected"}
          </p>
          <p className="font-gaming-value mt-1 text-2xl font-bold leading-none text-[#F4F7F5]">
            {matches ?? wins}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function MetadataGrid({ order }: { order: OrderRecord }) {
  const item = order.items[0];
  if (!item) return null;

  const config = item.configuration;
  const rows = [
    typeof config.playlist === "string"
      ? ["Playlist", formatValue(config.playlist)]
      : null,
    typeof config.platform === "string"
      ? ["Platform", formatValue(config.platform)]
      : null,
    typeof config.boostMethod === "string"
      ? ["Boost Method", formatValue(config.boostMethod)]
      : null,
  ].filter(Boolean) as Array<[string, string]>;

  if (!rows.length) return null;

  return (
    <dl className="grid gap-3 sm:grid-cols-3">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded-xl border border-white/[0.07] bg-[#090D0B] p-3">
          <dt className="text-[9px] font-semibold uppercase tracking-[0.11em] text-[#667069]">
            {label}
          </dt>
          <dd className="mt-1.5 text-xs font-medium text-[#F4F7F5]">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function StatusTimeline({
  history,
  currentStatus,
}: {
  history: OrderStatusEvent[];
  currentStatus: OrderRecord["status"];
}) {
  if (!history.length) {
    return (
      <div className="rounded-xl border border-white/[0.07] bg-[#090D0B] p-4">
        <div className="flex items-center gap-3">
          <span className="size-2 rounded-full bg-cyan-300" />
          <div>
            <p className="text-xs font-semibold text-[#F4F7F5]">
              {orderStatusLabel(currentStatus)}
            </p>
            <p className="mt-1 text-[10px] text-[#667069]">
              Current status. No additional history has been recorded yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ol className="relative space-y-0" aria-label="Order status history">
      {history.map((event, index) => {
        const current = index === history.length - 1;
        return (
          <li key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
            {index !== history.length - 1 ? (
              <span className="absolute left-[13px] top-7 h-[calc(100%-16px)] w-px bg-white/[0.08]" />
            ) : null}
            <span
              className={`relative z-[1] mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border ${
                current
                  ? "border-cyan-300/[0.20] bg-cyan-400/[0.07] text-cyan-200"
                  : "border-white/[0.08] bg-[#090D0B] text-[#667069]"
              }`}
            >
              <Check className="size-3" strokeWidth={2.4} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-[#F4F7F5]">
                  {orderStatusLabel(event.toStatus)}
                </p>
                <time className="text-[9px] text-[#667069]">
                  {formatShortDate(event.createdAt)}
                </time>
              </div>
              {event.note ? (
                <p className="mt-1 text-[11px] leading-5 text-[#A0AAA4]">
                  {event.note}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function BoosterAssignment({ order }: { order: OrderRecord }) {
  const statusCopy =
    order.status === "completed"
      ? "Booster assignment details are not available in the current customer data model."
      : order.status === "in_progress"
        ? "Your order is in progress. Booster profile data will appear here when assignment data is connected to the customer workspace."
        : "Waiting for assignment details to become available in the customer workspace.";

  return (
    <section className="rounded-[1.35rem] border border-white/[0.07] bg-[#0E1411] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.13em] text-[#667069]">
            Booster assignment
          </p>
          <h2 className="mt-2 text-base font-semibold text-[#F4F7F5]">
            {order.status === "paid" || order.status === "queued"
              ? "Waiting for assignment"
              : "Assignment details"}
          </h2>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-[#090D0B] text-[#667069]">
          <UsersRound className="size-4" strokeWidth={1.8} />
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-[#A0AAA4]">{statusCopy}</p>
    </section>
  );
}

function CustomerActionCenter({ order }: { order: OrderRecord }) {
  if (order.status === "pending_payment" && order.paymentStatus !== "paid") {
    return (
      <section className="rounded-[1.35rem] border border-amber-300/[0.14] bg-amber-300/[0.035] p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-amber-300/[0.14] bg-amber-300/[0.04] text-amber-200">
            <CreditCard className="size-4" strokeWidth={1.8} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.13em] text-amber-200/70">
              Action required
            </p>
            <h2 className="mt-1 text-base font-semibold text-[#F4F7F5]">
              Complete payment
            </h2>
            <p className="mt-1 text-xs leading-5 text-[#A0AAA4]">
              Payment is the only customer action currently available for this order.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return null;
}

function FutureWorkspaceModule({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#090D0B] p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-[#0E1411] text-[#667069]">
          {icon}
        </span>
        <div>
          <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.12em] text-[#667069]">
            {eyebrow}
          </p>
          <p className="mt-1 text-sm font-semibold text-[#F4F7F5]">{title}</p>
          <p className="mt-1 text-[11px] leading-5 text-[#A0AAA4]">
            {description}
          </p>
        </div>
      </div>
    </div>
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
        className="inline-flex items-center text-xs font-medium text-[#A0AAA4] transition-colors hover:text-[#F4F7F5]"
      >
        ← Back to orders
      </Link>

      {checkoutState === "success" ? (
        <div className="mt-5 rounded-xl border border-[#39E56F]/20 bg-[#39E56F]/[0.06] p-4 text-sm text-[#82F5A4]">
          Payment submitted successfully. Stripe is confirming the payment and this page will reflect the verified status.
        </div>
      ) : null}

      {checkoutState === "cancelled" ? (
        <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-400/[0.06] p-4 text-sm text-amber-100">
          Checkout was cancelled. Your order is still saved and you can try payment again.
        </div>
      ) : null}

      {paymentError ? (
        <div className="mt-5 rounded-xl border border-rose-300/20 bg-rose-400/[0.06] p-4 text-sm text-rose-100">
          We could not start secure checkout. Please try again.
        </div>
      ) : null}

      <header className="mt-5 overflow-hidden rounded-[1.45rem] border border-white/[0.08] bg-[#0E1411]">
        <div className="border-b border-white/[0.07] bg-gradient-to-br from-blue-500/[0.045] via-transparent to-transparent p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-blue-300/[0.12] bg-blue-400/[0.035] text-blue-200/75">
                  <Gamepad2 className="size-[18px]" strokeWidth={1.8} />
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

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-[#667069]">
                <span className="font-gaming-value font-bold text-[#A0AAA4]">
                  {order.orderNumber}
                </span>
                <span>Created {formatDate(order.createdAt)}</span>
              </div>
            </div>

            <div className="flex shrink-0 flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
              <OrderStatusBadge status={order.status} />
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-[0.11em] text-[#667069]">
                  Total
                </p>
                <p className="font-gaming-value mt-1 text-2xl font-bold tracking-[-0.035em] text-[#F4F7F5]">
                  {formatMoney(order.total)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <ServiceProgression order={order} />
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <MetadataGrid order={order} />
        </div>
      </header>

      <CustomerActionCenter order={order} />

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
        <div className="space-y-5">
          <section className="rounded-[1.35rem] border border-white/[0.07] bg-[#0E1411] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.13em] text-blue-200/55">
                  Order status
                </p>
                <h2 className="mt-2 text-lg font-semibold text-[#F4F7F5]">
                  Progress timeline
                </h2>
                <p className="mt-1 text-xs text-[#A0AAA4]">
                  Uses recorded order events only. No estimated percentage.
                </p>
              </div>
              <Clock3 className="size-4 text-[#667069]" strokeWidth={1.8} />
            </div>

            <div className="mt-5">
              <StatusTimeline history={history} currentStatus={order.status} />
            </div>
          </section>

          <section className="rounded-[1.35rem] border border-white/[0.07] bg-[#0E1411] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.13em] text-[#667069]">
                  Order details
                </p>
                <h2 className="mt-2 text-lg font-semibold text-[#F4F7F5]">
                  Configuration
                </h2>
              </div>
              <Monitor className="size-4 text-[#667069]" strokeWidth={1.8} />
            </div>

            {item ? (
              <>
                <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                  {Object.entries(item.configuration).map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-xl border border-white/[0.07] bg-[#090D0B] p-3"
                    >
                      <dt className="text-[9px] font-semibold uppercase tracking-[0.10em] text-[#667069]">
                        {formatLabel(key)}
                      </dt>
                      <dd className="mt-1.5 text-xs font-medium text-[#F4F7F5]">
                        {formatValue(value)}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="my-5 h-px bg-white/[0.07]" />

                <h3 className="text-sm font-semibold text-[#F4F7F5]">
                  Price breakdown
                </h3>
                <div className="mt-4 space-y-3">
                  {item.priceBreakdown.map((line, index) => (
                    <div
                      key={`${line.label}-${index}`}
                      className="flex justify-between gap-4 text-xs"
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
              </>
            ) : (
              <p className="mt-5 text-xs text-[#A0AAA4]">
                No configuration data is available for this order.
              </p>
            )}
          </section>

          <section className="rounded-[1.35rem] border border-white/[0.07] bg-[#0E1411] p-5 sm:p-6">
            <div>
              <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.13em] text-[#667069]">
                Order workspace foundation
              </p>
              <h2 className="mt-2 text-lg font-semibold text-[#F4F7F5]">
                Access & evidence
              </h2>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-[#A0AAA4]">
                Sensitive account access and evidence tools are intentionally not active in this phase.
              </p>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <FutureWorkspaceModule
                icon={<KeyRound className="size-4" strokeWidth={1.8} />}
                eyebrow="Secure account access"
                title="No credentials shown here"
                description="Game account credentials will only be handled inside the dedicated secure order workflow when that feature is implemented."
              />
              <FutureWorkspaceModule
                icon={<ShieldCheck className="size-4" strokeWidth={1.8} />}
                eyebrow="Verification & evidence"
                title="No action available yet"
                description="Identity verification and start/end evidence uploads are reserved for a later operational phase."
              />
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <BoosterAssignment order={order} />

          <section className="rounded-[1.35rem] border border-white/[0.07] bg-[#0E1411] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.13em] text-[#667069]">
                  Order conversation
                </p>
                <h2 className="mt-2 text-base font-semibold text-[#F4F7F5]">
                  No messages yet
                </h2>
              </div>
              <MessageSquare className="size-4 text-[#667069]" strokeWidth={1.8} />
            </div>

            <p className="mt-3 text-xs leading-5 text-[#A0AAA4]">
              Live order chat is not active yet. Conversation tools will be connected in Phase 16C.
            </p>
          </section>

          <section className="rounded-[1.35rem] border border-white/[0.07] bg-[#0E1411] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.13em] text-[#667069]">
                  Payment
                </p>
                <h2 className="mt-2 text-base font-semibold text-[#F4F7F5]">
                  {order.paymentStatus === "paid"
                    ? "Payment verified"
                    : order.paymentStatus === "pending"
                      ? "Payment pending"
                      : "Payment not completed"}
                </h2>
              </div>
              <CreditCard className="size-4 text-[#667069]" strokeWidth={1.8} />
            </div>

            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.11em] text-[#667069]">
                  Order total
                </p>
                <p className="font-gaming-value mt-1 text-2xl font-bold text-[#F4F7F5]">
                  {formatMoney(order.total)}
                </p>
              </div>
              <span
                className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold ${
                  order.paymentStatus === "paid"
                    ? "border-[#39E56F]/20 bg-[#39E56F]/[0.06] text-[#82F5A4]"
                    : "border-white/[0.08] bg-[#090D0B] text-[#A0AAA4]"
                }`}
              >
                {order.paymentStatus === "paid" ? "PAID" : "USD"}
              </span>
            </div>

            {canPay ? (
              <form action="/api/checkout" method="post" className="mt-4">
                <input type="hidden" name="orderId" value={order.id} />
                <button className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#39E56F] px-5 text-sm font-semibold text-[#050807] transition-colors hover:bg-[#20C95A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39E56F]/40">
                  Complete secure payment
                  <ArrowRight className="ml-2 size-4" strokeWidth={1.9} />
                </button>
              </form>
            ) : order.paymentStatus === "paid" ? (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#39E56F]/15 bg-[#39E56F]/[0.035] p-3">
                <Check className="mt-0.5 size-3.5 shrink-0 text-[#82F5A4]" />
                <p className="text-[11px] leading-5 text-[#A0AAA4]">
                  Stripe has confirmed this payment.
                </p>
              </div>
            ) : null}
          </section>

          <Link
            href="/dashboard/notifications"
            className="group flex items-center gap-3 rounded-[1.2rem] border border-white/[0.07] bg-[#090D0B] p-4 transition-colors hover:bg-[#0E1411]"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-[#0E1411] text-blue-200/65">
              <Bell className="size-4" strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-[#F4F7F5]">
                Order notifications
              </span>
              <span className="mt-1 block text-[10px] text-[#667069]">
                Review recorded payment and fulfillment updates.
              </span>
            </span>
            <ChevronRight className="size-4 text-[#667069] group-hover:text-[#A0AAA4]" />
          </Link>
        </aside>
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
