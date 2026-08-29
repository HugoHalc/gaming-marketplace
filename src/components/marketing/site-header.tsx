import Link from "next/link";
import { Bell } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { getCurrentIdentity } from "@/features/auth/server/auth";
import { getUnreadNotificationCount } from "@/features/notifications/server/notification-repository";

export async function SiteHeader() {
  const identity = await getCurrentIdentity();
  const unread = identity ? await getUnreadNotificationCount() : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-[#FFFFFF14] bg-[#050807]/90 backdrop-blur-xl supports-[backdrop-filter]:bg-[#050807]/82">
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-18">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {siteConfig.navigation.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-[#A0AAA4] transition-colors hover:text-[#82F5A4] focus-visible:outline-none focus-visible:text-[#82F5A4]">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {identity ? (
            <Link
              href="/dashboard/notifications"
              className="relative grid size-9 place-items-center rounded-lg text-[#A0AAA4] transition hover:bg-[#131B17] hover:text-[#82F5A4]"
              aria-label={unread ? `${unread} unread notifications` : "Notifications"}
            >
              <Bell className="size-4"/>
              {unread > 0 ? (
                <span className="absolute right-0.5 top-0.5 min-w-4 rounded-full bg-[#39E56F] px-1 text-center text-[9px] font-bold leading-4 text-[#050807]">
                  {unread > 9 ? "9+" : unread}
                </span>
              ) : null}
            </Link>
          ) : null}
          <Button asChild variant="ghost" size="sm" className="hidden text-[#A0AAA4] hover:bg-[#131B17] hover:text-[#F4F7F5] sm:inline-flex">
            <Link href={identity ? "/dashboard" : "/login"}>{identity ? "Dashboard" : "Sign in"}</Link>
          </Button>
          <Button asChild size="sm" className="bg-[#39E56F] text-[#050807] hover:bg-[#20C95A] hover:text-[#050807]">
            <Link href="/games">Explore games</Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}
