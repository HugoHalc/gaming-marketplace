import { requireUser } from "@/features/auth/server/auth";
import { ProfileAvatarPicker } from "@/components/profile/profile-avatar-picker";
import { updateProfileAction } from "./actions";

export const metadata = { title: "Profile | BoostingPedia" };
export const dynamic = "force-dynamic";

const avatarErrorCopy: Record<string, string> = {
  type: "Use a JPG, PNG or WebP image.",
  size: "Your image must be 5MB or smaller.",
  upload: "We could not upload your profile image. Please try again.",
  selection: "Choose an avatar or upload an image before saving.",
  save: "We could not save your avatar. Please try again.",
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{
    avatarSaved?: string;
    avatarError?: string;
    profileSaved?: string;
    profileError?: string;
  }>;
}) {
  const identity = await requireUser();
  const p = await searchParams;

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div>
        <p className="font-gaming-label text-[10px] uppercase tracking-[0.14em] text-blue-200/60">
          Account
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#F4F7F5] sm:text-3xl">
          Profile
        </h1>
        <p className="mt-2 text-sm text-[#A0AAA4]">
          Manage your identity, profile picture and account information.
        </p>
      </div>

      {p.avatarSaved ? (
        <p className="mt-5 rounded-xl border border-[#39E56F]/20 bg-[#39E56F]/[0.06] p-3 text-sm text-[#82F5A4]">
          Avatar updated.
        </p>
      ) : null}
      {p.avatarError ? (
        <p className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.05] p-3 text-sm text-red-300">
          {avatarErrorCopy[p.avatarError] ?? "We could not save your avatar."}
        </p>
      ) : null}
      {p.profileSaved ? (
        <p className="mt-5 rounded-xl border border-[#39E56F]/20 bg-[#39E56F]/[0.06] p-3 text-sm text-[#82F5A4]">
          Profile information updated.
        </p>
      ) : null}
      {p.profileError ? (
        <p className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.05] p-3 text-sm text-red-300">
          We could not save your profile information.
        </p>
      ) : null}

      <div className="mt-6 space-y-5">
        <ProfileAvatarPicker currentAvatarUrl={identity.profile?.avatar_url} />

        <form action={updateProfileAction}>
          <section className="rounded-[1.4rem] border border-white/[0.08] bg-[#0E1411] p-5 sm:p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm font-medium text-[#F4F7F5]">
                Email
                <input
                  value={identity.email}
                  disabled
                  className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 text-[#667069]"
                />
              </label>
              <label className="block text-sm font-medium text-[#F4F7F5]">
                Full name
                <input
                  name="fullName"
                  required
                  minLength={2}
                  defaultValue={identity.profile?.full_name ?? ""}
                  className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 text-[#F4F7F5] outline-none transition-colors focus:border-[#39E56F]/30"
                />
              </label>
              <label className="block text-sm font-medium text-[#F4F7F5]">
                Phone
                <input
                  name="phone"
                  defaultValue={identity.profile?.phone ?? ""}
                  className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 text-[#F4F7F5] outline-none transition-colors focus:border-[#39E56F]/30"
                />
              </label>
              <label className="block text-sm font-medium text-[#F4F7F5]">
                Gamer tag
                <input
                  name="gamerTag"
                  defaultValue={identity.profile?.gamer_tag ?? ""}
                  className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 text-[#F4F7F5] outline-none transition-colors focus:border-[#39E56F]/30"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.07] pt-5">
              <span className="rounded-full border border-white/[0.08] bg-[#090D0B] px-3 py-1 text-xs uppercase text-[#667069]">
                Role: {identity.profile?.role ?? "customer"}
              </span>
              <button className="rounded-xl bg-[#39E56F] px-5 py-2.5 text-sm font-semibold text-[#050807] transition-colors hover:bg-[#20C95A]">
                Save profile
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}
