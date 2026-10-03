import "server-only";
import { requireAdmin } from "@/features/auth/server/auth";
import { createAuthServerClient } from "@/lib/supabase/auth";
import { UUID_PATTERN, type BoosterAccount } from "@/features/admin/lib/booster-settings";

export async function listBoosterAccounts(query: string, page: number, boostersOnly: boolean, userId?: string) {
  await requireAdmin();
  if (userId && !UUID_PATTERN.test(userId)) throw new Error("Invalid account.");
  const client = await createAuthServerClient();
  const { data, error } = await client.rpc("admin_booster_accounts", {
    p_query: query.slice(0, 100), p_page: page, p_boosters_only: boostersOnly, p_user_id: userId ?? null,
  });
  if (error) throw new Error("Unable to load booster accounts.");
  const rows = (data ?? []) as BoosterAccount[];
  return { accounts: rows.slice(0, 20), hasNextPage: rows.length > 20 };
}
