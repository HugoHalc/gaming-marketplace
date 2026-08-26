import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";

const footerLinks = [
  { label: "Games", href: "/games" },
  { label: "Popular services", href: "/#popular-services" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-green-400/[0.08] bg-black/25 py-10 sm:py-12">
      <Container>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logo />
            <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--muted-foreground)]">
              Premium gaming services with transparent configuration, secure checkout, and clear order progress.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Footer navigation">
            {footerLinks.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-green-300">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-9 flex flex-col gap-3 border-t border-white/[0.06] pt-6 text-xs text-[var(--muted-foreground)] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 BoostingPedia. All rights reserved.</p>
          <p>Independent marketplace. Not affiliated with game publishers.</p>
        </div>
      </Container>
    </footer>
  );
}
