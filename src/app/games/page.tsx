import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Layers3, Search, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CatalogBrowser } from "@/features/catalog/components/catalog-browser";
import { listCatalogGames } from "@/features/catalog/data/catalog-repository";

export const metadata: Metadata = {
  title: "Games",
  description:
    "Browse supported games and compare premium gaming services with transparent starting prices and flexible configurations.",
};

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string }>;
}) {
  const { game } = await searchParams;
  const games = await listCatalogGames();
  const totalServices = games.reduce((total, item) => total + item.services.length, 0);
  const serviceTypes = new Set(games.flatMap((item) => item.services.map((service) => service.category))).size;

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
        <div className="hero-grid absolute inset-0 -z-20 opacity-35" />
        <div className="absolute left-1/2 top-[-18rem] -z-10 h-[34rem] w-[62rem] -translate-x-1/2 rounded-full bg-violet-600/16 blur-[115px]" />
        <Container className="py-16 sm:py-20 lg:py-24">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <Link href="/" className="transition-colors hover:text-white">Home</Link>
                <span aria-hidden="true">/</span>
                <span className="text-white">Games</span>
              </div>
              <Badge className="mt-7 border-violet-300/20 bg-violet-400/[0.08] text-violet-200">
                <Sparkles className="mr-2 size-3.5" />
                Launch catalog
              </Badge>
              <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.02] tracking-[-0.055em] text-white sm:text-5xl lg:text-6xl">
                Find the right service for the game you play.
              </h1>
              <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-[var(--muted-foreground)] sm:text-lg sm:leading-8">
                Browse supported titles, compare available service types, and start from transparent pricing before configuring the details that matter.
              </p>
            </div>

            <div className="grid w-full max-w-xl grid-cols-3 gap-3 lg:w-auto lg:min-w-[30rem]">
              {[
                [String(games.length), "Games"],
                [String(totalServices), "Services"],
                [String(serviceTypes), "Service types"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/[0.08] bg-black/15 p-4 sm:p-5">
                  <p className="text-2xl font-bold tracking-[-0.04em] text-white">{value}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-violet-300">Browse catalog</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-white sm:text-3xl">
                Games and services available now
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--muted-foreground)] sm:text-right">
              Search by title or service, then narrow the catalog by the kind of help you are looking for.
            </p>
          </div>

          <CatalogBrowser games={games} initialGameSlug={game} />
        </Container>
      </section>

      <section className="border-y border-white/[0.06] bg-white/[0.012] py-16 sm:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-violet-300">Built for expansion</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em] text-white">
                One catalog structure, many service models.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted-foreground)]">
                The storefront is already structured so new games and service types can be added from data instead of requiring a custom page rewrite for every launch.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Search, title: "Easy discovery", text: "Search across titles and services instantly." },
                { icon: Layers3, title: "Flexible catalog", text: "Multiple service types can live under each game." },
                { icon: CheckCircle2, title: "Clear availability", text: "Only active catalog items are shown to customers." },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-white/[0.08] bg-black/15 p-5">
                  <span className="grid size-10 place-items-center rounded-xl border border-violet-300/15 bg-violet-400/[0.07] text-violet-300">
                    <Icon className="size-4" />
                  </span>
                  <h3 className="mt-5 text-sm font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="relative overflow-hidden rounded-[2rem] border border-violet-300/15 bg-gradient-to-br from-violet-500/[0.15] via-[#11121f] to-cyan-400/[0.05] p-8 sm:p-10 lg:p-12">
            <div className="absolute right-[-5rem] top-[-7rem] size-72 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="relative max-w-3xl">
              <Badge className="border-white/10 bg-white/[0.06] text-white/80">Game-specific storefronts</Badge>
              <h2 className="mt-5 text-3xl font-bold tracking-[-0.045em] text-white sm:text-4xl">
                Explore each title before choosing a service.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
                Every supported game now has a dedicated page with its available services, starting prices, and game-specific purchase context.
              </p>
              <Button asChild size="lg" className="mt-7">
                <Link href="#catalog">Choose a game <ArrowRight className="ml-2 size-4" /></Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
