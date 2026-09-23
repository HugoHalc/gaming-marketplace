export const MINIMUM_ORDER_TOTAL_CENTS = 500;
export const MINIMUM_ORDER_TOTAL_USD = MINIMUM_ORDER_TOTAL_CENTS / 100;
export const MINIMUM_ORDER_ERROR_CODE = "minimum_order_total" as const;

export function currencyToCents(amount: number) {
  if (!Number.isFinite(amount)) return Number.NaN;
  return Math.round((amount + Number.EPSILON) * 100);
}

export function meetsMinimumOrderTotal(amount: number) {
  const cents = currencyToCents(amount);
  return Number.isFinite(cents) && cents >= MINIMUM_ORDER_TOTAL_CENTS;
}

export function minimumOrderShortfallCents(amount: number) {
  const cents = currencyToCents(amount);
  if (!Number.isFinite(cents)) return 0;
  return Math.max(0, MINIMUM_ORDER_TOTAL_CENTS - cents);
}

export function formatUsdCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export const MINIMUM_ORDER_TOTAL_LABEL = formatUsdCents(MINIMUM_ORDER_TOTAL_CENTS);
