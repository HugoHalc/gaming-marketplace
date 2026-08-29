import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Gamepad2, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { launchGames } from "@/features/catalog/data/launch-games";

export const metadata: Metadata = {
  title: "Games",
  description: "Explore the BoostingPedia launch game lineup.",
};

const visuals = {
  emerald: "from-emerald-500/[0.18] via-transparent to-transparent",
  rose: "from-rose-500/[0.18] via-transparent to-transparent",
  violet: "from-violet-500/[0.18] via-transparent to-transparent",
  cyan: "from-cyan-500/[0.18] via-transparent to-transparent",
  amber: "from-amber-500/[0.18] via-transparent to-transparent",
  blue: "from-blue-500/[0.20] via-transparent to-transparent",
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
              <Link href="/" className="transition-colors hover:text-white">Home</Link>
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
              const content = (
                <>
                  <div className={`absolute inset-0 bg-gradient-to-br ${visuals[game.accent]} ${game.ready ? "" : "opacity-45"}`} />
                  <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 select-none text-[clamp(2.8rem,5vw,5.4rem)] font-black tracking-[-0.07em] text-white/[0.035]">
                    {game.displayName}
                  </div>
                  <div className="relative flex min-h-[19rem] flex-col p-6 sm:p-7">
                    <div className="flex items-start justify-between">
                      <span className="grid size-11 place-items-center rounded-xl border border-white/[0.08] bg-black/20 text-white/60">
                        <Gamepad2 className="size-5" />
                      </span>
                      <span className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${
                        game.ready
                          ? "border-green-400/20 bg-green-400/[0.07] text-green-300"
                          : "border-amber-300/15 bg-amber-300/[0.05] text-amber-200/75"
                      }`}>
                        {game.ready ? "Available" : "In development"}
                      </span>
                    </div>
                    <div className="mt-auto">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                        {game.category}
                      </p>
                      <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-white">
                        {game.displayName}
                      </h2>
                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-xs text-white/40">
                          {game.ready ? "Open game storefront" : "Services being prepared"}
                        </span>
                        <span className={`grid size-9 place-items-center rounded-full border ${
                          game.ready
                            ? "border-white/[0.08] bg-white/[0.03] text-white/70 transition-colors group-hover:border-green-400/25 group-hover:bg-green-400/[0.08] group-hover:text-green-300"
                            : "border-white/[0.06] bg-white/[0.02] text-white/20"
                        }`}>
                          <ArrowRight className="size-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              );

              return game.ready ? (
                <Link
                  key={game.slug}
                  href={`/games/${game.slug}`}
                  className="group relative min-h-[19rem] overflow-hidden rounded-[1.5rem] border border-white/[0.075] bg-[#090b0a] transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/[0.16]"
                >
                  {content}
                </Link>
              ) : (
                <div
                  key={game.slug}
                  aria-label={`${game.displayName} is in development`}
                  className="relative min-h-[19rem] cursor-default overflow-hidden rounded-[1.5rem] border border-white/[0.06] bg-[#090b0a] opacity-75"
                >
                  {content}
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
