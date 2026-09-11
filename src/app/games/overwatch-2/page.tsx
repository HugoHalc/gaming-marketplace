import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Gamepad2,
  Gauge,
  Layers3,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StartingPriceDisplay } from "@/features/catalog/components/service-card";
import { findCatalogGameBySlug } from "@/features/catalog/data/catalog-repository";
import type { ServiceSummary } from "@/features/catalog/types/catalog";


const storefrontHighlights = [
  {
    icon: ShieldCheck,
    title: "Server pricing",
    description: "Every quote is recalculated server-side before the order is stored.",
  },
  {
    icon: Gamepad2,
    title: "Overwatch options",
    description: "Tank, Damage, Support, Open Queue, four servers, and PC or console platforms.",
  },
  {
    icon: Check,
    title: "Existing order flow",
    description: "Checkout, dashboard tracking, chat, and secure order handling stay on the existing platform flow.",
  },
] as const;

export const metadata: Metadata = {
  title: "Overwatch Boosting Services",
  description:
    "Configure Overwatch Rank Boost, Competitive Wins, Competitive Drives, Placements Boost, and Unrated Matches with server-validated pricing.",
  alternates: { canonical: "/games/overwatch-2" },
};

function ServiceVisual({ service }: { service: ServiceSummary }) {
  const base =
    "mt-6 flex h-[4.1rem] items-center overflow-hidden text-white/70 transition-colors duration-200 group-hover:text-white/90";

  if (service.slug === "rank-boost") {
    return (
      <div className={`${base} gap-3`}>
        <span className="grid size-9 place-items-center rounded-xl border border-amber-300/[0.16] bg-amber-300/[0.05] text-amber-200/80">
          <ShieldCheck className="size-4" />
        </span>
        <div>
          <p className="font-gaming-label text-[9px] uppercase tracking-[0.13em] text-white/35">Rank progression</p>
          <p className="mt-1 font-gaming-value text-sm text-amber-100/80">Bronze V → Champion I</p>
        </div>
      </div>
    );
  }

  if (service.slug === "wins") {
    return (
      <div className={`${base} gap-4`}>
        <Trophy className="size-7 text-amber-200/65" />
        <div className="min-w-0 flex-1">
          <p className="font-gaming-label text-[9px] uppercase tracking-[0.13em] text-white/35">Competitive wins</p>
          <div className="mt-2 flex gap-1.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <span key={index} className={`h-1.5 flex-1 rounded-full ${index === 0 ? "bg-amber-300/55" : "bg-white/[0.07]"}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (service.slug === "competitive-drives") {
    return (
      <div className={`${base} gap-4`}>
        <Gauge className="size-7 text-amber-200/65" />
        <div className="min-w-0 flex-1">
          <p className="font-gaming-label text-[9px] uppercase tracking-[0.13em] text-white/35">Competitive Drive</p>
          <p className="mt-1 font-gaming-value text-sm text-amber-100/80">0 → 4,000 · 50 point steps</p>
        </div>
      </div>
    );
  }

  if (service.slug === "placement-matches") {
    return (
      <div className={`${base} w-full`}>
        <div className="w-full">
          <p className="font-gaming-label text-[9px] uppercase tracking-[0.13em] text-white/35">Placements</p>
          <div className="mt-3 flex gap-1.5">
            {Array.from({ length: 10 }).map((_, index) => (
              <span key={index} className="size-2 rounded-full border border-amber-200/20 bg-amber-200/[0.035]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${base} gap-4`}>
      <Gamepad2 className="size-7 text-amber-200/65" />
      <div>
        <p className="font-gaming-label text-[9px] uppercase tracking-[0.13em] text-white/35">Unrated Matches</p>
        <p className="mt-1 font-gaming-value text-sm text-amber-100/80">1–10 matches · no rank required</p>
      </div>
    </div>
  );
}

export default async function OverwatchPage() {
  const game = await findCatalogGameBySlug("overwatch-2");
  if (!game) notFound();

  return (
    <main className="min-h-screen overflow-hidden bg-[#050807]">
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
        <div className="hero-grid absolute inset-y-0 left-0 -z-20 w-[62%] opacity-15" />
        <div className="absolute right-[-10rem] top-[-13rem] -z-20 h-[38rem] w-[52rem] rounded-full bg-amber-400/[0.075] blur-[130px]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[60%] overflow-hidden md:block">
          <Image
            src="/game-cards/overwatch.webp"
            alt=""
            fill
            priority
            sizes="60vw"
            className="object-cover object-center opacity-50 lg:opacity-65"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#050807_0%,rgba(5,8,7,.98)_18%,rgba(5,8,7,.82)_38%,rgba(5,8,7,.32)_62%,rgba(5,8,7,.08)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050807]/55 via-transparent to-[#050807]/20" />
        </div>

        <Container className="relative py-12 sm:py-16 lg:min-h-[31rem] lg:py-20">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/games" className="transition-colors hover:text-white">Games</Link>
            <span>/</span>
            <span className="text-white">Overwatch</span>
          </div>

          <div className="mt-10 max-w-3xl">
            <Badge className="border-amber-300/20 bg-amber-400/[0.06] text-amber-200">
              <Sparkles className="mr-2 size-3.5" />
              Overwatch boosting services
            </Badge>
            <h1 className="mt-5 text-balance text-5xl font-bold leading-[0.96] tracking-[-0.065em] text-white sm:text-6xl lg:text-7xl">
              Overwatch Boosting Services
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
              Choose the service that matches your goal, then configure rank, role or Open Queue, server, platform, boost method, and optional extras from one dedicated Overwatch flow.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {["5 active services", "PC & console", "Server-validated pricing"].map((item) => (
                <span key={item} className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/65">
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="#services">View services<ArrowRight className="ml-2 size-4" /></Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/games"><ArrowLeft className="mr-2 size-4" />All games</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section id="services" className="scroll-mt-20 py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-amber-200/75">Boosting services</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">
                Choose the Overwatch service that matches your goal.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--muted-foreground)] lg:text-right">
              Every service uses its own server-side pricing rules and the same BoostingPedia order workflow.
            </p>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {game.services.map((service) => (
              <Link
                key={service.id}
                href={`/games/overwatch-2/${service.slug}`}
                className="group relative flex min-h-[22rem] flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#090B0A] p-5 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-amber-300/[0.18] hover:shadow-[0_28px_70px_-42px_rgba(0,0,0,.95)] sm:p-6"
              >
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-amber-400/[0.055] to-transparent" />
                <div className="relative flex items-start justify-between gap-4">
                  <Badge className="border-white/[0.08] bg-black/20 text-white/55">
                    {service.slug === "rank-boost" ? "Rank progression" : service.slug === "placement-matches" ? "Placements" : "Competitive"}
                  </Badge>
                  <span className="grid size-8 place-items-center rounded-lg border border-amber-300/[0.12] bg-amber-300/[0.035] text-amber-200/60">
                    <Layers3 className="size-3.5" />
                  </span>
                </div>

                <ServiceVisual service={service} />

                <div className="relative mt-3">
                  <h3 className="font-gaming-value max-w-[14rem] text-2xl leading-[1.05] tracking-[-0.045em] text-white">
                    {service.name}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{service.description}</p>
                </div>

                <div className="relative mt-auto pt-6">
                  <div className="mb-5 h-px bg-gradient-to-r from-white/[0.10] to-transparent" />
                  <div className="flex items-end justify-between gap-4">
                    <StartingPriceDisplay value={service.startingPrice} context={service.startingPriceContext} />
                    <span className="grid size-10 place-items-center rounded-full border border-white/[0.09] bg-white/[0.035] text-white/70 transition-colors group-hover:border-amber-300/25 group-hover:bg-amber-300/[0.07] group-hover:text-amber-200">
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/[0.06] bg-white/[0.012] py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[.78fr_1.22fr]">
            <div className="max-w-xl">
              <p className="text-sm font-semibold text-amber-200/75">Built for Overwatch</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">
                One visual system. Overwatch-specific configuration.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                The storefront follows the same premium BoostingPedia family as the other implemented games while keeping Overwatch-specific ranks, roles, servers, platforms, and service logic.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {storefrontHighlights.map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-2xl border border-white/[0.08] bg-black/15 p-5 transition-colors hover:border-amber-300/[0.14] sm:p-6">
                  <Icon className="size-5 text-amber-200/70" />
                  <h3 className="mt-5 text-sm font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
