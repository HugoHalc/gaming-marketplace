import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Crosshair,
  Layers3,
  ShieldCheck,
  Sparkles,
  Swords,
  Target,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { marvelRivalsServices } from "@/features/catalog/data/marvel-rivals-foundation";

export const metadata: Metadata = {
  title: "Marvel Rivals",
  description: "Explore Marvel Rivals boosting services in BoostingPedia.",
  alternates: { canonical: "/games/marvel-rivals" },
};

const serviceIcons = [Target, Layers3, Swords, Crosshair, ShieldCheck] as const;

const highlights = [
  {
    title: "Built around your goal",
    description:
      "Choose the Marvel Rivals service that matches the progression, wins, placements, hero levels or unrated games you need.",
  },
  {
    title: "Clear configuration",
    description:
      "Select the service details that matter to your order and review your configuration before checkout.",
  },
  {
    title: "Order tracking",
    description:
      "Completed purchases are managed from your BoostingPedia account with order status and fulfillment details in one place.",
  },
] as const;

export default function MarvelRivalsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050807]">
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/[0.06] bg-[#050807]">
        <div className="hero-grid absolute inset-y-0 left-0 -z-20 w-[62%] opacity-15" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-full overflow-hidden sm:w-[72%] lg:w-[62%]"
        >
          <Image
            src="/game-cards/marvel-rivals.webp"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 62vw, (min-width: 640px) 72vw, 100vw"
            className="object-cover object-[60%_50%] opacity-40 sm:object-[62%_50%] sm:opacity-65 lg:object-[64%_50%] lg:opacity-85"
          />
          <div className="absolute inset-0 bg-[#5D45CC]/[0.035]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#050807_0%,rgba(5,8,7,.99)_18%,rgba(5,8,7,.88)_36%,rgba(5,8,7,.54)_54%,rgba(5,8,7,.10)_74%,transparent_100%)]" />
        </div>

        <Container className="relative py-12 sm:py-16 lg:min-h-[31rem] lg:py-20">
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

            <div className="mt-5 h-10 w-40 sm:h-11 sm:w-44">
              <Image
                src="/game-cards/marvel-rivals-logo.png"
                alt="Marvel Rivals"
                width={176}
                height={44}
                className="h-full w-full object-contain object-left"
                priority
              />
            </div>

            <h1 className="mt-5 text-balance text-5xl font-bold leading-[0.96] tracking-[-0.065em] text-white sm:text-6xl lg:text-7xl">
              Marvel Rivals
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
              Choose the service that matches your competitive goal, configure the details you need, and keep the full order flow inside BoostingPedia.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/65">
                Hero shooter
              </span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/65">
                Competitive services
              </span>
              <span className="rounded-full border border-[#A38CFF]/[0.15] bg-[#7A63F2]/[0.04] px-3 py-1.5 text-xs font-medium text-[#CEC5FF]/80">
                {marvelRivalsServices.length} services
              </span>
            </div>

            <Link
              href="/games/marvel-rivals/rank-boost"
              className="mt-8 inline-flex min-h-11 items-center rounded-xl border border-[#A38CFF]/20 bg-[#7A63F2]/[0.08] px-4 text-sm font-semibold text-white transition-colors hover:border-[#A38CFF]/35 hover:bg-[#7A63F2]/[0.12]"
            >
              Configure Rank Boost
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
        </Container>
      </section>

      <section id="services" className="py-14 sm:py-18 lg:py-20">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-[#BDB2FF]/65">
                Marvel Rivals services
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">
                Choose the service that fits your goal.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--muted-foreground)] lg:text-right">
              Open a service to configure the options that apply to your order.
            </p>
          </div>

          <div className="mt-8 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 xl:grid-cols-3">
            {marvelRivalsServices.map((service, index) => {
              const Icon = serviceIcons[index];
              return (
                <Link
                  key={service.slug}
                  href={`/games/marvel-rivals/${service.slug}`}
                  className="group relative flex min-h-[22rem] w-[82vw] max-w-[20rem] shrink-0 snap-start flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#090B0A] p-5 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-[#A38CFF]/[0.18] hover:shadow-[0_28px_70px_-42px_rgba(0,0,0,.95)] sm:p-6 md:h-full md:w-auto md:max-w-none md:shrink md:snap-none"
                >
                  <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#7A63F2]/[0.05] to-transparent" />
                  <div className="relative flex items-start justify-between gap-4">
                    <Badge className="border-white/[0.08] bg-black/20 text-white/55">
                      {service.eyebrow}
                    </Badge>
                    <span className="grid size-10 place-items-center rounded-xl border border-[#A38CFF]/[0.13] bg-[#7A63F2]/[0.04] text-[#C7B9FF]/85">
                      <Icon className="size-4" strokeWidth={1.8} />
                    </span>
                  </div>

                  <div className="relative mt-8">
                    <p className="font-gaming-label text-[10px] uppercase tracking-[0.13em] text-[#8BE4EF]/55">
                      {service.summary}
                    </p>
                    <h3 className="font-gaming-value mt-3 max-w-[15rem] text-2xl leading-[1.05] tracking-[-0.045em] text-white">
                      {service.name}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                      {service.description}
                    </p>
                  </div>

                  <div className="relative mt-auto pt-8">
                    <div className="mb-5 h-px bg-gradient-to-r from-white/[0.10] to-transparent" />
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-semibold text-white/60">Configure service</span>
                      <span className="grid size-10 place-items-center rounded-full border border-white/[0.09] bg-white/[0.035] text-white/70 transition-colors group-hover:border-[#39E56F]/35 group-hover:bg-[#39E56F]/[0.08] group-hover:text-[#82F5A4]">
                        <ArrowRight className="size-4" />
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
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <div className="max-w-xl">
              <p className="text-sm font-semibold text-[#BDB2FF]">Built for Marvel Rivals</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">
                Configure the service around the way you want to progress.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                Choose your service, set the relevant progression or match goal, and review the selected options in one consistent BoostingPedia flow.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item, index) => {
                const icons = [Layers3, ShieldCheck, Crosshair] as const;
                const Icon = icons[index];
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/[0.08] bg-black/15 p-5 transition-[border-color,background-color] duration-200 ease-out hover:border-[#A38CFF]/[0.16] hover:bg-[#0E1411] sm:p-6"
                  >
                    <span className="grid size-10 place-items-center rounded-xl border border-[#A38CFF]/[0.16] bg-[#7A63F2]/[0.04] text-[#C7B9FF]/80">
                      <Icon className="size-4" strokeWidth={1.8} />
                    </span>
                    <h3 className="mt-5 text-sm font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
