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
    title: "Rainbow Six Siege Rank Boost",
    description: service.description,
    alternates: { canonical: service.route },
  };
}

export default async function RainbowSixSiegeServicePage({
  params,
}: RainbowSixSiegeServicePageProps) {
  const { service: slug } = await params;
  const service = findRainbowSixSiegeServiceFoundation(slug);
  if (!service || service.status !== "active" || service.slug !== "rank-boost") notFound();

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
            <span className="text-white">Rank Boost</span>
          </div>

          <div className="mt-8 max-w-3xl">
            <Badge className="border-emerald-300/15 bg-emerald-400/[0.055] text-emerald-100/80">
              <ShieldCheck className="mr-2 size-3.5" aria-hidden="true" />
              Rainbow Six Siege Rank Boost
            </Badge>
            <h1 className="mt-4 text-balance text-4xl font-bold tracking-[-0.055em] text-white sm:text-5xl lg:text-6xl">
              Rainbow Six Siege Rank Boost
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
              {service.description}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-7 sm:py-9 lg:py-10">
        <Container>
          <RainbowSixSiegeServiceNavigation currentSlug="rank-boost">
            <RainbowSixSiegeRankConfigurator />
          </RainbowSixSiegeServiceNavigation>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
