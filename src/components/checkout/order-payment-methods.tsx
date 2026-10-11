"use client";

import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import { ArrowRight, LoaderCircle, LockKeyhole } from "lucide-react";

type PaymentProvider = "stripe" | "paypal";

type CardNetwork = {
  name: string;
  logo: string;
  width: number;
  height: number;
  imageClassName: string;
};

const stripeCardNetworks: CardNetwork[] = [
  {
    name: "Visa",
    logo: "/images/payments/visa-icon.png",
    width: 2073,
    height: 758,
    imageClassName: "h-[18px] w-auto max-w-[46px]",
  },
  {
    name: "Mastercard",
    logo: "/images/payments/mastercard-icon.png",
    width: 1499,
    height: 1049,
    imageClassName: "h-6 w-auto max-w-[38px]",
  },
  {
    name: "American Express",
    logo: "/images/payments/americanexpress-icon.webp",
    width: 512,
    height: 420,
    imageClassName: "h-6 w-auto max-w-[32px]",
  },
  {
    name: "JCB",
    logo: "/images/payments/jcb-icon.png",
    width: 1254,
    height: 1254,
    imageClassName: "h-6 w-auto max-w-6",
  },
  {
    name: "UnionPay",
    logo: "/images/payments/unionpay-icon.png",
    width: 2048,
    height: 1152,
    imageClassName: "h-[22px] w-auto max-w-[40px]",
  },
];

const providers: Array<{
  id: PaymentProvider;
  name: string;
  description: string;
  logo: string;
  logoClassName: string;
  logoWidth: number;
  logoHeight: number;
  cardNetworks?: CardNetwork[];
  fundingLabel?: string;
}> = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Card checkout hosted by Stripe.",
    logo: "/images/payments/stripe-logo.png",
    logoClassName: "h-11 w-11",
    logoWidth: 1254,
    logoHeight: 1254,
    cardNetworks: stripeCardNetworks,
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Pay with your PayPal account.",
    logo: "/images/payments/paypal-logo.png",
    logoClassName: "h-12 w-auto max-w-12",
    logoWidth: 1240,
    logoHeight: 1269,
    fundingLabel: "PayPal wallet",
  },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function OrderPaymentMethods({
  orderId,
  total,
  compact = false,
  summary,
}: {
  orderId: string;
  total: number;
  compact?: boolean;
  summary?: ReactNode;
}) {
  const [provider, setProvider] = useState<PaymentProvider>("stripe");
  const [pendingProvider, setPendingProvider] = useState<PaymentProvider | null>(null);
  const submittingRef = useRef(false);
  const disabled = pendingProvider !== null;
  const action = provider === "stripe" ? "/api/checkout" : "/api/paypal/orders";
  const buttonLabel = provider === "stripe"
    ? "Continue to secure payment"
    : "Continue to PayPal";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (submittingRef.current) {
      event.preventDefault();
      return;
    }
    submittingRef.current = true;
    setPendingProvider(provider);
  }

  const providerSelector = (
    <fieldset disabled={disabled} className="space-y-3.5">
      <legend className="sr-only">Select a payment provider</legend>
      {providers.map((option) => {
        const selected = provider === option.id;
        return (
          <label
            key={option.id}
            className={`group grid min-h-[96px] cursor-pointer grid-cols-[20px_72px_minmax(0,1fr)] items-center gap-x-3 rounded-2xl border px-4 py-4 transition-colors sm:grid-cols-[20px_96px_minmax(0,1fr)_auto] sm:gap-x-4 sm:px-5 ${
              selected
                ? "border-[#39E56F]/55 bg-[#39E56F]/[0.055]"
                : "border-white/[0.09] bg-[#090E0B] hover:border-white/[0.16] hover:bg-white/[0.025]"
            } ${disabled ? "cursor-wait opacity-65" : ""}`}
          >
            <input
              type="radio"
              name="paymentProvider"
              value={option.id}
              checked={selected}
              onChange={() => setProvider(option.id)}
              className="peer sr-only"
              aria-label={`Pay with ${option.name}`}
            />
            <span
              aria-hidden="true"
              className={`grid size-5 shrink-0 place-items-center rounded-full border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#82F5A4]/70 peer-focus-visible:ring-offset-4 peer-focus-visible:ring-offset-[#0B100D] ${
                selected ? "border-[#39E56F]" : "border-white/25"
              }`}
            >
              {selected ? <span className="size-2 rounded-full bg-[#39E56F]" /> : null}
            </span>
            <span className="grid h-[52px] w-[72px] shrink-0 place-items-center sm:w-24" aria-hidden="true">
              <Image
                src={option.logo}
                alt=""
                width={option.logoWidth}
                height={option.logoHeight}
                sizes="48px"
                className={`${option.logoClassName} object-contain`}
              />
            </span>
            <span className="min-w-0">
              <span className="block text-[18px] font-bold leading-6 text-[#F4F7F5]">{option.name}</span>
              <span className="mt-1 block text-[13px] leading-5 text-[#9AA59F]">{option.description}</span>
            </span>
            <span className="col-span-2 col-start-2 mt-3 flex min-w-0 flex-wrap items-center gap-1.5 sm:col-span-1 sm:col-start-4 sm:mt-0 sm:flex-nowrap sm:justify-end" aria-label={option.cardNetworks ? "Supported card networks" : undefined}>
              {option.cardNetworks?.map((network) => (
                <span
                  key={network.name}
                  title={network.name}
                  className="grid h-8 min-w-10 place-items-center rounded-md border border-white/[0.07] bg-white/[0.025] px-1.5"
                >
                  <Image
                    src={network.logo}
                    alt={network.name}
                    width={network.width}
                    height={network.height}
                    sizes="46px"
                    className={`${network.imageClassName} object-contain`}
                  />
                </span>
              ))}
              {option.fundingLabel ? (
                <span className="rounded-md border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-[11px] font-semibold text-[#AEB8B2]">
                  {option.fundingLabel}
                </span>
              ) : null}
            </span>
          </label>
        );
      })}
    </fieldset>
  );

  const paymentAction = (
    <div className="rounded-[22px] border border-white/[0.08] bg-[#0B100D] p-4 sm:p-5">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#667069]">Amount due</p>
          <p className="mt-1 font-gaming-value text-[26px] font-bold tracking-[-0.03em] text-[#F4F7F5]">
            {formatMoney(total)}
          </p>
        </div>
        <span className="text-[11px] font-semibold text-[#8C9891]">USD</span>
      </div>

      <button
        type="submit"
        disabled={disabled}
        aria-label={`${buttonLabel}, ${formatMoney(total)} USD`}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#39E56F]/30 bg-[#39E56F] px-4 text-sm font-extrabold text-[#041007] transition-colors hover:bg-[#52EC7F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82F5A4]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080C0A] disabled:cursor-wait disabled:opacity-65"
      >
        {pendingProvider ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
        {pendingProvider ? `Opening ${pendingProvider === "stripe" ? "Stripe" : "PayPal"}…` : buttonLabel}
        {!pendingProvider ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
      </button>

      <p className="mt-3 flex items-start justify-center gap-1.5 text-center text-[10px] leading-4 text-[#6F7B74]">
        <LockKeyhole className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
        You&apos;ll continue to {provider === "stripe" ? "Stripe" : "PayPal"}. Your order updates only after provider confirmation.
      </p>
    </div>
  );

  if (summary) {
    return (
      <form action={action} method="post" onSubmit={handleSubmit} className="mt-6">
        <input type="hidden" name="orderId" value={orderId} />

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.63fr)_minmax(340px,1fr)] lg:gap-6 xl:gap-8">
          <aside
            aria-labelledby="order-summary-heading"
            className="order-1 min-w-0 overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0B100D] lg:col-start-2 lg:row-start-1"
          >
            {summary}
          </aside>

          <section
            aria-labelledby="payment-method-heading"
            className="order-2 min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1"
          >
            <div className="mb-4">
              <h2 id="payment-method-heading" className="text-lg font-bold tracking-[-0.02em]">Choose a payment method</h2>
              <p className="mt-1 text-[13px] leading-5 text-[#9AA59F]">Select a provider to continue on its secure checkout page.</p>
            </div>
            {providerSelector}
          </section>

          <div className="order-3 min-w-0 lg:col-start-2 lg:row-start-2">
            {paymentAction}
          </div>
        </div>
      </form>
    );
  }

  return (
    <form action={action} method="post" onSubmit={handleSubmit} className={compact ? "mt-4" : "mt-6"}>
      <input type="hidden" name="orderId" value={orderId} />
      {providerSelector}
      <div className={compact ? "mt-4" : "mt-6"}>{paymentAction}</div>
    </form>
  );
}
