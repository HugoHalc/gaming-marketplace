import type { ReactNode } from "react";
import type { QuotePreview } from "@/features/configurator/types/configurator";
import { PaymentMethodsTrustBlock } from "./payment-methods-trust-block";

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatBreakdownAmount(value: number) {
  if (value < 0) return `−${formatUsd(Math.abs(value))}`;
  return formatUsd(value);
}

export function MarvelRivalsOrderSummary({
  gameLabel,
  progression,
  metadata,
  quote,
  quoteLoading,
  checkoutAction,
  checkoutError,
  children,
}: {
  gameLabel: string;
  progression?: ReactNode;
  metadata?: ReactNode;
  quote: QuotePreview | null;
  quoteLoading: boolean;
  checkoutAction: ReactNode;
  checkoutError?: string | null;
  children?: ReactNode;
}) {
  const pricedBreakdown = quote?.breakdown.filter((item) => item.amount !== 0) ?? [];
  const hasBreakdown = pricedBreakdown.length > 0;
  const hasExplicitDiscountLine = pricedBreakdown.some((item) => item.amount < 0);
  const activeDiscount = quote && quote.discount > 0 && !hasExplicitDiscountLine ? quote.discount : 0;

  return (
    <aside id="boost-summary" className="scroll-mt-28 xl:scroll-mt-24 xl:sticky xl:top-24">
      <div className="space-y-3">
        <div className="overflow-hidden rounded-[1.6rem] border border-white/[0.09] bg-[#070A08] shadow-[0_26px_70px_-46px_rgba(0,0,0,.95)]">
          <div className="border-b border-white/[0.07] bg-gradient-to-br from-violet-500/[0.05] via-transparent to-transparent px-4 py-4">
            <p className="font-gaming-value text-[1.65rem] font-bold leading-none tracking-[-0.045em] text-[#F4F7F5]">
              Order Summary
            </p>
            <p className="mt-1.5 text-[11px] font-medium text-[#A0AAA4]">{gameLabel}</p>
          </div>

          <div className="p-4">
            {progression}
            {metadata}

            {hasBreakdown ? (
              <div className="mt-4 border-t border-white/[0.08] pt-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">
                  Price breakdown
                </p>
                <div className="mt-2 divide-y divide-white/[0.05]">
                  {pricedBreakdown.map((item, index) => (
                    <div key={`${item.label}-${index}`} className="flex items-start justify-between gap-3 py-2 text-[10px] leading-4">
                      <span className="min-w-0 text-white/42">{item.label}</span>
                      <span className={`shrink-0 font-medium ${item.amount < 0 ? "text-[#82F5A4]" : "text-white/72"}`}>
                        {formatBreakdownAmount(item.amount)}
                      </span>
                    </div>
                  ))}
                  {activeDiscount > 0 ? (
                    <div className="flex items-start justify-between gap-3 py-2 text-[10px] leading-4">
                      <span className="text-white/42">Discount</span>
                      <span className="shrink-0 font-medium text-[#82F5A4]">−{formatUsd(activeDiscount)}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="my-4 h-px bg-white/[0.08]" />

            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-[#A0AAA4]">Total</p>
                <p
                  className={`font-gaming-value mt-1 whitespace-nowrap text-[2.35rem] font-bold leading-none tracking-[-0.05em] ${
                    quote ? "text-white" : "text-white/30"
                  }`}
                  aria-live="polite"
                >
                  {quote ? formatUsd(quote.total) : "—"}
                </p>
                <p className="mt-2 text-[9px] font-medium uppercase tracking-[0.11em] text-white/38">
                  {quoteLoading ? "Updating price…" : quote ? "Server-Validated Price" : "Server-Validated Price"}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[9px] font-medium text-white/45">
                USD
              </span>
            </div>

            {children}

            {checkoutError ? (
              <div className="mt-4 rounded-xl border border-rose-300/15 bg-rose-400/[0.06] p-3 text-xs leading-5 text-rose-200">
                {checkoutError}
              </div>
            ) : null}

            {checkoutAction}

            <p className="mt-3 text-center text-[10px] leading-4 text-white/35">
              Final order details will be validated before checkout.
            </p>
          </div>
        </div>

        <PaymentMethodsTrustBlock />
      </div>
    </aside>
  );
}
