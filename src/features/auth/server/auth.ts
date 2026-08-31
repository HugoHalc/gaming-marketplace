import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth";
import { hasPublicSupabaseEnv } from "@/lib/supabase/env";

export type AppRole = "customer" | "admin";

export async function getCurrentIdentity() {
  if (!hasPublicSupabaseEnv()) return null;
  const supabase = await createAuthServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = error ? null : data?.claims;
  if (!claims?.sub) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, phone, gamer_tag, role, avatar_url")
    .eq("id", claims.sub)
    .maybeSingle();

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : "",
    profile: profile as null | {
      id: string;
      full_name: string | null;
      phone: string | null;
      gamer_tag: string | null;
      role: AppRole;
      avatar_url: string | null;
    },
  };
}

export async function requireUser() {
  const identity = await getCurrentIdentity();
  if (!identity) redirect("/login?next=/dashboard");
  return identity;
}

export async function requireAdmin() {
  const identity = await requireUser();
  if (identity.profile?.role !== "admin") redirect("/dashboard");
  return identity;
}
