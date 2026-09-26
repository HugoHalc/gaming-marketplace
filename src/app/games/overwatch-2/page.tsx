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

const overviewServiceMeta = {
  "rank-boost": { badge: "RANK PROGRESSION", icon: ShieldCheck },
  wins: { badge: "COMPETITIVE WINS", icon: Trophy },
  "competitive-drives": { badge: "COMPETITIVE DRIVE", icon: Gauge },
  "placement-matches": { badge: "PLACEMENTS", icon: Layers3 },
  "unrated-matches": { badge: "UNRATED", icon: Gamepad2 },
} as const;

function serviceMeta(slug: string) {
  return overviewServiceMeta[slug as keyof typeof overviewServiceMeta] ?? {
    badge: "Overwatch service",
    icon: Gamepad2,
  };
}

function RankPreviewBadge({
  src,
  label,
}: {
  src: string;
  label: string;
}) {
  return (
    <span className="group/rank-preview flex min-w-0 flex-col items-center gap-1.5">
      <span className="grid size-10 place-items-center rounded-xl border border-white/[0.075] bg-black/20 transition-[border-color,background-color,transform] duration-200 group-hover:border-amber-300/[0.14] group-hover:bg-amber-300/[0.025]">
        <Image
          src={src}
          alt=""
          width={40}
          height={40}
          className="size-9 object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,.5)] transition-transform duration-200 group-hover/rank-preview:scale-[1.045]"
        />
      </span>
      <span className="max-w-14 truncate text-[8px] font-semibold text-white/40">{label}</span>
    </span>
  );
}

function ServiceVisual({ service }: { service: ServiceSummary }) {
  const base =
    "relative mt-5 flex h-[5.15rem] items-center overflow-hidden rounded-xl border border-white/[0.055] bg-black/15 px-3.5 text-white/70 transition-[border-color,background-color] duration-200 group-hover:border-amber-300/[0.10] group-hover:bg-amber-300/[0.018] group-hover:text-white/90";

  if (service.slug === "rank-boost") {
    return (
      <div className={`${base} justify-between gap-2`}>
        <RankPreviewBadge src="/ranks/overwatch/bronze.png" label="Bronze" />
        <ArrowRight className="size-3.5 shrink-0 text-amber-200/25" />
        <RankPreviewBadge src="/ranks/overwatch/emerald.png" label="Emerald" />
        <ArrowRight className="size-3.5 shrink-0 text-amber-200/25" />
        <RankPreviewBadge src="/ranks/overwatch/champion.png" label="Champion" />
      </div>
    );
  }

  if (service.slug === "wins") {
    return (
      <div className={`${base} gap-3.5`}>
        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-amber-300/[0.10] bg-amber-300/[0.025]">
          <Image
            src="/ranks/overwatch/gold.png"
            alt=""
            width={44}
            height={44}
            className="size-10 object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,.5)] transition-transform duration-200 group-hover:scale-[1.04]"
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-gaming-label text-[8px] uppercase tracking-[0.14em] text-white/30">
            Win targets
          </p>
          <div className="mt-2 flex gap-1.5">
            {Array.from({ length: 3 }).map((_, index) => (
              <span
                key={index}
                className="flex h-6 flex-1 items-center justify-center rounded-lg border border-amber-300/[0.11] bg-amber-300/[0.025] font-gaming-label text-[8px] font-semibold tracking-[0.1em] text-amber-100/55"
              >
                WIN
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (service.slug === "competitive-drives") {
    return (
      <div className={`${base} gap-3.5`}>
        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-amber-300/[0.10] bg-amber-300/[0.025]">
          <Image
            src="/ranks/overwatch/champion.png"
            alt=""
            width={44}
            height={44}
            className="size-10 object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,.5)] transition-transform duration-200 group-hover:scale-[1.04]"
          />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="font-gaming-label text-[8px] uppercase tracking-[0.14em] text-white/30">
              Drive points
            </p>
            <span className="text-[8px] font-semibold text-amber-100/45">50 point steps</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-gaming-value text-[9px] text-white/50">0</span>
            <div className="relative h-px flex-1 bg-white/[0.12]">
              <span className="absolute -left-0.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full border border-amber-200/35 bg-[#090B0A]" />
              <ArrowRight className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 text-amber-200/35" />
              <span className="absolute -right-0.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full border border-amber-200/35 bg-[#090B0A]" />
            </div>
            <span className="font-gaming-value text-[9px] text-white/65">4,000</span>
          </div>
        </div>
      </div>
    );
  }

  if (service.slug === "placement-matches") {
    return (
      <div className={`${base} gap-3`}>
        <span className="flex h-9 shrink-0 items-center rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 font-gaming-label text-[8px] font-semibold uppercase tracking-[0.1em] text-white/45">
          Unranked
        </span>
        <ArrowRight className="size-3.5 shrink-0 text-amber-200/25" />
        <div className="min-w-0 flex-1">
          <p className="font-gaming-label text-[8px] uppercase tracking-[0.14em] text-white/30">
            Placement matches
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className="size-3 rounded-full border border-amber-200/[0.20] bg-amber-200/[0.018]"
              />
            ))}
            <span className="ml-1 text-[8px] font-medium text-white/30">1–10</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${base} gap-3.5`}>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-amber-100/55">
        <Gamepad2 className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="font-gaming-label text-[8px] uppercase tracking-[0.14em] text-white/30">
            Unrated sessions
          </p>
          <span className="text-[8px] font-medium text-white/35">No rank required</span>
        </div>
        <div className="mt-2 flex gap-1.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <span
              key={index}
              className="h-2 flex-1 rounded-full border border-white/[0.08] bg-white/[0.025]"
            />
          ))}
        </div>
        <p className="mt-1.5 text-[8px] font-medium text-amber-100/45">1–10 matches</p>
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
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-full overflow-hidden sm:w-[84%] md:w-[76%] lg:w-[68%] xl:w-[64%]"
        >
          <Image
            src="/game-heroes/overwatch-hero.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 64vw, (min-width: 1024px) 68vw, (min-width: 768px) 76vw, (min-width: 640px) 84vw, 100vw"
            className="object-cover object-[76%_50%] opacity-40 sm:object-[72%_50%] sm:opacity-58 md:object-[68%_50%] md:opacity-72 lg:object-[58%_50%] lg:opacity-85 xl:opacity-90"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#050807_0%,rgba(5,8,7,.985)_18%,rgba(5,8,7,.88)_36%,rgba(5,8,7,.5)_56%,rgba(5,8,7,.14)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050807]/72 via-[#050807]/10 to-[#050807]/18" />
          <div className="absolute left-[44%] top-[14%] h-44 w-44 rounded-full bg-amber-300/[0.10] blur-[100px] lg:h-56 lg:w-56" />
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

          <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.12em] text-white/35 md:hidden">Swipe to explore 5 services</p>
          <div className="-mx-4 mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 md:mx-0 md:mt-9 md:grid md:grid-cols-2 md:items-stretch md:overflow-visible md:px-0 md:pb-0 md:snap-none xl:grid-cols-3">
            {game.services.map((service) => {
              const meta = serviceMeta(service.slug);
              const ServiceIcon = meta.icon;

              return (
                <Link
                  key={service.id}
                  href={`/games/overwatch-2/${service.slug}`}
                  className="group relative flex min-h-[22rem] w-[82vw] max-w-[20rem] shrink-0 snap-start flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#090B0A] p-5 outline-none transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-amber-300/[0.18] hover:shadow-[0_28px_70px_-42px_rgba(0,0,0,.95)] focus-visible:border-amber-300/25 focus-visible:ring-2 focus-visible:ring-amber-300/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A08] motion-reduce:transform-none motion-reduce:transition-none sm:p-6 md:h-full md:w-auto md:max-w-none md:shrink md:snap-none"
                >
                  <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-amber-400/[0.065] to-transparent" />
                  <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/15 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative flex items-start justify-between gap-4">
                    <Badge className="border-white/[0.08] bg-black/20 text-white/55 transition-colors group-hover:border-amber-300/[0.12] group-hover:text-white/68">
                      {meta.badge}
                    </Badge>
                    <span className="grid size-8 place-items-center rounded-lg border border-amber-300/[0.12] bg-amber-300/[0.035] text-amber-200/60 transition-[border-color,background-color,color,transform] duration-200 group-hover:scale-[1.03] group-hover:border-amber-300/[0.20] group-hover:bg-amber-300/[0.06] group-hover:text-amber-100/80">
                      <ServiceIcon className="size-3.5" />
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
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[11px] font-semibold text-white/48">Configure service</span>
                      <span className="grid size-10 place-items-center rounded-full border border-white/[0.09] bg-white/[0.035] text-white/70 transition-colors group-hover:border-amber-300/25 group-hover:bg-amber-300/[0.07] group-hover:text-amber-200">
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:transform-none" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
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
