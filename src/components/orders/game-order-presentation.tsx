"use client";

import Image from "next/image";
import {
  resolveRocketLeagueRank,
  RocketLeagueRankValue,
} from "@/components/orders/rocket-league-rank";

const VALORANT_RANK_ASSETS: Record<string, string> = {
  iron: "/ranks/valorant/iron.png",
  bronze: "/ranks/valorant/bronze.png",
  silver: "/ranks/valorant/silver.png",
  gold: "/ranks/valorant/gold.png",
  platinum: "/ranks/valorant/platinum.png",
  diamond: "/ranks/valorant/diamond.png",
  ascendant: "/ranks/valorant/ascendant.png",
  immortal: "/ranks/valorant/immortal.png",
};

const MARVEL_RIVALS_RANK_ASSETS: Record<string, string> = {
  bronze: "/ranks/marvel-rivals/bronze.png",
  silver: "/ranks/marvel-rivals/silver.png",
  gold: "/ranks/marvel-rivals/gold.png",
  platinum: "/ranks/marvel-rivals/platinum.png",
  diamond: "/ranks/marvel-rivals/diamond.png",
  grandmaster: "/ranks/marvel-rivals/grandmaster.png",
  celestial: "/ranks/marvel-rivals/celestial.png",
  eternity: "/ranks/marvel-rivals/eternity.png",
};

export function normalizedGameSlug(gameName: unknown) {
  if (typeof gameName !== "string") return "";
  return gameName.trim().toLowerCase().replace(/\s+/g, "-");
}

export function isMarvelRivalsGame(gameName: unknown) {
  return normalizedGameSlug(gameName) === "marvel-rivals";
}

function valorantRankFamily(value: string) {
  if (value === "immortal") return value;
  return value.replace(/-\d$/, "");
}

function familyLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function marvelDivision(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return ["III", "II", "I"].includes(normalized) ? normalized : null;
}

export function resolveValorantRank(value: unknown) {
  if (typeof value !== "string") return null;

  if (value === "unrated") {
    return { key: value, label: "Unrated", asset: null };
  }

  if (value === "immortal") {
    return {
      key: value,
      label: "Immortal",
      asset: VALORANT_RANK_ASSETS.immortal,
    };
  }

  const tier = value.match(/-(\d)$/)?.[1];
  const family = valorantRankFamily(value);
  const asset = VALORANT_RANK_ASSETS[family];

  if (!asset || !tier) return null;

  const roman =
    tier === "1" ? "I" : tier === "2" ? "II" : tier === "3" ? "III" : null;

  if (!roman) return null;

  return {
    key: value,
    label: `${familyLabel(family)} ${roman}`,
    asset,
  };
}

export function resolveMarvelRivalsRank(value: unknown, division?: unknown) {
  if (typeof value !== "string") return null;

  const family = value.trim().toLowerCase();
  if (family === "unranked") {
    return { key: family, label: "Unranked", asset: null };
  }

  const asset = MARVEL_RIVALS_RANK_ASSETS[family];
  if (!asset) return null;

  if (family === "eternity") {
    return { key: family, label: "Eternity", asset };
  }

  const normalizedDivision = marvelDivision(division);
  return {
    key: normalizedDivision ? `${family}-${normalizedDivision}` : family,
    label: normalizedDivision
      ? `${familyLabel(family)} ${normalizedDivision}`
      : familyLabel(family),
    asset,
  };
}

export function gameCardAsset(gameName: unknown) {
  const slug = normalizedGameSlug(gameName);

  if (slug === "valorant") return "/game-cards/valorant.webp";
  if (slug === "rocket-league") return "/game-cards/rocket-league.webp";
  if (slug === "marvel-rivals") return "/game-cards/marvel-rivals.webp";

  return "/brand/boostingpedia-hero-art.webp";
}

export function resolveGameRank(gameName: unknown, value: unknown, division?: unknown) {
  const slug = normalizedGameSlug(gameName);

  if (slug === "valorant") return resolveValorantRank(value);
  if (slug === "rocket-league") return resolveRocketLeagueRank(value);
  if (slug === "marvel-rivals") return resolveMarvelRivalsRank(value, division);

  return null;
}

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

  if (slug !== "valorant" && slug !== "marvel-rivals") return null;

  const marvel = slug === "marvel-rivals";
  const rank = marvel
    ? resolveMarvelRivalsRank(value, division)
    : resolveValorantRank(value);
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
              marvel ? "text-[#CEC5FF]/55" : "text-rose-200/50"
            }`}
          >
            {label}
          </p>
        ) : null}
        <p
          className={`font-gaming-value font-bold text-[#F4F7F5] ${
            marvel ? "break-words leading-tight" : "truncate"
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
