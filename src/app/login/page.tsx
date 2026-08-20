import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { loginAction } from "./actions";
import { getCurrentIdentity } from "@/features/auth/server/auth";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const identity = await getCurrentIdentity();
  if (identity) redirect("/dashboard");
  const params = await searchParams;
  const message = params.error === "credentials" ? "Email or password is incorrect." : params.error ? "Please check your details and try again." : null;

  return <main className="min-h-screen px-4 py-10 sm:py-16">
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 flex justify-center"><Logo /></div>
      <div className="rounded-3xl border border-white/10 bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
        <p className="text-sm font-semibold text-violet-300">WELCOME BACK</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Sign in to your account</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">Access your orders, profile and service history.</p>
        {message && <p className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{message}</p>}
        <form action={loginAction} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
          <label className="block text-sm font-medium">Email<input name="email" type="email" autoComplete="email" required className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 outline-none focus:border-violet-400" /></label>
          <label className="block text-sm font-medium">Password<input name="password" type="password" autoComplete="current-password" required minLength={8} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 outline-none focus:border-violet-400" /></label>
          <button className="h-11 w-full rounded-xl bg-[var(--primary)] text-sm font-semibold text-white hover:brightness-110">Sign in</button>
        </form>
        <div className="mt-5 flex items-center justify-between gap-4 text-sm text-[var(--muted-foreground)]"><Link href="/forgot-password" className="hover:text-white">Forgot password?</Link><Link href="/register" className="hover:text-white">Create account</Link></div>
      </div>
    </div>
  </main>;
}
