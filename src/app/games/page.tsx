import { gamePresentation, type PresentedGameSlug } from "@/features/catalog/data/game-presentation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { publicGameNavigation } from "@/features/catalog/data/launch-games";
import { createPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = createPublicMetadata({
  title: "Games",
  description: "Explore professional boosting services for your favorite competitive titles.",
  path: "/games",
  image: "/brand/boostingpedia-home-hero.webp",
});



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

            <h1 className="mt-5 text-balance text-4xl font-bold leading-[1] tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
              Choose your game. Start your climb.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
              Explore professional boosting services for your favorite competitive titles.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-18 lg:py-20">
        <Container>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {publicGameNavigation.map((game) => {
              const canOpenOverview = game.ready || game.overviewReady;
              const imageSrc =
                gamePresentation[game.slug as PresentedGameSlug].artwork;

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
                        game.slug === "rainbow-six-siege"
                          ? "scale-[1.004]"
                          : ""
                      }`}
                    />
                  </div>

                  {game.slug === "marvel-rivals" ? (
                    <>
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#050807]/20 via-transparent to-transparent" />
                      <Image
                        src={gamePresentation["marvel-rivals"].subject}
                        alt=""
                        width={379}
                        height={659}
                        sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 60vw"
                        className="pointer-events-none absolute right-[2%] top-[3%] h-[136%] w-auto max-w-none object-contain sm:h-[140%]"
                      />
                    </>
                  ) : null}

                  <div
                    className={`absolute inset-0 bg-gradient-to-t to-transparent ${
                      game.slug === "valorant"
                        ? "from-[#050807]/70 via-[#050807]/10"
                        : "from-[#050807]/88 via-[#050807]/12"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#050807]/46 via-[#050807]/06 to-transparent" />

                  {game.slug === "dota-2" ? (
                    <Image
                      src={gamePresentation["dota-2"].logo}
                      alt="Dota 2"
                      width={506}
                      height={616}
                      sizes="(min-width: 640px) 60px, 52px"
                      className="pointer-events-none absolute left-4 top-4 z-10 h-auto w-[52px] object-contain sm:left-5 sm:top-5 sm:w-[60px]"
                    />
                  ) : null}

                  {game.slug === "overwatch-2" ? (
                    <Image
                      src={gamePresentation["overwatch-2"].logo}
                      alt="Overwatch"
                      width={2033}
                      height={1144}
                      sizes="(min-width: 640px) 124px, 108px"
                      className="pointer-events-none absolute left-4 top-4 z-10 h-auto w-[108px] max-w-[36%] object-contain sm:left-5 sm:top-5 sm:w-[124px]"
                    />
                  ) : null}

                  {game.slug === "valorant" ? (
                    <Image
                      src={gamePresentation["valorant"].logo}
                      alt="Valorant"
                      width={1393}
                      height={925}
                      sizes="(min-width: 640px) 108px, 92px"
                      className="pointer-events-none absolute left-4 top-4 z-10 h-auto w-[92px] max-w-[28%] object-contain sm:left-5 sm:top-5 sm:w-[108px]"
                    />
                  ) : null}

                  {game.slug === "league-of-legends" ? (
                    <Image
                      src={gamePresentation["league-of-legends"].logo}
                      alt="League of Legends"
                      width={1707}
                      height={724}
                      sizes="(min-width: 640px) 142px, 122px"
                      className="pointer-events-none absolute left-3 top-3 z-10 h-auto w-[122px] max-w-[40%] object-contain sm:left-4 sm:top-4 sm:w-[142px]"
                    />
                  ) : null}

                  {game.slug === "marvel-rivals" ? (
                    <Image
                      src={gamePresentation["marvel-rivals"].logo}
                      alt="Marvel Rivals"
                      width={2048}
                      height={804}
                      sizes="(min-width: 640px) 134px, 116px"
                      className="pointer-events-none absolute left-4 top-4 z-10 h-auto w-[116px] max-w-[38%] object-contain sm:left-5 sm:top-5 sm:w-[134px]"
                    />
                  ) : null}

                  {game.slug === "rainbow-six-siege" ? (
                    <div className="pointer-events-none absolute left-4 top-4 z-10 h-12 w-[45%] sm:left-5 sm:top-5 sm:h-14 sm:w-[46%]">
                      <Image
                        src={gamePresentation["rainbow-six-siege"].logo}
                        alt=""
                        fill
                        sizes="(min-width: 1280px) 15vw, (min-width: 768px) 23vw, 45vw"
                        className="object-contain object-left object-top"
                      />
                    </div>
                  ) : null}

                  {game.slug === "rocket-league" ? (
                    <div className="pointer-events-none absolute left-6 top-4 z-10 h-10 w-[42%] sm:top-5 sm:h-[2.875rem]">
                      <Image
                        src={gamePresentation["rocket-league"].logo}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 128px, 111px"
                        className="object-contain object-left-top"
                      />
                    </div>
                  ) : null}

                  <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#F4F7F5]">
                      Explore services
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </div>
                </>
              );

              return canOpenOverview ? (
                <Link
                  key={game.slug}
                  href={`/games/${game.slug}`}
                  aria-label={`Explore ${game.displayName} services`}
                  className="group relative aspect-[2048/1143] overflow-hidden rounded-[1.4rem] border border-[#FFFFFF14] bg-[#0E1411] transition-[transform,border-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39E56F]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050807] hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-[0_24px_55px_-38px_rgba(0,0,0,.95)]"
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
