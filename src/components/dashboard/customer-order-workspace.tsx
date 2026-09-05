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
  GameRankValue,
  resolveGameRank,
} from "@/components/orders/game-order-presentation";
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
    <div className="mt-5 flex min-w-0 items-center overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {recent.map((event, index) => {
        const current = index === recent.length - 1;

        return (
          <div key={event.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                  current
                    ? "border-[#39D5E6]/25 bg-[#39D5E6]/[0.08]"
                    : "border-[#39E56F]/22 bg-[#39E56F]/[0.07]"
                }`}
              >
                {current ? (
                  <span className="size-1.5 rounded-full bg-cyan-300" />
                ) : (
                  <Check className="size-2.5 text-[#82F5A4]" />
                )}
              </span>

              <div>
                <p
                  className={`whitespace-nowrap text-[12px] font-semibold ${
                    current ? "text-[#BDF5FA]" : "text-[#A4AEA8]"
                  }`}
                >
                  {formatLabel(event.toStatus)}
                </p>
                {current ? (
                  <p className="mt-0.5 whitespace-nowrap text-[11px] text-[#6F7B74]">
                    Current status
                  </p>
                ) : null}
              </div>
            </div>

            {index < recent.length - 1 ? (
              <span className="mx-4 h-px w-10 shrink-0 bg-[#39E56F]/20" />
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

  const currentRank = resolveGameRank(item?.gameName, currentValue);
  const targetRank = resolveGameRank(item?.gameName, targetValue);

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
          <p className="font-gaming-label text-[10px] uppercase tracking-[0.14em] text-[#4DA3FF]/70">
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

        {(currentRank || targetRank) ? (
          <div className="flex min-w-0 items-center gap-4 border-l border-[#4DA3FF]/20 pl-4 lg:justify-end">
            {currentRank ? (
              <GameRankValue
                gameName={item?.gameName}
                value={currentValue}
                label="Current"
                size="lg"
              />
            ) : null}

            {currentRank && targetRank ? (
              <ArrowRight className="size-4 shrink-0 text-blue-200/30" />
            ) : null}

            {targetRank ? (
              <GameRankValue
                gameName={item?.gameName}
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
          <section className="rounded-[18px] border border-white/[0.07] bg-[#0B110E] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.14)]">
            <div className="flex items-center gap-2.5">
              <Clock3 className="size-4 text-[#39D5E6]/75" />
              <h2 className="text-[18px] font-bold tracking-[-0.02em] text-[#F4F7F5]">
                Progress
              </h2>
            </div>

            <ProgressTimeline history={history} />
          </section>

          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="size-4 text-[#39D5E6]/75" />
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

          {item ? (
            <div className="mt-6">
              <OrderConfigurationSummary
                gameName={item.gameName}
                configuration={item.configuration}
                priceBreakdown={item.priceBreakdown}
              />
            </div>
          ) : null}

          <section className="mt-6 rounded-[18px] border border-white/[0.07] bg-[#0B110E] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            <h2 className="text-[18px] font-bold tracking-[-0.02em] text-[#F4F7F5]">
              Price Breakdown
            </h2>

            <div className="mt-4 divide-y divide-white/[0.06]">
              {item?.priceBreakdown.map((line, index) => (
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
            <section className="rounded-[16px] border border-white/[0.07] bg-[#0B110E] p-4">
              <div className="flex items-center gap-2.5">
                <UserRound className="size-4 text-[#39D5E6]/70" />
                <h2 className="text-[15px] font-bold text-[#F4F7F5]">
                  Booster
                </h2>
              </div>

              {boosterAssignment ? (
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
            </section>

            <section className="rounded-[16px] border border-white/[0.08] bg-[#0F1713] p-4">
              <div className="flex items-center gap-2.5">
                <CreditCard className="size-4 text-[#82F5A4]/75" />
                <h2 className="text-[15px] font-bold text-[#F4F7F5]">
                  Payment
                </h2>
              </div>

              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="font-gaming-value text-[28px] font-bold tracking-[-0.03em] text-[#F4F7F5]">
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

              {canPay ? (
                <form action="/api/checkout" method="post" className="mt-4">
                  <input type="hidden" name="orderId" value={order.id} />
                  <button className="h-10 w-full rounded-lg bg-[#39E56F] text-[10px] font-semibold text-[#050807] transition-colors hover:bg-[#20C95A]">
                    Complete secure payment
                  </button>
                </form>
              ) : null}
            </section>

            <section className="rounded-[16px] border border-[#39E56F]/12 bg-[#0F1713] p-4">
              <div className="mb-3 flex items-start gap-2.5">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-[10px] border border-[#39E56F]/14 bg-[#39E56F]/[0.045]">
                  <ShieldCheck className="size-4 text-[#82F5A4]" />
                </span>
                <div>
                  <h2 className="text-[15px] font-bold text-[#F4F7F5]">
                    Secure Account Access
                  </h2>
                  <p className="mt-1 text-[11px] leading-4 text-[#6F7B74]">
                    {boosterAssignment
                      ? "Share your game login securely with your assigned booster"
                      : secureAccessAvailable
                        ? "Add your game login now. It stays encrypted until a booster is assigned."
                        : "Available immediately after payment is confirmed"}
                  </p>
                </div>
              </div>

              {boosterAssignment || secureAccessAvailable ? (
                <div className="[&_input]:h-11 [&_input]:border-white/[0.08] [&_input]:bg-[#0A100D] [&_input]:text-[13px] [&_input]:focus:border-[#39E56F]/35 [&_input]:focus:ring-1 [&_input]:focus:ring-[#39E56F]/20 [&_label>span]:text-[11px] [&_label>span]:text-[#6F7B74] [&_button]:min-h-10 [&_p]:text-[11px]">
                  <OrderAccountDetails
                    orderId={order.id}
                    canEdit={isCustomerOwner}
                  />
                </div>
              ) : null}
            </section>

            <section>
              <div className="space-y-3 [&>div]:border-0 [&>div]:bg-transparent [&>section]:rounded-[16px] [&>section]:border [&>section]:border-white/[0.07] [&>section]:bg-[#0B110E] [&>section]:shadow-[0_8px_24px_rgba(0,0,0,0.10)] [&>section:first-child]:border-[#39E56F]/10 [&>section:first-child]:bg-[#39E56F]/[0.025] [&_h2]:text-[15px] [&_h2]:font-bold [&_p]:text-[11px] [&_input]:h-11 [&_input]:bg-[#080D0A] [&_textarea]:bg-[#080D0A] [&_[class*='border-dashed']]:min-h-20 [&_[class*='border-dashed']]:border-white/[0.12] [&_[class*='border-dashed']]:bg-[#080D0A]">
                <OrderOperationsPanel
                  orderId={order.id}
                  canManage={false}
                  suggestedPlatform={suggestedPlatform}
                  orderStatus={order.status}
                />
              </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
