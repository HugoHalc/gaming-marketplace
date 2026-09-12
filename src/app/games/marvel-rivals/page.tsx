import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Crosshair,
  Gamepad2,
  Layers3,
  ShieldCheck,
  Sparkles,
  Swords,
  Target,
  Trophy,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  marvelRivalsRanks,
  marvelRivalsServices,
  type MarvelRivalsServiceFoundation,
} from "@/features/catalog/data/marvel-rivals-foundation";

export const metadata: Metadata = {
  title: "Marvel Rivals",
  description: "Explore Marvel Rivals boosting services in BoostingPedia.",
  alternates: { canonical: "/games/marvel-rivals" },
};

const highlights = [
  {
    title: "Built around your goal",
    description:
      "Choose the Marvel Rivals service that matches your rank, placements, wins, hero progression, or unrated objective.",
    icon: Layers3,
  },
  {
    title: "Clear configuration",
    description:
      "Set the options that apply to the selected service and review the configuration before checkout.",
    icon: ShieldCheck,
  },
  {
    title: "Dashboard order tracking",
    description:
      "Purchased services stay connected to your BoostingPedia account, order status, and fulfillment workspace.",
    icon: Crosshair,
  },
] as const;

const rankPreviewKeys = ["gold", "diamond", "celestial"] as const;

function rankByKey(key: (typeof rankPreviewKeys)[number]) {
  return marvelRivalsRanks.find((rank) => rank.key === key) ?? marvelRivalsRanks[0];
}

function MarvelServiceMicrovisual({
  service,
}: {
  service: MarvelRivalsServiceFoundation;
}) {
  const base =
    "relative mt-6 flex h-[4.1rem] items-center overflow-hidden text-white/70 transition-colors duration-200 group-hover:text-white/90";

  if (service.slug === "rank-boost") {
    const ranks = rankPreviewKeys.map(rankByKey);

    return (
      <div className={`${base} gap-2.5`} aria-label="Marvel Rivals rank progression preview">
        {ranks.map((rank, index) => (
          <div key={rank.key} className="contents">
            <span className="grid size-9 shrink-0 place-items-center sm:size-10">
              {rank.badge ? (
                <Image
                  src={rank.badge}
                  alt=""
                  width={40}
                  height={40}
                  className="size-9 object-contain opacity-90 drop-shadow-[0_7px_14px_rgba(0,0,0,.55)] transition-[opacity,transform] duration-200 group-hover:scale-[1.04] group-hover:opacity-100 sm:size-10"
                />
              ) : null}
            </span>
            {index < ranks.length - 1 ? (
              <ArrowRight
                className="size-3.5 shrink-0 text-[#BDB2FF]/35"
                strokeWidth={1.6}
              />
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  if (service.slug === "placement-matches") {
    return (
      <div className={`${base} w-full gap-4`} aria-label="Marvel Rivals placements preview">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#A38CFF]/[0.14] bg-[#7A63F2]/[0.04] text-[#CEC5FF]/75">
          <Layers3 className="size-4" strokeWidth={1.7} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-gaming-label text-[10px] uppercase tracking-[0.14em] text-white/35">
            Placement path
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="h-1.5 w-[22%] rounded-full bg-[#A38CFF]/45" />
            <span className="h-1.5 w-[22%] rounded-full bg-[#A38CFF]/22" />
            <span className="h-1.5 flex-1 rounded-full bg-white/[0.07]" />
          </div>
        </div>
      </div>
    );
  }

  if (service.slug === "wins") {
    return (
      <div className={`${base} gap-4`} aria-label="Marvel Rivals competitive wins preview">
        <Trophy className="size-7 text-[#CEC5FF]/70" strokeWidth={1.6} />
        <div className="min-w-0 flex-1">
          <p className="font-gaming-label text-[10px] uppercase tracking-[0.14em] text-white/35">
            Competitive wins
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="h-1.5 flex-1 rounded-full bg-[#A38CFF]/48" />
            <span className="h-1.5 flex-1 rounded-full bg-white/[0.07]" />
            <span className="h-1.5 flex-1 rounded-full bg-white/[0.07]" />
          </div>
        </div>
      </div>
    );
  }

  if (service.slug === "hero-boost") {
    return (
      <div className={`${base} gap-4`} aria-label="Marvel Rivals hero progression preview">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#A38CFF]/[0.14] bg-[#7A63F2]/[0.04] text-[#CEC5FF]/75">
          <Target className="size-4" strokeWidth={1.7} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-gaming-label text-[10px] uppercase tracking-[0.14em] text-white/35">
            Hero progression
          </p>
          <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <span className="h-1.5 rounded-full bg-white/[0.08]" />
            <ArrowRight className="size-3 text-[#BDB2FF]/40" />
            <span className="h-1.5 rounded-full bg-[#A38CFF]/45" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${base} gap-4`} aria-label="Marvel Rivals unrated games preview">
      <Gamepad2 className="size-7 text-[#CEC5FF]/70" strokeWidth={1.6} />
      <div className="min-w-0 flex-1">
        <p className="font-gaming-label text-[10px] uppercase tracking-[0.14em] text-white/35">
          Unrated games
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
          <div className="h-full w-[42%] rounded-full bg-[#A38CFF]/42" />
        </div>
      </div>
    </div>
  );
}

function MarvelServiceCard({
  service,
  index,
}: {
  service: MarvelRivalsServiceFoundation;
  index: number;
}) {
  const serviceIcons = [Target, Layers3, Swords, Crosshair, Gamepad2] as const;
  const Icon = serviceIcons[index] ?? Sparkles;

  return (
    <Link
      href={`/games/marvel-rivals/${service.slug}`}
      className="group relative flex min-h-[22rem] w-[82vw] max-w-[20rem] shrink-0 snap-start flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#090B0A] p-5 transition-[transform,border-color,box-shadow,background-color] duration-300 hover:-translate-y-1 hover:border-[#A38CFF]/[0.18] hover:bg-[#0B0D0B] hover:shadow-[0_28px_70px_-42px_rgba(0,0,0,.95)] sm:p-6 md:h-full md:w-auto md:max-w-none md:shrink md:snap-none"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#7A63F2]/[0.06] via-[#7A63F2]/[0.018] to-transparent" />

      <div className="relative flex items-start justify-between gap-4">
        <Badge className="border-white/[0.08] bg-black/20 text-white/55">
          {service.eyebrow}
        </Badge>
        <span className="grid size-8 place-items-center rounded-lg border border-[#A38CFF]/[0.12] bg-[#7A63F2]/[0.035] text-[#C7B9FF]/65 transition-colors group-hover:border-[#A38CFF]/[0.18] group-hover:text-[#CEC5FF]/90">
          <Icon className="size-3.5" strokeWidth={1.7} />
        </span>
      </div>

      <MarvelServiceMicrovisual service={service} />

      <div className="relative mt-3">
        <h3 className="font-gaming-value max-w-[14rem] text-2xl leading-[1.05] tracking-[-0.045em] text-white">
          {service.name}
        </h3>
        <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
          {service.description}
        </p>
      </div>

      <div className="relative mt-auto pt-5">
        <div className="mb-5 h-px bg-gradient-to-r from-[#A38CFF]/16 via-white/[0.08] to-transparent" />
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-gaming-label text-[9px] uppercase tracking-[0.13em] text-white/30">
              Service
            </p>
            <p className="mt-1 text-xs font-semibold text-white/62">Configure service</p>
          </div>
          <span className="grid size-10 place-items-center rounded-full border border-white/[0.09] bg-white/[0.035] text-white/70 transition-[border-color,background-color,color,transform] group-hover:border-[#A38CFF]/25 group-hover:bg-[#7A63F2]/[0.07] group-hover:text-[#CEC5FF]">
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function MarvelRivalsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050807]">
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/[0.06] bg-[#050807]">
        <div className="hero-grid absolute inset-y-0 left-0 -z-20 w-[62%] opacity-12" />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-full overflow-hidden sm:w-[78%] lg:w-[68%] xl:w-[64%]"
        >
          <Image
            src="/game-heroes/marvel-rivals-storefront.webp"
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 64vw, (min-width: 1024px) 68vw, (min-width: 640px) 78vw, 100vw"
            quality={100}
            className="object-contain object-right opacity-45 sm:opacity-72 lg:opacity-94 xl:opacity-100"
          />
          <div className="absolute inset-0 bg-[#5D45CC]/[0.018]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#050807_0%,rgba(5,8,7,.99)_17%,rgba(5,8,7,.90)_34%,rgba(5,8,7,.58)_52%,rgba(5,8,7,.15)_73%,transparent_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050807] via-[#050807]/35 to-transparent" />
        </div>

        <Container className="relative py-12 sm:py-16 lg:min-h-[32rem] lg:py-20">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/games" className="transition-colors hover:text-white">
              Games
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-white">Marvel Rivals</span>
          </div>

          <div className="mt-12 max-w-3xl">
            <Badge className="border-[#A38CFF]/20 bg-[#7A63F2]/[0.06] text-[#CEC5FF]">
              <Sparkles className="mr-2 size-3.5" />
              Marvel Rivals boosting services
            </Badge>

            <h1 className="mt-5 text-balance text-5xl font-bold leading-[0.96] tracking-[-0.065em] text-white sm:text-6xl lg:text-7xl">
              Marvel Rivals
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
              Choose the Marvel Rivals service that matches your goal, configure the options that apply to it, and continue through the BoostingPedia order flow.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/65">
                Hero shooter
              </span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/65">
                Competitive services
              </span>
              <span className="rounded-full border border-[#A38CFF]/16 bg-[#7A63F2]/[0.05] px-3 py-1.5 text-xs font-medium text-[#CEC5FF]/80">
                {marvelRivalsServices.length} services
              </span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="#services">
                  View services
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/games">
                  <ArrowLeft className="mr-2 size-4" />
                  All games
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section id="services" className="scroll-mt-20 py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-[#BDB2FF]">Boosting services</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">
                Choose the Marvel Rivals service that matches your goal.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--muted-foreground)] lg:text-right">
              Browse the available services and open the configuration that matches your competitive objective.
            </p>
          </div>

          <div className="-mx-4 mt-9 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-2 md:items-stretch md:overflow-visible md:px-0 md:pb-0 md:snap-none xl:grid-cols-3">
            {marvelRivalsServices.map((service, index) => (
              <MarvelServiceCard key={service.slug} service={service} index={index} />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/[0.06] bg-white/[0.012] py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <div className="max-w-xl">
              <p className="text-sm font-semibold text-[#BDB2FF]">Built for Marvel Rivals</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">
                Marvel-specific configuration. Same BoostingPedia experience.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                Move from service discovery to configuration and order tracking through the same visual family used across BoostingPedia.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/[0.08] bg-black/15 p-5 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[#A38CFF]/20 hover:bg-[#0E1411] sm:p-6"
                  >
                    <span className="grid size-10 place-items-center rounded-xl border border-[#A38CFF]/18 bg-[#7A63F2]/[0.05] text-[#CEC5FF]/80">
                      <Icon className="size-4" strokeWidth={1.8} />
                    </span>
                    <h3 className="mt-5 text-sm font-semibold text-[#F4F7F5]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#A0AAA4]">
                      {item.description}
                    </p>
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
              <p className="text-sm font-semibold text-[#BDB2FF]">Explore more games</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-white sm:text-3xl">
                Explore more BoostingPedia game storefronts.
              </h2>
            </div>
            <Link
              href="/games"
              className="inline-flex items-center text-sm font-semibold text-white/70 transition-colors hover:text-white"
            >
              View all games
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
