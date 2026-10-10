import { CreditCard, LockKeyhole } from "lucide-react";
import { OrderPaymentMethods } from "@/components/checkout/order-payment-methods";

export function OrderCheckoutRedirect({ orderId }: { orderId: string }) {
  return (
    <div className="grid min-h-[55vh] place-items-center px-4 py-12">
      <div className="w-full max-w-md rounded-[22px] border border-white/[0.08] bg-[#0B100D] p-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <span className="mx-auto grid size-11 place-items-center rounded-full border border-[#39E56F]/20 bg-[#39E56F]/[0.05] text-[#82F5A4]">
          <LockKeyhole className="size-4.5" />
        </span>

        <h1 className="mt-4 text-lg font-semibold text-[#F4F7F5]">
          Choose your payment method
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#A0AAA4]">
          Your order is ready. Continue securely with Stripe or PayPal.
        </p>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#667069]">
          <CreditCard className="size-3.5" />
          No payment details are stored by BoostingPedia
        </div>
        <OrderPaymentMethods orderId={orderId} />
      </div>
    </div>
  );
}
