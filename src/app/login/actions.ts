"use server";

import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth";
import { isValidEmail, isValidPassword, normalizeEmail } from "@/features/auth/server/validation";

function safeNext(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export async function loginAction(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!isValidEmail(email) || !isValidPassword(password)) {
    redirect(`/login?error=invalid&next=${encodeURIComponent(next)}`);
  }

  const supabase = await createAuthServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=credentials&next=${encodeURIComponent(next)}`);
  redirect(next);
}
