import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Gamepad2,
  Layers3,
  ReceiptText,
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

export const metadata: Metadata = {
  title: "League of Legends",
  description: "Explore League of Legends boosting services on BoostingPedia.",
  alternates: { canonical: "/games/league-of-legends" },
};


const storefrontHighlights = [
  {
    title: "Built around your League goal",
    description: "Choose the service that matches your ranked, mastery, Arena, Clash, or match objective.",
    icon: Layers3,
  },
  {
    title: "Clear configuration before checkout",
    description: "Configure the options that matter for the selected service and review the server-calculated total before creating the order.",
    icon: ReceiptText,
  },
  {
    title: "One BoostingPedia flow",
    description: "League of Legends uses the same premium order, checkout, dashboard, and tracking family as the rest of BoostingPedia.",
    icon: ShieldCheck,
  },
] as const;

const lolRanks = [
  { src: "/ranks/league-of-legends/gold.png", alt: "Gold" },
  { src: "/ranks/league-of-legends/emerald.png", alt: "Emerald" },
  { src: "/ranks/league-of-legends/diamond.png", alt: "Diamond" },
] as const;

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function categoryLabel(category: ServiceSummary["category"]) {
  if (category === "rank") return "Rank progression";
  if (category === "wins") return "Competitive";
  if (category === "placements") return "Placements";
  return "Service";
}

function LeagueServiceMicrovisual({ service }: { service: ServiceSummary }) {
  const base = "relative mt-6 flex h-[4.1rem] items-center overflow-hidden";

  if (service.slug === "rank-boost") {
    return (
      <div className={`${base} gap-2.5`} aria-label="League of Legends rank progression preview">
        {lolRanks.map((rank, index) => (
          <div key={rank.src} className="contents">
            <span className="grid size-9 shrink-0 place-items-center sm:size-10">
              <Image
                src={rank.src}
                alt={rank.alt}
                width={40}
                height={40}
                className="size-9 object-contain opacity-85 drop-shadow-[0_7px_14px_rgba(0,0,0,.55)] transition-[opacity,transform] duration-200 group-hover:scale-[1.04] group-hover:opacity-100 sm:size-10"
              />
            </span>
            {index < lolRanks.length - 1 ? (
              <ArrowRight className="size-3.5 shrink-0 text-[#C89B3C]/35" strokeWidth={1.6} />
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  if (service.slug === "wins") {
    return (
      <div className={`${base} gap-4`} aria-label="Ranked wins preview">
        <span className="font-gaming-value text-[1.8rem] leading-none tracking-[-0.04em] text-[#E7C867]">+1</span>
        <div className="min-w-0 flex-1">
          <p className="font-gaming-label text-[10px] uppercase tracking-[0.14em] text-white/35">Ranked win</p>
          <div className="mt-2 flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <span key={index} className={`h-1.5 flex-1 rounded-full ${index < 2 ? "bg-[#C89B3C]/55" : "bg-white/[0.07]"}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (service.slug === "placement-matches") {
    return (
      <div className={`${base} w-full`} aria-label="Placement matches preview">
        <div className="w-full">
          <p className="font-gaming-value text-[13px] uppercase tracking-[0.12em] text-[#E7C867]/85">Placements</p>
          <div className="mt-3 flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <span key={index} className={`size-2.5 rounded-full border ${index === 0 ? "border-[#C89B3C]/50 bg-[#C89B3C]/25" : "border-white/15 bg-white/[0.025]"}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (service.slug === "unrated-matches") {
    return (
      <div className={`${base} gap-4`} aria-label="Unrated matches preview">
        <Gamepad2 className="size-7 text-[#E7C867]/75" strokeWidth={1.6} />
        <div className="min-w-0 flex-1">
          <p className="font-gaming-label text-[10px] uppercase tracking-[0.14em] text-white/35">Match package</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <div className="h-full w-[42%] rounded-full bg-[#C89B3C]/50" />
          </div>
        </div>
      </div>
    );
  }

  if (service.slug === "arena-boost") {
    return (
      <div className={`${base} gap-4`} aria-label="Arena boost preview">
        <Trophy className="size-7 text-[#E7C867]/78" strokeWidth={1.6} />
        <div className="grid flex-1 grid-cols-4 gap-1.5">
          {Array.from({ length: 4 }).map((_, index) => (
            <span key={index} className={`h-7 rounded-md border ${index === 0 ? "border-[#C89B3C]/30 bg-[#7A5B22]/18" : "border-white/[0.07] bg-white/[0.02]"}`} />
          ))}
        </div>
      </div>
    );
  }

  if (service.slug === "mastery-boost") {
    return (
      <div className={`${base} gap-4`} aria-label="Mastery boost preview">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#C89B3C]/20 bg-[#7A5B22]/15 text-[#E7C867]">
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-gaming-label text-[10px] uppercase tracking-[0.14em] text-white/35">Mastery progress</p>
          <div className="mt-2 flex gap-1.5">
            <span className="h-1.5 w-1/3 rounded-full bg-[#C89B3C]/55" />
            <span className="h-1.5 w-1/3 rounded-full bg-[#C89B3C]/28" />
            <span className="h-1.5 w-1/3 rounded-full bg-white/[0.07]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${base} gap-4`} aria-label="Clash boost preview">
      <ShieldCheck className="size-7 text-[#E7C867]/75" strokeWidth={1.6} />
      <div className="min-w-0 flex-1">
        <p className="font-gaming-label text-[10px] uppercase tracking-[0.14em] text-white/35">Clash path</p>
        <div className="mt-2 flex items-center gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <span key={index} className={`h-2 flex-1 rounded-full ${index === 0 ? "bg-[#C89B3C]/55" : "bg-white/[0.07]"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LeagueServiceCard({ service }: { service: ServiceSummary }) {
  return (
    <Link
      href={`/games/league-of-legends/${service.slug}`}
      className="group relative flex min-h-[22rem] w-[82vw] max-w-[20rem] shrink-0 snap-start flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#090B0A] p-5 transition-[transform,border-color,box-shadow,background-color] duration-300 hover:-translate-y-1 hover:border-[#C89B3C]/25 hover:bg-[#0B0D0B] hover:shadow-[0_30px_80px_-44px_rgba(0,0,0,.98)] sm:p-6 md:h-full md:w-auto md:max-w-none md:shrink md:snap-none"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#C89B3C]/[0.075] via-[#7A5B22]/[0.025] to-transparent" />
      <div className="pointer-events-none absolute -right-12 -top-14 size-36 rounded-full bg-[#C89B3C]/[0.035] blur-3xl" />

      <div className="relative flex items-start justify-between gap-4">
        <Badge className="border-[#C89B3C]/16 bg-[#7A5B22]/10 text-[#E7C867]/75">
          {categoryLabel(service.category)}
        </Badge>
        <span className="grid size-8 place-items-center rounded-lg border border-white/[0.07] bg-black/20 text-[#E7C867]/45 transition-colors group-hover:border-[#C89B3C]/18 group-hover:text-[#E7C867]/75">
          <Sparkles className="size-3.5" strokeWidth={1.7} />
        </span>
      </div>

      <LeagueServiceMicrovisual service={service} />

      <div className="relative mt-3">
        <h3 className="font-gaming-value max-w-[14rem] text-2xl leading-[1.05] tracking-[-0.045em] text-white">
          {service.name}
        </h3>
        <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
          {service.description}
        </p>
      </div>

      <div className="relative mt-auto pt-5">
        <div className="mb-5 h-px bg-gradient-to-r from-[#C89B3C]/20 via-white/[0.08] to-transparent" />
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-gaming-label text-[10px] uppercase tracking-[0.13em] text-white/30">Starting from</p>
            <p className="font-gaming-value mt-1 text-lg text-white">{formatPrice(service.startingPrice)}</p>
          </div>
          <span className="grid size-10 place-items-center rounded-full border border-white/[0.09] bg-white/[0.035] text-white/70 transition-[border-color,background-color,color,transform] group-hover:border-[#C89B3C]/30 group-hover:bg-[#7A5B22]/15 group-hover:text-[#E7C867]">
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function LeagueOfLegendsPage() {
  const game = await findCatalogGameBySlug("league-of-legends");
  if (!game) notFound();

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/[0.06] bg-[#050807]">
        <div className="hero-grid absolute inset-y-0 left-0 -z-20 w-[62%] opacity-10" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-full overflow-hidden sm:w-[78%] lg:w-[68%] xl:w-[64%]">
          <Image
            src="/game-heroes/league-of-legends-storefront.jpeg"
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 64vw, (min-width: 1024px) 68vw, (min-width: 640px) 78vw, 100vw"
            quality={100}
            className="object-cover object-[73%_50%] opacity-48 sm:object-[72%_50%] sm:opacity-72 lg:object-[70%_50%] lg:opacity-92 xl:opacity-100"
          />
          <div className="absolute inset-0 bg-[#7A5B22]/[0.025]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#050807_0%,rgba(5,8,7,.99)_17%,rgba(5,8,7,.90)_34%,rgba(5,8,7,.58)_52%,rgba(5,8,7,.16)_73%,transparent_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050807] via-[#050807]/35 to-transparent" />
        </div>

        <Container className="relative py-12 sm:py-16 lg:min-h-[32rem] lg:py-20">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/games" className="transition-colors hover:text-white">Games</Link>
            <span>/</span>
            <span className="text-white">League of Legends</span>
          </div>

          <div className="mt-12 max-w-3xl">
            <Badge className="border-[#C89B3C]/22 bg-[#7A5B22]/12 text-[#E7C867]">
              <Sparkles className="mr-2 size-3.5" />
              League of Legends boosting services
            </Badge>
            <h1 className="mt-5 text-balance text-5xl font-bold leading-[0.96] tracking-[-0.065em] text-white sm:text-6xl lg:text-7xl">
              League of Legends
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
              Choose the League of Legends service that matches your goal, configure the real options for that service, and continue through the same secure BoostingPedia order flow.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/65">MOBA</span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/65">Game-specific configuration</span>
              <span className="rounded-full border border-[#C89B3C]/16 bg-[#7A5B22]/10 px-3 py-1.5 text-xs font-medium text-[#E7C867]/80">{game.services.length} services</span>
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
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-[#C89B3C]">Boosting services</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">Choose the League of Legends service that matches your goal.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--muted-foreground)] lg:text-right">Browse the available services and open the configurator that best matches your League of Legends objective.</p>
          </div>

          <div className="-mx-4 mt-9 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-2 md:items-stretch md:overflow-visible md:px-0 md:pb-0 md:snap-none xl:grid-cols-3">
            {game.services.map((service) => <LeagueServiceCard key={service.id} service={service} />)}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/[0.06] bg-white/[0.012] py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <div className="max-w-xl">
              <p className="text-sm font-semibold text-[#C89B3C]">Built for League of Legends</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">League-specific configuration. Same BoostingPedia experience.</h2>
              <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">Move from service discovery to configuration, order creation, payment, and tracking without leaving the visual and operational family used across BoostingPedia.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {storefrontHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-white/[0.08] bg-black/15 p-5 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[#C89B3C]/20 hover:bg-[#0E1411] sm:p-6">
                    <span className="grid size-10 place-items-center rounded-xl border border-[#C89B3C]/18 bg-[#7A5B22]/12 text-[#E7C867]/80"><Icon className="size-4" strokeWidth={1.8} /></span>
                    <h3 className="mt-5 text-sm font-semibold text-[#F4F7F5]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#A0AAA4]">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="flex flex-col gap-6 rounded-[1.8rem] border border-white/[0.08] bg-[#090B0A] p-7 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-[#C89B3C]">Explore more games</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-white sm:text-3xl">Continue through the BoostingPedia launch lineup.</h2>
            </div>
            <Link href="/games" className="inline-flex items-center text-sm font-semibold text-white/70 transition-colors hover:text-white">View all games<ArrowRight className="ml-2 size-4" /></Link>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
