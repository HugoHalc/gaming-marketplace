import {
  formatUsdCents,
  MINIMUM_ORDER_TOTAL_LABEL,
} from "@/features/orders/minimum-order";

export function MinimumOrderNotice({
  id,
  shortfallCents,
}: {
  id: string;
  shortfallCents: number;
}) {
  if (shortfallCents <= 0) return null;

  return (
    <div
      id={id}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="mt-3 rounded-lg border border-amber-200/15 bg-amber-200/[0.035] px-3 py-2.5 text-[10px] leading-4 text-amber-50/75"
    >
      <p className="font-semibold">Minimum order total: {MINIMUM_ORDER_TOTAL_LABEL}</p>
      <p className="mt-0.5 text-amber-50/55">
        Add {formatUsdCents(shortfallCents)} to reach the {MINIMUM_ORDER_TOTAL_LABEL} minimum.
      </p>
    </div>
  );
}
