import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { getCurrentIdentity } from "@/features/auth/server/auth";
import { registerAction } from "./actions";

export const metadata = { title: "Create account" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; checkEmail?: string }>;
}) {
  const identity = await getCurrentIdentity();
  if (identity) redirect("/dashboard");

  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#050807] px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-[1.5rem] border border-[#FFFFFF14] bg-[#0E1411] p-6 shadow-[0_24px_70px_-50px_rgba(0,0,0,.95)] sm:p-8">
          <p className="font-gaming-label text-[10px] uppercase tracking-[0.14em] text-[#A0AAA4]">
            Create account
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.045em] text-[#F4F7F5]">
            Join BoostingPedia
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#A0AAA4]">
            Track services and manage your gaming profile in one place.
          </p>

          {params.checkEmail ? (
            <p className="mt-5 rounded-xl border border-[#39E56F]/20 bg-[#39E56F]/[0.06] p-3 text-sm text-[#82F5A4]">
              Check your inbox to confirm your email, then return here to sign in.
            </p>
          ) : null}

          {params.error ? (
            <p className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.05] p-3 text-sm text-red-300">
              {params.error === "legal"
                ? "You must accept the legal policies and confirm the age requirement before creating an account."
                : "We could not create the account. Check your details or try another email."}
            </p>
          ) : null}

          {!params.checkEmail ? (
            <form action={registerAction} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-[#F4F7F5]">
                Full name
                <input
                  name="fullName"
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  className="mt-2 h-11 w-full rounded-xl border border-[#FFFFFF14] bg-[#090D0B] px-3 text-[#F4F7F5] outline-none transition-colors focus:border-[#39E56F]/35"
                />
              </label>

              <label className="block text-sm font-medium text-[#F4F7F5]">
                Email
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-2 h-11 w-full rounded-xl border border-[#FFFFFF14] bg-[#090D0B] px-3 text-[#F4F7F5] outline-none transition-colors focus:border-[#39E56F]/35"
                />
              </label>

              <label className="block text-sm font-medium text-[#F4F7F5]">
                Password
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  className="mt-2 h-11 w-full rounded-xl border border-[#FFFFFF14] bg-[#090D0B] px-3 text-[#F4F7F5] outline-none transition-colors focus:border-[#39E56F]/35"
                />
                <span className="mt-1 block text-xs text-[#667069]">
                  Use at least 8 characters.
                </span>
              </label>

              <div className="rounded-xl border border-[#FFFFFF14] bg-[#090D0B] p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    name="legalConsent"
                    type="checkbox"
                    value="accepted"
                    required
                    className="mt-0.5 size-4 shrink-0 accent-[#39E56F]"
                  />
                  <span className="text-xs leading-5 text-[#A0AAA4]">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="font-medium text-[#F4F7F5] underline decoration-white/20 underline-offset-2 transition-colors hover:text-[#82F5A4]"
                    >
                      Terms & Conditions
                    </Link>
                    ,{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      className="font-medium text-[#F4F7F5] underline decoration-white/20 underline-offset-2 transition-colors hover:text-[#82F5A4]"
                    >
                      Privacy Policy
                    </Link>
                    ,{" "}
                    <Link
                      href="/cookies"
                      target="_blank"
                      className="font-medium text-[#F4F7F5] underline decoration-white/20 underline-offset-2 transition-colors hover:text-[#82F5A4]"
                    >
                      Cookie Policy
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/refunds"
                      target="_blank"
                      className="font-medium text-[#F4F7F5] underline decoration-white/20 underline-offset-2 transition-colors hover:text-[#82F5A4]"
                    >
                      Refund Policy
                    </Link>
                    . I also confirm that I am at least 18 years old, or that I have permission from a parent or legal guardian.
                  </span>
                </label>
              </div>

              <button className="h-11 w-full rounded-xl bg-[#39E56F] text-sm font-semibold text-[#050807] shadow-[0_10px_30px_-18px_rgba(57,229,111,.65)] transition-colors hover:bg-[#20C95A]">
                Create account
              </button>
            </form>
          ) : null}

          <p className="mt-5 text-sm text-[#A0AAA4]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#F4F7F5] transition-colors hover:text-[#82F5A4]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
