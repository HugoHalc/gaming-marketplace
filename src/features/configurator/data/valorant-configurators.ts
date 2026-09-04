import type { ServiceConfiguratorSchema } from "../types/configurator";

const valorantRanks = [
  ["iron-1", "Iron 1"],
  ["iron-2", "Iron 2"],
  ["iron-3", "Iron 3"],
  ["bronze-1", "Bronze 1"],
  ["bronze-2", "Bronze 2"],
  ["bronze-3", "Bronze 3"],
  ["silver-1", "Silver 1"],
  ["silver-2", "Silver 2"],
  ["silver-3", "Silver 3"],
  ["gold-1", "Gold 1"],
  ["gold-2", "Gold 2"],
  ["gold-3", "Gold 3"],
  ["platinum-1", "Platinum 1"],
  ["platinum-2", "Platinum 2"],
  ["platinum-3", "Platinum 3"],
  ["diamond-1", "Diamond 1"],
  ["diamond-2", "Diamond 2"],
  ["diamond-3", "Diamond 3"],
  ["ascendant-1", "Ascendant 1"],
  ["ascendant-2", "Ascendant 2"],
  ["ascendant-3", "Ascendant 3"],
  ["immortal", "Immortal"],
].map(([value, label]) => ({ value, label }));

const placementRanks = [{ value: "unrated", label: "Unrated" }, ...valorantRanks];

const servers = [
  { value: "europe", label: "Europe" },
  { value: "north-america", label: "North America" },
  { value: "brazil", label: "Brazil" },
  { value: "korea", label: "Korea" },
  { value: "sea-oce", label: "SEA/OCE" },
  { value: "latin-america", label: "Latin America" },
];

const queue = [
  { value: "solo", label: "Solo" },
  { value: "duo", label: "Duo (+100%)" },
];

const rrGain = [
  { value: "10", label: "10+ RR (+20%)" },
  { value: "20", label: "20+ RR" },
  { value: "30", label: "30+ RR" },
  { value: "45", label: "45+ RR (-10%)" },
];

const rrAmount = [
  { value: "0-20", label: "0-20 RR" },
  { value: "21-40", label: "21-40 RR (-4%)" },
  { value: "41-60", label: "41-60 RR (-5%)" },
  { value: "61-80", label: "61-80 RR (-6%)" },
  { value: "81-100", label: "81-100 RR (-8%)" },
];

const platform = [
  { value: "pc", label: "PC" },
];

const commonExtras = [
  {
    key: "playOffline",
    label: "Play Offline",
    description: "Keep the booster activity discreet while the order is being completed.",
    type: "toggle" as const,
    required: false,
    defaultValue: false,
  },
  {
    key: "agentPreferences",
    label: "Agents Preferences",
    description: "Save that you have preferred agents for the booster to follow.",
    type: "toggle" as const,
    required: false,
    defaultValue: false,
  },
  {
    key: "liveStream",
    label: "Streaming (+$10)",
    description: "Add a live stream of the boosting session.",
    type: "toggle" as const,
    required: false,
    defaultValue: false,
  },
  {
    key: "expressDelivery",
    label: "Express Delivery (+30%)",
    description: "Prioritize faster fulfillment when booster capacity is available.",
    type: "toggle" as const,
    required: false,
    defaultValue: false,
  },
  {
    key: "extraWin",
    label: "+1 Extra Win (+$6)",
    description: "Add one additional competitive win to the order.",
    type: "toggle" as const,
    required: false,
    defaultValue: false,
  },
  {
    key: "rankInsurance",
    label: "Rank Insurance (+50%)",
    description: "Add the Valorant rank insurance option to the order.",
    type: "toggle" as const,
    required: false,
    defaultValue: false,
  },
];

const notes = [
  "Final pricing is recalculated and validated on the server before the order is stored.",
  "Valorant orders are available for PC only.",
  "Account access and fulfillment details remain protected inside the order workspace.",
];

const rankSchema: ServiceConfiguratorSchema = {
  category: "rank",
  fields: [
    {
      key: "currentRank",
      label: "Current Rank",
      type: "select",
      required: true,
      options: valorantRanks,
      defaultValue: "iron-1",
    },
    {
      key: "targetRank",
      label: "Target Rank",
      description: "The target must be above your current rank. Radiant is not offered.",
      type: "select",
      required: true,
      options: valorantRanks,
      defaultValue: "bronze-1",
    },
    {
      key: "queue",
      label: "Boost Type",
      type: "select",
      required: true,
      options: queue,
      defaultValue: "solo",
    },
    {
      key: "rrGain",
      label: "RR Gain",
      type: "select",
      required: true,
      options: rrGain,
      defaultValue: "20",
    },
    {
      key: "rrAmount",
      label: "RR Amount",
      type: "select",
      required: true,
      options: rrAmount,
      defaultValue: "0-20",
    },
    {
      key: "server",
      label: "Server",
      type: "select",
      required: true,
      options: servers,
      defaultValue: "north-america",
    },
    {
      key: "platform",
      label: "Platform",
      type: "select",
      required: true,
      options: platform,
      defaultValue: "pc",
    },
    ...commonExtras,
  ],
  notes,
};

const winsSchema: ServiceConfiguratorSchema = {
  category: "wins",
  fields: [
    {
      key: "currentRank",
      label: "Current Rank",
      type: "select",
      required: true,
      options: valorantRanks,
      defaultValue: "iron-1",
    },
    {
      key: "wins",
      label: "Competitive Wins",
      description: "Choose between 1 and 5 wins.",
      type: "number",
      required: true,
      min: 1,
      max: 5,
      step: 1,
      defaultValue: 1,
    },
    {
      key: "queue",
      label: "Boost Type",
      type: "select",
      required: true,
      options: queue,
      defaultValue: "solo",
    },
    {
      key: "rrGain",
      label: "RR Gain",
      type: "select",
      required: true,
      options: rrGain,
      defaultValue: "20",
    },
    {
      key: "server",
      label: "Server",
      type: "select",
      required: true,
      options: servers,
      defaultValue: "north-america",
    },
    {
      key: "platform",
      label: "Platform",
      type: "select",
      required: true,
      options: platform,
      defaultValue: "pc",
    },
    ...commonExtras,
  ],
  notes,
};

const placementsSchema: ServiceConfiguratorSchema = {
  category: "placements",
  fields: [
    {
      key: "currentRank",
      label: "Current Rank",
      description: "Use Unrated if the account does not have a prior competitive rank.",
      type: "select",
      required: true,
      options: placementRanks,
      defaultValue: "unrated",
    },
    {
      key: "matches",
      label: "Placement Matches",
      description: "Choose between 1 and 5 placement matches.",
      type: "number",
      required: true,
      min: 1,
      max: 5,
      step: 1,
      defaultValue: 1,
    },
    {
      key: "queue",
      label: "Boost Type",
      type: "select",
      required: true,
      options: queue,
      defaultValue: "solo",
    },
    {
      key: "server",
      label: "Server",
      type: "select",
      required: true,
      options: servers,
      defaultValue: "north-america",
    },
    {
      key: "platform",
      label: "Platform",
      type: "select",
      required: true,
      options: platform,
      defaultValue: "pc",
    },
    ...commonExtras,
  ],
  notes,
};

const schemasByServiceId: Record<string, ServiceConfiguratorSchema> = {
  service_val_rank: rankSchema,
  service_val_wins: winsSchema,
  service_val_placements: placementsSchema,
};

export function getValorantConfiguratorSchema(serviceId: string) {
  return schemasByServiceId[serviceId];
}
