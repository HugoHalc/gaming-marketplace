import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Gamepad2, LockKeyhole } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import {
  dota2GameFoundation,
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

  return {
    title: `${service.name} | Dota 2 | BoostingPedia`,
    description: service.description,
    alternates: { canonical: service.route },
    robots: { index: false, follow: false },
  };
}

export default async function Dota2ServiceFoundationPage({
  params,
}: Dota2ServiceFoundationPageProps) {
  const { service: slug } = await params;
  const service = findDota2ServiceFoundation(slug);

  if (!service) notFound();

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/[0.06] bg-[#050807]">
        <div className="hero-grid absolute inset-0 -z-20 opacity-20" />
        <div className="absolute right-[-10rem] top-[-12rem] -z-10 size-[38rem] rounded-full bg-red-500/[0.06] blur-[130px]" />

        <Container className="py-12 sm:py-16 lg:py-20">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/games/dota-2" className="transition-colors hover:text-white">Dota 2</Link>
            <span>/</span>
            <span className="text-white">{service.name}</span>
          </div>

          <div className="mt-12 max-w-3xl">
            <Badge className="border-amber-300/15 bg-amber-400/[0.05] text-amber-200/80">
              <LockKeyhole className="mr-2 size-3.5" />
              Foundation preview · checkout disabled
            </Badge>

            <p className="mt-6 font-gaming-label text-sm uppercase tracking-[0.12em] text-red-200/65">
              {dota2GameFoundation.name}
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-[-0.055em] text-white sm:text-5xl lg:text-6xl">
              {service.name}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
              {service.description}
            </p>

            {service.requirements?.length ? (
              <div className="mt-7 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <p className="text-sm font-semibold text-white">Requirement</p>
                {service.requirements.map((requirement) => (
                  <p key={requirement} className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    {requirement}
                  </p>
                ))}
              </div>
            ) : null}

            {service.safetyNotes?.length ? (
              <div className="mt-7 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <p className="text-sm font-semibold text-white">Service scope</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  {service.safetyNotes.map((note) => (
                    <li key={note}>• {note}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-8 rounded-[1.35rem] border border-dashed border-white/[0.10] bg-[#090B0A] p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-red-300/[0.13] bg-red-400/[0.035] text-red-200/80">
                  <Gamepad2 className="size-4" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-white">Configurator not implemented in PHASE 1</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    Pricing, configuration controls, estimated timing and checkout will be introduced only in later approved phases. This route cannot create an order.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/games/dota-2"
              className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.035] px-5 text-sm font-semibold text-white/70 transition-colors hover:border-white/[0.15] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050807]"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to Dota 2 services
            </Link>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
