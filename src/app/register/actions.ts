"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth";
import { safeNextPath } from "@/features/auth/safe-next";
import {
  isValidEmail,
  isValidPassword,
  normalizeEmail,
  normalizeText,
} from "@/features/auth/server/validation";

const LEGAL_VERSION = "2026-08-30";

function registerRedirect(params: Record<string, string>) {
  const search = new URLSearchParams(params);
  return `/register?${search.toString()}`;
}

export async function registerAction(formData: FormData) {
  const fullName = normalizeText(formData.get("fullName"), 100);
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const legalConsent = formData.get("legalConsent") === "accepted";
  const next = safeNextPath(formData.get("next"));

  if (!legalConsent) {
    redirect(registerRedirect({ error: "legal", next }));
  }

  if (
    fullName.length < 2 ||
    !isValidEmail(email) ||
    !isValidPassword(password)
  ) {
    redirect(registerRedirect({ error: "invalid", next }));
  }

  const h = await headers();
  const origin =
    h.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const confirmationUrl = new URL("/auth/confirm", origin);
  confirmationUrl.searchParams.set("next", next);

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
      emailRedirectTo: confirmationUrl.toString(),
    },
  });

  if (error) {
    redirect(registerRedirect({ error: "signup", next }));
  }

  if (data.session) {
    redirect(next);
  }

  redirect(registerRedirect({ checkEmail: "1", next }));
}
