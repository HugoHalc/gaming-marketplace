import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Gamepad2,
  Layers3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/features/catalog/components/service-card";
import {
  findCatalogGameBySlug,
  listCatalogGames,
} from "@/features/catalog/data/catalog-repository";
import { gameDetailContent } from "@/features/catalog/data/game-detail-content";
import { gameThemes } from "@/features/catalog/data/game-theme";

interface GamePageProps {
  params: Promise<{ game: string }>;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export async function generateStaticParams() {
  const games = await listCatalogGames();
  return games.map((game) => ({ game: game.slug }));
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { game: slug } = await params;
  const game = await findCatalogGameBySlug(slug);

  if (!game) {
    return { title: "Game not found" };
  }

  return {
    title: game.name,
    description: `Explore ${game.name} services, compare starting prices, and choose the service model that matches your competitive goal.`,
    alternates: {
      canonical: `/games/${game.slug}`,
    },
  };
}

export default async function GamePage({ params }: GamePageProps) {
  const { game: slug } = await params;
  const game = await findCatalogGameBySlug(slug);

  if (!game) {
    notFound();
  }

  const content = gameDetailContent[game.slug];
  if (!content) {
    notFound();
  }

  const theme = gameThemes[content.accent];
  const relatedGames = (await listCatalogGames()).filter((item) => item.id !== game.id).slice(0, 3);
  const serviceCategories = new Set(game.services.map((service) => service.category)).size;

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
        <div className="hero-grid absolute inset-0 -z-20 opacity-30" />
        <div
          className={`absolute left-[65%] top-[-14rem] -z-10 h-[34rem] w-[44rem] rounded-full ${theme.softGlow} blur-[120px]`}
        />
        <Container className="py-12 sm:py-16 lg:py-20">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/games" className="transition-colors hover:text-white">Games</Link>
            <span aria-hidden="true">/</span>
            <span className="text-white">{game.name}</span>
          </div>

          <div className="mt-9 grid gap-10 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
            <div>
              <Badge className={`${theme.border} ${theme.surface} ${theme.text}`}>
                <Sparkles className="mr-2 size-3.5" />
                {content.eyebrow}
              </Badge>
              <h1 className="mt-5 max-w-4xl text-balance text-4xl font-bold leading-[1.02] tracking-[-0.055em] text-white sm:text-5xl lg:text-6xl">
                Competitive services for {game.name}.
              </h1>
              <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-[var(--muted-foreground)] sm:text-lg sm:leading-8">
                {content.heroDescription}
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-xs font-medium text-white/75">
                  {content.categoryLabel}
                </span>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-xs font-medium text-white/75">
                  {content.fulfillmentLabel}
                </span>
                <span className="rounded-full border border-emerald-300/15 bg-emerald-400/[0.06] px-3 py-1.5 text-xs font-medium text-emerald-300">
                  Services available
                </span>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="#services">
                    Browse services
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/games">
                    <ArrowLeft className="mr-2 size-4" />
                    All games
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className={`absolute inset-10 -z-10 rounded-full ${theme.softGlow} blur-3xl`} />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.09] bg-[#0d0e18]/90 p-6 shadow-[0_28px_90px_-45px_rgba(0,0,0,.95)] sm:p-7">
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.glow}`} />
                <div className="relative">
                  <div className="flex items-center justify-between gap-4">
                    <span className={`grid size-14 place-items-center rounded-2xl border ${theme.icon}`}>
                      <Gamepad2 className="size-6" />
                    </span>
                    <Badge className="border-emerald-300/15 bg-emerald-400/[0.06] text-emerald-300">
                      Available now
                    </Badge>
                  </div>

                  <p className="mt-9 text-sm font-medium text-white/50">{game.name} catalog</p>
                  <p className="mt-2 text-3xl font-bold tracking-[-0.045em] text-white">
                    {game.services.length} services
                  </p>

                  <div className="mt-7 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                      <p className="text-xs text-[var(--muted-foreground)]">Starting from</p>
                      <p className="mt-1 text-lg font-bold text-white">
                        {game.startingPrice === null ? "—" : formatPrice(game.startingPrice)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                      <p className="text-xs text-[var(--muted-foreground)]">Service types</p>
                      <p className="mt-1 text-lg font-bold text-white">{serviceCategories}</p>
                    </div>
                  </div>

                  <div className="mt-7 space-y-3 border-t border-white/[0.07] pt-6">
                    {content.trustPoints.map((point) => (
                      <div key={point} className="flex items-center gap-3 text-sm text-white/75">
                        <CheckCircle2 className={`size-4 shrink-0 ${theme.text}`} />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="services" className="scroll-mt-20 py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className={`text-sm font-semibold ${theme.text}`}>Available services</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.045em] text-white sm:text-4xl">
                {content.serviceIntro}
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--muted-foreground)] sm:text-right">
              Starting prices are shown before game-specific options and modifiers are applied in configuration.
            </p>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {game.services.map((service) => (
              <ServiceCard key={service.id} service={service} gameSlug={game.slug} />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/[0.06] bg-white/[0.012] py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-start">
            <div className="max-w-xl">
              <p className={`text-sm font-semibold ${theme.text}`}>Designed around the game</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em] text-white sm:text-4xl">
                A storefront that explains the choice before checkout.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                Each game can present its own competitive context while still using the same catalog, pricing, and order architecture underneath.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {content.highlights.map((item, index) => {
                const icons = [Layers3, ShieldCheck, Clock3] as const;
                const Icon = icons[index] ?? Layers3;
                return (
                  <div key={item.title} className="rounded-2xl border border-white/[0.08] bg-black/15 p-5 sm:p-6">
                    <span className={`grid size-10 place-items-center rounded-xl border ${theme.icon}`}>
                      <Icon className="size-4" />
                    </span>
                    <h3 className="mt-5 text-sm font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="mb-7 flex items-end justify-between gap-5">
            <div>
              <p className="text-sm font-semibold text-violet-300">Explore more</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-white sm:text-3xl">
                Other supported games
              </h2>
            </div>
            <Link href="/games" className="hidden items-center text-sm font-semibold text-violet-200 transition-colors hover:text-white sm:inline-flex">
              View all games
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {relatedGames.map((related) => {
              const relatedTheme = gameThemes[related.accent];
              return (
                <Link
                  key={related.id}
                  href={`/games/${related.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[var(--surface)] p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/[0.14]"
                >
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${relatedTheme.glow}`} />
                  <div className="relative">
                    <span className={`grid size-10 place-items-center rounded-xl border ${relatedTheme.icon}`}>
                      <Gamepad2 className="size-4" />
                    </span>
                    <h3 className="mt-6 text-lg font-semibold text-white">{related.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted-foreground)]">
                      {related.shortDescription}
                    </p>
                    <span className="mt-6 inline-flex items-center text-sm font-semibold text-white/75 transition-colors group-hover:text-white">
                      Explore services
                      <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
