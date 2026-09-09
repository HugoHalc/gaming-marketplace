import Link from "next/link";
import {
  ArrowRight,
  Award,
  Crosshair,
  GraduationCap,
  Medal,
  Trophy,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ServiceCategory, ServiceSummary } from "../types/catalog";

const categoryMeta: Record<ServiceCategory, { label: string; icon: typeof Trophy }> = {
  rank: { label: "Rank progression", icon: Medal },
  wins: { label: "Competitive wins", icon: Trophy },
  placements: { label: "Placements", icon: Crosshair },
  coaching: { label: "Coaching", icon: GraduationCap },
};

const rocketLeagueServiceMeta: Record<
  string,
  { label: string; icon: typeof Trophy }
> = {
  "tournament-boost": { label: "Tournament", icon: Trophy },
  "rewards-boost": { label: "Season rewards", icon: Award },
  "placements-boost": { label: "Placements", icon: Crosshair },
};

const DEFAULT_STARTING_PRICE_CONTEXT = "Your total updates with your configuration.";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function StartingPriceDisplay({
  value,
  context,
  variant = "gaming",
}: {
  value: number;
  context?: string;
  variant?: "gaming" | "catalog";
}) {
  const isGaming = variant === "gaming";

  return (
    <div className="min-w-0">
      <p
        className={
          isGaming
            ? "font-gaming-label text-[10px] uppercase tracking-[0.13em] text-white/30"
            : "text-xs text-[var(--muted-foreground)]"
        }
      >
        Starting from
      </p>
      <p
        className={
          isGaming
            ? "font-gaming-value mt-1 text-lg text-white"
            : "mt-1 text-xl font-bold tracking-[-0.03em] text-white"
        }
      >
        {formatPrice(value)}
      </p>
      <p
        className={
          isGaming
            ? "mt-1.5 max-w-[13rem] text-[9px] leading-3.5 text-white/50 sm:text-[10px] sm:leading-4"
            : "mt-1.5 max-w-[14rem] text-[10px] leading-4 text-[var(--muted-foreground)]"
        }
      >
        {context ?? DEFAULT_STARTING_PRICE_CONTEXT}
      </p>
    </div>
  );
}

export function ServiceCard({ service, gameSlug }: { service: ServiceSummary; gameSlug: string }) {
  const override =
    gameSlug === "rocket-league" ? rocketLeagueServiceMeta[service.slug] : undefined;
  const meta = override ?? categoryMeta[service.category];
  const Icon = meta.icon;

  return (
    <Card className="group flex h-full flex-col p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/[0.14] sm:p-7">
      <div className="flex items-start justify-between gap-5">
        <span className="grid size-11 place-items-center rounded-xl border border-violet-300/15 bg-violet-400/[0.07] text-violet-300">
          <Icon className="size-5" />
        </span>
        <span className="rounded-full border border-white/[0.08] bg-black/15 px-2.5 py-1 text-xs font-medium text-white/60">
          {meta.label}
        </span>
      </div>

      <h3 className="mt-7 text-xl font-semibold tracking-[-0.03em] text-white">{service.name}</h3>
      <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{service.description}</p>

      <div className="mt-auto pt-8">
        <div className="mb-5 h-px bg-gradient-to-r from-white/[0.1] to-transparent" />
        <div className="flex items-end justify-between gap-4">
          <StartingPriceDisplay
            value={service.startingPrice}
            context={service.startingPriceContext}
            variant="catalog"
          />
          <Link
            href={`/games/${gameSlug}/${service.slug}`}
            className="inline-flex items-center text-sm font-semibold text-violet-200 transition-colors hover:text-white"
          >
            Configure
            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
