import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { findCatalogGameBySlug } from "@/features/catalog/data/catalog-repository";
import { OverwatchServiceConfigurator } from "@/features/configurator/components/overwatch-service-configurator";
import { getServiceConfiguratorSchema } from "@/features/configurator/data/configurator-repository";

interface OverwatchServicePageProps {
  params: Promise<{ service: string }>;
}

const serviceCopy: Record<
  string,
  {
    title: string;
    description: string;
    pills: string[];
  }
> = {
  "rank-boost": {
    title: "Overwatch Rank Boost",
    description:
      "Choose your current rank and target rank, then configure role or Open Queue, server, platform, boost method, and optional extras.",
    pills: ["Bronze V → Champion I", "Account Boost or Play With Booster", "Role & Open Queue pricing"],
  },
  wins: {
    title: "Overwatch Competitive Wins",
    description:
      "Choose your current rank and 1 to 5 competitive wins, then configure the Overwatch options that apply to your order.",
    pills: ["1–5 Competitive Wins", "Rank-based pricing", "PC & console"],
  },
  "competitive-drives": {
    title: "Overwatch Competitive Drives",
    description:
      "Choose your rank and move from your current Drive score toward a target up to 4000 in 50-point steps.",
    pills: ["0–4000 Drive", "50 point steps", "Rank-specific Drive pricing"],
  },
  "placement-matches": {
    title: "Overwatch Placements Boost",
    description:
      "Select Unranked or your previous rank and configure up to 10 placement matches with the server, platform, role, and boost method you need.",
    pills: ["1–10 Placement Matches", "Unranked supported", "Champion divisions included"],
  },
  "unrated-matches": {
    title: "Overwatch Unrated Matches",
    description:
      "Configure 1 to 10 unrated matches without a rank requirement, then select your server, platform, role, and preferred boost method.",
    pills: ["1–10 Unrated Matches", "No rank required", "PC & console"],
  },
};

export async function generateMetadata({ params }: OverwatchServicePageProps): Promise<Metadata> {
  const { service: serviceSlug } = await params;
  const copy = serviceCopy[serviceSlug];
  if (!copy) return { title: "Overwatch service not found" };

  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: `/games/overwatch-2/${serviceSlug}` },
  };
}

export default async function OverwatchServicePage({ params }: OverwatchServicePageProps) {
  const { service: serviceSlug } = await params;
  const game = await findCatalogGameBySlug("overwatch-2");
  if (!game) notFound();

  const service = game.services.find((item) => item.slug === serviceSlug);
  const copy = serviceCopy[serviceSlug];
  if (!service || !copy) notFound();

  const schema = await getServiceConfiguratorSchema({
    serviceId: service.id,
    category: service.category,
  });

  return (
    <main className="min-h-screen overflow-hidden bg-[#050807]">
      <SiteHeader />

      <section className="relative isolate min-h-[232px] overflow-hidden border-b border-white/[0.06] sm:min-h-[286px] lg:min-h-[300px]">
        <Image
          src="/game-heroes/overwatch-hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="pointer-events-none -z-30 object-cover object-[67%_48%] sm:object-[68%_46%] lg:object-[70%_44%]"
        />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(5,6,5,0.96)_0%,rgba(5,6,5,0.86)_42%,rgba(5,6,5,0.44)_70%,rgba(5,6,5,0.18)_100%)]" />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(5,6,5,0.20)_0%,rgba(5,6,5,0.02)_42%,rgba(5,6,5,0.34)_100%)]" />
        <Container className="flex min-h-[232px] items-center py-5 sm:min-h-[286px] sm:py-8 lg:min-h-[300px] lg:py-9">
          <div className="max-w-2xl">
            <Link href="/games/overwatch-2" className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/48 transition-colors hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/35 sm:hidden">
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              Back to Overwatch 2
            </Link>
            <div className="hidden items-center gap-2 text-[11px] text-white/40 sm:flex">
              <Link href="/games/overwatch-2" className="transition-colors hover:text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/35">Overwatch 2</Link>
              <span aria-hidden="true">/</span>
              <span className="text-white/62">{copy.title}</span>
            </div>
            <h1 className="mt-4 max-w-[18ch] text-[1.8rem] font-bold tracking-[-0.04em] text-white sm:mt-3 sm:text-[2.5rem] lg:text-[2.75rem]">{copy.title}</h1>
            <p className="mt-3 hidden max-w-xl text-sm leading-6 text-white/56 sm:block lg:text-[15px]">{copy.description}</p>
          </div>
        </Container>
      </section>

      <section className="py-5 sm:py-10 lg:py-12">
        <Container>
          <OverwatchServiceConfigurator gameSlug="overwatch-2" service={service} schema={schema} />
        </Container>
      </section>

      <section className="border-t border-white/[0.06] py-10 sm:py-12">
        <Container>
          <div className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.015] p-5 text-xs leading-5 text-[var(--muted-foreground)] sm:max-w-2xl">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-200/65" />
            <span>
              Your selected configuration is recalculated server-side before order creation. Checkout, order tracking, communication, and secure fulfillment continue through the existing BoostingPedia order flow.
            </span>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
