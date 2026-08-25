import type { ServiceCategory } from "@/features/catalog/types/catalog";
import type { ServiceConfiguratorSchema } from "../types/configurator";

const regions = [
  { value: "na", label: "North America" },
  { value: "eu", label: "Europe" },
  { value: "latam", label: "Latin America" },
  { value: "apac", label: "Asia Pacific" },
];

const rankOptions = [
  "Iron IV", "Iron III", "Iron II", "Iron I",
  "Bronze IV", "Bronze III", "Bronze II", "Bronze I",
  "Silver IV", "Silver III", "Silver II", "Silver I",
  "Gold IV", "Gold III", "Gold II", "Gold I",
  "Platinum IV", "Platinum III", "Platinum II", "Platinum I",
  "Diamond IV", "Diamond III", "Diamond II", "Diamond I",
  "Master", "Grandmaster",
].map((label, index) => ({ value: String(index), label }));

const schemas: Record<ServiceCategory, ServiceConfiguratorSchema> = {
  rank: {
    category: "rank",
    fields: [
      {
        key: "currentRank",
        label: "Current rank",
        description: "Select your current competitive rank.",
        type: "select",
        required: true,
        options: rankOptions,
        defaultValue: "8",
      },
      {
        key: "targetRank",
        label: "Target rank",
        description: "Your target must be above your current rank.",
        type: "select",
        required: true,
        options: rankOptions,
        defaultValue: "12",
      },
      {
        key: "region",
        label: "Server region",
        type: "select",
        required: true,
        options: regions,
        defaultValue: "na",
      },
      {
        key: "queue",
        label: "Queue",
        type: "select",
        required: true,
        options: [
          { value: "solo", label: "Solo queue" },
          { value: "duo", label: "Duo queue", priceMultiplier: 1.22 },
        ],
        defaultValue: "solo",
      },
      {
        key: "priority",
        label: "Priority start",
        description: "Move your order into the priority assignment queue.",
        type: "toggle",
        defaultValue: false,
      },
    ],
    notes: [
      "Final pricing is recalculated on the server before checkout.",
      "Account and fulfillment details are collected securely after purchase.",
      "You can review the full order summary before payment.",
    ],
  },
  wins: {
    category: "wins",
    fields: [
      {
        key: "wins",
        label: "Number of wins",
        description: "Choose how many competitive wins you need.",
        type: "number",
        required: true,
        min: 1,
        max: 20,
        step: 1,
        defaultValue: 3,
      },
      {
        key: "region",
        label: "Server region",
        type: "select",
        required: true,
        options: regions,
        defaultValue: "na",
      },
      {
        key: "queue",
        label: "Queue",
        type: "select",
        required: true,
        options: [
          { value: "solo", label: "Solo queue" },
          { value: "duo", label: "Duo queue", priceMultiplier: 1.18 },
        ],
        defaultValue: "solo",
      },
      {
        key: "priority",
        label: "Priority start",
        description: "Faster assignment when capacity is available.",
        type: "toggle",
        defaultValue: false,
      },
    ],
    notes: [
      "Win packages use quantity-based pricing.",
      "The server validates every selected modifier before checkout.",
      "Order progress will be visible from your dashboard.",
    ],
  },
  placements: {
    category: "placements",
    fields: [
      {
        key: "matches",
        label: "Placement matches",
        type: "number",
        required: true,
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 5,
      },
      {
        key: "region",
        label: "Server region",
        type: "select",
        required: true,
        options: regions,
        defaultValue: "na",
      },
      {
        key: "priority",
        label: "Priority start",
        description: "Prioritize assignment when capacity is available.",
        type: "toggle",
        defaultValue: false,
      },
    ],
    notes: [
      "Pricing scales with the number of placement matches selected.",
      "Final checkout pricing is always server-authoritative.",
      "You can review the configuration before creating an order.",
    ],
  },
  coaching: {
    category: "coaching",
    fields: [
      {
        key: "hours",
        label: "Coaching hours",
        type: "number",
        required: true,
        min: 1,
        max: 8,
        step: 1,
        defaultValue: 1,
      },
      {
        key: "focus",
        label: "Session focus",
        type: "select",
        required: true,
        options: [
          { value: "review", label: "VOD review" },
          { value: "mechanics", label: "Mechanics" },
          { value: "strategy", label: "Strategy & decision-making" },
          { value: "live", label: "Live session", priceMultiplier: 1.12 },
        ],
        defaultValue: "review",
      },
      {
        key: "priority",
        label: "Priority scheduling",
        description: "Prioritize the earliest available coaching slots.",
        type: "toggle",
        defaultValue: false,
      },
    ],
    notes: [
      "Coaching packages are priced by session duration and format.",
      "Scheduling details are confirmed after purchase.",
      "Final pricing is recalculated on the server before checkout.",
    ],
  },
};

export function getConfiguratorSchema(category: ServiceCategory) {
  return schemas[category];
}

export function getDefaultSelection(schema: ServiceConfiguratorSchema) {
  return Object.fromEntries(schema.fields.map((field) => [field.key, field.defaultValue]));
}
