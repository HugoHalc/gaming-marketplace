import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { HeroHoldLoopVideo } from "@/components/marketing/hero-hold-loop-video";
import { HowItWorksShowcase } from "@/components/marketing/how-it-works-showcase";
import { Button } from "@/components/ui/button";
import { launchGames } from "@/features/catalog/data/launch-games";
import { rocketLeagueBoosters } from "@/features/boosters/data/rocket-league-boosters";

export const metadata: Metadata = {
  title: "Editorial Homepage Test | BoostingPedia",
  description: "Temporary editorial visual test for the BoostingPedia homepage.",
  robots: { index: false, follow: false },
};

const homeGameCardAssets = {
  "rocket-league": "/game-cards/rocket-league.webp",
  "league-of-legends": "/game-cards/league-of-legends.webp",
  valorant: "/game-cards/valorant.webp",
  "marvel-rivals": "/game-cards/marvel-rivals.webp",
  "overwatch-2": "/game-cards/overwatch.webp",
  "battlefield-6": "/game-cards/battlefield-6.webp",
  "rainbow-six-siege": "/game-cards/rainbow-six-siege.webp",
} as const;

const trustpilot = {
  brand: "Trustpilot",
  ratingLabel: "Excellent",
  score: 4.3,
  reviewCount: 9,
  profileUrl: "https://www.trustpilot.com/review/boostingpedia.com",
} as const;

function EditorialHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#FFFFFF14] bg-[#050807]/94 backdrop-blur-xl supports-[backdrop-filter]:bg-[#050807]/88">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-7">
            <Logo />
            <Link
              href="/games"
              className="hidden h-10 items-center rounded-xl border border-[#FFFFFF14] bg-[#131B17] px-4 text-sm font-semibold text-[#F4F7F5] transition-colors hover:border-white/[0.16] hover:bg-[#18211C] lg:inline-flex"
            >
              Select your game
            </Link>
          </div>

          <nav className="hidden items-center gap-8 xl:flex" aria-label="Editorial test navigation">
            <Link href="#games" className="text-sm font-medium text-[#A0AAA4] transition-colors hover:text-[#F4F7F5]">
              Games
            </Link>
            <Link href="#boosters" className="text-sm font-medium text-[#A0AAA4] transition-colors hover:text-[#F4F7F5]">
              Boosters
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-[#A0AAA4] transition-colors hover:text-[#F4F7F5]">
              How it works
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-xl px-3 py-2 text-sm font-medium text-[#A0AAA4] transition-colors hover:bg-[#131B17] hover:text-[#F4F7F5] sm:inline-flex"
            >
              Sign in
            </Link>
            <Button asChild size="sm" className="rounded-xl border-0 bg-[#39E56F] font-semibold text-[#050807] hover:bg-[#20C95A] hover:text-[#050807]">
              <Link href="/games">Choose a game</Link>
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}

function TrustRow() {
  return (
    <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/[0.07] pt-5 text-xs text-[#A0AAA4]">
      <a
        href={trustpilot.profileUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2.5 transition-colors hover:text-[#F4F7F5]"
      >
        <span className="font-gaming-value text-base font-bold text-[#F4F7F5]">{trustpilot.score.toFixed(1)} / 5</span>
        <span>{trustpilot.ratingLabel} on {trustpilot.brand}</span>
        <span className="text-[#667069]">·</span>
        <span>{trustpilot.reviewCount} reviews</span>
      </a>

      <span className="hidden h-4 w-px bg-white/[0.08] sm:block" />
      <span className="inline-flex items-center gap-1.5">
        <ShieldCheck className="size-3.5 text-[#82F5A4]" />
        Secure checkout
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Check className="size-3.5 text-[#82F5A4]" />
        Server-validated pricing
      </span>
    </div>
  );
}

function GameCatalog() {
  return (
    <section id="games" className="scroll-mt-24 border-y border-white/[0.06] bg-[#090D0B]/55 py-20 sm:py-24">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-gaming-label text-[11px] uppercase tracking-[0.18em] text-[#82F5A4]">Current catalog</p>
            <h2 className="font-gaming-value mt-3 text-4xl font-bold uppercase leading-[0.92] tracking-[-0.055em] text-[#F4F7F5] sm:text-5xl lg:text-6xl">
              Choose your game
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#A0AAA4] lg:text-right">
            Enter a dedicated game storefront, choose the service you need, and configure the order around your goal.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {launchGames.map((game, index) => {
            const imageSrc = homeGameCardAssets[game.slug as keyof typeof homeGameCardAssets];
            const card = (
              <>
                <Image
                  src={imageSrc}
                  alt=""
                  fill
                  priority={index < 2}
                  sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover object-center transition-transform duration-500 motion-reduce:transition-none lg:group-hover:scale-[1.025]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,7,.05)_20%,rgba(5,8,7,.86)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <div className="flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-gaming-label text-[9px] uppercase tracking-[0.15em] text-[#A0AAA4]">
                          {game.category}
                        </span>
                        <span className={`rounded-full border px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] ${
                          game.ready
                            ? "border-[#39E56F]/25 bg-[#39E56F]/[0.055] text-[#82F5A4]"
                            : "border-white/[0.10] bg-black/15 text-[#667069]"
                        }`}>
                          {game.ready ? "Available" : "In development"}
                        </span>
                      </div>
                      <h3 className="font-gaming-value mt-2 truncate text-2xl font-bold uppercase tracking-[-0.035em] text-[#F4F7F5]">
                        {game.displayName}
                      </h3>
                    </div>
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/[0.10] bg-[#050807]/70 text-[#A0AAA4] backdrop-blur-sm transition-colors group-hover:border-[#39E56F]/25 group-hover:text-[#82F5A4]">
                      <ArrowRight className="size-4" />
                    </span>
                  </div>
                </div>
                <span className="pointer-events-none absolute left-4 top-4 h-6 w-6 border-l border-t border-white/[0.14]" />
                <span className="pointer-events-none absolute bottom-4 right-4 h-6 w-6 border-b border-r border-white/[0.10]" />
              </>
            );

            return game.ready ? (
              <Link
                key={game.slug}
                href={`/games/${game.slug}`}
                className="group relative aspect-[16/9] overflow-hidden rounded-[1.3rem] border border-[#FFFFFF14] bg-[#0E1411] transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/[0.16] motion-reduce:transition-none"
              >
                {card}
              </Link>
            ) : (
              <div
                key={game.slug}
                className="group relative aspect-[16/9] cursor-default overflow-hidden rounded-[1.3rem] border border-[#FFFFFF14] bg-[#0E1411] opacity-80"
              >
                {card}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function BoosterSection() {
  return (
    <section id="boosters" className="scroll-mt-24 py-20 sm:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
          <div>
            <p className="font-gaming-label text-[11px] uppercase tracking-[0.18em] text-[#82F5A4]">Verified boosters</p>
            <h2 className="font-gaming-value mt-3 text-4xl font-bold uppercase leading-[0.94] tracking-[-0.055em] text-[#F4F7F5] sm:text-5xl">
              Meet the players<br />behind the services.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#A0AAA4]">
              Real profiles from the current Rocket League booster roster, presented with the information already available in BoostingPedia.
            </p>
            <Link href="/boosters/rocket-league" className="mt-6 inline-flex items-center text-sm font-semibold text-[#A0AAA4] transition-colors hover:text-[#F4F7F5]">
              View Rocket League boosters
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {rocketLeagueBoosters.map((booster) => (
              <Link
                key={booster.slug}
                href="/boosters/rocket-league"
                className="group relative overflow-hidden rounded-[1.35rem] border border-[#FFFFFF14] bg-[#0E1411] transition-[transform,border-color,background-color] duration-300 hover:-translate-y-1 hover:border-white/[0.15] hover:bg-[#131B17] motion-reduce:transition-none"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#090D0B]">
                  <Image
                    src={booster.image}
                    alt={`${booster.nickname} Rocket League booster`}
                    fill
                    sizes="(min-width: 1024px) 32vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover object-center transition-transform duration-500 motion-reduce:transition-none lg:group-hover:scale-[1.025]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050807]/90 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="font-gaming-label text-[9px] uppercase tracking-[0.14em] text-[#A0AAA4]">Rocket League</p>
                    <div className="mt-1 flex items-end justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-gaming-value truncate text-2xl font-bold uppercase tracking-[-0.035em] text-[#F4F7F5]">{booster.nickname}</h3>
                        <p className="mt-1 text-xs font-semibold text-[#82F5A4]">{booster.rank}</p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#F4F7F5]">
                        <Star className="size-3.5 fill-[#F4F7F5] text-[#F4F7F5]" />
                        {booster.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 divide-x divide-white/[0.06] border-t border-white/[0.06]">
                  <div className="p-4">
                    <p className="font-gaming-label text-[8px] uppercase tracking-[0.12em] text-[#667069]">Experience</p>
                    <p className="mt-1.5 text-[11px] font-semibold text-[#F4F7F5]">{booster.experience}</p>
                  </div>
                  <div className="p-4">
                    <p className="font-gaming-label text-[8px] uppercase tracking-[0.12em] text-[#667069]">Region</p>
                    <p className="mt-1.5 truncate text-[11px] font-semibold text-[#F4F7F5]">{booster.region}</p>
                  </div>
                  <div className="p-4">
                    <p className="font-gaming-label text-[8px] uppercase tracking-[0.12em] text-[#667069]">Languages</p>
                    <p className="mt-1.5 truncate text-[11px] font-semibold text-[#F4F7F5]">{booster.languages.join(" / ")}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function EditorialHomepageTest() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#050807] text-[#F4F7F5]">
      <EditorialHeader />

      <main>
        <section className="relative isolate overflow-hidden border-b border-white/[0.06] bg-[#050807]">
          <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.014)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
          <div className="pointer-events-none absolute left-[8%] top-[18%] -z-10 h-px w-28 bg-gradient-to-r from-[#39E56F]/40 to-transparent" />

          <Container className="grid min-h-[690px] items-center gap-12 py-14 sm:py-16 lg:grid-cols-[.88fr_1.12fr] lg:gap-14 lg:py-20 xl:min-h-[760px]">
            <div className="relative z-10 max-w-[760px]">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-[#39E56F]/45" />
                <p className="font-gaming-label text-[10px] uppercase tracking-[0.20em] text-[#A0AAA4]">
                  Premium competitive services
                </p>
              </div>

              <h1 className="font-gaming-value mt-6 text-[clamp(3.65rem,7.4vw,7.8rem)] font-bold uppercase leading-[0.82] tracking-[-0.07em] text-[#F4F7F5]">
                Professional<br />
                boosting built<br />
                <span className="bg-gradient-to-r from-[#39E56F] to-[#3DD9EB] bg-clip-text text-transparent">
                  around your game.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-sm leading-7 text-[#A0AAA4] sm:text-base">
                Choose your game, configure the service around your competitive goal, and track every step from checkout to completion.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="min-w-44 rounded-xl border-0 bg-[#39E56F] font-semibold text-[#050807] shadow-none hover:bg-[#20C95A] hover:text-[#050807]">
                  <Link href="/games">
                    Choose your game
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="min-w-44 rounded-xl border border-[#FFFFFF14] bg-[#131B17] font-semibold text-[#F4F7F5] shadow-none hover:border-white/[0.16] hover:bg-[#18211C]">
                  <Link href="/boosters/rocket-league">Meet the boosters</Link>
                </Button>
              </div>

              <TrustRow />
            </div>

            <div className="relative mx-auto w-full max-w-[760px] lg:max-w-none">
              <div className="pointer-events-none absolute -inset-5 border border-white/[0.04] [clip-path:polygon(6%_0,100%_0,100%_92%,94%_100%,0_100%,0_8%)]" />
              <span className="pointer-events-none absolute -left-2 top-8 z-20 h-14 w-px bg-gradient-to-b from-[#39E56F]/55 to-transparent" />
              <span className="pointer-events-none absolute -right-2 bottom-10 z-20 h-px w-16 bg-gradient-to-l from-[#3DD9EB]/35 to-transparent" />

              <div className="relative aspect-[16/11] overflow-hidden border border-white/[0.10] bg-[#090D0B] [clip-path:polygon(5%_0,100%_0,100%_91%,95%_100%,0_100%,0_9%)] shadow-[0_40px_120px_-70px_rgba(0,0,0,.95)]">
                <HeroHoldLoopVideo
                  src="/brand/boostingpedia-hooded-rogue-loop.webm"
                  poster="/brand/boostingpedia-hooded-rogue.png"
                  holdSeconds={2}
                  className="h-full w-full object-cover object-[58%_50%]"
                  sizes="(min-width: 1280px) 52vw, (min-width: 1024px) 56vw, 100vw"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,7,.30),transparent_35%),linear-gradient(0deg,rgba(5,8,7,.30),transparent_32%)]" />
              </div>

              <div className="mt-4 flex items-center justify-between gap-4 text-[9px] uppercase tracking-[0.14em] text-[#667069]">
                <span>BoostingPedia marketplace</span>
                <span className="hidden items-center gap-2 sm:flex">
                  <span className="h-px w-8 bg-white/[0.08]" />
                  Competitive gaming services
                </span>
              </div>
            </div>
          </Container>
        </section>

        <GameCatalog />
        <BoosterSection />
        <HowItWorksShowcase />

        <section className="border-t border-white/[0.06] bg-[#090D0B]/40 py-16 sm:py-20">
          <Container>
            <div className="grid gap-8 rounded-[1.6rem] border border-[#FFFFFF14] bg-[#0E1411] p-7 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="font-gaming-label text-[10px] uppercase tracking-[0.18em] text-[#82F5A4]">Editorial test</p>
                <h2 className="font-gaming-value mt-2 text-3xl font-bold uppercase tracking-[-0.04em] text-[#F4F7F5] sm:text-4xl">
                  Ready to compare against the current homepage.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#A0AAA4]">
                  This route is isolated from the production homepage so the visual direction can be reviewed safely before any merge decision.
                </p>
              </div>
              <Button asChild size="lg" className="rounded-xl border-0 bg-[#39E56F] font-semibold text-[#050807] hover:bg-[#20C95A] hover:text-[#050807]">
                <Link href="/">
                  Compare current homepage
                  <ChevronRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
