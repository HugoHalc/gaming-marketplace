"use client";

import Image from "next/image";
import { resolveRocketLeagueRank } from "@/components/orders/game-order-presentation-data";

export { resolveRocketLeagueRank } from "@/components/orders/game-order-presentation-data";

export function RocketLeagueRankValue({
  value,
  label,
  size = "md",
}: {
  value: unknown;
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  const rank = resolveRocketLeagueRank(value);
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
          <p className="font-gaming-label text-[8px] uppercase tracking-[0.12em] text-blue-200/45">
            {label}
          </p>
        ) : null}
        <p
          className={`font-gaming-value truncate font-bold text-[#F4F7F5] ${
            size === "lg" ? "text-sm" : size === "sm" ? "text-[10px]" : "text-[11px]"
          }`}
        >
          {rank.label}
        </p>
      </div>
    </div>
  );
}
