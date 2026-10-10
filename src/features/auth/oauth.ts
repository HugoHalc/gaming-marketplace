import { officialSiteUrl } from "@/config/site";
import { safeNextPath } from "@/features/auth/safe-next";

export type SocialAuthProvider = "google" | "discord";

type OAuthClient = {
  auth: {
    signInWithOAuth(options: {
      provider: SocialAuthProvider;
      options: { redirectTo: string };
    }): Promise<{ error: Error | null }>;
  };
};

function isLocalDevelopmentOrigin(origin: URL) {
  return (
    origin.hostname === "localhost" ||
    origin.hostname === "127.0.0.1" ||
    origin.hostname === "[::1]"
  );
}

export function createOAuthCallbackUrl(currentOrigin: string, next: unknown) {
  let callbackOrigin = officialSiteUrl;

  try {
    const parsedOrigin = new URL(currentOrigin);
    if (isLocalDevelopmentOrigin(parsedOrigin)) {
      callbackOrigin = parsedOrigin.origin;
    }
  } catch {
    // Invalid or unavailable browser origins safely fall back to production.
  }

  const callbackUrl = new URL("/auth/callback", callbackOrigin);
  callbackUrl.searchParams.set("next", safeNextPath(next));
  return callbackUrl.toString();
}

export function startSocialOAuth(
  supabase: OAuthClient,
  provider: SocialAuthProvider,
  currentOrigin: string,
  next: unknown,
) {
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: createOAuthCallbackUrl(currentOrigin, next),
    },
  });
}
