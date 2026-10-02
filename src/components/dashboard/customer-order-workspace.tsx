"use client";

import { presentRocketLeaguePriceBreakdown } from "@/features/configurator/presentation/rocket-league-price-breakdown";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
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
import { getAccountDetailsMode } from "@/features/orders/presentation/account-details-mode";
import { OrderOperationsPanel } from "@/components/dashboard/order-operations-panel";
import {
  isMarvelRivalsGame,
  isOverwatchGame,
} from "@/components/orders/game-order-presentation";
import { OrderWorkspaceConfiguration } from "@/components/orders/order-workspace-configuration";

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

export function CustomerOrderWorkspace({
  order,
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
  const displayedPriceBreakdown = item
    ? presentRocketLeaguePriceBreakdown(item.priceBreakdown, item.total, item.gameName)
    : [];
  const config = item?.configuration ?? {};
  const isMarvelRivals = isMarvelRivalsGame(item?.gameName);
  const isOverwatch = isOverwatchGame(item?.gameName);
  const accountDetailsMode = getAccountDetailsMode(item?.gameName ?? "", config);
  const suggestedPlatform =
    typeof config.platform === "string"
      ? config.platform
      : undefined;

  const canPay =
    order.status === "pending_payment" &&
    order.paymentStatus !== "paid";

  const isCustomerOwner = currentUserRole === "customer";
  const secureAccessAvailable =
    isCustomerOwner && order.paymentStatus === "paid";

  return (
    <div className="mx-auto w-full max-w-[1480px] bg-[#050807] px-4 py-5 text-[#F4F7F5] sm:px-6 sm:py-7 lg:px-8">
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] pb-3">
        <Link
          href={backHref}
          className="inline-flex items-center text-[11px] font-semibold text-[#A4AEA8] transition-colors hover:text-[#F4F7F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39E56F]/30"
        >
          <ArrowLeft className="mr-1.5 size-3.5" />
          {backLabel}
        </Link>

        <span className="font-gaming-value text-[11px] font-semibold tracking-[0.04em] text-[#6F7B74]">
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
          <p
            className={`font-gaming-label text-[10px] uppercase tracking-[0.14em] ${
              isMarvelRivals
                ? "text-[#CEC5FF]/70"
                : isOverwatch
                  ? "text-amber-200/60"
                  : "text-[#4DA3FF]/70"
            }`}
          >
            {item?.gameName ?? "Gaming service"}
          </p>

          <h1 className="mt-1 text-[24px] font-bold tracking-[-0.035em] text-[#F4F7F5] sm:text-[26px]">
            {item?.serviceName ?? "Customer Order"}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <span className="text-[11px] text-[#6F7B74]">
              Created {formatDate(order.createdAt)}
            </span>
          </div>
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px] 2xl:grid-cols-[minmax(0,1fr)_410px]">
        <main className="min-w-0">
          <section>
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="size-4 text-[#82F5A4]/75" />
                <h2 className="text-[18px] font-bold tracking-[-0.02em] text-[#F4F7F5]">
                  Conversation
                </h2>
              </div>

              {boosterAssignment ? (
                <span className="hidden text-[11px] text-[#6F7B74] sm:block">
                  Your assigned booster is connected to this order
                </span>
              ) : null}
            </div>

            <OrderLiveChat
              orderId={order.id}
              currentUserId={currentUserId}
              initialMessages={initialMessages}
              visualVariant="customer-premium"
            />
          </section>

          <section className="mt-6 rounded-[18px] border border-white/[0.07] bg-[#0B110E] p-5">
            <h2 className="text-[18px] font-bold tracking-[-0.02em] text-[#F4F7F5]">
              Price Breakdown
            </h2>

            <div className="mt-4 divide-y divide-white/[0.06]">
              {displayedPriceBreakdown.map((line, index) => (
                <div
                  key={`${line.label}-${index}`}
                  className="flex min-h-11 items-center justify-between gap-4 py-3"
                >
                  <span className="text-[13px] text-[#A4AEA8]">
                    {line.label}
                  </span>
                  <span
                    className={`font-gaming-value text-[13px] font-semibold ${
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

              <div className="flex items-end justify-between gap-4 border-t border-white/[0.10] pt-5">
                <span className="text-[14px] font-bold text-[#F4F7F5]">
                  Total
                </span>
                <span className="font-gaming-value text-[26px] font-bold tracking-[-0.02em] text-[#F4F7F5]">
                  {formatMoney(order.total)}
                </span>
              </div>
            </div>
          </section>
        </main>

        <aside className="min-w-0 xl:sticky xl:top-[76px] xl:self-start">
          <div className="space-y-3">
            <OrderOperationsPanel
              orderId={order.id}
              canManage={false}
              suggestedPlatform={suggestedPlatform}
              orderStatus={order.status}
              details={<><p className="mb-2 text-xs font-semibold text-white">{item?.gameName}</p><dl className="mb-4 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <dt>Status</dt><dd><OrderStatusBadge status={order.status} /></dd>
                </div>
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                  <dt>Order</dt><dd className="text-right font-semibold text-[#F4F7F5]">{order.orderNumber}</dd>
                </div>
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                  <dt>Service</dt><dd className="text-right font-semibold text-[#F4F7F5]">{item?.serviceName ?? "Gaming service"}</dd>
                </div>
                
              </dl>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-gaming-value text-2xl font-bold tracking-[-0.03em] text-[#F4F7F5]">
                    {formatMoney(order.total)}
                  </p>
                  <p className="mt-1 text-[12px] text-[#6F7B74]">
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
                      ? "border-[#39E56F]/20 bg-[#39E56F]/[0.08] text-[#82F5A4]"
                      : "border-white/[0.08] bg-white/[0.025] text-[#A0AAA4]"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>

              {item ? (
                <div className="mt-4">
                  <OrderWorkspaceConfiguration gameName={item.gameName} configuration={item.configuration} priceBreakdown={item.priceBreakdown} rankSize={isMarvelRivals || isOverwatch ? "md" : "lg"} />
                </div>
              ) : null}

              {canPay ? (
                <form action="/api/checkout" method="post" className="mt-4">
                  <input type="hidden" name="orderId" value={order.id} />
                  <button className="h-10 w-full rounded-lg bg-[#39E56F] text-[10px] font-semibold text-[#050807] transition-colors hover:bg-[#20C95A]">
                    Complete secure payment
                  </button>
                </form>
              ) : null}
            
<div className="mt-3">{boosterAssignment ? (
                <div className="mt-3 flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-white/[0.09] bg-[#0F1713] text-[11px] font-bold text-[#F4F7F5]">
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
                    <p className="truncate text-[14px] font-bold text-[#F4F7F5]">
                      {boosterAssignment.displayName}
                    </p>
                    <p className="mt-1 text-[11px] text-[#6F7B74]">
                      Assigned booster
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-[12px] leading-5 text-[#A4AEA8]">
                  Your assigned booster will appear here once the order is accepted.
                </p>
              )}
            </div>
</>}
              accountDetails={<OrderAccountDetails orderId={order.id} canEdit={isCustomerOwner} mode={accountDetailsMode} asCard enabled={Boolean(boosterAssignment || secureAccessAvailable)} />}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
