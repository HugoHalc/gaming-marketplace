import { ServicePageHeader, serviceWorkspaceClassName } from "@/features/catalog/components/service-page-shell";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { RainbowSixSiegeServiceNavigation } from "@/features/catalog/components/rainbow-six-siege-service-navigation";
import {
  findRainbowSixSiegeServiceFoundation,
  rainbowSixSiegeGameFoundation,
  rainbowSixSiegeServiceFoundations,
} from "@/features/catalog/data/rainbow-six-siege-foundation";
import { RainbowSixSiegeWinsConfigurator } from "@/features/configurator/components/rainbow-six-siege-wins-configurator";
import { RainbowSixSiegePlacementsConfigurator } from "@/features/configurator/components/rainbow-six-siege-placements-configurator";
import { RainbowSixSiegeUnratedConfigurator } from "@/features/configurator/components/rainbow-six-siege-unrated-configurator";
import { RainbowSixSiegeRankConfigurator } from "@/features/configurator/components/rainbow-six-siege-rank-configurator";

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

  return {
    title: `Rainbow Six Siege ${service.name}`,
    description: service.description,
    alternates: { canonical: service.route },
  };
}

export default async function RainbowSixSiegeServicePage({
  params,
}: RainbowSixSiegeServicePageProps) {
  const { service: slug } = await params;
  const service = findRainbowSixSiegeServiceFoundation(slug);
  if (!service || service.status !== "active") notFound();

  return (
    <main className="min-h-screen overflow-hidden">
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
          <RainbowSixSiegeServiceNavigation currentSlug={service.slug}>
            {service.slug === "rank-boost" ? <RainbowSixSiegeRankConfigurator /> : service.slug === "competitive-wins" ? <RainbowSixSiegeWinsConfigurator /> : service.slug === "placements-boost" ? <RainbowSixSiegePlacementsConfigurator /> : <RainbowSixSiegeUnratedConfigurator />}
          </RainbowSixSiegeServiceNavigation>
          {service.slug === "placements-boost" ? (
            <section className="mt-10 max-w-3xl space-y-4" aria-labelledby="placements-faq-title">
              <h2 id="placements-faq-title" className="text-2xl font-semibold text-white">Placements Boost FAQ</h2>
              <p className="text-sm leading-6 text-white/65">
                Placement matches establish the start of a ranked season. Previous performance, hidden MMR and the game’s ranking system can affect your result. An exact resulting rank is not guaranteed.
              </p>
              <details className="rounded-xl border border-white/10 p-4 text-sm text-white/75">
                <summary className="cursor-pointer font-semibold focus-visible:outline-2 focus-visible:outline-emerald-300">How are my games completed?</summary>
                <p className="mt-2 leading-6">Games are completed manually. Choose Solo for account-based play or Duo to play alongside a booster.</p>
              </details>
              <details className="rounded-xl border border-white/10 p-4 text-sm text-white/75">
                <summary className="cursor-pointer font-semibold focus-visible:outline-2 focus-visible:outline-emerald-300">What do I need before ordering?</summary>
                <p className="mt-2 leading-6">Your account must already meet Rainbow Six Siege ranked-access requirements.</p>
              </details>
            </section>
          ) : null}
          {service.slug === "unrated-matches" ? (
            <section className="mt-10 max-w-3xl space-y-4" aria-labelledby="unrated-faq-title">
              <h2 id="unrated-faq-title" className="text-2xl font-semibold text-white">Unrated Matches FAQ</h2>
              <p className="text-sm leading-6 text-white/65">Purchase completed unrated matches, not Ranked games or rank progress. Matches are played manually; wins, win rate, and account outcomes are not guaranteed.</p>
              <details className="rounded-xl border border-white/10 p-4 text-sm text-white/75">
                <summary className="cursor-pointer font-semibold focus-visible:outline-2 focus-visible:outline-emerald-300">How do Solo and Duo differ?</summary>
                <p className="mt-2 leading-6">In Solo, the booster plays the selected unrated matches on your account. In Duo, you play alongside the booster.</p>
              </details>
              <details className="rounded-xl border border-white/10 p-4 text-sm text-white/75">
                <summary className="cursor-pointer font-semibold focus-visible:outline-2 focus-visible:outline-emerald-300">What do I choose before checkout?</summary>
                <p className="mt-2 leading-6">Select 1 to 10 games, your platform and region, a service mode, and any optional customizations. Review your total before placing the order.</p>
              </details>
              <details className="rounded-xl border border-white/10 p-4 text-sm text-white/75">
                <summary className="cursor-pointer font-semibold focus-visible:outline-2 focus-visible:outline-emerald-300">What happens after checkout?</summary>
                <p className="mt-2 leading-6">Your order appears in your dashboard, where you can follow its progress and communicate about fulfillment.</p>
              </details>
            </section>
          ) : null}
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
