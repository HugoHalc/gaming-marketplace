import { ServicePageHeader, serviceWorkspaceClassName, serviceNavigationGridClassName } from "@/features/catalog/components/service-page-shell";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import {
  getMarvelRivalsService,
  marvelRivalsServices,
} from "@/features/catalog/data/marvel-rivals-foundation";
import { MarvelRivalsHeroConfigurator } from "@/features/configurator/components/marvel-rivals-hero-configurator";
import { MarvelRivalsPlacementsConfigurator } from "@/features/configurator/components/marvel-rivals-placements-configurator";
import { MarvelRivalsRankConfigurator } from "@/features/configurator/components/marvel-rivals-rank-configurator";
import { MarvelRivalsServiceConfigurator } from "@/features/configurator/components/marvel-rivals-service-configurator";
import { MarvelRivalsUnratedConfigurator } from "@/features/configurator/components/marvel-rivals-unrated-configurator";
import { MarvelRivalsWinsConfigurator } from "@/features/configurator/components/marvel-rivals-wins-configurator";
import { GameServiceNavigation } from "@/features/configurator/components/game-service-navigation";
import { ServiceSeoContent } from "@/features/catalog/components/service-seo-content";
import { getServiceSeoContent } from "@/features/catalog/data/service-seo-content";
import { createPublicMetadata } from "@/lib/seo";

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

  return createPublicMetadata({
    title: `${service.name} | Marvel Rivals`,
    description: service.description,
    path: `/games/marvel-rivals/${service.slug}`,
    image: "/game-heroes/marvel-rivals-storefront.webp",
  });
}

export default async function MarvelRivalsServicePage({ params }: MarvelRivalsServicePageProps) {
  const { service: serviceSlug } = await params;
  const service = getMarvelRivalsService(serviceSlug);
  if (!service) notFound();
  const seoContent = getServiceSeoContent("marvel-rivals", service.slug);

  const heroTitle =
    service.slug === "rank-boost"
      ? "Reach your target rank without the unnecessary grind."
      : service.slug === "placement-matches"
        ? "Complete your placement matches with a clean, configurable order."
        : service.slug === "wins"
          ? "Stack the competitive wins you need with a clear configuration."
          : service.slug === "hero-boost"
            ? "Build the Hero Proficiency progression you want."
            : "Configure the unrated games you need.";

  const heroPills =
    service.slug === "rank-boost"
      ? ["Bronze → Eternity", "Solo or Duo", "Flexible extras"]
      : service.slug === "placement-matches"
        ? ["Previous Rank + Placement Matches", "Solo or Duo", "Flexible extras"]
        : service.slug === "wins"
          ? ["Current Rank + Competitive Wins", "Solo or Duo", "Flexible extras"]
          : service.slug === "hero-boost"
            ? ["Hero Proficiency 1 → 70", "Choose your hero", "Solo or Duo"]
            : ["1–10 Unrated Games", "Solo or Duo", "Flexible extras"];

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

      <ServicePageHeader gameName="Marvel Rivals" gameSlug="marvel-rivals" serviceName={service.name} title={`Marvel Rivals ${service.name}`} description={heroTitle}>
        <p className="mt-2 max-w-[36rem] text-sm leading-6 text-white/60">{service.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {heroPills.map((pill) => <span key={pill} className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1 text-[11px] font-medium text-white/60">{pill}</span>)}
        </div>
      </ServicePageHeader>

      <section className={serviceWorkspaceClassName}>
        <h2 className="sr-only">Configure Marvel Rivals {service.name}</h2>
        <Container>
          <div className={serviceNavigationGridClassName}>
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
              ) : service.slug === "placement-matches" ? (
                <MarvelRivalsPlacementsConfigurator service={service} />
              ) : service.slug === "wins" ? (
                <MarvelRivalsWinsConfigurator service={service} />
              ) : service.slug === "hero-boost" ? (
                <MarvelRivalsHeroConfigurator service={service} />
              ) : service.slug === "unrated-games" ? (
                <MarvelRivalsUnratedConfigurator service={service} />
              ) : (
                <MarvelRivalsServiceConfigurator service={service} />
              )}
            </div>
          </div>
        </Container>
      </section>

      {seoContent ? <ServiceSeoContent content={seoContent} /> : null}

      <SiteFooter />
    </main>
  );
}
