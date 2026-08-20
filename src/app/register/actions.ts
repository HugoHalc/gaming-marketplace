"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth";
import { isValidEmail, isValidPassword, normalizeEmail, normalizeText } from "@/features/auth/server/validation";

export async function registerAction(formData: FormData) {
  const fullName = normalizeText(formData.get("fullName"), 100);
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  if (fullName.length < 2 || !isValidEmail(email) || !isValidPassword(password)) redirect("/register?error=invalid");

  const h = await headers();
  const origin = h.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createAuthServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName }, emailRedirectTo: `${origin}/auth/confirm?next=/dashboard` },
  });
  if (error) redirect("/register?error=signup");
  if (data.session) redirect("/dashboard");
  redirect("/register?checkEmail=1");
}
