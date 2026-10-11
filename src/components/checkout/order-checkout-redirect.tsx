"use client";

import Image from "next/image";
import { Check, ChevronRight, LockKeyhole } from "lucide-react";
import type { OrderRecord } from "@/features/orders/types/orders";
import { presentRocketLeaguePriceBreakdown } from "@/features/configurator/presentation/rocket-league-price-breakdown";
import { OrderWorkspaceConfiguration } from "@/components/orders/order-workspace-configuration";
import { OrderPaymentMethods } from "@/components/checkout/order-payment-methods";

const gameArtwork: Record<string, string> = {
  "Rocket League": "/game-cards/rocket-league.webp",
  "League of Legends": "/game-cards/league-of-legends.webp",
  Valorant: "/game-cards/valorant.webp",
  "Marvel Rivals": "/game-cards/marvel-rivals.webp",
  Overwatch: "/game-cards/overwatch.webp",
  "Dota 2": "/game-cards/dota-2.webp",
  "Rainbow Six Siege": "/game-cards/rainbow-six-siege.webp",
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function CheckoutProgress() {
  return (
    <ol aria-label="Checkout progress" className="grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] sm:gap-3 sm:text-[11px]">
      <li className="flex min-w-0 items-center gap-2 text-[#82F5A4]">
        <span className="grid size-6 shrink-0 place-items-center rounded-full border border-[#39E56F]/30 bg-[#39E56F]/[0.09]">
          <Check className="size-3" aria-hidden="true" />
        </span>
        <span className="hidden sm:inline">Order details</span>
      </li>
      <span aria-hidden="true" className="h-px bg-[#39E56F]/25" />
      <li aria-current="step" className="flex min-w-0 items-center gap-2 text-[#F4F7F5]">
        <span className="grid size-6 shrink-0 place-items-center rounded-full border border-[#39E56F]/55 bg-[#39E56F] text-[#041007]">2</span>
        <span>Payment method</span>
      </li>
      <span aria-hidden="true" className="h-px bg-white/[0.09]" />
      <li className="flex min-w-0 items-center gap-2 text-[#5F6963]">
        <span className="grid size-6 shrink-0 place-items-center rounded-full border border-white/[0.10] bg-white/[0.02]">3</span>
        <span className="hidden sm:inline">Order confirmed</span>
      </li>
    </ol>
  );
}

export function OrderCheckoutRedirect({
  order,
  checkoutState,
  paymentError,
}: {
  order: OrderRecord;
  checkoutState?: string;
  paymentError?: string;
}) {
  const item = order.items[0];
  const breakdown = item
    ? presentRocketLeaguePriceBreakdown(item.priceBreakdown, item.total, item.gameName)
    : [];
  const artwork = item ? gameArtwork[item.gameName] : undefined;
  const notice = paymentError
    ? "We could not start checkout. Your order is saved—select a provider and try again."
    : checkoutState === "cancelled"
      ? "Checkout was cancelled. No new order was created and you can try again."
      : null;

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-7 text-[#F4F7F5] sm:px-6 sm:py-9 lg:px-8 lg:py-11">
      <div className="rounded-[26px] border border-white/[0.07] bg-[#080C0A] p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-5 border-b border-white/[0.07] pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#667069]">Checkout</p>
            <h1 className="mt-2 text-[24px] font-bold tracking-[-0.035em] sm:text-[30px]">Complete your order</h1>
            <p className="mt-2 text-sm text-[#8C9891]">Review your order and choose where you want to pay.</p>
          </div>
          <div className="min-w-0 lg:w-[560px]">
            <CheckoutProgress />
          </div>
        </div>

        {notice ? (
          <div role="status" className={`mt-5 rounded-xl border px-4 py-3 text-[12px] leading-5 ${paymentError ? "border-rose-300/20 bg-rose-300/[0.05] text-rose-100" : "border-amber-300/20 bg-amber-300/[0.05] text-amber-100"}`}>
            {notice}
          </div>
        ) : null}

        <OrderPaymentMethods
          orderId={order.id}
          total={order.total}
          summary={(
            <>
              <div className="border-b border-white/[0.07] px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#667069]">Order summary</p>
                    <h2 id="order-summary-heading" className="mt-1 text-lg font-bold tracking-[-0.02em]">Order details</h2>
                  </div>
                  <LockKeyhole className="size-4 text-[#82F5A4]/70" aria-hidden="true" />
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex min-w-0 items-center gap-4">
                  {artwork ? (
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-white/[0.09] bg-[#0F1713]">
                      <Image src={artwork} alt="" fill sizes="56px" className="object-cover" />
                    </div>
                  ) : null}
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-[#82F5A4]/75">{item?.gameName ?? "Gaming service"}</p>
                    <p className="mt-1 break-words text-[15px] font-bold leading-5 text-[#F4F7F5]">{item?.serviceName ?? "Customer order"}</p>
                    <p className="mt-1.5 text-[11px] text-[#77827C]">Order {order.orderNumber}</p>
                  </div>
                </div>

                {item ? (
                  <div className="mt-5 border-t border-white/[0.07] pt-4 text-[#8C9891]">
                    <OrderWorkspaceConfiguration gameName={item.gameName} configuration={item.configuration} priceBreakdown={item.priceBreakdown} rankSize="md" />
                  </div>
                ) : null}

                <div className="mt-5 divide-y divide-white/[0.06] border-t border-white/[0.07]">
                  {breakdown.map((line, index) => (
                    <div key={`${line.label}-${index}`} className="flex min-h-10 items-center justify-between gap-4 py-2.5 text-[12px]">
                      <span className="min-w-0 break-words text-[#8C9891]">{line.label}</span>
                      <span className={`shrink-0 font-gaming-value font-semibold ${line.amount < 0 ? "text-[#82F5A4]" : "text-[#DDE3DF]"}`}>
                        {line.amount < 0 ? "−" : ""}{formatMoney(Math.abs(line.amount))}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-5 flex items-start gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-3 text-[10px] leading-4 text-[#6F7B74]">
                  <ChevronRight className="mt-0.5 size-3 shrink-0 text-[#82F5A4]" aria-hidden="true" />
                  Payment confirmation is applied only after BoostingPedia receives confirmation from the provider.
                </p>
              </div>
            </>
          )}
        />
      </div>
    </div>
  );
}
