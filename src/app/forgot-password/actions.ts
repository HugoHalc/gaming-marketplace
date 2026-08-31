"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth";
import { isValidEmail, normalizeEmail } from "@/features/auth/server/validation";
export async function forgotPasswordAction(formData: FormData) {
  const email=normalizeEmail(formData.get("email")); if(!isValidEmail(email)) redirect("/forgot-password?error=1");
  const h=await headers(); const origin=h.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase=await createAuthServerClient(); await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${origin}/auth/confirm?next=/update-password`});
  redirect("/forgot-password?sent=1");
}
