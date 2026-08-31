import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { launchGames } from "@/features/catalog/data/launch-games";

export const metadata: Metadata = {
  title: "Games",
  description: "Explore the BoostingPedia launch game lineup.",
};

const gameCardAssets = {
  "rocket-league": "/game-cards/rocket-league.webp",
  "league-of-legends": "/game-cards/league-of-legends.webp",
  valorant: "/game-cards/valorant.webp",
  "marvel-rivals": "/game-cards/marvel-rivals.webp",
  "overwatch-2": "/game-cards/overwatch.webp",
  "battlefield-6": "/game-cards/battlefield-6.webp",
  "rainbow-six-siege": "/game-cards/rainbow-six-siege.webp",
} as const;

export default function GamesPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
        <div className="hero-grid absolute inset-0 -z-20 opacity-30" />
        <div className="absolute left-1/2 top-[-18rem] -z-10 h-[34rem] w-[62rem] -translate-x-1/2 rounded-full bg-green-500/[0.10] blur-[115px]" />

        <Container className="py-16 sm:py-20 lg:py-24">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Link href="/" className="transition-colors hover:text-white">
                Home
              </Link>
              <span>/</span>
              <span className="text-white">Games</span>
            </div>

            <Badge className="mt-7 border-green-300/20 bg-green-400/[0.07] text-green-200">
              <Sparkles className="mr-2 size-3.5" />
              Launch catalog
            </Badge>

            <h1 className="mt-5 text-balance text-4xl font-bold leading-[1] tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
              Seven games. One consistent marketplace structure.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
              Choose a title to open its dedicated storefront. Final artwork and game-specific content can be added without changing this structure.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-18 lg:py-20">
        <Container>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {launchGames.map((game) => {
              const imageSrc =
                gameCardAssets[game.slug as keyof typeof gameCardAssets];

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

      <SiteFooter />
    </main>
  );
}
