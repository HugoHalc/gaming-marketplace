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
        <div className="hero-grid absolute inset-0 -z-20 opacity-20" />
        <div className="absolute left-1/2 top-[-20rem] -z-10 h-[34rem] w-[60rem] -translate-x-1/2 rounded-full bg-[#7A63F2]/[0.07] blur-[120px]" />

        <Container className="py-5 sm:py-16 lg:py-18">
          <div className="sm:hidden">
            <Link
              href="/games/marvel-rivals"
              className="inline-flex min-h-11 items-center text-xs font-semibold text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft className="mr-2 size-3.5" />
              Back to Marvel Rivals
            </Link>
            <h1 className="mt-2 text-balance text-3xl font-bold leading-[1.02] tracking-[-0.05em] text-white">
              {service.name}
            </h1>
          </div>

          <div className="hidden sm:block">
            <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Link href="/" className="transition-colors hover:text-white">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/games" className="transition-colors hover:text-white">Games</Link>
              <span aria-hidden="true">/</span>
              <Link href="/games/marvel-rivals" className="transition-colors hover:text-white">Marvel Rivals</Link>
              <span aria-hidden="true">/</span>
              <span className="text-white">{service.name}</span>
            </div>
          </div>

          <div className="mt-2 grid gap-8 sm:mt-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <Badge className="hidden border-[#A38CFF]/20 bg-[#7A63F2]/[0.06] text-[#CEC5FF] sm:inline-flex">
                <Sparkles className="mr-2 size-3.5" />
                Marvel Rivals · {service.eyebrow}
              </Badge>
              <h1 className="hidden text-balance text-4xl font-bold leading-[1.03] tracking-[-0.055em] text-white sm:mt-5 sm:block sm:text-5xl">
                {service.name}
              </h1>
              <p className="mt-4 hidden max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:block sm:text-lg">
                {service.description}
              </p>
            </div>

            <Link
              href="/games/marvel-rivals"
              className="hidden items-center text-sm font-semibold text-white/65 transition-colors hover:text-white sm:inline-flex"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to Marvel Rivals
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-6 sm:py-12 lg:py-16">
        <Container>
          <MarvelRivalsServiceConfigurator service={service} />
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
