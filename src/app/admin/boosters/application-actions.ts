"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/server/auth";
import { createAuthServerClient } from "@/lib/supabase/auth";
import {
  UUID_PATTERN,
  payoutPercentToBps,
} from "@/features/admin/lib/booster-settings";
import { applicationGames } from "@/features/booster-applications/catalog";
import type { ApplicationActionState } from "@/features/booster-applications/types";

const messages = new Set([
  "Application changed. Refresh the page and try again.",
  "This account already has active booster access.",
  "This application is no longer reviewable.",
  "This application has already been approved.",
]);
export async function reviewApplication(
  _previous: ApplicationActionState,
  form: FormData,
): Promise<ApplicationActionState> {
  await requireAdmin();
  const id = String(form.get("applicationId") ?? "");
  const version = Number(form.get("version"));
  const action = String(form.get("intent") ?? "");
  const note = String(form.get("internalNote") ?? "").trim();
  const reason = String(form.get("rejectionReason") ?? "").trim();
  if (
    !UUID_PATTERN.test(id) ||
    !Number.isSafeInteger(version) ||
    version < 1 ||
    !["under_review", "approved", "rejected"].includes(action)
  )
    return { error: "Invalid review details." };
  const fields: Record<string, string> = {};
  if (note.length > 2000) fields.internalNote = "Use at most 2,000 characters.";
  if (reason.length > 1000)
    fields.rejectionReason = "Use at most 1,000 characters.";
  if (action !== "under_review" && form.get("confirmDecision") !== "yes")
    fields.confirmDecision = "Confirm this decision.";
  let bps = 0;
  const games = form.getAll("games").map(String);
  if (action === "approved") {
    try {
      bps = payoutPercentToBps(String(form.get("payout") ?? ""));
    } catch (error) {
      fields.payout =
        error instanceof Error ? error.message : "Invalid payout.";
    }
    const canonical = new Set(applicationGames.map((game) => game.slug));
    if (
      !games.length ||
      games.some((game) => !canonical.has(game)) ||
      new Set(games).size !== games.length
    )
      fields.games = "Select at least one supported game.";
  }
  if (Object.keys(fields).length)
    return { error: "Check the highlighted fields.", fields };
  const client = await createAuthServerClient();
  const { error } = await client.rpc("review_booster_application", {
    p_id: id,
    p_version: version,
    p_action: action,
    p_note: note,
    p_reason: action === "rejected" ? reason : "",
    p_payout_rate_bps: bps,
    p_games: action === "approved" ? games : [],
  });
  if (error)
    return {
      error: messages.has(error.message)
        ? error.message
        : "Unable to review the application. Refresh the page and try again.",
    };
  revalidatePath("/admin/boosters");
  revalidatePath("/become-a-booster");
  if (action === "approved") {
    revalidatePath("/booster/orders");
    revalidatePath("/dashboard", "layout");
  }
  return {
    success:
      action === "approved"
        ? "Application approved. Booster access enabled."
        : action === "rejected"
          ? "Application not approved."
          : "Application marked as under review.",
  };
}
