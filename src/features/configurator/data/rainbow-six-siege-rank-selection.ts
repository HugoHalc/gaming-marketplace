export type SiegeRankOption = {
  readonly value: string;
  readonly label: string;
  readonly tier?: string;
  readonly division?: string;
};

export function rankTier(option: SiegeRankOption) {
  return option.tier ?? option.value;
}

export function availableSiegeRankOptions(
  options: readonly SiegeRankOption[],
  minimumIndex = -1,
  excludeFinalRank = false,
) {
  return options.filter((_, index) =>
    index > minimumIndex && (!excludeFinalRank || index < options.length - 1),
  );
}

export function siegeRankTierOptions(options: readonly SiegeRankOption[]) {
  return options.filter((option, index) =>
    options.findIndex((candidate) => rankTier(candidate) === rankTier(option)) === index,
  );
}

export function resolveSiegeRankTierSelection(
  options: readonly SiegeRankOption[],
  value: string,
  tier: string,
  minimumIndex = -1,
  excludeFinalRank = false,
) {
  const available = availableSiegeRankOptions(options, minimumIndex, excludeFinalRank)
    .filter((option) => rankTier(option) === tier);
  return available.find((option) => option.value === value)?.value ?? available[0]?.value ?? null;
}
