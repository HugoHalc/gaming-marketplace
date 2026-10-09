import { ServicePageHeader, serviceWorkspaceClassName } from "@/features/catalog/components/service-page-shell";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { StructuredData } from "@/components/seo/structured-data";
import { findCatalogGameBySlug } from "@/features/catalog/data/catalog-repository";
import { OverwatchServiceConfigurator } from "@/features/configurator/components/overwatch-service-configurator";
import { getServiceConfiguratorSchema } from "@/features/configurator/data/configurator-repository";
import { ServiceSeoContent } from "@/features/catalog/components/service-seo-content";
import { getServiceSeoContent } from "@/features/catalog/data/service-seo-content";
import { createPublicMetadata, createServicePageJsonLd } from "@/lib/seo";

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

// Match the existing public routes to their dedicated service-page shell.
export function generateStaticParams() {
  return Object.keys(serviceCopy).map((service) => ({ service }));
}

export async function generateMetadata({ params }: OverwatchServicePageProps): Promise<Metadata> {
  const { service: serviceSlug } = await params;
  const copy = serviceCopy[serviceSlug];
  if (!copy) return { title: "Overwatch service not found" };

  return createPublicMetadata({
    title: copy.title,
    description: copy.description,
    path: `/games/overwatch-2/${serviceSlug}`,
    image: "/game-heroes/overwatch-hero.jpg",
  });
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
  const seoContent = getServiceSeoContent("overwatch-2", serviceSlug);
  if (!seoContent) notFound();
  const structuredData = createServicePageJsonLd({ gameName: "Overwatch 2", gameSlug: "overwatch-2", serviceName: service.name, serviceSlug, description: copy.description });

  return (
    <main className="min-h-screen overflow-hidden bg-[#050807]">
      <StructuredData data={structuredData} />
      <SiteHeader />

      <ServicePageHeader gameName="Overwatch 2" gameSlug="overwatch-2" serviceName={service.name} title={copy.title} description={copy.description} hasArtwork background={<>
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
      </>} />

      <section className={serviceWorkspaceClassName}>
        <Container>
          <h2 className="sr-only">Configure {copy.title}</h2>
          <OverwatchServiceConfigurator gameSlug="overwatch-2" service={service} schema={schema} />
        </Container>
      </section>

      <ServiceSeoContent content={seoContent} />

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
