import "server-only";
import { requireAdmin, requireUser } from "@/features/auth/server/auth";
import { createAuthServerClient } from "@/lib/supabase/auth";
import { UUID_PATTERN } from "@/features/admin/lib/booster-settings";
import type { AdminApplication, CandidateApplication } from "../types";

// Explicit safe projection: no review notes, administrator identity or payout.
export const CANDIDATE_APPLICATION_SELECT =
  "id,status,requested_games,platforms,experience,weekly_hours,timezone,submitted_at,updated_at,reviewed_at,rejection_reason,version";
export async function getCandidateApplications(page = 0) {
  const identity = await requireUser();
  const client = await createAuthServerClient();
  const [applications, booster, latest] = await Promise.all([
    client
      .from("booster_applications")
      .select(CANDIDATE_APPLICATION_SELECT)
      .eq("user_id", identity.id)
      .order("submitted_at", { ascending: false })
      .order("id", { ascending: false })
      .range(page * 20, page * 20 + 20),
    client
      .from("booster_profiles")
      .select("is_active")
      .eq("user_id", identity.id)
      .maybeSingle(),
    client
      .from("booster_applications")
      .select(CANDIDATE_APPLICATION_SELECT)
      .eq("user_id", identity.id)
      .order("submitted_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(1),
  ]);
  if (applications.error || booster.error || latest.error)
    throw new Error("Unable to load your application status.");
  const rows = (applications.data ?? []) as CandidateApplication[];
  return {
    latest: ((latest.data ?? []) as CandidateApplication[])[0],
    applications: rows.slice(0, 20),
    hasNextPage: rows.length > 20,
    activeBooster: booster.data?.is_active === true,
  };
}
export async function listAdminApplications(
  query: string,
  status: string,
  page: number,
  id?: string,
) {
  await requireAdmin();
  if (id && !UUID_PATTERN.test(id)) throw new Error("Invalid application.");
  const client = await createAuthServerClient();
  const { data, error } = await client.rpc("admin_booster_applications", {
    p_query: query.slice(0, 100),
    p_status: status,
    p_page: page,
    p_id: id ?? null,
  });
  if (error) throw new Error("Unable to load applications.");
  const rows = (data ?? []) as AdminApplication[];
  return { applications: rows.slice(0, 20), hasNextPage: rows.length > 20 };
}
