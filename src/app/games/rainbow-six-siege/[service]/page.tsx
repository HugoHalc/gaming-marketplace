import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { RainbowSixSiegeServiceNavigation } from "@/features/catalog/components/rainbow-six-siege-service-navigation";
import {
  findRainbowSixSiegeServiceFoundation,
  rainbowSixSiegeGameFoundation,
  rainbowSixSiegeServiceFoundations,
} from "@/features/catalog/data/rainbow-six-siege-foundation";
import { RainbowSixSiegeWinsConfigurator } from "@/features/configurator/components/rainbow-six-siege-wins-configurator";
import { RainbowSixSiegePlacementsConfigurator } from "@/features/configurator/components/rainbow-six-siege-placements-configurator";
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

      <section className="relative isolate overflow-hidden border-b border-white/[0.06] bg-[#050807]">
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
            className="object-cover object-center opacity-28 sm:opacity-42 md:opacity-54 lg:opacity-65"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#050807_0%,rgba(5,8,7,.99)_18%,rgba(5,8,7,.92)_38%,rgba(5,8,7,.62)_60%,rgba(5,8,7,.25)_82%,rgba(5,8,7,.08)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050807] via-[#050807]/32 to-transparent" />
        </div>

        <Container className="py-8 sm:py-10 lg:py-12">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/games/rainbow-six-siege" className="transition-colors hover:text-white">
              Rainbow Six Siege
            </Link>
            <span>/</span>
            <span className="text-white">{service.name}</span>
          </div>

          <div className="mt-8 max-w-3xl">
            <Badge className="border-emerald-300/15 bg-emerald-400/[0.055] text-emerald-100/80">
              <ShieldCheck className="mr-2 size-3.5" aria-hidden="true" />
              Rainbow Six Siege {service.name}
            </Badge>
            <h1 className="mt-4 text-balance text-4xl font-bold tracking-[-0.055em] text-white sm:text-5xl lg:text-6xl">
              Rainbow Six Siege {service.name}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
              {service.description}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-7 sm:py-9 lg:py-10">
        <Container>
          <RainbowSixSiegeServiceNavigation currentSlug={service.slug}>
            {service.slug === "rank-boost" ? <RainbowSixSiegeRankConfigurator /> : service.slug === "competitive-wins" ? <RainbowSixSiegeWinsConfigurator /> : <RainbowSixSiegePlacementsConfigurator />}
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
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
