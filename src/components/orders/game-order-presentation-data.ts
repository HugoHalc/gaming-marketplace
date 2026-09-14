export type ResolvedGameRank = {
  key: string;
  label: string;
  asset: string | null;
};

const ROCKET_LEAGUE_RANK_ASSETS: Record<string, string> = {
  bronze: "/ranks/rocket-league/bronze.png",
  silver: "/ranks/rocket-league/silver.png",
  gold: "/ranks/rocket-league/gold.png",
  platinum: "/ranks/rocket-league/platinum.png",
  diamond: "/ranks/rocket-league/diamond.png",
  champion: "/ranks/rocket-league/champion.png",
  "grand-champion": "/ranks/rocket-league/grand-champion.png",
  "supersonic-legend": "/ranks/rocket-league/supersonic-legend.png",
};

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

const OVERWATCH_RANK_ASSETS: Record<string, string> = {
  bronze: "/ranks/overwatch/bronze.png",
  silver: "/ranks/overwatch/silver.png",
  gold: "/ranks/overwatch/gold.png",
  platinum: "/ranks/overwatch/platinum.png",
  emerald: "/ranks/overwatch/emerald.png",
  diamond: "/ranks/overwatch/diamond.png",
  master: "/ranks/overwatch/master.png",
  grandmaster: "/ranks/overwatch/grandmaster.png",
  champion: "/ranks/overwatch/champion.png",
};

const OVERWATCH_DIVISION_LABELS: Record<string, string> = {
  "5": "V",
  "4": "IV",
  "3": "III",
  "2": "II",
  "1": "I",
};

export function normalizedGameSlug(gameName: unknown) {
  if (typeof gameName !== "string") return "";
  return gameName.trim().toLowerCase().replace(/\s+/g, "-");
}

export function isMarvelRivalsGame(gameName: unknown) {
  return normalizedGameSlug(gameName) === "marvel-rivals";
}

export function isOverwatchGame(gameName: unknown) {
  return normalizedGameSlug(gameName) === "overwatch-2";
}

function familyLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function rocketLeagueRankFamily(value: string) {
  if (value === "supersonic-legend") return value;
  return value.replace(/-\d$/, "");
}

export function resolveRocketLeagueRank(value: unknown): ResolvedGameRank | null {
  if (typeof value !== "string") return null;

  if (value === "unrated") {
    return { key: value, label: "Unrated", asset: null };
  }

  if (value === "supersonic-legend") {
    return {
      key: value,
      label: "Supersonic Legend",
      asset: ROCKET_LEAGUE_RANK_ASSETS[value],
    };
  }

  const tier = value.match(/-(\d)$/)?.[1];
  const family = rocketLeagueRankFamily(value);
  const asset = ROCKET_LEAGUE_RANK_ASSETS[family];

  if (!asset) return null;

  const label = familyLabel(family);

  if (!tier) {
    return {
      key: value,
      label,
      asset,
    };
  }

  const roman =
    tier === "1" ? "I" : tier === "2" ? "II" : tier === "3" ? "III" : null;

  if (!roman) return null;

  return {
    key: value,
    label: `${label} ${roman}`,
    asset,
  };
}

function valorantRankFamily(value: string) {
  if (value === "immortal") return value;
  return value.replace(/-\d$/, "");
}

export function resolveValorantRank(value: unknown): ResolvedGameRank | null {
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

function marvelDivision(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return ["III", "II", "I"].includes(normalized) ? normalized : null;
}

export function resolveMarvelRivalsRank(
  value: unknown,
  division?: unknown,
): ResolvedGameRank | null {
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

export function resolveOverwatchRank(value: unknown): ResolvedGameRank | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();
  if (normalized === "unranked") {
    return { key: normalized, label: "Unranked", asset: null };
  }

  const matched = normalized.match(/^([a-z]+(?:-[a-z]+)?)-(5|4|3|2|1)$/);
  if (matched) {
    const [, family, division] = matched;
    const asset = OVERWATCH_RANK_ASSETS[family];
    const divisionLabel = OVERWATCH_DIVISION_LABELS[division];
    if (!asset || !divisionLabel) return null;

    return {
      key: normalized,
      label: `${familyLabel(family)} ${divisionLabel}`,
      asset,
    };
  }

  const familyAsset = OVERWATCH_RANK_ASSETS[normalized];
  if (!familyAsset) return null;

  return {
    key: normalized,
    label: familyLabel(normalized),
    asset: familyAsset,
  };
}

export function gameCardAsset(gameName: unknown) {
  const slug = normalizedGameSlug(gameName);

  if (slug === "valorant") return "/game-cards/valorant.webp";
  if (slug === "rocket-league") return "/game-cards/rocket-league.webp";
  if (slug === "marvel-rivals") return "/game-cards/marvel-rivals.webp";
  if (slug === "overwatch-2") return "/game-cards/overwatch.webp";

  return "/brand/boostingpedia-hero-art.webp";
}

export function resolveGameRank(
  gameName: unknown,
  value: unknown,
  division?: unknown,
): ResolvedGameRank | null {
  const slug = normalizedGameSlug(gameName);

  if (slug === "valorant") return resolveValorantRank(value);
  if (slug === "rocket-league") return resolveRocketLeagueRank(value);
  if (slug === "marvel-rivals") return resolveMarvelRivalsRank(value, division);
  if (slug === "overwatch-2") return resolveOverwatchRank(value);

  return null;
}
