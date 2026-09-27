import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Crosshair,
  Gamepad2,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import {
  dota2GameFoundation,
  dota2ServiceFoundations,
  type Dota2ServiceCategory,
} from "@/features/catalog/data/dota-2-foundation";

export const metadata: Metadata = {
  title: "Dota 2 Boosting Services | BoostingPedia",
  description:
    "Choose a focused Dota 2 service for MMR progression, net wins, calibration matches, or Dota Plus hero progression.",
  alternates: { canonical: "/games/dota-2" },
  robots: { index: false, follow: false },
};

const serviceMeta: Record<
  Dota2ServiceCategory,
  { label: string; icon: typeof Gamepad2 }
> = {
  "mmr-progression": {
    label: "MMR progression",
    icon: ShieldCheck,
  },
  "net-wins": { label: "Ranked wins", icon: Trophy },
  calibration: { label: "Calibration", icon: Crosshair },
  "hero-progression": {
    label: "Hero progression",
    icon: Sparkles,
  },
};

const implementedServices = new Set(["mmr-boost", "net-wins"]);

export default function Dota2FoundationPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/[0.06] bg-[#050807]">
        <div className="hero-grid absolute inset-0 -z-20 opacity-20" />
        <div className="absolute right-[-10rem] top-[-12rem] -z-10 size-[38rem] rounded-full bg-red-500/[0.07] blur-[130px]" />
        <div className="absolute bottom-[-14rem] left-[-8rem] -z-10 size-[32rem] rounded-full bg-amber-500/[0.035] blur-[120px]" />

        <Container className="relative py-12 sm:py-16 lg:min-h-[31rem] lg:py-20">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/games" className="transition-colors hover:text-white">
              Games
            </Link>
            <span>/</span>
            <span className="text-white">Dota 2</span>
          </div>

          <div className="mt-12 max-w-3xl">
            <Badge className="border-red-300/15 bg-red-400/[0.055] text-red-200">
              <Gamepad2 className="mr-2 size-3.5" />
              Dota 2 rollout preview
            </Badge>

            <h1 className="mt-5 text-balance text-5xl font-bold leading-[0.96] tracking-[-0.065em] text-white sm:text-6xl lg:text-7xl">
              {dota2GameFoundation.title}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
              {dota2GameFoundation.shortDescription}
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/65">
                MOBA
              </span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/65">
                Four planned services
              </span>
              <span className="rounded-full border border-red-300/15 bg-red-400/[0.05] px-3 py-1.5 text-xs font-medium text-red-100/80">
                MMR Boost and Net Wins available for direct review
              </span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#services"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#39E56F] px-5 text-sm font-semibold text-[#050807] transition-colors hover:bg-[#20C95A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39E56F]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050807]"
              >
                View Dota 2 services
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link
                href="/games"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.035] px-5 text-sm font-semibold text-white/70 transition-colors hover:border-white/[0.15] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050807]"
              >
                <ArrowLeft className="mr-2 size-4" />
                All games
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section
        id="services"
        className="scroll-mt-20 py-14 sm:py-16 lg:py-20"
      >
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-red-200">
              Dota 2 services
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">
              Choose the service path you want to review.
            </h2>
            <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
              MMR Boost and Net Wins now have complete direct-route configurators. Calibration Matches and Dota Plus Hero Level remain foundation previews and cannot create orders yet.
            </p>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dota2ServiceFoundations.map((service, index) => {
              const meta = serviceMeta[service.category];
              const Icon = meta.icon;
              const implemented = implementedServices.has(service.slug);

              return (
                <Link
                  key={service.id}
                  href={service.route}
                  className="group flex min-h-[19rem] flex-col rounded-[1.35rem] border border-white/[0.08] bg-[#090B0A] p-5 transition-[transform,border-color,background-color] hover:-translate-y-0.5 hover:border-red-300/[0.16] hover:bg-[#0E1411] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050807] motion-reduce:transform-none sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-10 place-items-center rounded-xl border border-red-300/[0.13] bg-red-400/[0.035] text-red-200/80">
                      <Icon className="size-4" strokeWidth={1.8} />
                    </span>

                    <span
                      className={`font-gaming-label rounded-full border px-2 py-1 text-[9px] uppercase tracking-[0.09em] ${
                        implemented
                          ? "border-[#39E56F]/25 bg-[#39E56F]/[0.05] text-[#82F5A4]"
                          : "border-white/[0.08] bg-black/20 text-white/35"
                      }`}
                    >
                      {implemented
                        ? "Direct review"
                        : String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="mt-7">
                    <p className="font-gaming-label text-[10px] uppercase tracking-[0.13em] text-red-200/55">
                      {meta.label}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
                      {service.name}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                      {service.description}
                    </p>
                  </div>

                  <div className="mt-auto pt-7">
                    <div className="mb-4 h-px bg-gradient-to-r from-white/[0.10] to-transparent" />
                    <span
                      className={`inline-flex items-center text-xs font-semibold transition-colors ${
                        implemented
                          ? "text-[#82F5A4]"
                          : "text-white/55 group-hover:text-red-100/80"
                      }`}
                    >
                      {service.slug === "mmr-boost"
                        ? "Configure MMR Boost"
                        : service.slug === "net-wins"
                          ? "Configure Net Wins"
                          : "Review service foundation"}
                      <ArrowRight className="ml-2 size-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/[0.06] bg-white/[0.012] py-14 sm:py-16">
        <Container>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Two server-validated services",
                text: "MMR Boost and Net Wins calculate pricing on the server and recalculate the order before creation.",
              },
              {
                title: "Two services remain in preview",
                text: "Calibration Matches and Dota Plus Hero Level still do not expose quote or order creation flows.",
              },
              {
                title: "Final assets pending",
                text: "Dota 2 imagery and rank badges will be integrated later from the final assets you provide.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-white/[0.08] bg-black/15 p-5 sm:p-6"
              >
                <h3 className="text-sm font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
