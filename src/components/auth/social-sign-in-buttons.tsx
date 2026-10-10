"use client";

import { LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";
import {
  startSocialOAuth,
  type SocialAuthProvider,
} from "@/features/auth/oauth";
import { createAuthBrowserClient } from "@/lib/supabase/browser";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px] shrink-0">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.32 2.98-7.4Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.43l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.86A6 6 0 0 1 6.07 12c0-.65.11-1.28.32-1.86V7.52H3.05A10 10 0 0 0 2 12c0 1.61.39 3.14 1.05 4.48l3.34-2.62Z" />
      <path fill="#EA4335" d="M12 6.01c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.95 5.52l3.34 2.62C7.18 7.77 9.39 6.01 12 6.01Z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px] shrink-0" fill="currentColor">
      <path d="M19.54 5.34A16.4 16.4 0 0 0 15.44 4a11.2 11.2 0 0 0-.52 1.07 15.3 15.3 0 0 0-5.82 0A11.8 11.8 0 0 0 8.56 4a16.7 16.7 0 0 0-4.1 1.34C1.87 9.18 1.17 12.92 1.52 16.6a16.8 16.8 0 0 0 5.03 2.55c.4-.55.77-1.14 1.08-1.75-.59-.22-1.15-.5-1.69-.81l.41-.32c3.27 1.51 6.82 1.51 10.05 0l.42.32c-.54.32-1.1.59-1.69.81.31.61.67 1.2 1.08 1.75a16.7 16.7 0 0 0 5.03-2.55c.42-4.27-.72-7.98-1.7-11.26ZM8.15 14.34c-.98 0-1.79-.9-1.79-2s.79-2.01 1.79-2.01 1.8.9 1.79 2.01c0 1.1-.79 2-1.79 2Zm7.7 0c-.98 0-1.79-.9-1.79-2s.79-2.01 1.79-2.01 1.8.9 1.79 2.01c0 1.1-.79 2-1.79 2Z" />
    </svg>
  );
}

export function SocialSignInButtons({
  next,
  formId,
}: {
  next: string;
  formId: string;
}) {
  const inFlightRef = useRef(false);
  const [loadingProvider, setLoadingProvider] = useState<SocialAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setFormBusy(isBusy: boolean) {
    const form = document.getElementById(formId);
    if (!(form instanceof HTMLFormElement)) return;
    form.inert = isBusy;
    if (isBusy) form.setAttribute("aria-busy", "true");
    else form.removeAttribute("aria-busy");
  }

  async function startOAuth(provider: SocialAuthProvider) {
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    setLoadingProvider(provider);
    setError(null);
    setFormBusy(true);

    try {
      const supabase = createAuthBrowserClient();
      const { error: oauthError } = await startSocialOAuth(
        supabase,
        provider,
        window.location.origin,
        next,
      );

      if (oauthError) {
        throw oauthError;
      }
    } catch {
      setError(
        `${provider === "google" ? "Google" : "Discord"} sign-in could not be started.`,
      );
      inFlightRef.current = false;
      setLoadingProvider(null);
      setFormBusy(false);
    }
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          aria-label="Continue with Google"
          aria-busy={loadingProvider === "google"}
          onClick={() => startOAuth("google")}
          disabled={Boolean(loadingProvider)}
          className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-white/[0.10] bg-[#090D0B] px-3 text-[13px] font-semibold text-[#F4F7F5] outline-none transition-[border-color,background-color,color] hover:border-[#39E56F]/25 hover:bg-[#101713] focus-visible:border-[#39E56F]/35 focus-visible:ring-2 focus-visible:ring-[#39E56F]/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B110E] disabled:cursor-wait disabled:opacity-55"
        >
          {loadingProvider === "google" ? (
            <LoaderCircle aria-hidden="true" className="size-[18px] shrink-0 animate-spin text-[#82F5A4]" />
          ) : (
            <GoogleIcon />
          )}
          <span>{loadingProvider === "google" ? "Connecting…" : "Continue with Google"}</span>
        </button>

        <button
          type="button"
          aria-label="Continue with Discord"
          aria-busy={loadingProvider === "discord"}
          onClick={() => startOAuth("discord")}
          disabled={Boolean(loadingProvider)}
          className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-white/[0.10] bg-[#090D0B] px-3 text-[13px] font-semibold text-[#F4F7F5] outline-none transition-[border-color,background-color,color] hover:border-[#39E56F]/25 hover:bg-[#101713] focus-visible:border-[#39E56F]/35 focus-visible:ring-2 focus-visible:ring-[#39E56F]/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B110E] disabled:cursor-wait disabled:opacity-55"
        >
          {loadingProvider === "discord" ? (
            <LoaderCircle aria-hidden="true" className="size-[18px] shrink-0 animate-spin text-[#82F5A4]" />
          ) : (
            <DiscordIcon />
          )}
          <span>{loadingProvider === "discord" ? "Connecting…" : "Continue with Discord"}</span>
        </button>
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
