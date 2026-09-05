"use client";

import { useState } from "react";
import { createAuthBrowserClient } from "@/lib/supabase/browser";

type Provider = "google" | "discord";

export function SocialSignInButtons({
  next,
  googleEnabled,
  discordEnabled,
}: {
  next: string;
  googleEnabled: boolean;
  discordEnabled: boolean;
}) {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startOAuth(provider: Provider) {
    if (loadingProvider) return;

    setLoadingProvider(provider);
    setError(null);

    try {
      const callbackUrl = new URL("/auth/confirm", window.location.origin);
      callbackUrl.searchParams.set("next", next);

      const supabase = createAuthBrowserClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (oauthError) {
        throw oauthError;
      }
    } catch {
      setError(
        `${provider === "google" ? "Google" : "Discord"} sign-in could not be started.`,
      );
      setLoadingProvider(null);
    }
  }

  return (
    <div className="mt-6">
      <div className="space-y-2.5">
        {googleEnabled ? (
          <button
            type="button"
            onClick={() => startOAuth("google")}
            disabled={Boolean(loadingProvider)}
            className="flex h-12 w-full items-center justify-center rounded-xl border border-black/[0.08] bg-[#F4F7F5] px-4 text-[13px] font-semibold text-[#111512] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 disabled:cursor-wait disabled:opacity-65"
          >
            {loadingProvider === "google"
              ? "Connecting to Google…"
              : "Continue with Google"}
          </button>
        ) : null}

        {discordEnabled ? (
          <button
            type="button"
            onClick={() => startOAuth("discord")}
            disabled={Boolean(loadingProvider)}
            className="flex h-12 w-full items-center justify-center rounded-xl border border-[#6D78F4]/35 bg-[#5865F2] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#6672F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8790FF]/35 disabled:cursor-wait disabled:opacity-65"
          >
            {loadingProvider === "discord"
              ? "Connecting to Discord…"
              : "Continue with Discord"}
          </button>
        ) : null}
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-xl border border-[#FF7A59]/20 bg-[#FF7A59]/[0.05] px-3 py-2.5 text-[12px] text-[#FFB09C]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
