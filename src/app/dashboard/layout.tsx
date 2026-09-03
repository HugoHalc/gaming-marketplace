import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/features/auth/server/auth";
import { getUnreadNotificationCount } from "@/features/notifications/server/notification-repository";
import { createAuthServerClient } from "@/lib/supabase/auth";
import { UserPresenceReporter } from "@/components/presence/user-presence-reporter";

function getAvatarInitials(identity: Awaited<ReturnType<typeof requireUser>>) {
  const source =
    identity.profile?.gamer_tag?.trim() ||
    identity.profile?.full_name?.trim() ||
    identity.email.trim() ||
    "BP";

  const words = source.split(/[\s@._-]+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await requireUser();
  const supabase = await createAuthServerClient();

  const [{ data: boosterProfile }, unreadNotifications] = await Promise.all([
    supabase
      .from("booster_profiles")
      .select("user_id")
      .eq("user_id", identity.id)
      .eq("is_active", true)
      .maybeSingle(),
    getUnreadNotificationCount(),
  ]);

  return (
    <>
      <UserPresenceReporter />
      <DashboardShell
        displayName={
        identity.profile?.gamer_tag ||
        identity.profile?.full_name ||
        "BoostingPedia account"
      }
        email={identity.email}
        avatarUrl={identity.profile?.avatar_url ?? null}
        initials={getAvatarInitials(identity)}
        unreadNotifications={unreadNotifications}
        canAccessBooster={Boolean(boosterProfile)}
        canAccessAdmin={identity.profile?.role === "admin"}
      >
        {children}
      </DashboardShell>
    </>
  );
}
