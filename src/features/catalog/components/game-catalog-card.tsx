import Link from "next/link";
import { ArrowRight, Gamepad2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { gameThemes } from "../data/game-theme";
import type { CatalogGame } from "../types/catalog";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function GameCatalogCard({ game }: { game: CatalogGame }) {
  const accent = gameThemes[game.accent];

  return (
    <Card
      id={game.slug}
      className="group relative scroll-mt-28 overflow-hidden p-0 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/[0.14]"
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent.glow}`} />
      <div className="relative flex min-h-[31rem] flex-col p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <span className={`grid size-12 place-items-center rounded-2xl border ${accent.icon}`}>
            <Gamepad2 className="size-5" />
          </span>
          <div className="flex items-center gap-2">
            {game.featured ? (
              <Badge className="border-violet-300/15 bg-violet-400/[0.08] text-violet-200">
                Featured
              </Badge>
            ) : null}
            <Badge className="border-emerald-300/15 bg-emerald-400/[0.07] text-emerald-300">
              Available
            </Badge>
          </div>
        </div>

        <div className="mt-9">
          <h2 className="text-2xl font-semibold tracking-[-0.035em] text-white">{game.name}</h2>
          <p className="mt-3 min-h-12 text-sm leading-6 text-[var(--muted-foreground)]">
            {game.shortDescription}
          </p>
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          {game.services.map((service) => (
            <span
              key={service.id}
              className="rounded-full border border-white/[0.07] bg-black/15 px-2.5 py-1 text-xs font-medium text-white/75"
            >
              {service.name}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-9">
          <div className="mb-5 h-px bg-gradient-to-r from-white/[0.1] via-white/[0.05] to-transparent" />
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">Starting from</p>
              <p className="mt-1 text-xl font-bold tracking-[-0.03em] text-white">
                {game.startingPrice === null ? "Coming soon" : formatPrice(game.startingPrice)}
              </p>
            </div>
            <Link
              href={`/games/${game.slug}`}
              className="inline-flex items-center text-sm font-semibold text-violet-200 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              View services
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className={`mt-6 h-px w-16 bg-gradient-to-r ${accent.line} to-transparent`} />
        </div>
      </div>
    </Card>
  );
}
