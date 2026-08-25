import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { getCurrentIdentity } from "@/features/auth/server/auth";
import { registerAction } from "./actions";

export const metadata = { title: "Create account" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string; checkEmail?: string }> }) {
  const identity = await getCurrentIdentity(); if (identity) redirect("/dashboard");
  const params = await searchParams;
  return <main className="min-h-screen px-4 py-10 sm:py-16"><div className="mx-auto w-full max-w-md">
    <div className="mb-8 flex justify-center"><Logo /></div>
    <div className="rounded-3xl border border-white/10 bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
      <p className="text-sm font-semibold text-violet-300">CREATE ACCOUNT</p><h1 className="mt-2 text-3xl font-semibold">Join VantaBoost</h1><p className="mt-2 text-sm text-[var(--muted-foreground)]">Track services and manage your gaming profile in one place.</p>
      {params.checkEmail && <p className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">Check your inbox to confirm your email, then return here to sign in.</p>}
      {params.error && <p className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">We could not create the account. Check your details or try another email.</p>}
      {!params.checkEmail && <form action={registerAction} className="mt-6 space-y-4">
        <label className="block text-sm font-medium">Full name<input name="fullName" required minLength={2} maxLength={100} autoComplete="name" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 outline-none focus:border-violet-400" /></label>
        <label className="block text-sm font-medium">Email<input name="email" type="email" required autoComplete="email" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 outline-none focus:border-violet-400" /></label>
        <label className="block text-sm font-medium">Password<input name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 outline-none focus:border-violet-400" /><span className="mt-1 block text-xs text-[var(--muted-foreground)]">Use at least 8 characters.</span></label>
        <button className="h-11 w-full rounded-xl bg-[var(--primary)] text-sm font-semibold text-white hover:brightness-110">Create account</button>
      </form>}
      <p className="mt-5 text-sm text-[var(--muted-foreground)]">Already have an account? <Link href="/login" className="text-white hover:text-violet-300">Sign in</Link></p>
    </div></div></main>;
}
