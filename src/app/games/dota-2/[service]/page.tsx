import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crosshair, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Dota2ServiceNavigation } from "@/features/catalog/components/dota-2-service-navigation";
import { Dota2MmrConfigurator } from "@/features/configurator/components/dota-2-mmr-configurator";
import { Dota2NetWinsConfigurator } from "@/features/configurator/components/dota-2-net-wins-configurator";
import { Dota2CalibrationConfigurator } from "@/features/configurator/components/dota-2-calibration-configurator";
import { Dota2HeroLevelConfigurator } from "@/features/configurator/components/dota-2-hero-level-configurator";
import {
  dota2AssetFoundation,
  dota2ServiceFoundations,
  findDota2ServiceFoundation,
} from "@/features/catalog/data/dota-2-foundation";

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
  return {
    title: isMmrBoost
      ? "Dota 2 MMR Boost"
      : isNetWins
        ? "Dota 2 Net Wins"
        : isCalibration
          ? "Dota 2 Calibration Matches"
          : isHeroLevel
            ? "Dota Plus Hero Level"
            : `${service.name} | Dota 2`,
    description: isMmrBoost
      ? "Configure your current MMR, target MMR and preferred boost options."
      : isNetWins
        ? "Purchase a fixed number of net ranked wins. Net wins are calculated as wins minus losses."
        : isCalibration
          ? "Purchase a selected number of calibration matches based on your previous rank, Rank Confidence and preferred play settings."
          : isHeroLevel
            ? "Progress one selected hero from its current Dota Plus Hero Level to your chosen target."
            : service.description,
    alternates: { canonical: service.route },
    robots: { index: false, follow: false },
  };
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

  const isMmrBoost = service.slug === "mmr-boost";
  const isNetWins = service.slug === "net-wins";
  const isCalibration = service.slug === "calibration-matches";
  const isHeroLevel = service.slug === "hero-level-boost";

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />

      {isMmrBoost ? (
        <>
          <section className="relative isolate overflow-hidden border-b border-white/[0.06] bg-[#050807]">
            <Dota2ServiceHeroBackground />
            <Container className="py-8 sm:py-10 lg:py-12">
              <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <Link href="/" className="transition-colors hover:text-white">Home</Link>
                <span>/</span>
                <Link href="/games/dota-2" className="transition-colors hover:text-white">Dota 2</Link>
                <span>/</span>
                <span className="text-white">MMR Boost</span>
              </div>

              <div className="mt-8 max-w-3xl">
                <Badge className="border-red-300/15 bg-red-400/[0.055] text-red-200">
                  <ShieldCheck className="mr-2 size-3.5" />
                  Dota 2 MMR Boost
                </Badge>
                <h1 className="mt-4 text-balance text-4xl font-bold tracking-[-0.055em] text-white sm:text-5xl lg:text-6xl">
                  Dota 2 MMR Boost
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
                  Configure your current MMR, target MMR and preferred boost options.
                </p>
              </div>
            </Container>
          </section>

          <section className="py-7 sm:py-9 lg:py-10">
            <Container>
              <Dota2ServiceNavigation currentSlug="mmr-boost">
                <Dota2MmrConfigurator />
              </Dota2ServiceNavigation>
            </Container>
          </section>
        </>
      ) : isNetWins ? (
        <>
          <section className="relative isolate overflow-hidden border-b border-white/[0.06] bg-[#050807]">
            <Dota2ServiceHeroBackground />
            <Container className="py-8 sm:py-10 lg:py-12">
              <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <Link href="/" className="transition-colors hover:text-white">Home</Link>
                <span>/</span>
                <Link href="/games/dota-2" className="transition-colors hover:text-white">Dota 2</Link>
                <span>/</span>
                <span className="text-white">Net Wins</span>
              </div>

              <div className="mt-8 max-w-3xl">
                <Badge className="border-red-300/15 bg-red-400/[0.055] text-red-200">
                  <Trophy className="mr-2 size-3.5" />
                  Dota 2 Net Wins
                </Badge>
                <h1 className="mt-4 text-balance text-4xl font-bold tracking-[-0.055em] text-white sm:text-5xl lg:text-6xl">
                  Dota 2 Net Wins
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
                  Purchase a fixed number of net ranked wins. Net wins are calculated as wins minus losses.
                </p>
              </div>
            </Container>
          </section>

          <section className="py-7 sm:py-9 lg:py-10">
            <Container>
              <Dota2ServiceNavigation currentSlug="net-wins">
                <Dota2NetWinsConfigurator />
              </Dota2ServiceNavigation>
            </Container>
          </section>
        </>
      ) : isCalibration ? (
        <>
          <section className="relative isolate overflow-hidden border-b border-white/[0.06] bg-[#050807]">
            <Dota2ServiceHeroBackground />
            <Container className="py-8 sm:py-10 lg:py-12">
              <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <Link href="/" className="transition-colors hover:text-white">Home</Link>
                <span>/</span>
                <Link href="/games/dota-2" className="transition-colors hover:text-white">Dota 2</Link>
                <span>/</span>
                <span className="text-white">Calibration Matches</span>
              </div>

              <div className="mt-8 max-w-3xl">
                <Badge className="border-red-300/15 bg-red-400/[0.055] text-red-200">
                  <Crosshair className="mr-2 size-3.5" />
                  Dota 2 Calibration Matches
                </Badge>
                <h1 className="mt-4 text-balance text-4xl font-bold tracking-[-0.055em] text-white sm:text-5xl lg:text-6xl">
                  Dota 2 Calibration Matches
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
                  Purchase a selected number of calibration matches based on your previous rank, Rank Confidence and preferred play settings.
                </p>
                <p className="mt-2 max-w-2xl text-xs leading-5 text-white/40">
                  Final rank, match outcomes and Rank Confidence changes are not guaranteed.
                </p>
              </div>
            </Container>
          </section>

          <section className="py-7 sm:py-9 lg:py-10">
            <Container>
              <Dota2ServiceNavigation currentSlug="calibration-matches">
                <Dota2CalibrationConfigurator />
              </Dota2ServiceNavigation>
            </Container>
          </section>
        </>
      ) : isHeroLevel ? (
        <>
          <section className="relative isolate overflow-hidden border-b border-white/[0.06] bg-[#050807]">
            <Dota2ServiceHeroBackground />
            <Container className="py-8 sm:py-10 lg:py-12">
              <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <Link href="/" className="transition-colors hover:text-white">Home</Link>
                <span>/</span>
                <Link href="/games/dota-2" className="transition-colors hover:text-white">Dota 2</Link>
                <span>/</span>
                <span className="text-white">Dota Plus Hero Level</span>
              </div>

              <div className="mt-8 max-w-3xl">
                <Badge className="border-red-300/15 bg-red-400/[0.055] text-red-200">
                  <Sparkles className="mr-2 size-3.5" />
                  Dota 2 Hero Progression
                </Badge>
                <h1 className="mt-4 text-balance text-4xl font-bold tracking-[-0.055em] text-white sm:text-5xl lg:text-6xl">
                  Dota Plus Hero Level
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
                  Progress one selected hero from its current Dota Plus Hero Level to your chosen target.
                </p>
                <p className="mt-2 max-w-2xl text-xs leading-5 text-white/40">
                  An active Dota Plus subscription is required.
                </p>
              </div>
            </Container>
          </section>

          <section className="py-7 sm:py-9 lg:py-10">
            <Container>
              <Dota2ServiceNavigation currentSlug="hero-level-boost">
                <Dota2HeroLevelConfigurator />
              </Dota2ServiceNavigation>
            </Container>
          </section>
        </>
      ) : null}

      <SiteFooter />
    </main>
  );
}
