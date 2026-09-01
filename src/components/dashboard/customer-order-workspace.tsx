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
  ImageIcon,
  KeyRound,
  MessageSquare,
  Send,
  ShieldCheck,
  UserRoundCheck,
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
          width={52}
          height={52}
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

function CompactProgress({
  history,
  currentStatus,
}: {
  history: OrderStatusEvent[];
  currentStatus: OrderRecord["status"];
}) {
  const stages = history.length
    ? history.slice(-4).map((event) => ({
        id: event.id,
        label: orderStatusLabel(event.toStatus),
        date: formatShortDate(event.createdAt),
      }))
    : [
        {
          id: currentStatus,
          label: orderStatusLabel(currentStatus),
          date: "Current",
        },
      ];

  return (
    <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max items-center py-1">
        {stages.map((stage, index) => {
          const current = index === stages.length - 1;

          return (
            <div key={stage.id} className="flex items-center">
              <div className="flex items-center gap-2">
                <span
                  className={`grid size-5 place-items-center rounded-full border ${
                    current
                      ? "border-cyan-300/25 bg-cyan-400/[0.08] text-cyan-200"
                      : "border-white/[0.10] bg-white/[0.02] text-[#A0AAA4]"
                  }`}
                >
                  {current ? (
                    <span className="size-1.5 rounded-full bg-cyan-300" />
                  ) : (
                    <Check className="size-2.5" strokeWidth={2.5} />
                  )}
                </span>
                <div>
                  <p className="text-[10px] font-medium text-[#A0AAA4]">{stage.label}</p>
                  <p className="mt-0.5 text-[8px] text-[#667069]">{stage.date}</p>
                </div>
              </div>

              {index < stages.length - 1 ? (
                <span className="mx-4 h-px w-10 bg-white/[0.08] sm:w-14" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
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
          className="grid grid-cols-[minmax(110px,.72fr)_minmax(0,1.28fr)] gap-4 py-3"
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

function ConversationWorkspace() {
  return (
    <section className="overflow-hidden rounded-[1.2rem] border border-white/[0.07] bg-[#070A08]">
      <div className="flex min-h-[390px] flex-col sm:min-h-[480px] xl:min-h-[560px]">
        <div className="flex items-center justify-between border-b border-white/[0.05] px-4 py-3.5 sm:px-5">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full border border-white/[0.07] bg-[#0E1411] text-[#667069]">
              <UsersRound className="size-4" strokeWidth={1.8} />
            </span>
            <div>
              <p className="text-xs font-semibold text-[#F4F7F5]">Order conversation</p>
              <p className="mt-0.5 text-[10px] text-[#667069]">Live chat foundation</p>
            </div>
          </div>

          <span className="font-gaming-label text-[9px] uppercase tracking-[0.12em] text-[#667069]">
            Phase 16D
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 text-center">
          <div className="max-w-sm">
            <MessageSquare className="mx-auto size-6 text-[#667069]" strokeWidth={1.7} />
            <p className="mt-3 text-sm font-semibold text-[#F4F7F5]">No messages yet</p>
            <p className="mt-1.5 text-xs leading-5 text-[#A0AAA4]">
              This workspace is reserved for the live order conversation. No messages are fabricated in this visual phase.
            </p>
          </div>
        </div>

        <div className="border-t border-white/[0.05] bg-[#090D0B] p-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#050807] px-3">
            <input
              disabled
              placeholder="Live chat will be enabled in a later phase"
              className="h-11 min-w-0 flex-1 bg-transparent text-xs text-[#667069] outline-none placeholder:text-[#667069]"
              aria-label="Live chat unavailable"
            />
            <button
              type="button"
              disabled
              className="grid size-9 shrink-0 place-items-center text-[#667069]"
              aria-label="Send message unavailable"
            >
              <Send className="size-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SidebarSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="p-5">
      <div className="flex items-center gap-2.5">
        <span className="text-[#667069]">{icon}</span>
        <h2 className="text-sm font-semibold text-[#F4F7F5]">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
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
    <div className="mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center text-xs font-medium text-[#A0AAA4] transition-colors hover:text-[#F4F7F5]"
      >
        ← Back to orders
      </Link>

      {checkoutState === "success" ? (
        <div className="mt-4 border-y border-[#39E56F]/15 py-3 text-sm text-[#82F5A4]">
          Payment submitted successfully. Stripe is confirming the payment and this page will reflect the verified status.
        </div>
      ) : null}

      {checkoutState === "cancelled" ? (
        <div className="mt-4 border-y border-amber-300/15 py-3 text-sm text-amber-100">
          Checkout was cancelled. Your order is still saved and you can try payment again.
        </div>
      ) : null}

      {paymentError ? (
        <div className="mt-4 border-y border-rose-300/15 py-3 text-sm text-rose-100">
          We could not start secure checkout. Please try again.
        </div>
      ) : null}

      <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(330px,32%)]">
        <main className="min-w-0">
          <header className="border-b border-white/[0.06] pb-5">
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

          <section className="border-b border-white/[0.06] py-4">
            <div className="flex items-center justify-between gap-4">
              <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.13em] text-blue-200/55">
                Order Progress
              </p>
              <span className="text-[9px] text-[#667069]">Recorded events only</span>
            </div>
            <div className="mt-3">
              <CompactProgress history={history} currentStatus={order.status} />
            </div>
          </section>

          <div className="py-5">
            <ConversationWorkspace />
          </div>

          <section className="grid gap-6 border-t border-white/[0.06] pt-5 lg:grid-cols-2">
            <div>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-sm font-semibold text-[#F4F7F5]">Configuration</h2>
                <span className="text-[9px] text-[#667069]">Order selections</span>
              </div>
              <div className="mt-2">
                <ConfigurationRows order={order} />
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-[#F4F7F5]">Price breakdown</h2>
              {item ? (
                <div className="mt-2 divide-y divide-white/[0.05]">
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
            </div>
          </section>
        </main>

        <aside className="min-w-0">
          <div className="overflow-hidden rounded-[1.2rem] border border-white/[0.08] bg-[#0E1411]">
            <SidebarSection
              icon={<CreditCard className="size-4" strokeWidth={1.8} />}
              title="Order Details"
            >
              <dl className="divide-y divide-white/[0.05]">
                <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0">
                  <dt className="text-[11px] text-[#667069]">Order</dt>
                  <dd className="font-gaming-value text-xs font-bold text-[#F4F7F5]">
                    {order.orderNumber}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[11px] text-[#667069]">Created</dt>
                  <dd className="text-right text-[11px] text-[#F4F7F5]">
                    {formatDate(order.createdAt)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[11px] text-[#667069]">Status</dt>
                  <dd>
                    <OrderStatusBadge status={order.status} />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[11px] text-[#667069]">Payment</dt>
                  <dd
                    className={`text-[11px] font-semibold ${
                      order.paymentStatus === "paid"
                        ? "text-[#82F5A4]"
                        : "text-[#A0AAA4]"
                    }`}
                  >
                    {order.paymentStatus === "paid"
                      ? "Paid"
                      : order.paymentStatus === "pending"
                        ? "Pending"
                        : "Not completed"}
                  </dd>
                </div>
                <div className="flex items-end justify-between gap-4 pt-3">
                  <dt className="text-[11px] text-[#667069]">Total</dt>
                  <dd className="font-gaming-value text-2xl font-bold text-[#F4F7F5]">
                    {formatMoney(order.total)}
                  </dd>
                </div>
              </dl>

              {canPay ? (
                <form action="/api/checkout" method="post" className="mt-4">
                  <input type="hidden" name="orderId" value={order.id} />
                  <button className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#39E56F] px-4 text-xs font-semibold text-[#050807] transition-colors hover:bg-[#20C95A]">
                    Complete secure payment
                    <ArrowRight className="ml-2 size-3.5" strokeWidth={1.9} />
                  </button>
                </form>
              ) : order.paymentStatus === "paid" ? (
                <p className="mt-4 flex items-center gap-2 text-[11px] text-[#A0AAA4]">
                  <Check className="size-3.5 text-[#82F5A4]" strokeWidth={2.5} />
                  Stripe confirmed
                </p>
              ) : null}
            </SidebarSection>

            <div className="h-px bg-white/[0.06]" />

            <SidebarSection
              icon={<UsersRound className="size-4" strokeWidth={1.8} />}
              title="Booster"
            >
              <p className="text-sm font-semibold text-[#F4F7F5]">
                {order.status === "paid" || order.status === "queued"
                  ? "Waiting for assignment"
                  : "Assignment details unavailable"}
              </p>
              <p className="mt-1.5 text-[11px] leading-5 text-[#A0AAA4]">
                Booster identity will appear here when real assignment data is connected.
              </p>
            </SidebarSection>

            <div className="h-px bg-white/[0.06]" />

            <SidebarSection
              icon={<KeyRound className="size-4" strokeWidth={1.8} />}
              title="Account Details"
            >
              <div className="space-y-3">
                <label className="block">
                  <span className="text-[10px] text-[#667069]">Game account email</span>
                  <input
                    disabled
                    type="email"
                    placeholder="Secure access not active yet"
                    className="mt-1.5 h-10 w-full rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 text-xs text-[#667069] outline-none placeholder:text-[#667069]"
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] text-[#667069]">Password</span>
                  <input
                    disabled
                    type="password"
                    placeholder="••••••••"
                    className="mt-1.5 h-10 w-full rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 text-xs text-[#667069] outline-none placeholder:text-[#667069]"
                  />
                </label>

                <p className="text-[10px] leading-4 text-[#667069]">
                  These fields are visual placeholders only. No credentials are stored in this phase.
                </p>
              </div>
            </SidebarSection>

            <div className="h-px bg-white/[0.06]" />

            <SidebarSection
              icon={<UserRoundCheck className="size-4" strokeWidth={1.8} />}
              title="User Integrity Validation"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#F4F7F5]">Not requested</p>
                  <p className="mt-1 text-[10px] leading-4 text-[#667069]">
                    Validation workflow will be connected in a later phase.
                  </p>
                </div>
                <ShieldCheck className="size-5 shrink-0 text-[#667069]" strokeWidth={1.7} />
              </div>
            </SidebarSection>

            <div className="h-px bg-white/[0.06]" />

            <SidebarSection
              icon={<ImageIcon className="size-4" strokeWidth={1.8} />}
              title="Order Start Screenshot"
            >
              <div className="flex min-h-20 items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-[#090D0B] px-4 text-center">
                <div>
                  <ImageIcon className="mx-auto size-4 text-[#667069]" strokeWidth={1.7} />
                  <p className="mt-2 text-[10px] text-[#667069]">
                    Start evidence will appear here when uploads are enabled.
                  </p>
                </div>
              </div>
            </SidebarSection>

            <div className="h-px bg-white/[0.06]" />

            <SidebarSection
              icon={<ImageIcon className="size-4" strokeWidth={1.8} />}
              title="Order Final Screenshot"
            >
              <div className="flex min-h-20 items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-[#090D0B] px-4 text-center">
                <div>
                  <ImageIcon className="mx-auto size-4 text-[#667069]" strokeWidth={1.7} />
                  <p className="mt-2 text-[10px] text-[#667069]">
                    Completion evidence will appear here when uploads are enabled.
                  </p>
                </div>
              </div>
            </SidebarSection>
          </div>

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
