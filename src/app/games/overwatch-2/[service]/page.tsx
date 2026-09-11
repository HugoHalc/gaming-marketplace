import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
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

      <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
        <div className="hero-grid absolute inset-0 -z-20 opacity-20" />
        <div className="absolute left-1/2 top-[-20rem] -z-10 h-[34rem] w-[60rem] -translate-x-1/2 rounded-full bg-amber-400/[0.07] blur-[120px]" />

        <Container className="py-6 sm:py-12 lg:py-14">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)] sm:text-sm">
            <Link href="/games/overwatch-2" className="inline-flex min-h-10 items-center transition-colors hover:text-white">
              <ArrowLeft className="mr-2 size-3.5" />
              Overwatch
            </Link>
            <span>/</span>
            <span className="text-white">{service.name}</span>
          </div>

          <div className="mt-5 max-w-4xl sm:mt-7">
            <Badge className="border-amber-300/20 bg-amber-400/[0.06] text-amber-200">
              <Sparkles className="mr-2 size-3.5" />
              Overwatch boosting
            </Badge>
            <h1 className="mt-4 text-balance text-3xl font-bold leading-[1.02] tracking-[-0.055em] text-white sm:text-5xl">
              {copy.title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base sm:leading-7">
              {copy.description}
            </p>
            <div className="mt-5 hidden flex-wrap gap-2 sm:flex">
              {copy.pills.map((pill) => (
                <span key={pill} className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/65">
                  {pill}
                </span>
              ))}
            </div>
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
