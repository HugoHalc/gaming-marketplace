import Link from "next/link";
import { Bell } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { launchGames } from "@/features/catalog/data/launch-games";
import { getCurrentIdentity } from "@/features/auth/server/auth";
import { getUnreadNotificationCount } from "@/features/notifications/server/notification-repository";
import { AccountDrawer } from "./account-drawer";
import { DesktopGamesMenu } from "./desktop-games-menu";
import { MobileSiteMenu } from "./mobile-site-menu";

function getAvatarInitials(identity: NonNullable<Awaited<ReturnType<typeof getCurrentIdentity>>>) {
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

const primaryLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Boosters", href: "/boosters" },
  { label: "FAQ", href: "/#faq" },
] as const;

export async function SiteHeader() {
  const identity = await getCurrentIdentity();
  const unread = identity ? await getUnreadNotificationCount() : 0;
  const initials = identity ? getAvatarInitials(identity) : null;

  return (
    <header className="sticky top-0 z-50 border-b border-[#FFFFFF14] bg-[#050807]/94 backdrop-blur-xl supports-[backdrop-filter]:bg-[#050807]/88">
      <Container>
        <div className="relative flex h-[3.9rem] items-center justify-between gap-3 sm:h-16 sm:gap-4">
          <div className="flex min-w-0 items-center">
            <Logo />
          </div>

          <nav
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 xl:flex"
            aria-label="Primary navigation"
          >
            <DesktopGamesMenu games={launchGames} />

            {primaryLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-2.5 py-2 text-sm font-medium text-[#A0AAA4] transition-[background-color,color] duration-150 hover:bg-white/[0.035] hover:text-[#F4F7F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39E56F]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050807]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {identity && initials ? (
              <>
                <Link
                  href="/dashboard/notifications"
                  className="relative hidden size-10 place-items-center rounded-full border border-[#FFFFFF14] bg-[#090D0B] text-[#A0AAA4] transition-[background-color,border-color,color] duration-200 hover:border-white/[0.16] hover:bg-[#131B17] hover:text-[#F4F7F5] sm:grid"
                  aria-label={unread ? `${unread} unread notifications` : "Notifications"}
                >
                  <Bell className="size-4" />
                  {unread > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-[#39E56F] px-1 text-center text-[9px] font-bold leading-4 text-[#050807]">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  ) : null}
                </Link>

                <div className="hidden items-center gap-2 sm:flex">
                  <AccountDrawer
                    displayName={
                      identity.profile?.gamer_tag ||
                      identity.profile?.full_name ||
                      "BoostingPedia account"
                    }
                    email={identity.email}
                    avatarUrl={identity.profile?.avatar_url ?? null}
                    initials={initials}
                    unread={unread}
                  />
                </div>
              </>
            ) : (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden rounded-xl bg-transparent text-[#A0AAA4] hover:bg-[#131B17] hover:text-[#F4F7F5] sm:inline-flex"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            )}

            <MobileSiteMenu signedIn={Boolean(identity)} games={launchGames} />
          </div>
        </div>
      </Container>
    </header>
  );
}
