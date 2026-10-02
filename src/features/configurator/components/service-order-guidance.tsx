import Link from "next/link";
import { Clock3, ShieldCheck, UsersRound } from "lucide-react";

export function BeforeCheckoutGuidance() {
  return (
    <section aria-label="Before checkout" className="flex items-start gap-2.5 px-3 py-3">
      <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#82F5A4]" />
      <div className="min-w-0">
        <h3 className="text-xs font-semibold text-[#A0AAA4]">Before checkout</h3>
        <p className="mt-1 text-xs leading-5 text-[#A0AAA4]">Final order details are validated before checkout.</p>
      </div>
    </section>
  );
}

export function ServiceOrderGuidance({ startingTime, timingNote }: { startingTime: string; timingNote: string }) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.07] bg-black/15">
      <section aria-label="Before checkout" className="flex items-start gap-2.5 px-3 py-3">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#82F5A4]" />
        <div className="min-w-0">
          <h3 className="text-xs font-semibold text-[#A0AAA4]">Before checkout</h3>
          <p className="mt-1 text-xs leading-5 text-[#A0AAA4]">Pricing is recalculated on the server before the order is created.</p>
        </div>
      </section>
      <section aria-label="Estimated timing" className="flex items-start gap-2.5 border-t border-white/[0.06] px-3 py-3">
        <Clock3 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#82F5A4]" />
        <div className="min-w-0 flex-1" role="status" aria-live="polite" aria-atomic="true">
          <h3 className="text-xs font-semibold text-[#A0AAA4]">Estimated timing</h3>
          <p className="mt-1 text-xs leading-5 text-[#A0AAA4]">Estimated starting time</p>
          <p className="mt-1 text-sm font-semibold text-white/78">{startingTime}</p>
          <p className="mt-1 text-xs leading-5 text-[#A0AAA4]">{timingNote}</p>
        </div>
      </section>
      <section aria-label="Verify before you order" className="flex items-start gap-2.5 border-t border-white/[0.06] px-3 py-3">
        <UsersRound aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#82F5A4]" />
        <div className="min-w-0">
          <h3 className="text-xs font-semibold text-[#A0AAA4]">Verify before you order</h3>
          <div className="mt-1 flex flex-wrap gap-x-3 text-xs">
            <a href="https://www.trustpilot.com/review/boostingpedia.com" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-[#A0AAA4] underline underline-offset-2">Public Trustpilot reviews</a>
            <Link href="/refunds" className="inline-flex min-h-11 items-center text-[#A0AAA4] underline underline-offset-2">Refund policy</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
