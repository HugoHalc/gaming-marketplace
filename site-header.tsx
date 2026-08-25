import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { getCurrentIdentity } from "@/features/auth/server/auth";

export async function SiteHeader() {
  const identity = await getCurrentIdentity();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#070810]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#070810]/68">
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-18">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {siteConfig.navigation.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href={identity ? "/dashboard" : "/login"}>{identity ? "Dashboard" : "Sign in"}</Link>
          </Button>
          <Button asChild size="sm"><Link href="/games">Explore games</Link></Button>
        </div>
      </Container>
    </header>
  );
}
