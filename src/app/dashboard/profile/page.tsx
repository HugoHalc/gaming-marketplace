import Link from "next/link";
import { requireUser } from "@/features/auth/server/auth";
import { SiteHeader } from "@/components/marketing/site-header";
import { Container } from "@/components/layout/container";
import { ProfileAvatarPicker } from "@/components/profile/profile-avatar-picker";
import { updateProfileAction } from "./actions";

export const metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const identity = await requireUser();
  const p = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="py-10 sm:py-12">
        <Container className="max-w-[1180px]">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-[#A0AAA4] transition-colors hover:text-[#F4F7F5]"
          >
            ← Back to dashboard
          </Link>

          <div className="mt-5">
            <p className="font-gaming-label text-[10px] uppercase tracking-[0.14em] text-[#A0AAA4]">
              Account
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-[-0.05em] text-[#F4F7F5]">Profile</h1>
            <p className="mt-2 text-sm text-[#A0AAA4]">
              Manage your identity, profile picture and account information.
            </p>
          </div>

          {p.saved ? (
            <p className="mt-5 rounded-xl border border-[#39E56F]/20 bg-[#39E56F]/[0.06] p-3 text-sm text-[#82F5A4]">
              Profile updated.
            </p>
          ) : null}
          {p.error ? (
            <p className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.05] p-3 text-sm text-red-300">
              We could not save your changes.
            </p>
          ) : null}

          <form action={updateProfileAction} encType="multipart/form-data" className="mt-8 space-y-6">
            <ProfileAvatarPicker currentAvatarUrl={identity.profile?.avatar_url} />

            <section className="rounded-[1.5rem] border border-[#FFFFFF14] bg-[#0E1411] p-6 sm:p-7">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-medium text-[#F4F7F5]">
                  Email
                  <input
                    value={identity.email}
                    disabled
                    className="mt-2 h-11 w-full rounded-xl border border-[#FFFFFF14] bg-[#090D0B] px-3 text-[#667069]"
                  />
                </label>

                <label className="block text-sm font-medium text-[#F4F7F5]">
                  Full name
                  <input
                    name="fullName"
                    required
                    minLength={2}
                    defaultValue={identity.profile?.full_name ?? ""}
                    className="mt-2 h-11 w-full rounded-xl border border-[#FFFFFF14] bg-[#090D0B] px-3 text-[#F4F7F5] outline-none transition-colors focus:border-[#39E56F]/30"
                  />
                </label>

                <label className="block text-sm font-medium text-[#F4F7F5]">
                  Phone
                  <input
                    name="phone"
                    defaultValue={identity.profile?.phone ?? ""}
                    className="mt-2 h-11 w-full rounded-xl border border-[#FFFFFF14] bg-[#090D0B] px-3 text-[#F4F7F5] outline-none transition-colors focus:border-[#39E56F]/30"
                  />
                </label>

                <label className="block text-sm font-medium text-[#F4F7F5]">
                  Gamer tag
                  <input
                    name="gamerTag"
                    defaultValue={identity.profile?.gamer_tag ?? ""}
                    className="mt-2 h-11 w-full rounded-xl border border-[#FFFFFF14] bg-[#090D0B] px-3 text-[#F4F7F5] outline-none transition-colors focus:border-[#39E56F]/30"
                  />
                </label>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#FFFFFF14] pt-5">
                <span className="rounded-full border border-[#FFFFFF14] bg-[#090D0B] px-3 py-1 text-xs uppercase text-[#667069]">
                  Role: {identity.profile?.role ?? "customer"}
                </span>

                <button className="rounded-xl bg-[#39E56F] px-5 py-2.5 text-sm font-semibold text-[#050807] shadow-[0_10px_30px_-18px_rgba(57,229,111,.65)] transition-colors hover:bg-[#20C95A]">
                  Save profile
                </button>
              </div>
            </section>
          </form>
        </Container>
      </main>
    </>
  );
}
