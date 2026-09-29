import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Layers3,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import {
  rainbowSixSiegeGameFoundation,
  rainbowSixSiegeServiceFoundations,
  type RainbowSixSiegeServiceSlug,
} from "@/features/catalog/data/rainbow-six-siege-foundation";

export const metadata: Metadata = {
  title: { absolute: "Rainbow Six Siege Boosting Services | BoostingPedia" },
  description: rainbowSixSiegeGameFoundation.shortDescription,
  alternates: { canonical: `/games/${rainbowSixSiegeGameFoundation.slug}` },
};

const servicePresentation: Record<
  RainbowSixSiegeServiceSlug,
  { eyebrow: string; icon: typeof ShieldCheck }
> = {
  "rank-boost": { eyebrow: "RANK PROGRESSION", icon: ShieldCheck },
  "competitive-wins": { eyebrow: "COMPETITIVE WINS", icon: Trophy },
  "placements-boost": { eyebrow: "PLACEMENTS", icon: Layers3 },
  "unrated-matches": { eyebrow: "UNRATED MATCHES", icon: Sparkles },
};

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

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${siteConfig.url}/` },
    { "@type": "ListItem", position: 2, name: "Games", item: `${siteConfig.url}/games` },
    {
      "@type": "ListItem",
      position: 3,
      name: rainbowSixSiegeGameFoundation.name,
      item: `${siteConfig.url}/games/${rainbowSixSiegeGameFoundation.slug}`,
    },
  ],
} as const;

function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\u003c");
}

export default function RainbowSixSiegeOverviewPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
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

          <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {rainbowSixSiegeServiceFoundations.map((service, index) => {
              const presentation = servicePresentation[service.slug];
              const Icon = presentation.icon;

              const card = (
                <>
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-emerald-400/[0.045] to-transparent" />
                  <div className="relative flex items-start justify-between gap-4">
                    <Badge className="border-white/[0.08] bg-black/20 text-white/55">
                      {presentation.eyebrow}
                    </Badge>
                    <span className="grid size-9 place-items-center rounded-xl border border-emerald-300/[0.12] bg-emerald-400/[0.025] text-emerald-100/65">
                      <Icon className="size-4" strokeWidth={1.7} aria-hidden="true" />
                    </span>
                  </div>

                  <div className="relative mt-8">
                    <p className="font-gaming-label text-[9px] uppercase tracking-[0.12em] text-white/30">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 id={`siege-service-${service.slug}`} className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                      {service.name}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                      {service.description}
                    </p>
                  </div>

                  <div className="relative mt-auto pt-7">
                    <div className="mb-5 h-px bg-gradient-to-r from-white/[0.10] to-transparent" />
                    {service.status === "active" ? (
                      <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-emerald-300/[0.18] bg-emerald-400/[0.05] px-3 text-xs font-semibold text-emerald-100/80">
                        Configure service
                        <ArrowRight className="size-3.5" aria-hidden="true" />
                      </span>
                    ) : (
                      <span
                        className="inline-flex min-h-9 items-center rounded-full border border-white/[0.09] bg-white/[0.025] px-3 text-xs font-semibold text-[#A0AAA4]"
                        aria-label={`${service.name}, Coming soon`}
                      >
                        Coming soon
                      </span>
                    )}
                  </div>
                </>
              );

              return service.status === "active" ? (
                <Link
                  key={service.id}
                  href={service.route}
                  aria-labelledby={`siege-service-${service.slug}`}
                  className="group relative flex min-h-[20rem] flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#090b0a] p-5 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-emerald-300/[0.18] hover:shadow-[0_20px_60px_-40px_rgba(57,229,111,.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/35 motion-reduce:transform-none motion-reduce:transition-none sm:p-6"
                >
                  {card}
                </Link>
              ) : (
                <article
                  key={service.id}
                  aria-labelledby={`siege-service-${service.slug}`}
                  className="relative flex min-h-[20rem] flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#090b0a] p-5 opacity-[0.78] sm:p-6"
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
