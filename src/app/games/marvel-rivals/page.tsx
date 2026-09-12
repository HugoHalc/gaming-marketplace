import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
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
import { Button } from "@/components/ui/button";
import { marvelRivalsServices } from "@/features/catalog/data/marvel-rivals-foundation";

export const metadata: Metadata = {
  title: "Marvel Rivals",
  description: "Explore Marvel Rivals services in BoostingPedia.",
  alternates: { canonical: "/games/marvel-rivals" },
};

const serviceIcons = [Target, Layers3, Swords, Crosshair, ShieldCheck] as const;

const foundationHighlights = [
  {
    title: "A familiar BoostingPedia experience",
    description:
      "Marvel Rivals follows the same BoostingPedia service-navigation, configuration, and order-summary structure used across the marketplace.",
  },
  {
    title: "Service-specific configuration",
    description:
      "Each service keeps the fields that matter to its goal without introducing unrelated controls or duplicated flows.",
  },
  {
    title: "Purchase path safely gated",
    description:
      "You can explore each service now. Checkout remains unavailable until Marvel Rivals pricing is ready.",
  },
] as const;

export default function MarvelRivalsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050807]">
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
        <div className="hero-grid absolute inset-0 -z-30 opacity-25" />
        <div className="absolute left-1/2 top-[-20rem] -z-20 h-[36rem] w-[66rem] -translate-x-1/2 rounded-full bg-[#7A63F2]/[0.09] blur-[120px]" />
        <div className="absolute right-[-14rem] top-0 -z-20 h-[30rem] w-[30rem] rounded-full bg-[#55D7E8]/[0.045] blur-[115px]" />

        <Container className="relative py-10 sm:py-14 lg:min-h-[31rem] lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(24rem,1.05fr)]">
            <div className="relative z-10 max-w-3xl">
              <div className="flex items-center gap-2 text-xs text-[#A0AAA4] sm:text-sm">
                <Link href="/games" className="inline-flex min-h-10 items-center transition-colors hover:text-white">
                  <ArrowLeft className="mr-2 size-3.5" />
                  Games
                </Link>
                <span>/</span>
                <span className="text-white">Marvel Rivals</span>
              </div>

              <Badge className="mt-5 border-[#A38CFF]/20 bg-[#7A63F2]/[0.07] text-[#C7B9FF] sm:mt-7">
                <Sparkles className="mr-2 size-3.5" />
                Marvel Rivals services
              </Badge>

              <div className="mt-5 h-11 w-40 sm:h-12 sm:w-44">
                <Image
                  src="/game-cards/marvel-rivals-logo.png"
                  alt="Marvel Rivals"
                  width={176}
                  height={48}
                  className="h-full w-full object-contain object-left"
                  priority
                />
              </div>

              <h1 className="mt-5 max-w-2xl text-balance text-4xl font-bold leading-[0.98] tracking-[-0.055em] text-[#F4F7F5] sm:text-5xl lg:text-6xl">
                Competitive services, built for the BoostingPedia experience.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-[#A0AAA4] sm:text-base sm:leading-7">
                Explore Marvel Rivals services with the same premium dark surfaces, navigation rhythm, and clear configuration experience used across BoostingPedia.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/games/marvel-rivals/rank-boost">
                    Preview Rank Boost
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <a href="#services">Explore services</a>
                </Button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[42rem] lg:max-w-none">
              <div className="absolute inset-8 -z-10 rounded-full bg-[#7A63F2]/[0.07] blur-[70px]" />
              <div className="relative aspect-[2048/1143] overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-[#090D0B]">
                <Image
                  src="/game-cards/marvel-rivals.webp"
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1024px) 48vw, 92vw"
                  className="object-cover object-center opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050807]/75 via-transparent to-[#050807]/15" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050807]/32 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-gaming-label text-[10px] uppercase tracking-[0.14em] text-[#A38CFF]/80">Marvel Rivals</p>
                    <p className="mt-1 text-sm font-semibold text-white">Five approved service paths</p>
                  </div>
                  <span className="grid size-9 place-items-center rounded-full border border-[#55D7E8]/15 bg-[#55D7E8]/[0.05] text-[#8BE4EF]">
                    <Crosshair className="size-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="services" className="py-12 sm:py-16 lg:py-20">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-gaming-label text-[10px] uppercase tracking-[0.16em] text-[#A38CFF]/75">Available services</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.045em] text-[#F4F7F5] sm:text-4xl">Choose your Marvel Rivals path.</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[#A0AAA4]">
              Explore every Marvel Rivals service configuration. Pricing and checkout will appear when the services are ready to purchase.
            </p>
          </div>

          <div className="mt-8 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 xl:grid-cols-5">
            {marvelRivalsServices.map((service, index) => {
              const Icon = serviceIcons[index];
              return (
                <Link
                  key={service.slug}
                  href={`/games/marvel-rivals/${service.slug}`}
                  className="group relative flex min-h-[21rem] w-[82vw] max-w-[20rem] shrink-0 snap-start flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#090D0B] p-5 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-[#A38CFF]/[0.22] md:w-auto md:max-w-none md:shrink"
                >
                  <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#7A63F2]/[0.055] to-transparent" />
                  <div className="relative flex items-center justify-between gap-3">
                    <Badge className="border-white/[0.08] bg-black/20 text-white/55">{service.eyebrow}</Badge>
                    <span className="grid size-9 place-items-center rounded-xl border border-[#A38CFF]/[0.12] bg-[#7A63F2]/[0.045] text-[#B6A8FF]">
                      <Icon className="size-4" strokeWidth={1.7} />
                    </span>
                  </div>

                  <div className="relative mt-8">
                    <p className="font-gaming-label text-[10px] uppercase tracking-[0.13em] text-[#55D7E8]/60">{service.summary}</p>
                    <h3 className="font-gaming-value mt-3 text-2xl leading-[1.05] tracking-[-0.045em] text-white">{service.name}</h3>
                    <p className="mt-4 text-sm leading-6 text-[#A0AAA4]">{service.description}</p>
                  </div>

                  <div className="relative mt-auto pt-7">
                    <div className="mb-5 h-px bg-gradient-to-r from-white/[0.10] to-transparent" />
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="font-gaming-label text-[9px] uppercase tracking-[0.12em] text-white/30">Pricing</p>
                        <p className="mt-1 text-xs font-semibold text-white/65">Not available yet</p>
                      </div>
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

      <section className="border-y border-white/[0.06] bg-white/[0.012] py-12 sm:py-16">
        <Container>
          <div className="grid gap-4 lg:grid-cols-3">
            {foundationHighlights.map((item) => (
              <div key={item.title} className="rounded-[1.25rem] border border-white/[0.07] bg-[#090D0B] p-5 sm:p-6">
                <span className="grid size-8 place-items-center rounded-lg border border-[#A38CFF]/[0.12] bg-[#7A63F2]/[0.035] text-[#B6A8FF]">
                  <Check className="size-4" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-[#F4F7F5]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#A0AAA4]">{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
