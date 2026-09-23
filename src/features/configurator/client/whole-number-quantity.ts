export type WholeNumberQuantityResult =
  | { valid: true; value: number }
  | { valid: false; value: null };

export function parseWholeNumberQuantity(
  value: unknown,
  min: number,
  max: number,
): WholeNumberQuantityResult {
  if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) {
    throw new Error("Invalid quantity bounds.");
  }

  if (typeof value === "number") {
    return Number.isFinite(value) && Number.isInteger(value) && value >= min && value <= max
      ? { valid: true, value }
      : { valid: false, value: null };
  }

  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return { valid: false, value: null };
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= min && parsed <= max
    ? { valid: true, value: parsed }
    : { valid: false, value: null };
}

export function quantitySelectionValue(raw: string, min: number, max: number) {
  const parsed = parseWholeNumberQuantity(raw, min, max);
  return parsed.valid ? parsed.value : raw;
}
