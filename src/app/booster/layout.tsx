import type { ReactNode } from "react";
import { BoosterShell } from "@/components/booster/booster-shell";
import { requireBooster } from "@/features/auth/server/auth";
import { UserPresenceReporter } from "@/components/presence/user-presence-reporter";

export const dynamic = "force-dynamic";

export default async function BoosterLayout({ children }: { children: ReactNode }) {
  const identity = await requireBooster();
  const displayName =
    identity.profile?.gamer_tag ||
    identity.profile?.full_name ||
    "Booster";

  return (
    <>
      <UserPresenceReporter />
      <BoosterShell
        displayName={displayName}
        email={identity.email}
        avatarUrl={identity.profile?.avatar_url ?? null}
        payoutRateBps={identity.boosterProfile.payoutRateBps}
      >
        {children}
      </BoosterShell>
    </>
  );
}
