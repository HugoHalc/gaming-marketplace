import type { ServiceConfiguratorSchema } from "../types/configurator";

const rankFamilies = [
  "bronze",
  "silver",
  "gold",
  "platinum",
  "emerald",
  "diamond",
  "master",
  "grandmaster",
  "champion",
] as const;

const divisions = ["5", "4", "3", "2", "1"] as const;

const divisionLabel: Record<string, string> = {
  "5": "V",
  "4": "IV",
  "3": "III",
  "2": "II",
  "1": "I",
};

const labelForFamily = (family: string) =>
  family === "grandmaster"
    ? "Grandmaster"
    : family.charAt(0).toUpperCase() + family.slice(1);

const competitiveRanks = rankFamilies.flatMap((family) =>
  divisions.map((division) => ({
    value: `${family}-${division}`,
    label: `${labelForFamily(family)} ${divisionLabel[division]}`,
  })),
);

const placementRanks = [
  { value: "unranked", label: "Unranked" },
  ...competitiveRanks,
];

const driveRanks = rankFamilies.map((family) => ({
  value: family,
  label: labelForFamily(family),
}));

const servers = [
  { value: "north-america", label: "North America" },
  { value: "europe", label: "Europe" },
  { value: "asia", label: "Asia" },
  { value: "middle-east", label: "Middle East" },
];

const platforms = [
  { value: "pc", label: "PC" },
  { value: "xbox", label: "Xbox" },
  { value: "playstation", label: "PlayStation" },
  { value: "nintendo-switch", label: "Nintendo Switch" },
];

const roles = [
  { value: "tank", label: "Tank" },
  { value: "damage", label: "Damage" },
  { value: "support", label: "Support (+15%)" },
  { value: "open-queue", label: "Open Queue (+30%)" },
];

const boostMethods = [
  { value: "account", label: "Account Boost" },
  { value: "duo", label: "Play With Booster" },
];

const commonFields = [
  {
    key: "boostMethod",
    label: "Boost Method",
    type: "select" as const,
    required: true,
    options: boostMethods,
    defaultValue: "account",
  },
  {
    key: "boosters",
    label: "Boosters",
    description: "Used only for Play With Booster. Maximum 5 boosters.",
    type: "number" as const,
    required: true,
    min: 1,
    max: 5,
    step: 1,
    defaultValue: 1,
  },
  {
    key: "role",
    label: "Role / Queue",
    type: "select" as const,
    required: true,
    options: roles,
    defaultValue: "tank",
  },
  {
    key: "server",
    label: "Server",
    type: "select" as const,
    required: true,
    options: servers,
    defaultValue: "north-america",
  },
  {
    key: "platform",
    label: "Platform",
    type: "select" as const,
    required: true,
    options: platforms,
    defaultValue: "pc",
  },
  {
    key: "playOffline",
    label: "Play Offline",
    type: "toggle" as const,
    required: false,
    defaultValue: false,
  },
  {
    key: "specificHeroes",
    label: "Specific Heroes",
    type: "toggle" as const,
    required: false,
    defaultValue: false,
  },
  {
    key: "streaming",
    label: "Streaming",
    type: "toggle" as const,
    required: false,
    defaultValue: false,
  },
  {
    key: "expressDelivery",
    label: "Express Delivery",
    type: "toggle" as const,
    required: false,
    defaultValue: false,
  },
  {
    key: "extraWin",
    label: "+1 Bonus Win",
    type: "toggle" as const,
    required: false,
    defaultValue: false,
  },
  {
    key: "rankInsurance",
    label: "Rank Insurance",
    type: "toggle" as const,
    required: false,
    defaultValue: false,
  },
];

const notes = [
  "Final pricing is calculated and validated on the server before the order is stored.",
  "Servers: North America, Europe, Asia, and Middle East.",
  "Platforms: PC, Xbox, PlayStation, and Nintendo Switch.",
];

const rankSchema: ServiceConfiguratorSchema = {
  category: "rank",
  fields: [
    {
      key: "currentRank",
      label: "Current Rank",
      type: "select",
      required: true,
      options: competitiveRanks.slice(0, -1),
      defaultValue: "bronze-5",
    },
    {
      key: "targetRank",
      label: "Target Rank",
      type: "select",
      required: true,
      options: competitiveRanks,
      defaultValue: "silver-5",
    },
    ...commonFields,
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
      options: competitiveRanks,
      defaultValue: "bronze-5",
    },
    {
      key: "wins",
      label: "Competitive Wins",
      type: "number",
      required: true,
      min: 1,
      max: 5,
      step: 1,
      defaultValue: 1,
    },
    ...commonFields,
  ],
  notes,
};

const drivesSchema: ServiceConfiguratorSchema = {
  category: "wins",
  fields: [
    {
      key: "driveRank",
      label: "Current Rank",
      type: "select",
      required: true,
      options: driveRanks,
      defaultValue: "bronze",
    },
    {
      key: "currentDrive",
      label: "Current Drive",
      type: "number",
      required: true,
      min: 0,
      max: 3950,
      step: 50,
      defaultValue: 0,
    },
    {
      key: "desiredDrive",
      label: "Desired Drive",
      type: "number",
      required: true,
      min: 50,
      max: 4000,
      step: 50,
      defaultValue: 50,
    },
    ...commonFields,
  ],
  notes,
};

const placementsSchema: ServiceConfiguratorSchema = {
  category: "placements",
  fields: [
    {
      key: "currentRank",
      label: "Previous Rank",
      type: "select",
      required: true,
      options: placementRanks,
      defaultValue: "unranked",
    },
    {
      key: "matches",
      label: "Placement Matches",
      type: "number",
      required: true,
      min: 1,
      max: 10,
      step: 1,
      defaultValue: 1,
    },
    ...commonFields,
  ],
  notes,
};

const unratedSchema: ServiceConfiguratorSchema = {
  category: "wins",
  fields: [
    {
      key: "matches",
      label: "Unrated Matches",
      type: "number",
      required: true,
      min: 1,
      max: 10,
      step: 1,
      defaultValue: 1,
    },
    ...commonFields,
  ],
  notes,
};

const schemasByServiceId: Record<string, ServiceConfiguratorSchema> = {
  service_ow_rank: rankSchema,
  service_ow_wins: winsSchema,
  service_ow_drives: drivesSchema,
  service_ow_placements: placementsSchema,
  service_ow_unrated: unratedSchema,
};

export function getOverwatchConfiguratorSchema(serviceId: string) {
  return schemasByServiceId[serviceId];
}
