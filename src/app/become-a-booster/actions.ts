"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentIdentity } from "@/features/auth/server/auth";
import { createAuthServerClient } from "@/lib/supabase/auth";
import { UUID_PATTERN } from "@/features/admin/lib/booster-settings";
import { parseApplicationForm } from "@/features/booster-applications/validation";
import type { ApplicationActionState } from "@/features/booster-applications/types";

async function requireCandidate() {
  const identity = await getCurrentIdentity();
  if (!identity) redirect("/login?next=%2Fbecome-a-booster");
  return identity;
}
const safeMessages = new Set([
  "A registered account is required to apply.",
  "You already have an active application.",
  "Active boosters cannot submit another application.",
  "Application changed. Refresh the page and try again.",
  "This application can no longer be withdrawn.",
]);
export async function submitApplication(
  _previous: ApplicationActionState,
  form: FormData,
): Promise<ApplicationActionState> {
  await requireCandidate();
  const details = parseApplicationForm(form);
  if (Object.keys(details.fields).length)
    return { fields: details.fields, error: "Check the highlighted fields." };
  const requestId = String(form.get("requestId") ?? "");
  if (!UUID_PATTERN.test(requestId))
    return { error: "Refresh the page before submitting." };
  const client = await createAuthServerClient();
  const { error } = await client.rpc("submit_booster_application", {
    p_request_id: requestId,
    p_games: details.games,
    p_platforms: details.platforms,
    p_experience: details.experience,
    p_weekly_hours: details.weeklyHours,
    p_timezone: details.timezone,
    p_confirmations: details.confirmations,
  });
  if (error)
    return {
      error: safeMessages.has(error.message)
        ? error.message
        : "Unable to submit your application. Refresh the page and try again.",
    };
  revalidatePath("/become-a-booster");
  revalidatePath("/admin/boosters");
  return { success: "Application submitted." };
}
export async function withdrawApplication(
  _previous: ApplicationActionState,
  form: FormData,
): Promise<ApplicationActionState> {
  await requireCandidate();
  const id = String(form.get("applicationId") ?? "");
  const version = Number(form.get("version"));
  if (
    !UUID_PATTERN.test(id) ||
    !Number.isSafeInteger(version) ||
    version < 1 ||
    form.get("confirmWithdraw") !== "yes"
  )
    return { error: "Confirm withdrawal of this application." };
  const client = await createAuthServerClient();
  const { error } = await client.rpc("withdraw_booster_application", {
    p_id: id,
    p_version: version,
  });
  if (error)
    return {
      error: safeMessages.has(error.message)
        ? error.message
        : "Unable to withdraw your application. Refresh the page and try again.",
    };
  revalidatePath("/become-a-booster");
  revalidatePath("/admin/boosters");
  return { success: "Application withdrawn." };
}
