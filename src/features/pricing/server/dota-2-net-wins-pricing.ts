import type {
  ConfiguratorSelection,
  QuoteBreakdownItem,
  QuotePreview,
} from "@/features/configurator/types/configurator";
import {
  DOTA2_CURRENT_MMR_MAX,
  DOTA2_CURRENT_MMR_MIN,
  DOTA2_MAX_ROLE_PREFERENCES,
  dota2BehaviorScoreOptions,
  dota2BoostMethodOptions,
  dota2ExtraOptions,
  dota2PreferenceOptions,
  dota2RoleOptions,
  dota2ServerOptions,
  type Dota2BehaviorScore,
  type Dota2BoostMethod,
  type Dota2Preference,
  type Dota2Role,
  type Dota2Server,
} from "@/features/configurator/data/dota-2-mmr-options";
import {
  DOTA2_NET_WINS_MAX,
  DOTA2_NET_WINS_MIN,
  type Dota2NetWinsCustomQuoteState,
  type Dota2NetWinsQuoteMetadata,
} from "@/features/configurator/data/dota-2-net-wins-options";

const VERSION = "dota-2-net-wins-v2";
const IMMORTAL_MMR = 5620;

const pricingBrackets = [
  { name: "Herald", start: 0, end: 770, rateCentsPerWin: 150 },
  { name: "Guardian", start: 770, end: 1540, rateCentsPerWin: 150 },
  { name: "Crusader", start: 1540, end: 2310, rateCentsPerWin: 160 },
  { name: "Archon", start: 2310, end: 3080, rateCentsPerWin: 175 },
  { name: "Legend", start: 3080, end: 3850, rateCentsPerWin: 190 },
  { name: "Ancient", start: 3850, end: 4620, rateCentsPerWin: 210 },
  { name: "Divine", start: 4620, end: IMMORTAL_MMR, rateCentsPerWin: 240 },
] as const;

const ALLOWED_SELECTION_KEYS = new Set([
  "currentMmr",
  "netWins",
  "server",
  "behaviorScore",
  "boostMethod",
  "preference",
  "roles",
  "heroName",
  "privacyMode",
  "soloQueueOnly",
  "expressDelivery",
  "streaming",
]);

function dollars(cents: number) {
  return cents / 100;
}

function parseInteger(
  selection: ConfiguratorSelection,
  key: string,
  min: number,
  max: number,
) {
  const value = selection[key];
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    !Number.isInteger(value)
  ) {
    throw new Error(`Invalid value for ${key}.`);
  }
  if (value < min || value > max) {
    throw new Error(`Invalid value for ${key}.`);
  }
  return value;
}

function parseString(selection: ConfiguratorSelection, key: string) {
  const value = selection[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid value for ${key}.`);
  }
  return value;
}

function parseBoolean(selection: ConfiguratorSelection, key: string) {
  const value = selection[key];
  if (typeof value !== "boolean") {
    throw new Error(`Invalid value for ${key}.`);
  }
  return value;
}

function optionValue<T extends { value: string }>(
  options: readonly T[],
  value: string,
  message: string,
): T {
  const option = options.find((item) => item.value === value);
  if (!option) throw new Error(message);
  return option;
}

function validateSelectionKeys(selection: ConfiguratorSelection) {
  for (const key of Object.keys(selection)) {
    if (!ALLOWED_SELECTION_KEYS.has(key)) {
      throw new Error("Invalid Dota 2 Net Wins selection.");
    }
  }
}

function bracketForMmr(mmr: number) {
  if (mmr >= IMMORTAL_MMR) {
    return { name: "Immortal", rateCentsPerWin: 0, customQuote: true } as const;
  }
  const bracket = pricingBrackets.find(
    (item) => mmr >= item.start && mmr < item.end,
  );
  if (!bracket) throw new Error("Unable to determine Current MMR bracket.");
  return { ...bracket, customQuote: false } as const;
}

function parseRoles(
  selection: ConfiguratorSelection,
  preference: Dota2Preference,
) {
  const raw = selection.roles;
  if (typeof raw !== "string") throw new Error("Invalid role preference.");
  const roles = raw.length ? raw.split(",") : [];
  const unique = new Set(roles);

  if (unique.size !== roles.length) {
    throw new Error("Duplicate role preference.");
  }
  if (
    roles.some(
      (role) => !dota2RoleOptions.some((option) => option.value === role),
    )
  ) {
    throw new Error("Select valid roles.");
  }

  if (preference === "roles") {
    if (
      roles.length < 1 ||
      roles.length > DOTA2_MAX_ROLE_PREFERENCES
    ) {
      throw new Error(
        `Select between 1 and ${DOTA2_MAX_ROLE_PREFERENCES} roles.`,
      );
    }
  } else if (roles.length > 0) {
    throw new Error("Role preferences apply only to Specific Roles.");
  }

  return roles as Dota2Role[];
}

function validateHero(
  selection: ConfiguratorSelection,
  preference: Dota2Preference,
) {
  const raw = selection.heroName;
  if (typeof raw !== "string") throw new Error("Invalid hero preference.");
  const heroName = raw.trim();

  if (preference === "hero") {
    if (!heroName) throw new Error("Enter a hero name.");
  } else if (heroName) {
    throw new Error("Hero preference applies only to Specific Hero.");
  }

  return heroName;
}

function modifierLine(
  label: string,
  baseCents: number,
  percent: number,
) {
  return {
    label: `${label} (+${percent}%)`,
    cents: Math.round((baseCents * percent) / 100),
  };
}

export type Dota2NetWinsPricingResult =
  | {
      kind: "quote";
      quote: QuotePreview;
      metadata: Dota2NetWinsQuoteMetadata;
    }
  | {
      kind: "custom";
      customQuote: Dota2NetWinsCustomQuoteState;
    };

export function calculateDota2NetWinsPricing(
  selection: ConfiguratorSelection,
): Dota2NetWinsPricingResult {
  validateSelectionKeys(selection);

  const currentMmr = parseInteger(
    selection,
    "currentMmr",
    DOTA2_CURRENT_MMR_MIN,
    DOTA2_CURRENT_MMR_MAX,
  );
  const netWins = parseInteger(
    selection,
    "netWins",
    DOTA2_NET_WINS_MIN,
    DOTA2_NET_WINS_MAX,
  );

  const server = parseString(selection, "server") as Dota2Server;
  optionValue(dota2ServerOptions, server, "Select a valid server.");

  const behaviorScore = parseString(
    selection,
    "behaviorScore",
  ) as Dota2BehaviorScore;
  const behaviorOption = optionValue(
    dota2BehaviorScoreOptions,
    behaviorScore,
    "Select a valid Behavior Score range.",
  );

  const boostMethod = parseString(
    selection,
    "boostMethod",
  ) as Dota2BoostMethod;
  const boostMethodOption = optionValue(
    dota2BoostMethodOptions,
    boostMethod,
    "Select a valid boost method.",
  );

  const preference = parseString(
    selection,
    "preference",
  ) as Dota2Preference;
  const preferenceOption = optionValue(
    dota2PreferenceOptions,
    preference,
    "Select a valid preference.",
  );
  parseRoles(selection, preference);
  validateHero(selection, preference);

  const privacyMode = parseBoolean(selection, "privacyMode");
  const soloQueueOnly = parseBoolean(selection, "soloQueueOnly");
  const expressDelivery = parseBoolean(selection, "expressDelivery");
  const streaming = parseBoolean(selection, "streaming");

  if (boostMethod === "duo" && (soloQueueOnly || streaming)) {
    throw new Error(
      "Solo Queue Only and Streaming are available with Solo only.",
    );
  }

  const bracket = bracketForMmr(currentMmr);
  const metadata: Dota2NetWinsQuoteMetadata = {
    currentBracket: bracket.name,
    rateCentsPerWin: bracket.rateCentsPerWin,
  };

  if (bracket.customQuote) {
    return {
      kind: "custom",
      customQuote: {
        ...metadata,
        reason: "immortal",
        message: "Immortal orders require a custom quote.",
        supportingCopy:
          "Contact Support so we can confirm availability and pricing for your Current MMR.",
      },
    };
  }

  if (behaviorOption.customQuote) {
    return {
      kind: "custom",
      customQuote: {
        ...metadata,
        reason: "behavior-score",
        message: "This Behavior Score range requires a custom quote.",
        supportingCopy:
          "Contact Support so we can confirm availability and pricing for your order.",
      },
    };
  }

  const baseCents = bracket.rateCentsPerWin * netWins;
  const breakdown: QuoteBreakdownItem[] = [
    {
      label: `${netWins} Net Win${netWins === 1 ? "" : "s"} × $${(
        bracket.rateCentsPerWin / 100
      ).toFixed(2)}`,
      amount: dollars(baseCents),
    },
  ];

  const percentageLines: Array<{ label: string; cents: number }> = [];

  if (boostMethodOption.modifierPercent > 0) {
    percentageLines.push(
      modifierLine(
        boostMethod === "duo" ? "Play With Booster" : boostMethodOption.label,
        baseCents,
        boostMethodOption.modifierPercent,
      ),
    );
  }

  if (behaviorOption.modifierPercent > 0) {
    percentageLines.push(
      modifierLine(
        "Behavior Score",
        baseCents,
        behaviorOption.modifierPercent,
      ),
    );
  }

  if (preferenceOption.modifierPercent > 0) {
    percentageLines.push(
      modifierLine(
        preferenceOption.label,
        baseCents,
        preferenceOption.modifierPercent,
      ),
    );
  }

  if (soloQueueOnly) {
    percentageLines.push(
      modifierLine(
        dota2ExtraOptions.soloQueueOnly.label,
        baseCents,
        dota2ExtraOptions.soloQueueOnly.modifierPercent,
      ),
    );
  }

  if (expressDelivery) {
    percentageLines.push(
      modifierLine(
        dota2ExtraOptions.expressDelivery.label,
        baseCents,
        dota2ExtraOptions.expressDelivery.modifierPercent,
      ),
    );
  }

  const totalPercent =
    boostMethodOption.modifierPercent +
    behaviorOption.modifierPercent +
    preferenceOption.modifierPercent +
    (soloQueueOnly ? dota2ExtraOptions.soloQueueOnly.modifierPercent : 0) +
    (expressDelivery ? dota2ExtraOptions.expressDelivery.modifierPercent : 0);

  const combinedModifierCents = Math.round(
    (baseCents * totalPercent) / 100,
  );
  const roundedLineTotal = percentageLines.reduce(
    (sum, line) => sum + line.cents,
    0,
  );

  if (
    percentageLines.length > 0 &&
    roundedLineTotal !== combinedModifierCents
  ) {
    const last = percentageLines.length - 1;
    percentageLines[last] = {
      ...percentageLines[last],
      cents:
        percentageLines[last].cents +
        (combinedModifierCents - roundedLineTotal),
    };
  }

  breakdown.push(
    ...percentageLines.map((line) => ({
      label: line.label,
      amount: dollars(line.cents),
    })),
  );

  if (privacyMode) {
    breakdown.push({ label: dota2ExtraOptions.privacyMode.label, amount: 0 });
  }

  const streamingCents = streaming
    ? dota2ExtraOptions.streaming.fixedCents
    : 0;
  if (streaming) {
    breakdown.push({
      label: dota2ExtraOptions.streaming.label,
      amount: dollars(streamingCents),
    });
  }

  const totalCents = baseCents + combinedModifierCents + streamingCents;
  const total = dollars(totalCents);

  return {
    kind: "quote",
    metadata,
    quote: {
      currency: "USD",
      subtotal: total,
      discount: 0,
      total,
      ruleSetVersion: VERSION,
      breakdown,
    },
  };
}
