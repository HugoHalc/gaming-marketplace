"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth";
import {
  isValidEmail,
  isValidPassword,
  normalizeEmail,
  normalizeText,
} from "@/features/auth/server/validation";

const LEGAL_VERSION = "2026-08-30";

export async function registerAction(formData: FormData) {
  const fullName = normalizeText(formData.get("fullName"), 100);
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const legalConsent = formData.get("legalConsent") === "accepted";

  if (!legalConsent) {
    redirect("/register?error=legal");
  }

  if (
    fullName.length < 2 ||
    !isValidEmail(email) ||
    !isValidPassword(password)
  ) {
    redirect("/register?error=invalid");
  }

  const h = await headers();
  const origin =
    h.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const supabase = await createAuthServerClient();
  const acceptedAt = new Date().toISOString();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        legal_consent: true,
        legal_consent_version: LEGAL_VERSION,
        legal_consent_accepted_at: acceptedAt,
        age_or_guardian_confirmed: true,
      },
      emailRedirectTo: `${origin}/auth/confirm?next=/dashboard`,
    },
  });

  if (error) {
    redirect("/register?error=signup");
  }

  if (data.session) {
    redirect("/dashboard");
  }

  redirect("/register?checkEmail=1");
}
