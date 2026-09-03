import Link from "next/link";
import {
  Bell,
  Crosshair,
  Grid2X2,
  Radio,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { launchGames } from "@/features/catalog/data/launch-games";
import { getCurrentIdentity } from "@/features/auth/server/auth";
import { getUnreadNotificationCount } from "@/features/notifications/server/notification-repository";
import { AccountDrawer } from "./account-drawer";
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

export async function SiteHeader() {
  const identity = await getCurrentIdentity();
  const unread = identity ? await getUnreadNotificationCount() : 0;
  const initials = identity ? getAvatarInitials(identity) : null;

  return (
    <header className="sticky top-0 z-50 border-b border-[#FFFFFF14] bg-[#050807]/94 backdrop-blur-xl supports-[backdrop-filter]:bg-[#050807]/88">
      <Container>
        <div className="relative flex h-[3.9rem] items-center justify-between gap-3 sm:h-16 sm:gap-4">
          <div className="flex min-w-0 items-center gap-7">
            <Logo />

            <div className="hidden items-center gap-4 lg:flex">
              <Link
                href="/games"
                className="group inline-flex h-10 items-center gap-2.5 rounded-xl border border-[#FFFFFF14] bg-[#131B17] px-3.5 text-sm font-semibold text-[#F4F7F5] shadow-[inset_0_1px_0_rgba(255,255,255,.025)] transition-[background-color,border-color,color] duration-200 hover:border-white/[0.16] hover:bg-[#18211C]"
              >
                <span className="grid size-7 place-items-center rounded-full border border-white/[0.08] bg-[#090D0B] text-[#A0AAA4] transition-colors duration-200 group-hover:text-[#F4F7F5]">
                  <Crosshair className="size-3.5" />
                </span>
                <span>Select your game</span>
              </Link>

              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-full border border-[#FFFFFF14] bg-[#090D0B] text-[#A0AAA4]">
                  <Radio className="size-4" />
                </span>
                <div className="leading-none">
                  <p className="font-gaming-value text-sm text-[#F4F7F5]">37</p>
                  <p className="mt-1 text-[10px] font-medium text-[#667069]">Online Boosters</p>
                </div>
              </div>
            </div>
          </div>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 xl:flex" aria-label="Primary navigation">
            {siteConfig.navigation
              .filter((item) => item.label === "How it works" || item.label === "FAQ")
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-[#A0AAA4] transition-colors duration-200 hover:text-[#F4F7F5] focus-visible:outline-none focus-visible:text-[#F4F7F5]"
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

                <div className="hidden sm:block">
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
              <Button asChild variant="ghost" size="sm" className="hidden rounded-xl bg-transparent text-[#A0AAA4] hover:bg-[#131B17] hover:text-[#F4F7F5] sm:inline-flex">
                <Link href="/login">Sign in</Link>
              </Button>
            )}

            <MobileSiteMenu signedIn={Boolean(identity)} />
          </div>
        </div>

        <div className="hidden border-t border-white/[0.05] lg:block">
          <div className="flex h-[2.7rem] items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {launchGames.map((game) =>
              game.ready ? (
                <Link
                  key={game.slug}
                  href={`/games/${game.slug}`}
                  className="inline-flex h-8 shrink-0 items-center gap-2 rounded-lg border border-[#39E56F]/25 bg-[#39E56F]/[0.045] px-3 text-xs font-semibold text-[#F4F7F5] transition-[background-color,border-color,color] duration-200 hover:border-[#39E56F]/30 hover:bg-[#39E56F]/[0.06]"
                >
                  <span className="size-1.5 rounded-full bg-[#39E56F]" />
                  {game.displayName}
                </Link>
              ) : (
                <span
                  key={game.slug}
                  className="inline-flex h-8 shrink-0 cursor-default items-center rounded-lg border border-[#FFFFFF14] bg-[#090D0B] px-3 text-xs font-medium text-[#667069]"
                  title="In development"
                >
                  {game.displayName}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="flex h-10 items-center gap-2 overflow-x-auto border-t border-white/[0.05] lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href="/games"
            className="inline-flex h-8 shrink-0 items-center gap-2 rounded-lg border border-[#FFFFFF14] bg-[#131B17] px-3 text-xs font-semibold text-[#F4F7F5]"
          >
            <Grid2X2 className="size-3.5 text-[#A0AAA4]" />
            Games
          </Link>

          {launchGames.slice(0, 4).map((game) =>
            game.ready ? (
              <Link
                key={game.slug}
                href={`/games/${game.slug}`}
                className="inline-flex h-8 shrink-0 items-center gap-2 rounded-lg border border-[#39E56F]/25 bg-[#39E56F]/[0.045] px-3 text-xs font-semibold text-[#F4F7F5]"
              >
                <span className="size-1.5 rounded-full bg-[#39E56F]" />
                {game.displayName}
              </Link>
            ) : (
              <span
                key={game.slug}
                className="inline-flex h-8 shrink-0 items-center rounded-lg border border-[#FFFFFF14] bg-[#090D0B] px-3 text-xs text-[#667069]"
              >
                {game.displayName}
              </span>
            ),
          )}
        </div>
      </Container>
    </header>
  );
}
