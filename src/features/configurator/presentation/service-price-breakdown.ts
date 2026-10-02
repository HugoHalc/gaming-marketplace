import type { QuotePreview } from "@/features/configurator/types/configurator";

/** Presentation only: allocate the authoritative final cents, never price an order. */
export function presentServicePriceBreakdown(quote: QuotePreview) {
  const cents = (amount: number) => Math.round(amount * 100);
  const lines = quote.breakdown.filter((line) => line.amount >= 0 && line.label.trim().toLowerCase() !== "automatic price adjustment");
  const total = cents(quote.total);
  const gross = lines.reduce((sum, line) => sum + cents(line.amount), 0);
  if (gross === 0) return lines.map((line) => ({ ...line, amount: 0 }));

  const allocations = lines.map((line, index) => {
    const numerator = cents(line.amount) * total;
    return { index, amount: Math.floor(numerator / gross), remainder: numerator % gross };
  });
  const remaining = total - allocations.reduce((sum, line) => sum + line.amount, 0);
  const order = [...allocations].sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  for (let index = 0; index < remaining; index += 1) order[index].amount += 1;
  return lines.map((line, index) => ({ ...line, amount: allocations[index].amount / 100 }));
}
