import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";

const marketplaceLinks = [
  { label: "Games", href: "/games" },
  { label: "Rocket League Boosters", href: "/boosters/rocket-league" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
] as const;

const legalLinks = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Refund Policy", href: "/refunds" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-[#FFFFFF14] bg-[#050807] py-10 sm:py-12">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.15fr_.7fr_.7fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#A0AAA4]">
              Premium gaming services with transparent configuration, secure checkout, and clear order progress.
            </p>
            <p className="mt-4 text-xs text-[#667069]">
              Jalisco, Mexico · boostingpedia@gmail.com
            </p>
          </div>

          <div>
            <p className="font-gaming-label text-[10px] uppercase tracking-[0.14em] text-[#667069]">
              Marketplace
            </p>
            <nav className="mt-4 space-y-3" aria-label="Marketplace footer navigation">
              {marketplaceLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-sm text-[#A0AAA4] transition-colors hover:text-[#F4F7F5]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="font-gaming-label text-[10px] uppercase tracking-[0.14em] text-[#667069]">
              Legal
            </p>
            <nav className="mt-4 space-y-3" aria-label="Legal footer navigation">
              {legalLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-sm text-[#A0AAA4] transition-colors hover:text-[#F4F7F5]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[#FFFFFF14] pt-6 text-xs text-[#667069] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 BoostingPedia. All rights reserved.</p>
          <p>Independent marketplace. Not affiliated with game publishers.</p>
        </div>
      </Container>
    </footer>
  );
}
