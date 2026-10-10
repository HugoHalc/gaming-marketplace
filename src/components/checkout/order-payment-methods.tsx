"use client";

import { useState } from "react";
import { LoaderCircle, LockKeyhole } from "lucide-react";

function StripeMark() {
  return <span aria-hidden="true" className="text-[15px] font-black italic tracking-[-0.08em]">stripe</span>;
}

function PayPalMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="size-5" fill="none">
      <path fill="#003087" d="M9.2 4.5h9.1c5.1 0 7.7 2.6 7 7.1-.8 5.2-4.6 7.8-9.6 7.8h-2.3l-1.1 7H7.4L9.2 4.5Z" />
      <path fill="#009CDE" d="M13.1 11.1h7c4.5 0 6.7 2.3 6 6.2-.7 4.6-4 6.8-8.4 6.8h-2l-.6 3.4h-4.2l2.2-16.4Z" opacity=".9" />
      <path fill="#012169" d="M13.7 8.4h4.5c2.1 0 3.1 1 2.8 2.8-.3 2.1-1.8 3-3.8 3h-4.1l.6-5.8Z" />
    </svg>
  );
}

export function OrderPaymentMethods({ orderId, compact = false }: { orderId: string; compact?: boolean }) {
  const [pendingProvider, setPendingProvider] = useState<"stripe" | "paypal" | null>(null);
  const disabled = pendingProvider !== null;

  const submit = (provider: "stripe" | "paypal") => () => setPendingProvider(provider);
  const buttonBase = "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82F5A4]/55 disabled:cursor-wait disabled:opacity-60";

  return (
    <div className={compact ? "mt-4" : "mt-6"}>
      <div className={`grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
        <form action="/api/checkout" method="post" onSubmit={submit("stripe")}>
          <input type="hidden" name="orderId" value={orderId} />
          <button
            type="submit"
            aria-label="Pay securely with Stripe"
            disabled={disabled}
            className={`${buttonBase} border border-[#39E56F]/25 bg-[#39E56F] text-[#050807] hover:bg-[#20C95A]`}
          >
            {pendingProvider === "stripe" ? <LoaderCircle className="size-4 animate-spin" /> : <StripeMark />}
            {pendingProvider === "stripe" ? "Opening Stripe…" : "Pay with Stripe"}
          </button>
        </form>

        <form action="/api/paypal/orders" method="post" onSubmit={submit("paypal")}>
          <input type="hidden" name="orderId" value={orderId} />
          <button
            type="submit"
            aria-label="Pay securely with PayPal"
            disabled={disabled}
            className={`${buttonBase} border border-[#FFC439]/35 bg-[#FFC439] text-[#111820] hover:bg-[#FFD166]`}
          >
            {pendingProvider === "paypal" ? <LoaderCircle className="size-4 animate-spin" /> : <PayPalMark />}
            {pendingProvider === "paypal" ? "Opening PayPal…" : "Pay with PayPal"}
          </button>
        </form>
      </div>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] leading-4 text-[#6F7B74]">
        <LockKeyhole className="size-3" aria-hidden="true" />
        Secure checkout. Payment details are handled by your selected provider.
      </p>
    </div>
  );
}
