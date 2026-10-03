export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function payoutPercentToBps(value: string): number {
  if (!/^\d{1,3}(?:\.\d{1,2})?$/.test(value)) throw new Error("Enter a payout between 0 and 100%, with at most two decimal places.");
  const [whole, decimal = ""] = value.split(".");
  const bps = Number(whole) * 100 + Number(decimal.padEnd(2, "0"));
  if (bps > 10000) throw new Error("Payout must be between 0 and 100%.");
  return bps;
}

export type BoosterAccount = {
  user_id: string;
  email: string;
  full_name: string | null;
  gamer_tag: string | null;
  role: string;
  is_active: boolean | null;
  payout_rate_bps: number | null;
  activated_at: string | null;
  game_slugs: string[];
};
