import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { launchGames } from "@/features/catalog/data/launch-games";
import { boosterPlaceholders } from "@/features/marketing/booster-placeholders";
import {
  faqs,
  howItWorks,
  testimonials,
  trustFeatures,
} from "@/features/marketing/content";

const gameVisual = {
  emerald: "from-emerald-500/[0.18] via-emerald-500/[0.045] to-transparent border-emerald-300/15",
  rose: "from-rose-500/[0.20] via-rose-500/[0.045] to-transparent border-rose-300/15",
  violet: "from-violet-500/[0.20] via-violet-500/[0.045] to-transparent border-violet-300/15",
  cyan: "from-cyan-500/[0.18] via-cyan-500/[0.045] to-transparent border-cyan-300/15",
  amber: "from-amber-500/[0.18] via-amber-500/[0.045] to-transparent border-amber-300/15",
  blue: "from-blue-500/[0.22] via-blue-500/[0.05] to-transparent border-blue-300/15",
} as const;

const homeGameCardAssets = {
  "rocket-league": "/game-cards/rocket-league.webp",
  "league-of-legends": "/game-cards/league-of-legends.webp",
  valorant: "/game-cards/valorant.webp",
  "marvel-rivals": "/game-cards/marvel-rivals.webp",
  "overwatch-2": "/game-cards/overwatch.webp",
  "battlefield-6": "/game-cards/battlefield-6.webp",
  "rainbow-six-siege": "/game-cards/rainbow-six-siege.webp",
} as const;

const howItWorksIcons = [Sparkles, Check, ShieldCheck] as const;

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "center" | "left";
}) {
  const classes = align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl";
  return (
    <div className={classes}>
      <p className="font-gaming-label text-sm text-[#A0AAA4]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)] sm:text-base">
        {description}
      </p>
    </div>
  );
}

function BoosterAvatar({ initials }: { initials: string }) {
  return (
    <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/[0.09] bg-[radial-gradient(circle_at_30%_20%,rgba(74,222,128,.18),transparent_40%),#111512] text-lg font-black tracking-[-0.04em] text-white">
      <span className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent" />
      <span className="relative">{initials}</span>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <style>{`
        @keyframes boostingpediaHeroFloat {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(-7px, -5px, 0); }
        }

        @keyframes boostingpediaHeroBreathe {
          0%, 100% { filter: brightness(1) saturate(1); }
          50% { filter: brightness(1.025) saturate(1.02); }
        }

        @keyframes boostingpediaHeroGlow {
          0%, 100% { opacity: .38; transform: scale(.97); }
          50% { opacity: .64; transform: scale(1.03); }
        }

        .hero-art-float {
          animation: boostingpediaHeroFloat 10s ease-in-out infinite;
          will-change: transform;
        }

        .hero-art-breathe {
          animation: boostingpediaHeroBreathe 7.5s ease-in-out infinite;
          will-change: filter;
        }

        .hero-art-glow {
          animation: boostingpediaHeroGlow 7s ease-in-out infinite;
          will-change: opacity, transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-art-float,
          .hero-art-breathe,
          .hero-art-glow {
            animation: none !important;
            transform: none !important;
            filter: none !important;
          }
        }
      `}</style>
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-[#FFFFFF14] bg-[#050807]">
        <div className="hero-grid absolute inset-0 -z-20 opacity-30" />
        <div className="absolute right-[6%] top-[-12rem] -z-10 h-[31rem] w-[42rem] rounded-full bg-[#39E56F]/[0.07] blur-[115px]" />

        <div
          aria-hidden="true"
          className="hero-art-float pointer-events-none absolute inset-y-0 right-[-5vw] -z-10 w-[78vw] sm:right-[-4vw] sm:w-[72vw] lg:right-[-3vw] lg:w-[66vw] xl:right-[-2vw] xl:w-[63vw]"
        >
          <Image
            src="/brand/boostingpedia-hero-art.webp"
            alt=""
            fill
            priority
            sizes="(min-width:1280px) 63vw, (min-width:1024px) 66vw, (min-width:640px) 72vw, 78vw"
            className="hero-art-breathe object-cover object-[70%_53%] sm:object-[71%_53%] lg:object-[69%_53%] xl:object-[68%_53%] [mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,.10)_9%,rgba(0,0,0,.34)_20%,rgba(0,0,0,.66)_34%,rgba(0,0,0,.90)_46%,black_56%,black_100%)] [-webkit-mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,.10)_9%,rgba(0,0,0,.34)_20%,rgba(0,0,0,.66)_34%,rgba(0,0,0,.90)_46%,black_56%,black_100%)]"
          />
          <div className="hero-art-glow absolute bottom-[7%] right-[11%] h-[24%] w-[34%] rounded-full bg-[#39E56F]/[0.05] blur-[64px]" />
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 -z-[5] w-[74%] bg-[linear-gradient(90deg,#050807_0%,rgba(5,8,7,.98)_44%,rgba(5,8,7,.78)_66%,transparent_100%)] sm:w-[68%] lg:w-[57%]" />
        <Container className="grid min-h-[470px] items-center gap-10 py-14 lg:grid-cols-[1.04fr_.96fr] lg:py-16">
          <div className="max-w-3xl">
            <Badge className="mb-5 border-[#39E56F]/20 bg-[#39E56F]/[0.06] text-[#82F5A4]">
              <span className="mr-2 size-1.5 rounded-full bg-[#3DD9EB]" />
              BoostingPedia gaming marketplace
            </Badge>

            <h1 className="text-balance text-5xl font-bold leading-[0.96] tracking-[-0.065em] text-[#F4F7F5] sm:text-6xl lg:text-[4.5rem]">
              Professional boosting built around your game.
            </h1>

            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-[#A0AAA4] sm:text-lg">
              Choose your title, open its dedicated storefront, and configure the service around your competitive goal.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="min-w-44 rounded-xl border-0 bg-[#39E56F] font-semibold text-[#050807] shadow-[0_8px_24px_-16px_rgba(57,229,111,.60)] transition-[background-color,box-shadow,color] duration-200 hover:bg-[#20C95A] hover:text-[#050807] hover:shadow-[0_10px_26px_-16px_rgba(57,229,111,.68)] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none">
                <Link href="#games">
                  Choose your game
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="rounded-xl border border-[#FFFFFF14] bg-[#131B17] font-semibold text-[#F4F7F5] shadow-none transition-[background-color,border-color,color] duration-200 hover:border-white/[0.16] hover:bg-[#18211C] hover:text-white disabled:cursor-not-allowed disabled:opacity-45">
                <Link href="#boosters">Meet our boosters</Link>
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--muted-foreground)] sm:text-sm">
              {["Server-calculated pricing", "Game-specific storefronts", "Order tracking"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded-full border border-[#FFFFFF14] bg-[#090D0B] text-[#A0AAA4]">
                    <Check className="size-3" />
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative hidden min-h-[340px] lg:block" aria-hidden="true" />
        </Container>
      </section>

      <section id="boosters" className="scroll-mt-24 py-8 sm:py-10">
        <Container>
          <div className="flex items-center justify-between gap-5">
            <div>
              <p className="font-gaming-label text-sm text-[#A0AAA4]">Boosters</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.045em] text-[#F4F7F5] sm:text-3xl">
                Meet the players behind the services.
              </h2>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                aria-label="Previous boosters"
                className="grid size-10 place-items-center rounded-full border border-[#FFFFFF14] bg-[#090D0B] text-[#A0AAA4] shadow-none transition-[background-color,border-color,color] duration-200 hover:border-white/[0.16] hover:bg-[#131B17] hover:text-[#F4F7F5] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="size-4 rotate-180" />
              </button>
              <button
                type="button"
                aria-label="Next boosters"
                className="grid size-10 place-items-center rounded-full border border-[#FFFFFF14] bg-[#090D0B] text-[#A0AAA4] shadow-none transition-[background-color,border-color,color] duration-200 hover:border-white/[0.16] hover:bg-[#131B17] hover:text-[#F4F7F5] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="size-4" />
              </button>
              <Button asChild variant="secondary" className="ml-1 rounded-xl border border-[#FFFFFF14] bg-[#131B17] font-semibold text-[#F4F7F5] shadow-none transition-[background-color,border-color,color] duration-200 hover:border-white/[0.16] hover:bg-[#18211C] hover:text-white disabled:cursor-not-allowed disabled:opacity-45">
                <Link href="/boosters">View all</Link>
              </Button>
            </div>
          </div>

          <div className="mt-6 -mx-2 overflow-x-auto px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-3">
              {boosterPlaceholders.map((booster) => (
                <article
                  key={booster.id}
                  className="group relative w-[13.8rem] shrink-0 overflow-hidden rounded-[1.35rem] border border-[#FFFFFF14] bg-[#090D0B] p-4 transition-[transform,border-color,background-color] duration-300 hover:-translate-y-1 hover:border-white/[0.15] hover:bg-[#0E1411]"
                >
                  <div className="absolute left-4 top-4 size-1.5 rounded-full bg-[#39E56F]" />
                  <div className="absolute right-4 top-4 font-gaming-label text-[9px] uppercase tracking-[0.12em] text-white/25">
                    {booster.primaryGame}
                  </div>

                  <div className="pt-4">
                    <div className="mx-auto grid size-20 place-items-center rounded-full border border-[#FFFFFF14] bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,.055),transparent_42%),#0E1411] shadow-[inset_0_0_0_1px_rgba(255,255,255,.015)]">
                      <span className="font-gaming-value text-xl text-[#F4F7F5]">
                        {booster.initials}
                      </span>
                    </div>

                    <div className="mt-4 text-center">
                      <h3 className="font-gaming-value truncate text-sm text-[#F4F7F5]">
                        {booster.nickname}
                      </h3>
                      <p className="mt-1 truncate text-[10px] text-[#667069]">
                        {booster.rankLabel}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-full border border-[#FFFFFF14] bg-[#050807]/80 px-3 py-1.5 text-center">
                        <p className="font-gaming-label text-[9px] uppercase tracking-[0.1em] text-[#F4F7F5]">
                          4.9
                        </p>
                        <p className="mt-0.5 text-[9px] text-[#667069]">Rating</p>
                      </div>
                      <div className="rounded-full border border-[#FFFFFF14] bg-[#050807]/80 px-3 py-1.5 text-center">
                        <p className="font-gaming-label text-[9px] uppercase tracking-[0.1em] text-[#A0AAA4]">
                          {booster.specialty}
                        </p>
                        <p className="mt-0.5 text-[9px] text-[#667069]">Specialty</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-4 flex sm:hidden">
            <Button asChild variant="secondary" className="w-full rounded-xl border border-[#FFFFFF14] bg-[#131B17] font-semibold text-[#F4F7F5] shadow-none transition-[background-color,border-color,color] duration-200 hover:border-white/[0.16] hover:bg-[#18211C] hover:text-white disabled:cursor-not-allowed disabled:opacity-45">
              <Link href="/boosters">View all boosters</Link>
            </Button>
          </div>
        </Container>
      </section>

      <section id="games" className="scroll-mt-24 pb-16 pt-8 sm:pb-20 lg:pb-24">
        <Container>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="font-gaming-label text-sm text-[#A0AAA4]">Choose your game</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl lg:text-5xl">
                Jump straight into a game storefront.
              </h2>
            </div>
            <Link
              href="/games"
              className="inline-flex items-center text-sm font-semibold bg-transparent text-[#A0AAA4] shadow-none transition-colors duration-200 hover:bg-transparent hover:text-[#F4F7F5]"
            >
              View all games
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {launchGames.map((game) => {
              const imageSrc =
                homeGameCardAssets[game.slug as keyof typeof homeGameCardAssets];

              const cardVisual = (
                <>
                  <div className="absolute inset-0 bg-[#090D0B]">
                    <Image
                      src={imageSrc}
                      alt=""
                      fill
                      priority={game.slug === "rocket-league"}
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className={`object-cover object-center ${
                        game.slug === "rocket-league" ||
                        game.slug === "battlefield-6" ||
                        game.slug === "rainbow-six-siege"
                          ? "scale-[1.004]"
                          : ""
                      }`}
                    />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-[#050807]/78 via-[#050807]/05 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#050807]/38 via-transparent to-transparent" />

                  {game.slug === "marvel-rivals" ? (
                    <>
                      <div className="absolute left-5 top-5 z-10 h-9 w-32">
                        <Image
                          src="/game-cards/marvel-rivals-logo.png"
                          alt="Marvel Rivals"
                          fill
                          sizes="144px"
                          className="object-contain object-left"
                        />
                      </div>
                      <div className="pointer-events-none absolute left-5 top-[54%] z-[1] -translate-y-1/2 select-none font-gaming-value text-[clamp(1.6rem,3.2vw,3.1rem)] uppercase tracking-[-0.04em] text-[#F4F7F5]/[0.035]">
                        Marvel Rivals
                      </div>
                    </>
                  ) : null}

                  <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between p-5">
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-full border shadow-none transition-[border-color,background-color,color,opacity] duration-200 ${
                        game.ready
                          ? "border-[#FFFFFF14] bg-[#090D0B] text-[#A0AAA4] group-hover:border-[#39E56F]/35 group-hover:bg-[#39E56F]/[0.09] group-hover:text-[#82F5A4]"
                          : "border-[#FFFFFF14] bg-[#090D0B] text-[#667069] opacity-45"
                      }`}
                    >
                      <ArrowRight className="size-4" />
                    </span>

                    <span
                      className={`font-gaming-label rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.1em] transition-colors duration-200 ${
                        game.ready
                          ? "border-[#39E56F]/40 bg-[#39E56F]/[0.08] text-[#82F5A4]"
                          : "border-[#FFFFFF14] bg-[#090D0B] text-[#A0AAA4] opacity-60"
                      }`}
                    >
                      {game.ready ? "Available" : "In development"}
                    </span>
                  </div>
                </>
              );

              return game.ready ? (
                <Link
                  key={game.slug}
                  href={`/games/${game.slug}`}
                  className="group relative aspect-[2048/1143] overflow-hidden rounded-[1.4rem] border border-[#FFFFFF14] bg-[#0E1411] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-[0_24px_55px_-38px_rgba(0,0,0,.95)]"
                >
                  {cardVisual}
                </Link>
              ) : (
                <div
                  key={game.slug}
                  aria-label={`${game.displayName} is in development`}
                  className="relative aspect-[2048/1143] cursor-default overflow-hidden rounded-[1.4rem] border border-[#FFFFFF14] bg-[#0E1411] opacity-80"
                >
                  {cardVisual}
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-24 border-y border-white/[0.06] bg-[linear-gradient(180deg,rgba(9,13,11,.88),rgba(5,8,7,.96))] py-20 sm:py-24"
      >
        <Container>
          <div className="grid gap-12 lg:grid-cols-[.78fr_1.22fr] lg:items-start">
            <SectionHeading
              eyebrow="How it works"
              title="A simple path from game to order."
              description="The visual hierarchy starts with the game, then moves into the service and its configuration."
              align="left"
            />

            <div className="relative">
              <div className="absolute bottom-8 left-[2rem] top-8 w-px bg-gradient-to-b from-transparent via-white/[0.09] to-transparent lg:hidden" />
              <div className="absolute left-[8%] right-[8%] top-12 hidden h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent lg:block" />

              <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
                {howItWorks.map((item, index) => {
                  const Icon = howItWorksIcons[index] ?? Sparkles;

                  return (
                    <article
                      key={item.step}
                      className="group relative overflow-hidden rounded-[1.5rem] border border-[#FFFFFF14] bg-[#0E1411]/88 p-6 transition-[transform,border-color,background-color] duration-200 hover:-translate-y-1 hover:border-white/[0.16] hover:bg-[#131B17]"
                    >
                      <div className="absolute left-[1.72rem] top-8 h-3 w-3 rounded-full border border-[#FFFFFF14] bg-[#A0AAA4]/[0.10] lg:left-1/2 lg:-translate-x-1/2" />

                      <div className="flex items-start justify-between gap-4 lg:pt-6">
                        <span className="font-gaming-value text-5xl leading-none tracking-[-0.06em] text-[#82F5A4]/85">
                          {item.step}
                        </span>

                        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-[#FFFFFF14] bg-[#090D0B] text-[#A0AAA4] transition-colors duration-200 group-hover:border-white/[0.16] group-hover:text-[#F4F7F5]">
                          <Icon className="size-4" />
                        </span>
                      </div>

                      <div className="mt-5">
                        <h3 className="text-lg font-semibold text-[#F4F7F5]">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-[#A0AAA4]">{item.description}</p>
                      </div>

                      <div className="mt-6 flex items-center gap-2">
                        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
                        <span className="font-gaming-label text-[10px] uppercase tracking-[0.12em] text-[#667069]">
                          Progress
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Marketplace foundation"
            title="Designed to stay consistent as the catalog grows."
            description="The structure is ready for custom art, game-specific service catalogs, and future content without rebuilding the visual system."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trustFeatures.slice(0, 6).map(({ icon: Icon, title, description }, index) => {
              const stepLabel = `SYS-0${index + 1}`;
              const accentWidth = ["w-16", "w-20", "w-12", "w-24", "w-14", "w-16"][index] ?? "w-16";
              const isAccent = index === 1 || index === 4;

              return (
                <article
                  key={title}
                  className="group relative overflow-hidden rounded-[1.55rem] border border-[#FFFFFF14] bg-[linear-gradient(180deg,rgba(14,20,17,.92),rgba(9,13,11,.98))] p-6 transition-[transform,border-color,background-color] duration-200 hover:-translate-y-1 hover:border-white/[0.16] hover:bg-[#131B17]"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                  <div className="pointer-events-none absolute right-5 top-5 flex items-center gap-1.5 opacity-80">
                    <span className={`h-1.5 w-1.5 rounded-full ${isAccent ? "bg-[#39E56F]/55" : "bg-white/20"}`} />
                    <span className={`${accentWidth} h-px bg-gradient-to-r ${isAccent ? "from-[#39E56F]/24" : "from-white/[0.10]"} to-transparent`} />
                  </div>
                  <div className="pointer-events-none absolute bottom-5 left-6 flex items-center gap-1.5 opacity-75">
                    <span className="h-px w-8 bg-white/[0.08]" />
                    <span className={`h-1.5 w-1.5 rounded-full border ${isAccent ? "border-[#39E56F]/30 bg-[#39E56F]/[0.08]" : "border-[#FFFFFF14] bg-white/[0.04]"}`} />
                    <span className={`h-px w-10 bg-gradient-to-r ${isAccent ? "from-[#39E56F]/14" : "from-white/[0.08]"} to-transparent`} />
                  </div>

                  <div className="relative flex items-start justify-between gap-4">
                    <div className={`grid size-11 place-items-center rounded-[0.95rem] border border-[#FFFFFF14] ${isAccent ? "bg-[#39E56F]/[0.045] text-[#82F5A4]" : "bg-[#090D0B] text-[#A0AAA4]"}`}>
                      <Icon className="size-4.5" />
                    </div>

                    <div className="text-right">
                      <p className="font-gaming-label text-[10px] uppercase tracking-[0.14em] text-[#667069]">
                        Foundation
                      </p>
                      <p className={`font-gaming-label mt-1 text-[10px] uppercase tracking-[0.14em] ${isAccent ? "text-[#82F5A4]" : "text-[#667069]"}`}>
                        {stepLabel}
                      </p>
                    </div>
                  </div>

                  <div className="relative mt-6">
                    <h3 className="text-lg font-semibold text-[#F4F7F5]">{title}</h3>
                    <p className="mt-2 max-w-[32ch] text-sm leading-6 text-[#A0AAA4]">{description}</p>
                  </div>

                  <div className="relative mt-6 flex items-center justify-between gap-4 border-t border-white/[0.06] pt-4">
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${isAccent ? "bg-[#39E56F]/55" : "bg-white/20"}`} />
                      <span className="font-gaming-label text-[10px] uppercase tracking-[0.12em] text-[#667069]">
                        Active module
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-80">
                      <span className="h-px w-4 bg-white/[0.08]" />
                      <span className={`h-px w-6 ${isAccent ? "bg-[#39E56F]/16" : "bg-white/[0.08]"}`} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/[0.06] bg-black/10 py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Customer experience"
            title="Built to feel clear at every step."
            description="Illustrative launch content can be replaced later without affecting the structure."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="p-6 sm:p-7">
                <div className="flex gap-1 text-amber-300" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="size-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-6 text-[15px] leading-7 text-white/90">
                  “{testimonial.quote}”
                </blockquote>
                <div className="mt-7 border-t border-white/[0.06] pt-5">
                  <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">{testimonial.detail}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section id="faq" className="scroll-mt-24 py-20 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
          <SectionHeading
            eyebrow="FAQ"
            title="Straight answers before checkout."
            description="This section remains ready for final policy and launch copy."
            align="left"
          />
          <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {faqs.map((item) => (
              <details key={item.question} className="group py-5 open:pb-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left font-semibold text-white marker:hidden">
                  {item.question}
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-white/[0.08] text-[var(--muted-foreground)] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-3xl pr-10 text-sm leading-7 text-[var(--muted-foreground)]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-20 sm:pb-24">
        <Container>
          <div className="relative overflow-hidden rounded-[2rem] border border-[#FFFFFF14] bg-[#090D0B] p-8 sm:p-10 lg:p-12">
            <div className="absolute right-[-5rem] top-[-7rem] size-72 rounded-full bg-[#39E56F]/[0.045] blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-3xl">
                <Badge className="border-white/10 bg-white/[0.05] text-white/75">
                  <Sparkles className="mr-2 size-3.5" />
                  BoostingPedia
                </Badge>
                <h2 className="mt-5 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">
                  Start with the game. The rest becomes simpler.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)] sm:text-base">
                  Explore the launch lineup and enter a dedicated game storefront before choosing a service.
                </p>
              </div>
              <Button asChild size="lg" className="rounded-xl border-0 bg-[#39E56F] font-semibold text-[#050807] shadow-[0_8px_24px_-16px_rgba(57,229,111,.56)] transition-[background-color,box-shadow,color] duration-200 hover:bg-[#20C95A] hover:text-[#050807] hover:shadow-[0_10px_26px_-16px_rgba(57,229,111,.62)]">
                <Link href="/games">
                  Browse games
                  <ChevronRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
