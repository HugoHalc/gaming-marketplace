"use client";

import Image from "next/image";
import { RocketLeagueRankValue } from "@/components/orders/rocket-league-rank";
import {
  gameCardAsset,
  isMarvelRivalsGame,
  isOverwatchGame,
  normalizedGameSlug,
  resolveGameRank,
  resolveMarvelRivalsRank,
  resolveOverwatchRank,
  resolveRocketLeagueRank,
  resolveValorantRank,
} from "@/components/orders/game-order-presentation-data";

export {
  gameCardAsset,
  isMarvelRivalsGame,
  isOverwatchGame,
  normalizedGameSlug,
  resolveGameRank,
  resolveMarvelRivalsRank,
  resolveOverwatchRank,
  resolveRocketLeagueRank,
  resolveValorantRank,
} from "@/components/orders/game-order-presentation-data";

export function GameRankValue({
  gameName,
  value,
  division,
  label,
  size = "md",
}: {
  gameName: unknown;
  value: unknown;
  division?: unknown;
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  const slug = normalizedGameSlug(gameName);

  if (slug === "rocket-league") {
    return (
      <RocketLeagueRankValue
        value={value}
        label={label}
        size={size}
      />
    );
  }

  if (slug !== "valorant" && slug !== "marvel-rivals" && slug !== "overwatch-2") {
    return null;
  }

  const marvel = isMarvelRivalsGame(gameName);
  const overwatch = isOverwatchGame(gameName);
  const rank = resolveGameRank(gameName, value, division);
  if (!rank) return null;

  const dimensions = size === "sm" ? 26 : size === "lg" ? 46 : 34;

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      {rank.asset ? (
        <Image
          src={rank.asset}
          alt=""
          width={dimensions}
          height={dimensions}
          className="shrink-0 object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,.42)]"
          style={{ width: dimensions, height: dimensions }}
        />
      ) : null}
      <div className="min-w-0">
        {label ? (
          <p
            className={`font-gaming-label text-[8px] uppercase tracking-[0.12em] ${
              marvel
                ? "text-[#CEC5FF]/55"
                : overwatch
                  ? "text-amber-200/60"
                  : "text-rose-200/50"
            }`}
          >
            {label}
          </p>
        ) : null}
        <p
          className={`font-gaming-value font-bold text-[#F4F7F5] ${
            marvel || overwatch ? "break-words leading-tight" : "truncate"
          } ${
            size === "lg" ? "text-sm" : size === "sm" ? "text-[10px]" : "text-[11px]"
          }`}
        >
          {rank.label}
        </p>
      </div>
    </div>
  );
}
