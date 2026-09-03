"use client";

import Image from "next/image";

const RANK_ASSETS: Record<string, string> = {
  bronze: "/ranks/rocket-league/bronze.png",
  silver: "/ranks/rocket-league/silver.png",
  gold: "/ranks/rocket-league/gold.png",
  platinum: "/ranks/rocket-league/platinum.png",
  diamond: "/ranks/rocket-league/diamond.png",
  champion: "/ranks/rocket-league/champion.png",
  "grand-champion": "/ranks/rocket-league/grand-champion.png",
  "supersonic-legend": "/ranks/rocket-league/supersonic-legend.png",
};

function rankFamily(value: string) {
  if (value === "supersonic-legend") return value;
  return value.replace(/-\d$/, "");
}

function rankFamilyLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function resolveRocketLeagueRank(value: unknown) {
  if (typeof value !== "string") return null;

  if (value === "unrated") {
    return { key: value, label: "Unrated", asset: null };
  }

  if (value === "supersonic-legend") {
    return {
      key: value,
      label: "Supersonic Legend",
      asset: RANK_ASSETS[value],
    };
  }

  const tier = value.match(/-(\d)$/)?.[1];
  const family = rankFamily(value);
  const asset = RANK_ASSETS[family];

  if (!asset) return null;

  const familyLabel = rankFamilyLabel(family);

  // Some services (for example Tournament Boost) store the rank family
  // without a division, e.g. "grand-champion". Keep the family badge visible.
  if (!tier) {
    return {
      key: value,
      label: familyLabel,
      asset,
    };
  }

  const roman =
    tier === "1" ? "I" : tier === "2" ? "II" : tier === "3" ? "III" : null;

  if (!roman) return null;

  return {
    key: value,
    label: `${familyLabel} ${roman}`,
    asset,
  };
}

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

  const dimensions =
    size === "sm" ? 26 : size === "lg" ? 46 : 34;

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
