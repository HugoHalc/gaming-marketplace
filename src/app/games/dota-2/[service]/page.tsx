import { ServicePageHeader, serviceWorkspaceClassName } from "@/features/catalog/components/service-page-shell";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Dota2ServiceNavigation } from "@/features/catalog/components/dota-2-service-navigation";
import { ServiceSeoContent } from "@/features/catalog/components/service-seo-content";
import { getServiceSeoContent } from "@/features/catalog/data/service-seo-content";
import { Dota2MmrConfigurator } from "@/features/configurator/components/dota-2-mmr-configurator";
import { Dota2NetWinsConfigurator } from "@/features/configurator/components/dota-2-net-wins-configurator";
import { Dota2CalibrationConfigurator } from "@/features/configurator/components/dota-2-calibration-configurator";
import { Dota2HeroLevelConfigurator } from "@/features/configurator/components/dota-2-hero-level-configurator";
import {
  dota2AssetFoundation,
  dota2ServiceFoundations,
  findDota2ServiceFoundation,
} from "@/features/catalog/data/dota-2-foundation";
import { createPublicMetadata } from "@/lib/seo";

interface Dota2ServiceFoundationPageProps {
  params: Promise<{ service: string }>;
}

export function generateStaticParams() {
  return dota2ServiceFoundations.map((service) => ({ service: service.slug }));
}

export async function generateMetadata({
  params,
}: Dota2ServiceFoundationPageProps): Promise<Metadata> {
  const { service: slug } = await params;
  const service = findDota2ServiceFoundation(slug);

  if (!service) return { title: "Service not found" };

  const isMmrBoost = service.slug === "mmr-boost";
  const isNetWins = service.slug === "net-wins";
  const isCalibration = service.slug === "calibration-matches";
  const isHeroLevel = service.slug === "hero-level-boost";
  const title = isMmrBoost
      ? "Dota 2 MMR Boost"
      : isNetWins
        ? "Dota 2 Net Wins"
        : isCalibration
          ? "Dota 2 Calibration Matches"
          : isHeroLevel
            ? "Dota Plus Hero Level"
            : `${service.name} | Dota 2`;
  const description = isMmrBoost
      ? "Configure your current MMR, target MMR and preferred boost options."
      : isNetWins
        ? "Purchase a fixed number of net ranked wins. Net wins are calculated as wins minus losses."
        : isCalibration
          ? "Purchase a selected number of calibration matches based on your previous rank, Rank Confidence and preferred play settings."
          : isHeroLevel
            ? "Progress one selected hero from its current Dota Plus Hero Level to your chosen target."
            : service.description;

  return createPublicMetadata({
    title,
    description,
    path: service.route,
    image: dota2AssetFoundation.serviceHero,
  });
}



function Dota2ServiceHeroBackground() {
  return (
    <>
      <div className="hero-grid absolute inset-y-0 left-0 -z-20 w-[62%] opacity-10" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-full overflow-hidden sm:w-[88%] md:w-[80%] lg:w-[72%] xl:w-[68%]"
      >
        <Image
          src={dota2AssetFoundation.serviceHero}
          alt=""
          fill
          priority
          sizes="(min-width: 1280px) 68vw, (min-width: 1024px) 72vw, (min-width: 768px) 80vw, (min-width: 640px) 88vw, 100vw"
          className="object-cover object-[67%_50%] opacity-34 sm:object-[66%_50%] sm:opacity-50 md:object-[65%_50%] md:opacity-64 lg:object-[64%_50%] lg:opacity-78 xl:opacity-88"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#050807_0%,rgba(5,8,7,.99)_18%,rgba(5,8,7,.91)_37%,rgba(5,8,7,.58)_58%,rgba(5,8,7,.16)_82%,transparent_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050807] via-[#050807]/32 to-transparent" />
      </div>
    </>
  );
}

export default async function Dota2ServiceFoundationPage({ params }: Dota2ServiceFoundationPageProps) {
  const { service: slug } = await params;
  const service = findDota2ServiceFoundation(slug);
  if (!service) notFound();
  const metadata = await generateMetadata({ params: Promise.resolve({ service: slug }) });
  const title = service.slug === "hero-level-boost" ? "Dota Plus Hero Level" : `Dota 2 ${service.name}`;
  const seoContent = getServiceSeoContent("dota-2", service.slug);
  if (!seoContent) notFound();
  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <ServicePageHeader gameName="Dota 2" gameSlug="dota-2" serviceName={service.name} title={title} description={metadata.description ?? service.description} hasArtwork background={<Dota2ServiceHeroBackground />}>
        {service.slug === "calibration-matches" ? <p className="mt-2 max-w-2xl text-xs leading-5 text-white/55">Final rank, match outcomes and Rank Confidence changes are not guaranteed.</p> : null}
        {service.slug === "hero-level-boost" ? <p className="mt-2 max-w-2xl text-xs leading-5 text-white/55">An active Dota Plus subscription is required.</p> : null}
      </ServicePageHeader>
      <section className={serviceWorkspaceClassName}>
        <Container>
          <h2 className="sr-only">Configure {title}</h2>
          <Dota2ServiceNavigation currentSlug={service.slug}>
            {service.slug === "mmr-boost" ? <Dota2MmrConfigurator /> : service.slug === "net-wins" ? <Dota2NetWinsConfigurator /> : service.slug === "calibration-matches" ? <Dota2CalibrationConfigurator /> : <Dota2HeroLevelConfigurator />}
          </Dota2ServiceNavigation>
        </Container>
      </section>
      <ServiceSeoContent content={seoContent} />
      <SiteFooter />
    </main>
  );
}
