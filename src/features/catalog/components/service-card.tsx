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

const rocketLeagueUpcomingMeta: Record<
  string,
  { label: string; icon: typeof Trophy }
> = {
  "tournament-boost": { label: "Tournament", icon: Trophy },
  "rewards-boost": { label: "Season rewards", icon: Award },
};

const rocketLeagueActiveMeta: Record<
  string,
  { label: string; icon: typeof Trophy; startingPrice?: number }
> = {
  "placements-boost": { label: "Placements", icon: Crosshair, startingPrice: 1.29 },
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function ServiceCard({ service, gameSlug }: { service: ServiceSummary; gameSlug: string }) {
  const upcoming =
    gameSlug === "rocket-league" ? rocketLeagueUpcomingMeta[service.slug] : undefined;
  const activeOverride =
    gameSlug === "rocket-league" ? rocketLeagueActiveMeta[service.slug] : undefined;

  const meta = upcoming ?? activeOverride ?? categoryMeta[service.category];
  const Icon = meta.icon;
  const displayedStartingPrice =
    activeOverride?.startingPrice ?? service.startingPrice;

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

        {upcoming ? (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">Service status</p>
                <p className="mt-1 text-sm font-semibold text-white">Coming soon</p>
              </div>
              <span className="rounded-full border border-green-400/15 bg-green-400/[0.05] px-3 py-1.5 text-xs font-semibold text-green-300">
                In development
              </span>
            </div>
            <p className="mt-5 text-xs leading-5 text-white/40">
              This service is now part of the Rocket League catalog. Its dedicated configurator will be built next.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">Starting from</p>
                <p className="mt-1 text-xl font-bold tracking-[-0.03em] text-white">
                  {formatPrice(displayedStartingPrice)}
                </p>
              </div>
              <Link href={`/games/${gameSlug}/${service.slug}`} className="inline-flex items-center text-sm font-semibold text-violet-200 transition-colors hover:text-white">
                Configure
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <p className="mt-5 text-xs leading-5 text-white/40">
              Configure options and preview server-calculated pricing.
            </p>
          </>
        )}
      </div>
    </Card>
  );
}
