import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/features/auth/safe-next";
import { createAuthServerClient } from "@/lib/supabase/auth";

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const code = request.nextUrl.searchParams.get("code");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  const supabase = await createAuthServerClient();
  let error: unknown = null;

  if (tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }));
  } else if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else {
    error = new Error("Missing confirmation token");
  }

  const destination = error
    ? `/auth/error?next=${encodeURIComponent(next)}`
    : next;

  return NextResponse.redirect(new URL(destination, request.url));
}
