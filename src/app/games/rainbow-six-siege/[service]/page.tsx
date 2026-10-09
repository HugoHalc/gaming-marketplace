import { ServicePageHeader, serviceWorkspaceClassName } from "@/features/catalog/components/service-page-shell";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { StructuredData } from "@/components/seo/structured-data";
import { RainbowSixSiegeServiceNavigation } from "@/features/catalog/components/rainbow-six-siege-service-navigation";
import { ServiceSeoContent } from "@/features/catalog/components/service-seo-content";
import { getServiceSeoContent } from "@/features/catalog/data/service-seo-content";
import {
  findRainbowSixSiegeServiceFoundation,
  rainbowSixSiegeGameFoundation,
  rainbowSixSiegeServiceFoundations,
} from "@/features/catalog/data/rainbow-six-siege-foundation";
import { RainbowSixSiegeWinsConfigurator } from "@/features/configurator/components/rainbow-six-siege-wins-configurator";
import { RainbowSixSiegePlacementsConfigurator } from "@/features/configurator/components/rainbow-six-siege-placements-configurator";
import { RainbowSixSiegeUnratedConfigurator } from "@/features/configurator/components/rainbow-six-siege-unrated-configurator";
import { RainbowSixSiegeRankConfigurator } from "@/features/configurator/components/rainbow-six-siege-rank-configurator";
import { createPublicMetadata, createServicePageJsonLd } from "@/lib/seo";

interface RainbowSixSiegeServicePageProps {
  params: Promise<{ service: string }>;
}

export function generateStaticParams() {
  return rainbowSixSiegeServiceFoundations
    .filter((service) => service.status === "active")
    .map((service) => ({ service: service.slug }));
}

export async function generateMetadata({
  params,
}: RainbowSixSiegeServicePageProps): Promise<Metadata> {
  const { service: slug } = await params;
  const service = findRainbowSixSiegeServiceFoundation(slug);
  if (!service || service.status !== "active") return { title: "Service not found" };

  return createPublicMetadata({
    title: `Rainbow Six Siege ${service.name}`,
    description: service.description,
    path: service.route,
    image: rainbowSixSiegeGameFoundation.assets.serviceHero,
  });
}

export default async function RainbowSixSiegeServicePage({
  params,
}: RainbowSixSiegeServicePageProps) {
  const { service: slug } = await params;
  const service = findRainbowSixSiegeServiceFoundation(slug);
  if (!service || service.status !== "active") notFound();
  const seoContent = getServiceSeoContent("rainbow-six-siege", service.slug);
  if (!seoContent) notFound();
  const structuredData = createServicePageJsonLd({ gameName: rainbowSixSiegeGameFoundation.name, gameSlug: rainbowSixSiegeGameFoundation.slug, serviceName: service.name, serviceSlug: service.slug, description: service.description });

  return (
    <main className="min-h-screen overflow-hidden">
      <StructuredData data={structuredData} />
      <SiteHeader />

      <ServicePageHeader gameName="Rainbow Six Siege" gameSlug="rainbow-six-siege" serviceName={service.name} title={`Rainbow Six Siege ${service.name}`} description={service.description} hasArtwork background={<>
        <div className="hero-grid absolute inset-y-0 left-0 -z-20 w-[62%] opacity-10" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-full overflow-hidden sm:w-[88%] md:w-[80%] lg:w-[72%] xl:w-[68%]"
        >
          <Image
            src={rainbowSixSiegeGameFoundation.assets.serviceHero}
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 68vw, (min-width: 1024px) 72vw, (min-width: 768px) 80vw, (min-width: 640px) 88vw, 100vw"
            className="object-cover object-[76%_12%] opacity-38 sm:object-[74%_12%] sm:opacity-55 md:object-[72%_12%] md:opacity-68 lg:object-[70%_12%] lg:opacity-82 xl:opacity-90"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#050807_0%,rgba(5,8,7,.97)_18%,rgba(5,8,7,.82)_38%,rgba(5,8,7,.42)_60%,rgba(5,8,7,.10)_82%,transparent_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050807] via-[#050807]/32 to-transparent" />
        </div>

      </>} />

      <section className={serviceWorkspaceClassName}>
        <Container>
          <h2 className="sr-only">Configure Rainbow Six Siege {service.name}</h2>
          <RainbowSixSiegeServiceNavigation currentSlug={service.slug}>
            {service.slug === "rank-boost" ? <RainbowSixSiegeRankConfigurator /> : service.slug === "competitive-wins" ? <RainbowSixSiegeWinsConfigurator /> : service.slug === "placements-boost" ? <RainbowSixSiegePlacementsConfigurator /> : <RainbowSixSiegeUnratedConfigurator />}
          </RainbowSixSiegeServiceNavigation>
        </Container>
      </section>

      <ServiceSeoContent content={seoContent} />

      <SiteFooter />
    </main>
  );
}
