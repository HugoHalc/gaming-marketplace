"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type {
  OrderRecord,
  OrderStatusEvent,
} from "@/features/orders/types/orders";
import type {
  OrderBoosterAssignment,
  OrderWorkspaceMessage,
} from "@/features/orders/server/order-workspace-repository";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { OrderLiveChat } from "@/components/dashboard/order-live-chat";
import { OrderAccountDetails } from "@/components/dashboard/order-account-details";
import { OrderOperationsPanel } from "@/components/dashboard/order-operations-panel";
import {
  resolveRocketLeagueRank,
  RocketLeagueRankValue,
} from "@/components/orders/rocket-league-rank";
import { OrderConfigurationSummary } from "@/components/orders/order-configuration-summary";

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

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function ProgressTimeline({
  history,
}: {
  history: OrderStatusEvent[];
}) {
  if (!history.length) {
    return (
      <p className="mt-3 text-[10px] text-[#667069]">
        Order progress will appear here as your service moves forward.
      </p>
    );
  }

  const recent = history.slice(-4);

  return (
    <div className="mt-4 flex min-w-0 items-center overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {recent.map((event, index) => {
        const current = index === recent.length - 1;

        return (
          <div key={event.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                  current
                    ? "border-cyan-300/25 bg-cyan-400/[0.08]"
                    : "border-white/[0.10] bg-white/[0.015]"
                }`}
              >
                {current ? (
                  <span className="size-1.5 rounded-full bg-cyan-300" />
                ) : (
                  <Check className="size-2.5 text-[#82F5A4]/65" />
                )}
              </span>

              <div>
                <p
                  className={`whitespace-nowrap text-[10px] font-medium ${
                    current ? "text-cyan-100" : "text-[#A0AAA4]"
                  }`}
                >
                  {formatLabel(event.toStatus)}
                </p>
                {current ? (
                  <p className="mt-0.5 whitespace-nowrap text-[8px] text-[#667069]">
                    Current status
                  </p>
                ) : null}
              </div>
            </div>

            {index < recent.length - 1 ? (
              <span className="mx-4 h-px w-10 shrink-0 bg-white/[0.07]" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
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
  backHref = "/dashboard/orders",
  backLabel = "Orders",
}: Props) {
  const item = order.items[0];
  const config = item?.configuration ?? {};

  const currentValue =
    typeof config.currentRank !== "undefined"
      ? config.currentRank
      : config.previousRank;
  const targetValue = config.targetRank;

  const currentRank = resolveRocketLeagueRank(currentValue);
  const targetRank = resolveRocketLeagueRank(targetValue);

  const suggestedPlatform =
    typeof config.platform === "string"
      ? config.platform
      : undefined;

  const canPay =
    order.status === "pending_payment" &&
    order.paymentStatus !== "paid";

  const isCustomerOwner = currentUserRole === "customer";

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.05] pb-3">
        <Link
          href={backHref}
          className="inline-flex items-center text-[10px] font-semibold text-[#A0AAA4] transition-colors hover:text-[#F4F7F5]"
        >
          <ArrowLeft className="mr-1.5 size-3.5" />
          {backLabel}
        </Link>

        <span className="font-gaming-value text-[9px] text-[#667069]">
          {order.orderNumber}
        </span>
      </div>

      {checkoutState === "success" ? (
        <div className="mt-4 border-y border-[#39E56F]/15 py-3 text-[11px] text-[#82F5A4]">
          Payment submitted successfully. Stripe is confirming the payment.
        </div>
      ) : null}

      {checkoutState === "cancelled" ? (
        <div className="mt-4 border-y border-amber-300/15 py-3 text-[11px] text-amber-100">
          Checkout was cancelled. Your order is still saved.
        </div>
      ) : null}

      {paymentError ? (
        <div className="mt-4 border-y border-rose-300/15 py-3 text-[11px] text-rose-100">
          We could not start secure checkout. Please try again.
        </div>
      ) : null}

      <header className="flex flex-col gap-5 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="font-gaming-label text-[9px] uppercase tracking-[0.14em] text-blue-200/50">
            {item?.gameName ?? "Gaming service"}
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-[#F4F7F5]">
            {item?.serviceName ?? "Customer Order"}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <span className="text-[9px] text-[#667069]">
              Created {formatDate(order.createdAt)}
            </span>
          </div>
        </div>

        {(currentRank || targetRank) ? (
          <div className="flex min-w-0 items-center gap-4 lg:justify-end">
            {currentRank ? (
              <RocketLeagueRankValue
                value={currentValue}
                label="Current"
                size="lg"
              />
            ) : null}

            {currentRank && targetRank ? (
              <ArrowRight className="size-4 shrink-0 text-blue-200/30" />
            ) : null}

            {targetRank ? (
              <RocketLeagueRankValue
                value={targetValue}
                label="Desired"
                size="lg"
              />
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_390px]">
        <main className="min-w-0">
          <section className="border-t border-white/[0.05] pt-5">
            <div className="flex items-center gap-2">
              <Clock3 className="size-3.5 text-[#667069]" />
              <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#F4F7F5]">
                Progress
              </h2>
            </div>

            <ProgressTimeline history={history} />
          </section>

          <section className="mt-6 border-t border-white/[0.05] pt-5">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-3.5 text-[#667069]" />
                <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#F4F7F5]">
                  Conversation
                </h2>
              </div>

              {boosterAssignment ? (
                <span className="hidden text-[9px] text-[#667069] sm:block">
                  Your assigned booster is connected to this order
                </span>
              ) : null}
            </div>

            <OrderLiveChat
              orderId={order.id}
              currentUserId={currentUserId}
              initialMessages={initialMessages}
            />
          </section>

          {item ? (
            <div className="mt-6">
              <OrderConfigurationSummary
                configuration={item.configuration}
                priceBreakdown={item.priceBreakdown}
              />
            </div>
          ) : null}

          <section className="mt-6 border-t border-white/[0.05] pt-5">
            <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#F4F7F5]">
              Price Breakdown
            </h2>

            <div className="mt-3 divide-y divide-white/[0.05] border-y border-white/[0.05]">
              {item?.priceBreakdown.map((line, index) => (
                <div
                  key={`${line.label}-${index}`}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span className="text-[10px] text-[#A0AAA4]">
                    {line.label}
                  </span>
                  <span
                    className={`font-gaming-value text-[11px] font-bold ${
                      line.amount < 0
                        ? "text-[#82F5A4]"
                        : "text-[#F4F7F5]"
                    }`}
                  >
                    {line.amount < 0 ? "−" : ""}
                    {formatMoney(Math.abs(line.amount))}
                  </span>
                </div>
              ))}

              <div className="flex items-end justify-between gap-4 py-4">
                <span className="text-[10px] font-semibold text-[#F4F7F5]">
                  Total
                </span>
                <span className="font-gaming-value text-xl font-bold text-[#F4F7F5]">
                  {formatMoney(order.total)}
                </span>
              </div>
            </div>
          </section>
        </main>

        <aside className="min-w-0 xl:sticky xl:top-[76px] xl:self-start">
          <div className="border-y border-white/[0.06]">
            <section className="py-4">
              <div className="flex items-center gap-2">
                <UserRound className="size-3.5 text-[#667069]" />
                <h2 className="text-[13px] font-semibold text-[#F4F7F5]">
                  Booster
                </h2>
              </div>

              {boosterAssignment ? (
                <div className="mt-3 flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-white/[0.08] bg-[#0E1411] text-[10px] font-bold text-[#F4F7F5]">
                    {boosterAssignment.avatarUrl ? (
                      <img
                        src={boosterAssignment.avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      boosterAssignment.displayName.slice(0, 1).toUpperCase()
                    )}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#F4F7F5]">
                      {boosterAssignment.displayName}
                    </p>
                    <p className="mt-1 text-[9px] text-[#667069]">
                      Assigned booster
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-[10px] leading-5 text-[#A0AAA4]">
                  Your assigned booster will appear here once the order is accepted.
                </p>
              )}
            </section>

            <section className="border-t border-white/[0.05] py-4">
              <div className="flex items-center gap-2">
                <CreditCard className="size-3.5 text-[#667069]" />
                <h2 className="text-[13px] font-semibold text-[#F4F7F5]">
                  Payment
                </h2>
              </div>

              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="font-gaming-value text-2xl font-bold text-[#F4F7F5]">
                    {formatMoney(order.total)}
                  </p>
                  <p className="mt-1 text-[9px] text-[#667069]">
                    {order.paymentStatus === "paid"
                      ? "Stripe confirmed"
                      : order.paymentStatus === "pending"
                        ? "Payment pending"
                        : "Payment not completed"}
                  </p>
                </div>

                <span
                  className={`rounded-full border px-2.5 py-1 text-[8px] font-semibold uppercase ${
                    order.paymentStatus === "paid"
                      ? "border-[#39E56F]/15 bg-[#39E56F]/[0.05] text-[#82F5A4]"
                      : "border-white/[0.08] bg-white/[0.025] text-[#A0AAA4]"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>

              {canPay ? (
                <form action="/api/checkout" method="post" className="mt-4">
                  <input type="hidden" name="orderId" value={order.id} />
                  <button className="h-10 w-full rounded-lg bg-[#39E56F] text-[10px] font-semibold text-[#050807] transition-colors hover:bg-[#20C95A]">
                    Complete secure payment
                  </button>
                </form>
              ) : null}
            </section>

            <section className="border-t border-white/[0.05] py-4">
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-[#667069]" />
                <h2 className="text-[13px] font-semibold text-[#F4F7F5]">
                  Secure Account Access
                </h2>
              </div>

              {boosterAssignment ? (
                <OrderAccountDetails
                  orderId={order.id}
                  canEdit={isCustomerOwner}
                />
              ) : null}
            </section>

            <section className="border-t border-white/[0.05]">
              <OrderOperationsPanel
                orderId={order.id}
                canManage={false}
                suggestedPlatform={suggestedPlatform}
                orderStatus={order.status}
              />
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
