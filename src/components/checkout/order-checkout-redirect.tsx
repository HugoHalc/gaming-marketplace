"use client";

import { useEffect, useRef } from "react";
import { LoaderCircle, LockKeyhole } from "lucide-react";

export function OrderCheckoutRedirect({ orderId }: { orderId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.submit();
  }, []);

  return (
    <div className="grid min-h-[55vh] place-items-center px-4 py-12">
      <div className="w-full max-w-md rounded-[22px] border border-white/[0.08] bg-[#0B100D] p-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <span className="mx-auto grid size-11 place-items-center rounded-full border border-[#39E56F]/20 bg-[#39E56F]/[0.05] text-[#82F5A4]">
          <LockKeyhole className="size-4.5" />
        </span>

        <h1 className="mt-4 text-lg font-semibold text-[#F4F7F5]">
          Redirecting to secure checkout
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#A0AAA4]">
          Your order is ready. We&apos;re taking you directly to payment.
        </p>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#667069]">
          <LoaderCircle className="size-3.5 animate-spin" />
          Preparing payment…
        </div>

        <form ref={formRef} action="/api/checkout" method="POST" className="mt-6">
          <input type="hidden" name="orderId" value={orderId} />
          <button
            type="submit"
            className="text-xs font-medium text-[#A0AAA4] underline decoration-white/20 underline-offset-4 transition-colors hover:text-[#F4F7F5]"
          >
            Continue to payment
          </button>
        </form>
      </div>
    </div>
  );
}
