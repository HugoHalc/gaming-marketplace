"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/server/auth";
import { createAuthServerClient } from "@/lib/supabase/auth";
import { publicGameNavigation } from "@/features/catalog/data/launch-games";
import { payoutPercentToBps, UUID_PATTERN } from "@/features/admin/lib/booster-settings";

export type BoosterActionState = { error?: string; success?: string };

export async function saveBoosterAccess(_previous: BoosterActionState, form: FormData): Promise<BoosterActionState> {
  await requireAdmin();
  const userId = String(form.get("userId") ?? "");
  const action = String(form.get("intent") ?? "");
  const games = form.getAll("games").map(String);
  if (!UUID_PATTERN.test(userId) || !["enable", "save", "disable"].includes(action)) return { error: "Invalid booster settings." };
  if (action === "disable" && form.get("confirmDisable") !== "yes") return { error: "Confirm that you want to disable booster access." };
  const canonical = new Set(publicGameNavigation.map((game) => game.slug));
  if (games.some((slug) => !canonical.has(slug)) || new Set(games).size !== games.length) return { error: "Select valid approved games." };
  let bps: number;
  try { bps = payoutPercentToBps(String(form.get("payout") ?? "")); }
  catch (error) { return { error: error instanceof Error ? error.message : "Invalid payout." }; }
  const client = await createAuthServerClient();
  const { error } = await client.rpc("manage_booster_access", {
    p_user_id: userId, p_payout_rate_bps: bps, p_game_slugs: games, p_action: action,
  });
  if (error) return { error: error.message === "This booster still has active orders." ? error.message : "Unable to save booster access. Refresh the page and try again." };
  revalidatePath("/admin/boosters");
  revalidatePath("/booster/orders");
  revalidatePath("/dashboard", "layout");
  return { success: action === "disable" ? "Booster access disabled." : "Booster settings saved." };
}
