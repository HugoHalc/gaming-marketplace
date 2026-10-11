"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowRight, LoaderCircle, LockKeyhole } from "lucide-react";

type PaymentProvider = "stripe" | "paypal";

const providers: Array<{
  id: PaymentProvider;
  name: string;
  description: string;
  logo: string;
}> = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Continue to Stripe's hosted checkout.",
    logo: "/payment-providers/stripe-mark.svg",
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Pay with your PayPal account or available PayPal options.",
    logo: "/payment-providers/paypal-mark.svg",
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
}: {
  orderId: string;
  total: number;
  compact?: boolean;
}) {
  const [provider, setProvider] = useState<PaymentProvider>("stripe");
  const [pendingProvider, setPendingProvider] = useState<PaymentProvider | null>(null);
  const submittingRef = useRef(false);
  const disabled = pendingProvider !== null;
  const action = provider === "stripe" ? "/api/checkout" : "/api/paypal/orders";
  const buttonLabel = provider === "stripe"
    ? "Continue to secure payment"
    : "Continue with PayPal";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (submittingRef.current) {
      event.preventDefault();
      return;
    }
    submittingRef.current = true;
    setPendingProvider(provider);
  }

  return (
    <form action={action} method="post" onSubmit={handleSubmit} className={compact ? "mt-4" : "mt-6"}>
      <input type="hidden" name="orderId" value={orderId} />

      <fieldset disabled={disabled} className="space-y-3">
        <legend className="sr-only">Select a payment provider</legend>
        {providers.map((option) => {
          const selected = provider === option.id;
          return (
            <label
              key={option.id}
              className={`group flex min-h-[84px] cursor-pointer items-center gap-4 rounded-2xl border px-4 py-4 transition-colors sm:px-5 ${
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
              <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.96]">
                <Image src={option.logo} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-bold text-[#F4F7F5]">{option.name}</span>
                <span className="mt-1 block text-[12px] leading-5 text-[#8C9891]">{option.description}</span>
              </span>
              <span className={`hidden text-[10px] font-semibold uppercase tracking-[0.12em] sm:block ${selected ? "text-[#82F5A4]" : "text-[#667069]"}`}>
                {selected ? "Selected" : "Select"}
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className={`${compact ? "mt-4" : "mt-6"} rounded-2xl border border-white/[0.08] bg-[#080C0A] p-4`}>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#667069]">Amount due</p>
            <p className="mt-1 font-gaming-value text-[24px] font-bold tracking-[-0.03em] text-[#F4F7F5]">
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
          Payment details are entered and handled on the selected provider&apos;s checkout.
        </p>
      </div>
    </form>
  );
}
