import type { ServiceConfiguratorSchema } from "../types/configurator";

const ranks = [
  { value: "unranked", label: "Unranked" },
  { value: "bronze", label: "Bronze" },
  { value: "silver", label: "Silver" },
  { value: "gold", label: "Gold" },
  { value: "platinum", label: "Platinum" },
  { value: "diamond", label: "Diamond" },
  { value: "master", label: "Master" },
  { value: "grandmaster", label: "Grandmaster" },
];

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

const winsSchema: ServiceConfiguratorSchema = {
  category: "wins",
  fields: [
    {
      key: "currentRank",
      label: "Current Rank",
      description: "Select the rank used for the competitive win price.",
      type: "select",
      required: true,
      options: ranks,
      defaultValue: "bronze",
    },
    {
      key: "wins",
      label: "Competitive Wins",
      description: "Choose the number of competitive wins you need.",
      type: "number",
      required: true,
      min: 1,
      step: 1,
      defaultValue: 1,
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
      options: platforms,
      defaultValue: "pc",
    },
  ],
  notes: [
    "Final pricing is recalculated and validated on the server before the order is stored.",
    "Server and platform selections are saved with your order.",
    "Order status and fulfillment communication remain connected to your BoostingPedia order workspace.",
  ],
};

const schemasByServiceId: Record<string, ServiceConfiguratorSchema> = {
  service_ow_wins: winsSchema,
};

export function getOverwatchConfiguratorSchema(serviceId: string) {
  return schemasByServiceId[serviceId];
}
