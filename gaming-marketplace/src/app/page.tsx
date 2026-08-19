import Link from "next/link";
import { ArrowRight, Check, Gauge, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { mockGames } from "@/features/catalog/data/mock-catalog";

const foundations = [
  { icon: ShieldCheck, title: "Server-authoritative pricing", body: "The browser can preview prices, but only the server will authorize the final amount." },
  { icon: Gauge, title: "Performance by default", body: "Server Components first, minimal client JavaScript, optimized assets, and clean route boundaries." },
  { icon: Sparkles, title: "Premium design language", body: "Dark surfaces, deliberate contrast, restrained gradients, and accessible interactive states." },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <header className="border-b border-white/[0.06] bg-[#070810]/75 backdrop-blur-xl">
        <Container className="flex h-18 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
            {siteConfig.navigation.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex"><Link href="/login">Sign in</Link></Button>
            <Button asChild size="sm"><Link href="/register">Create account</Link></Button>
          </div>
        </Container>
      </header>

      <section className="relative py-24 sm:py-32">
        <Container>
          <div className="max-w-3xl">
            <Badge className="mb-6 border-violet-400/20 bg-violet-400/[0.08] text-violet-200">Phase 1 · Product foundation</Badge>
            <h1 className="text-balance text-5xl font-bold tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
              A premium foundation for competitive gaming services.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-[var(--muted-foreground)] sm:text-xl">
              VantaBoost is the temporary product identity for a scalable marketplace built around transparent configuration, secure checkout, and clear order progress.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg"><Link href="/games">Explore games <ArrowRight className="ml-2 size-4" /></Link></Button>
              <Button variant="secondary" size="lg">View design system</Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-16 sm:pb-24">
        <Container>
          <div className="grid gap-4 md:grid-cols-3">
            {foundations.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="p-6 transition-transform duration-300 hover:-translate-y-1">
                <div className="mb-5 grid size-10 place-items-center rounded-xl border border-violet-300/15 bg-violet-400/[0.08] text-violet-300"><Icon className="size-5" /></div>
                <h2 className="text-base font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/[0.06] bg-white/[0.015] py-16">
        <Container>
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-violet-300">Catalog model preview</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">Games remain data-driven.</h2>
            </div>
            <Badge>Mock data only</Badge>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {mockGames.map((game) => (
              <Card key={game.id} className="group p-5">
                <div className="mb-8 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Game</span>
                  <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,.55)]" />
                </div>
                <h3 className="text-xl font-semibold text-white">{game.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-[var(--muted-foreground)]">{game.shortDescription}</p>
                <div className="mt-5 flex items-center text-sm font-semibold text-violet-300">View services <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1" /></div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <Card className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <Badge className="mb-4">Design principles</Badge>
              <h2 className="text-2xl font-bold text-white">Built to become a product, not a disposable prototype.</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {["English-only product copy", "Strict TypeScript", "Accessible interaction states", "Data-driven catalog domain"].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-[var(--muted-foreground)]"><Check className="size-4 text-emerald-400" />{item}</div>
                ))}
              </div>
            </div>
            <Button variant="secondary">Foundation ready</Button>
          </Card>
        </Container>
      </section>
    </main>
  );
}
