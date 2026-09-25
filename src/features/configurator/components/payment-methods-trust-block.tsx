import { LockKeyhole } from "lucide-react";

export function PaymentMethodsTrustBlock({ className = "" }: { className?: string }) {
  return (
    <section
      aria-labelledby="secure-payments-heading"
      className={`rounded-[1.25rem] border border-white/[0.08] bg-[#080B09] p-3.5 ${className}`.trim()}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/[0.09] bg-white/[0.025] text-white/65"
        >
          <LockKeyhole className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 id="secure-payments-heading" className="text-xs font-semibold text-[#F4F7F5]">
            Secure payments
          </h3>
          <p className="mt-1 text-[10px] leading-4 text-white/45">
            Processed securely by Stripe
          </p>
          <div
            className="mt-2.5 inline-flex max-w-full items-center rounded-lg border border-white/[0.07] bg-black/15 px-2.5 py-1.5 text-[10px] font-medium text-white/55"
            aria-label="Payment method availability"
          >
            Payment options are shown in Stripe Checkout
          </div>
          <p className="mt-2 text-[9px] leading-4 text-white/35">
            Payment method availability may vary by device and region.
          </p>
        </div>
      </div>
    </section>
  );
}
