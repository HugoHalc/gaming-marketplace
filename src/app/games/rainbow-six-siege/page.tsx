import { overviewServiceGridClassName, overviewServiceCardLayoutClassName, overviewServicePreviewLayoutClassName } from "@/features/catalog/components/overview-service-card-layout";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Layers3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RainbowSixSiegeRankBadge } from "@/features/catalog/components/rainbow-six-siege-rank-badge";
import { OverviewServiceCardAction } from "@/features/catalog/components/overview-service-card-action";
import { StructuredData } from "@/components/seo/structured-data";
import {
  rainbowSixSiegeGameFoundation,
  rainbowSixSiegeServiceFoundations,
  type RainbowSixSiegeServiceSlug,
} from "@/features/catalog/data/rainbow-six-siege-foundation";
import { createPublicMetadata, gameBreadcrumbs } from "@/lib/seo";

export const metadata: Metadata = {
  ...createPublicMetadata({
    title: "Rainbow Six Siege Boosting Services",
    description: rainbowSixSiegeGameFoundation.shortDescription,
    path: `/games/${rainbowSixSiegeGameFoundation.slug}`,
    image: rainbowSixSiegeGameFoundation.assets.overviewHero,
  }),
  title: { absolute: "Rainbow Six Siege Boosting Services | BoostingPedia" },
};

const servicePresentation: Record<
  RainbowSixSiegeServiceSlug,
  { eyebrow: string }
> = {
  "rank-boost": { eyebrow: "RANK PROGRESSION" },
  "competitive-wins": { eyebrow: "COMPETITIVE WINS" },
  "placements-boost": { eyebrow: "PLACEMENTS" },
  "unrated-matches": { eyebrow: "UNRATED MATCHES" },
};

function SiegeServicePreview({ slug }: { slug: RainbowSixSiegeServiceSlug }) {
  const base = `${overviewServicePreviewLayoutClassName} border border-white/[0.07] bg-black/20 transition-colors group-hover:border-emerald-300/[0.15]`;

  if (slug === "rank-boost") {
    return (
      <div className={`${base} justify-between gap-3`} aria-label="Illustrative rank progression">
        <span className="flex min-w-0 flex-col items-center gap-0.5 text-center">
          <RainbowSixSiegeRankBadge rank="gold-v" size={40} />
          <span className="text-[10px] text-white/55">Example<br /><strong className="text-xs text-white/80">Gold</strong></span>
        </span>
        <ArrowRight className="size-4 shrink-0 text-emerald-200/55" aria-hidden="true" />
        <span className="flex min-w-0 flex-col items-center gap-0.5 text-center">
          <RainbowSixSiegeRankBadge rank="diamond-v" size={40} />
          <span className="text-[10px] text-white/55">Illustrative target<br /><strong className="text-xs text-white/80">Diamond</strong></span>
        </span>
      </div>
    );
  }

  if (slug === "competitive-wins") {
    return (
      <div className={`${base} gap-3`} aria-label="Fixed competitive wins preview">
        <RainbowSixSiegeRankBadge rank="silver-v" size={40} />
        <span className="min-w-0">
          <span className="block text-xs font-semibold text-white/80">Fixed competitive wins</span>
          <span className="mt-2 flex gap-1.5" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((win) => <span key={win} className={`grid size-5 place-items-center rounded border text-[9px] font-bold ${win <= 3 ? "border-emerald-300/30 bg-emerald-400/[0.12] text-emerald-200" : "border-white/[0.12] text-white/25"}`}>{win <= 3 ? "✓" : "·"}</span>)}
          </span>
          <span className="mt-1 block text-[9px] text-white/35">Choose 1–5 wins</span>
        </span>
      </div>
    );
  }

  if (slug === "placements-boost") {
    return (
      <div className={`${base} gap-3`} aria-label="Previous season rank and placement matches preview">
        <RainbowSixSiegeRankBadge rank="gold" size={40} />
        <span className="min-w-0">
          <span className="block text-xs font-semibold text-white/80">Previous season rank</span>
          <span className="mt-1 block text-[10px] text-white/55">Placement matches <span aria-hidden="true" className="text-emerald-200/70">● ● ● ● ●</span></span>
          <span className="mt-1 block text-[9px] text-white/35">Result depends on placement matches</span>
        </span>
      </div>
    );
  }

  return (
    <div className={`${base} gap-3`} aria-label="Unrated match count preview">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/[0.12] bg-white/[0.035] text-xs font-bold tracking-[0.1em] text-white/65">NR</span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-white/80">Unranked play</span>
        <span className="mt-2 flex gap-1.5" aria-hidden="true">{[1, 2, 3, 4].map((game) => <span key={game} className="h-2 w-7 rounded-full bg-white/20" />)}</span>
        <span className="mt-2 block text-[9px] text-white/40">Choose 1–10 matches</span>
      </span>
    </div>
  );
}

const overviewHighlights = [
  {
    title: "Ranked progression",
    description:
      "Choose your current rank and target rank across the competitive Siege ladder.",
    icon: ShieldCheck,
  },
  {
    title: "Focused service options",
    description:
      "Choose rank progression, competitive wins, placements or unrated play.",
    icon: Layers3,
  },
  {
    title: "Transparent configuration",
    description:
      "See how your selections affect the final price before checkout.",
    icon: Sparkles,
  },
] as const;

const breadcrumbJsonLd = gameBreadcrumbs(
  rainbowSixSiegeGameFoundation.name,
  rainbowSixSiegeGameFoundation.slug,
);

export default function RainbowSixSiegeOverviewPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <StructuredData data={breadcrumbJsonLd} />
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/[0.06] bg-[#050807]">
        <div className="hero-grid absolute inset-0 -z-30 opacity-20" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 -z-20 w-full overflow-hidden sm:w-[84%] md:w-[76%] lg:w-[68%] xl:w-[64%]"
        >
          <Image
            src={rainbowSixSiegeGameFoundation.assets.overviewHero}
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 64vw, (min-width: 1024px) 68vw, (min-width: 768px) 76vw, (min-width: 640px) 84vw, 100vw"
            className="object-cover object-[78%_50%] opacity-38 sm:object-[76%_50%] sm:opacity-56 md:object-[74%_50%] md:opacity-72 lg:object-[72%_50%] lg:opacity-90 xl:opacity-100"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#050807_0%,rgba(5,8,7,.97)_18%,rgba(5,8,7,.82)_36%,rgba(5,8,7,.40)_58%,rgba(5,8,7,.10)_78%,transparent_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050807] via-[#050807]/35 to-transparent" />
        </div>

        <Container className="relative py-12 sm:py-16 lg:min-h-[31rem] lg:py-20">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Link href="/" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39E56F]/35">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/games" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39E56F]/35">
              Games
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-white">{rainbowSixSiegeGameFoundation.name}</span>
          </div>

          <div className="mt-12 max-w-3xl">
            <Badge className="border-emerald-300/[0.16] bg-emerald-400/[0.045] text-emerald-100/80">
              <Sparkles className="mr-2 size-3.5" aria-hidden="true" />
              Rainbow Six Siege services
            </Badge>
            <h1 className="mt-5 text-balance text-5xl font-bold leading-[0.96] tracking-[-0.065em] text-white sm:text-6xl lg:text-7xl">
              Rainbow Six Siege
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
              {rainbowSixSiegeGameFoundation.shortDescription}
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/65">
                {rainbowSixSiegeGameFoundation.categoryLabel}
              </span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/65">
                {rainbowSixSiegeGameFoundation.rankedSystemLabel}
              </span>
              <span className="rounded-full border border-emerald-300/[0.14] bg-emerald-400/[0.035] px-3 py-1.5 text-xs font-medium text-emerald-100/75">
                4 services available
              </span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="#services">
                  View services
                  <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/games">
                  <ArrowLeft className="mr-2 size-4" aria-hidden="true" />
                  All games
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section id="services" className="scroll-mt-20 py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-emerald-200/75">Boosting services</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">
                Rainbow Six Siege services.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--muted-foreground)] lg:text-right">
              Choose the Siege service that matches your goal. Configure ranked progression or unrated matches with a clear price before checkout.
            </p>
          </div>

          <p className="mt-7 text-[11px] font-medium tracking-[0.01em] text-white/45 md:hidden">Swipe to explore 4 services</p>
          <div className={`${overviewServiceGridClassName} mt-3 md:mt-9`}>
            {rainbowSixSiegeServiceFoundations.map((service) => {
              const presentation = servicePresentation[service.slug];

              const card = (
                <>
                  <p className="font-gaming-label text-[10px] uppercase tracking-[0.13em] text-emerald-200/65">{presentation.eyebrow}</p>

                  <div className="mt-2">
                    <h3 id={`siege-service-${service.slug}`} className="text-xl font-semibold tracking-[-0.03em] text-white sm:text-2xl">
                      {service.name}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                      {service.description}
                    </p>
                  </div>

                  <SiegeServicePreview slug={service.slug} />

                  {service.status === "active" ? (
                    <OverviewServiceCardAction label={`Configure ${service.name}`} />
                  ) : <div className="mt-auto pt-5 text-xs text-white/50">Coming soon</div>}
                </>
              );

              return service.status === "active" ? (
                <Link
                  key={service.id}
                  href={service.route}
                  aria-labelledby={`siege-service-${service.slug}`}
                  className={`group ${overviewServiceCardLayoutClassName} border border-white/[0.08] bg-[#090b0a] outline-none transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-emerald-300/[0.18] hover:bg-[#0E1411] focus-visible:ring-2 focus-visible:ring-emerald-300/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050807] motion-reduce:transform-none motion-reduce:transition-none`}
                >
                  {card}
                </Link>
              ) : (
                <article
                  key={service.id}
                  aria-labelledby={`siege-service-${service.slug}`}
                  className="flex min-h-[21rem] flex-col rounded-[1.35rem] border border-white/[0.08] bg-[#090b0a] p-5 opacity-[0.78] sm:p-6"
                >
                  {card}
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/[0.06] bg-white/[0.012] py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <div className="max-w-xl">
              <p className="text-sm font-semibold text-emerald-200/75">Built for competitive progression</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">
                A clearer way to configure your Siege service.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                Review your goal, customize the service, and see your updated price before continuing to checkout.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {overviewHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-white/[0.08] bg-black/15 p-5 sm:p-6">
                    <span className="grid size-10 place-items-center rounded-xl border border-emerald-300/[0.14] bg-emerald-400/[0.025] text-emerald-100/70">
                      <Icon className="size-4" strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-sm font-semibold text-[#F4F7F5]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#A0AAA4]">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="flex flex-col gap-6 rounded-[1.8rem] border border-white/[0.08] bg-[#090b0a] p-7 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-emerald-200/75">Explore BoostingPedia</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-white sm:text-3xl">
                Browse currently available game storefronts.
              </h2>
            </div>
            <Link
              href="/games"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39E56F]/35"
            >
              View all games
              <ArrowRight className="ml-2 size-4" aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
