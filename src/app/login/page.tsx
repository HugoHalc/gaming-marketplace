import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { SocialSignInButtons } from "@/components/auth/social-sign-in-buttons";
import { safeNextPath } from "@/features/auth/safe-next";
import { getCurrentIdentity } from "@/features/auth/server/auth";
import { loginAction } from "./actions";

export const metadata = {
  title: "Sign in",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    next?: string;
    oauthError?: string;
  }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);

  const identity = await getCurrentIdentity();
  if (identity) redirect(next);

  const message =
    params.error === "credentials"
      ? "Email or password is incorrect."
      : params.error
        ? "Please check your details and try again."
        : params.oauthError
          ? "Social sign-in could not be completed. Please try again."
          : null;

  const googleEnabled =
    process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";
  const discordEnabled =
    process.env.NEXT_PUBLIC_AUTH_DISCORD_ENABLED === "true";
  const hasSocialProviders = googleEnabled || discordEnabled;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050807] px-4 py-8 text-[#F4F7F5] sm:py-12 lg:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.014)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]"
      />

      <div className="relative mx-auto w-full max-w-[470px]">
        <div className="mb-6 flex justify-center sm:mb-7">
          <Logo />
        </div>

        <section className="overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0B110E] shadow-[0_12px_36px_rgba(0,0,0,0.22)]">
          <div className="relative h-[138px] overflow-hidden border-b border-white/[0.06] bg-[#080D0A] sm:h-[158px]">
            <Image
              src="/brand/boostingpedia-signin-hero.webp"
              alt=""
              fill
              priority
              sizes="(max-width: 640px) calc(100vw - 32px), 470px"
              className="object-cover object-center"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,7,.04),rgba(11,17,14,.18)_55%,#0B110E_100%)]"
            />
            <span
              aria-hidden="true"
              className="absolute left-5 top-5 h-6 w-6 border-l border-t border-[#39E56F]/20"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-5 right-5 h-6 w-6 border-b border-r border-[#39D5E6]/16"
            />
          </div>

          <div className="p-6 sm:p-8">
            <div className="text-center">
              <p className="font-gaming-label text-[11px] font-semibold uppercase tracking-[0.16em] text-[#82F5A4]/80">
                Welcome back
              </p>
              <h1 className="mt-2 text-[28px] font-bold tracking-[-0.04em] text-[#F4F7F5] sm:text-[30px]">
                Sign in to BoostingPedia
              </h1>
              <p className="mx-auto mt-2 max-w-sm text-[13px] leading-6 text-[#A0AAA4]">
                Access your orders, messages, and service history.
              </p>
            </div>

            {message ? (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-[#FF7A59]/20 bg-[#FF7A59]/[0.055] px-3.5 py-3 text-[12px] leading-5 text-[#FFB09C]"
              >
                {message}
              </div>
            ) : null}

            {hasSocialProviders ? (
              <>
                <SocialSignInButtons
                  next={next}
                  googleEnabled={googleEnabled}
                  discordEnabled={discordEnabled}
                />

                <div className="my-6 flex items-center gap-3">
                  <span className="h-px flex-1 bg-white/[0.08]" />
                  <span className="font-gaming-label text-[11px] uppercase tracking-[0.12em] text-[#667069]">
                    Or
                  </span>
                  <span className="h-px flex-1 bg-white/[0.08]" />
                </div>
              </>
            ) : null}

            <form action={loginAction} className={hasSocialProviders ? "" : "mt-6"}>
              <input type="hidden" name="next" value={next} />

              <div className="space-y-4">
                <label className="block">
                  <span className="text-[13px] font-semibold text-[#F4F7F5]">
                    Email
                  </span>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    className="mt-2 h-12 w-full rounded-xl border border-white/[0.09] bg-[#080D0A] px-3.5 text-[14px] text-[#F4F7F5] outline-none transition-[border-color,box-shadow] placeholder:text-[#6F7B74] focus:border-[#39E56F]/35 focus:ring-2 focus:ring-[#39E56F]/10"
                  />
                </label>

                <label className="block">
                  <span className="text-[13px] font-semibold text-[#F4F7F5]">
                    Password
                  </span>
                  <input
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    minLength={8}
                    placeholder="Enter your password"
                    className="mt-2 h-12 w-full rounded-xl border border-white/[0.09] bg-[#080D0A] px-3.5 text-[14px] text-[#F4F7F5] outline-none transition-[border-color,box-shadow] placeholder:text-[#6F7B74] focus:border-[#39E56F]/35 focus:ring-2 focus:ring-[#39E56F]/10"
                  />
                </label>
              </div>

              <button className="mt-5 h-12 w-full rounded-xl bg-[#39E56F] text-[14px] font-bold text-[#041008] transition-colors hover:bg-[#20C95A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82F5A4]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B110E]">
                Sign in
              </button>
            </form>

            <div className="mt-5 flex flex-col items-center justify-between gap-3 text-[13px] text-[#A0AAA4] sm:flex-row">
              <Link
                href="/forgot-password"
                className="transition-colors hover:text-[#82F5A4] focus-visible:outline-none focus-visible:text-[#82F5A4]"
              >
                Forgot password?
              </Link>
              <Link
                href={`/register?next=${encodeURIComponent(next)}`}
                className="transition-colors hover:text-[#82F5A4] focus-visible:outline-none focus-visible:text-[#82F5A4]"
              >
                Create account
              </Link>
            </div>
          </div>
        </section>

        <p className="mt-4 text-center text-[11px] leading-5 text-[#536059]">
          Secure authentication powered by BoostingPedia&apos;s existing account system.
        </p>
      </div>
    </main>
  );
}
