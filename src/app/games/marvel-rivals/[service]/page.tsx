import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import {
  getMarvelRivalsService,
  marvelRivalsServices,
} from "@/features/catalog/data/marvel-rivals-foundation";
import { MarvelRivalsRankConfigurator } from "@/features/configurator/components/marvel-rivals-rank-configurator";
import { MarvelRivalsServiceConfigurator } from "@/features/configurator/components/marvel-rivals-service-configurator";
import { GameServiceNavigation } from "@/features/configurator/components/game-service-navigation";

interface MarvelRivalsServicePageProps {
  params: Promise<{ service: string }>;
}

export function generateStaticParams() {
  return marvelRivalsServices.map((service) => ({ service: service.slug }));
}

export async function generateMetadata({ params }: MarvelRivalsServicePageProps): Promise<Metadata> {
  const { service: serviceSlug } = await params;
  const service = getMarvelRivalsService(serviceSlug);
  if (!service) return { title: "Marvel Rivals service not found" };

  return {
    title: `${service.name} | Marvel Rivals`,
    description: service.description,
    alternates: { canonical: `/games/marvel-rivals/${service.slug}` },
  };
}

export default async function MarvelRivalsServicePage({ params }: MarvelRivalsServicePageProps) {
  const { service: serviceSlug } = await params;
  const service = getMarvelRivalsService(serviceSlug);
  if (!service) notFound();

  const heroTitle =
    service.slug === "rank-boost"
      ? "Reach your target rank without the unnecessary grind."
      : service.slug === "placement-matches"
        ? "Complete your placement matches with a clean, configurable order."
        : service.slug === "wins"
          ? "Stack the competitive wins you need with a clear configuration."
          : service.slug === "hero-boost"
            ? "Build the hero progression you want."
            : "Configure the unrated games you need.";

  const heroPills =
    service.slug === "rank-boost"
      ? ["Bronze → Eternity", "Solo or Duo", "Flexible extras"]
      : service.slug === "placement-matches"
        ? ["Previous rank + games", "Solo or Duo", "Flexible extras"]
        : service.slug === "wins"
          ? ["Rank + win quantity", "Solo or Duo", "Flexible extras"]
          : service.slug === "hero-boost"
            ? ["Current → desired hero level", "Specific Hero preference", "Flexible extras"]
            : ["Game quantity", "Solo or Duo", "Flexible extras"];

  const serviceNavigation = marvelRivalsServices.map((item) => ({
    slug: item.slug,
    label: item.name,
    mobileLabel:
      item.slug === "placement-matches"
        ? "Placements"
        : item.slug === "wins"
          ? "Wins"
          : item.slug === "unrated-games"
            ? "Unrated"
            : item.name,
  }));

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
        <div className="hero-grid absolute inset-0 -z-20 opacity-25" />
        <div className="absolute left-1/2 top-[-20rem] -z-10 h-[34rem] w-[60rem] -translate-x-1/2 rounded-full bg-[#7A63F2]/[0.08] blur-[120px]" />

        <Container className="py-5 sm:py-16 lg:py-18">
          <div className="sm:hidden">
            <Link
              href="/games/marvel-rivals"
              className="inline-flex min-h-11 items-center text-xs font-semibold text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft className="mr-2 size-3.5" />
              Back to Marvel Rivals
            </Link>
          </div>

          <div className="hidden sm:block">
            <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Link href="/" className="transition-colors hover:text-white">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/games" className="transition-colors hover:text-white">Games</Link>
              <span aria-hidden="true">/</span>
              <Link href="/games/marvel-rivals" className="transition-colors hover:text-white">Marvel Rivals</Link>
              <span aria-hidden="true">/</span>
              <span className="text-white">{service.name}</span>
            </div>
          </div>

          <div className="mt-2 grid gap-8 sm:mt-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <Badge className="hidden border-[#A38CFF]/20 bg-[#7A63F2]/[0.06] text-[#CEC5FF] sm:inline-flex">
                <Sparkles className="mr-2 size-3.5" />
                Marvel Rivals {service.name}
              </Badge>

              <h1 className="text-balance text-3xl font-bold leading-[1.02] tracking-[-0.05em] text-white sm:mt-5">
                Marvel Rivals {service.name}
              </h1>
              <p className="mt-3 hidden text-balance text-4xl font-bold leading-[1.03] tracking-[-0.055em] text-white sm:block sm:text-5xl">
                {heroTitle}
              </p>

              <p className="mt-4 hidden max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:block sm:text-lg">
                {service.description}
              </p>

              <div className="mt-5 hidden flex-wrap gap-2 sm:flex">
                {heroPills.map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-xs font-medium text-white/58"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/games/marvel-rivals"
              className="hidden items-center text-sm font-semibold text-white/65 transition-colors hover:text-white sm:inline-flex"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to Marvel Rivals
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-6 sm:py-12 lg:py-16">
        <Container>
          <div className="xl:grid xl:grid-cols-[13.5rem_minmax(0,1fr)] xl:gap-4 2xl:grid-cols-[14.5rem_minmax(0,1fr)] 2xl:gap-5">
            <GameServiceNavigation
              gameName="Marvel Rivals"
              gameSlug="marvel-rivals"
              activeSlug={service.slug}
              items={serviceNavigation}
              accentTextClass="text-[#CEC5FF]/60"
              accentBorderClass="border-[#A38CFF]/[0.20]"
            />
            <div className="min-w-0">
              {service.slug === "rank-boost" ? (
                <MarvelRivalsRankConfigurator service={service} />
              ) : (
                <MarvelRivalsServiceConfigurator service={service} />
              )}
            </div>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
