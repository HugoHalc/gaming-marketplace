import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import {
  getMarvelRivalsService,
  marvelRivalsServices,
} from "@/features/catalog/data/marvel-rivals-foundation";
import { MarvelRivalsServiceConfigurator } from "@/features/configurator/components/marvel-rivals-service-configurator";

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

  return {
    title: `${service.name} | Marvel Rivals`,
    description: service.description,
    alternates: { canonical: `/games/marvel-rivals/${service.slug}` },
  };
}

export default async function MarvelRivalsServicePage({ params }: MarvelRivalsServicePageProps) {
  const { service: serviceSlug } = await params;
  const service = getMarvelRivalsService(serviceSlug);
  if (!service) notFound();

  return (
    <main className="min-h-screen overflow-hidden bg-[#050807]">
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
        <div className="hero-grid absolute inset-0 -z-30 opacity-20" />
        <div className="absolute left-1/2 top-[-21rem] -z-20 h-[34rem] w-[62rem] -translate-x-1/2 rounded-full bg-[#7A63F2]/[0.075] blur-[120px]" />
        <div className="absolute right-[-12rem] top-[-6rem] -z-20 h-[24rem] w-[24rem] rounded-full bg-[#55D7E8]/[0.035] blur-[105px]" />

        <Container className="py-6 sm:py-10 lg:py-12">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#A0AAA4] sm:text-sm">
            <Link href="/games/marvel-rivals" className="inline-flex min-h-10 items-center transition-colors hover:text-white">
              <ArrowLeft className="mr-2 size-3.5" />
              Marvel Rivals
            </Link>
            <span>/</span>
            <span className="text-white">{service.name}</span>
          </div>

          <div className="mt-5 max-w-4xl sm:mt-6">
            <Badge className="border-[#A38CFF]/20 bg-[#7A63F2]/[0.07] text-[#C7B9FF]">
              <Sparkles className="mr-2 size-3.5" />
              Marvel Rivals service
            </Badge>
            <h1 className="mt-4 text-balance text-3xl font-bold leading-[1.02] tracking-[-0.05em] text-[#F4F7F5] sm:text-5xl">{service.name}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#A0AAA4] sm:text-base sm:leading-7">{service.description}</p>
          </div>
        </Container>
      </section>

      <section className="py-5 sm:py-8 lg:py-10">
        <Container>
          <MarvelRivalsServiceConfigurator service={service} />
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
