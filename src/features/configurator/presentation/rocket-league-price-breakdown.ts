import type { QuoteBreakdownItem } from "@/features/configurator/types/configurator";

/** Display-only allocation; the authoritative quote and stored snapshot stay intact. */
export function presentRocketLeaguePriceBreakdown(
  breakdown: QuoteBreakdownItem[],
  total: number | undefined,
  game: string,
): QuoteBreakdownItem[] {
  const isAdjustment = (line: QuoteBreakdownItem) =>
    line.label.trim().toLowerCase() === "automatic price adjustment";

  if (game.toLowerCase().replace(/[\s_-]/g, "") !== "rocketleague"
    || !breakdown.some(isAdjustment)) {
    return breakdown;
  }

  const cents = (amount: number) => Math.round(amount * 100);
  const lines = breakdown.filter((line) => !isAdjustment(line));
  const totalCents = total === undefined
    ? breakdown.reduce((sum, line) => sum + cents(line.amount), 0)
    : cents(total);
  const grossCents = lines.reduce((sum, line) => sum + cents(line.amount), 0);

  // The adjustment applies to the complete subtotal, including paid extras.
  // Allocate final cents proportionally, then distribute rounding cents in
  // stable largest-remainder order so the displayed rows always equal the total.
  if (grossCents === 0) return lines.map((line) => ({ ...line, amount: 0 }));
  const allocated = lines.map((line, index) => {
    const numerator = cents(line.amount) * totalCents;
    return { index, amount: Math.floor(numerator / grossCents), remainder: numerator % grossCents };
  });
  const roundingCents = totalCents - allocated.reduce((sum, line) => sum + line.amount, 0);
  const roundingOrder = [...allocated].sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  for (let index = 0; index < roundingCents; index += 1) roundingOrder[index].amount += 1;

  return lines.map((line, index) => ({ ...line, amount: allocated[index].amount / 100 }));
}
