import Link from "next/link";
import {
  Bell,
  ChevronDown,
  Crosshair,
  Grid2X2,
  Radio,
  LayoutDashboard,
  Menu,
  Package,
  UserRound,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { launchGames } from "@/features/catalog/data/launch-games";
import { getCurrentIdentity } from "@/features/auth/server/auth";
import { getUnreadNotificationCount } from "@/features/notifications/server/notification-repository";

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
        <div className="relative flex h-[3.9rem] items-center justify-between gap-4 sm:h-16">
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

          <div className="flex items-center gap-2">
            {identity ? (
              <>
                <Link
                  href="/dashboard/notifications"
                  className="relative grid size-10 place-items-center rounded-full border border-[#FFFFFF14] bg-[#090D0B] text-[#A0AAA4] transition-[background-color,border-color,color] duration-200 hover:border-white/[0.16] hover:bg-[#131B17] hover:text-[#F4F7F5]"
                  aria-label={unread ? `${unread} unread notifications` : "Notifications"}
                >
                  <Bell className="size-4" />
                  {unread > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-[#39E56F] px-1 text-center text-[9px] font-bold leading-4 text-[#050807]">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  ) : null}
                </Link>

                <div
                  className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-[#FFFFFF14] bg-[#131B17] text-xs font-bold text-[#F4F7F5]"
                  aria-label="Account avatar"
                  title={identity.profile?.gamer_tag || identity.profile?.full_name || identity.email}
                >
                  {identity.profile?.avatar_url ? (
                    <img
                      src={identity.profile.avatar_url}
                      alt=""
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    initials
                  )}
                </div>

                <details className="group relative">
                  <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-[#FFFFFF14] bg-[#131B17] px-3.5 py-2.5 text-sm font-semibold text-[#F4F7F5] transition-[background-color,border-color] duration-200 hover:border-white/[0.16] hover:bg-[#18211C] [&::-webkit-details-marker]:hidden">
                    <Menu className="size-4 text-[#A0AAA4]" strokeWidth={1.8} />
                    <span className="hidden sm:inline">Menu</span>
                    <ChevronDown className="size-3.5 text-[#667069] transition-transform duration-200 group-open:rotate-180" />
                  </summary>

                  <div className="absolute right-0 top-[calc(100%+0.65rem)] w-64 overflow-hidden rounded-2xl border border-[#FFFFFF14] bg-[#090D0B] p-2 shadow-[0_24px_60px_-28px_rgba(0,0,0,.95)]">
                    <div className="border-b border-white/[0.06] px-3 pb-3 pt-2">
                      <p className="truncate text-sm font-semibold text-[#F4F7F5]">
                        {identity.profile?.gamer_tag || identity.profile?.full_name || "BoostingPedia account"}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[#667069]">{identity.email}</p>
                    </div>

                    <nav className="mt-2 grid gap-1" aria-label="Account menu">
                      <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#A0AAA4] transition-colors duration-200 hover:bg-[#131B17] hover:text-[#F4F7F5]">
                        <LayoutDashboard className="size-4" />
                        Dashboard
                      </Link>
                      <Link href="/dashboard/orders" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#A0AAA4] transition-colors duration-200 hover:bg-[#131B17] hover:text-[#F4F7F5]">
                        <Package className="size-4" />
                        My Orders
                      </Link>
                      <Link href="/dashboard/profile" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#A0AAA4] transition-colors duration-200 hover:bg-[#131B17] hover:text-[#F4F7F5]">
                        <UserRound className="size-4" />
                        Profile
                      </Link>
                      <Link href="/dashboard/notifications" className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-[#A0AAA4] transition-colors duration-200 hover:bg-[#131B17] hover:text-[#F4F7F5]">
                        <span className="flex items-center gap-3">
                          <Bell className="size-4" />
                          Notifications
                        </span>
                        {unread > 0 ? (
                          <span className="rounded-full bg-[#39E56F]/[0.10] px-2 py-0.5 text-[10px] font-bold text-[#82F5A4]">
                            {unread > 9 ? "9+" : unread}
                          </span>
                        ) : null}
                      </Link>
                    </nav>
                  </div>
                </details>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden rounded-xl bg-transparent text-[#A0AAA4] hover:bg-[#131B17] hover:text-[#F4F7F5] sm:inline-flex">
                  <Link href="/login">Sign in</Link>
                </Button>
              </>
            )}
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
