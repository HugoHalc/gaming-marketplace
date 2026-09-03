import { ArrowRight } from "lucide-react";

export function ClaimOrderButton({
  orderId,
  compact = false,
}: {
  orderId: string;
  compact?: boolean;
}) {
  return (
    <form
      action={`/api/booster/orders/${orderId}/claim`}
      method="post"
      className="relative z-10"
    >
      <button
        type="submit"
        className={`inline-flex items-center justify-center bg-[#39E56F] font-semibold text-[#050807] shadow-[0_0_0_1px_rgba(57,229,111,0.08)] transition-colors hover:bg-[#55ED82] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39E56F]/50 ${
          compact
            ? "h-8 min-w-[78px] rounded-lg px-3.5 text-[9px]"
            : "h-10 rounded-xl px-4 text-xs"
        }`}
      >
        {compact ? "Accept" : "Accept Order"}
        {!compact ? <ArrowRight className="ml-2 size-3.5" /> : null}
      </button>
    </form>
  );
}
