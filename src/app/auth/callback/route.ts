import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/features/auth/safe-next";
import { createAuthServerClient } from "@/lib/supabase/auth";

function loginErrorRedirect(
  request: NextRequest,
  next: string,
  reason: "cancelled" | "missing" | "failed",
) {
  const destination = new URL("/login", request.url);
  destination.searchParams.set("oauthError", reason);
  destination.searchParams.set("next", next);
  return NextResponse.redirect(destination);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const next = safeNextPath(searchParams.get("next"));
  const providerError = searchParams.get("error");

  if (providerError) {
    return loginErrorRedirect(
      request,
      next,
      providerError === "access_denied" ? "cancelled" : "failed",
    );
  }

  const code = searchParams.get("code");
  if (!code) {
    return loginErrorRedirect(request, next, "missing");
  }

  const supabase = await createAuthServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return loginErrorRedirect(request, next, "failed");
  }

  return NextResponse.redirect(new URL(next, request.url));
}
