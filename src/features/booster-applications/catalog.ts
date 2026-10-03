import { publicGameNavigation } from "@/features/catalog/data/launch-games";
import { getOverwatchConfiguratorSchema } from "@/features/configurator/data/overwatch-configurators";
import { getValorantConfiguratorSchema } from "@/features/configurator/data/valorant-configurators";
import { rainbowSixSiegePlatformOptions } from "@/features/configurator/data/rainbow-six-siege-rank-options";

export type ApplicationGame = {
  slug: string;
  name: string;
  platforms: { value: string; label: string }[];
};
const schemaPlatforms = (
  schema: ReturnType<typeof getOverwatchConfiguratorSchema>,
) =>
  (schema?.fields.find((field) => field.key === "platform")?.options ?? []).map(
    ({ value, label }) => ({ value, label }),
  );

// These are adapters to existing exported options, not a second platform catalog.
const reusablePlatforms: Record<string, ApplicationGame["platforms"]> = {
  "overwatch-2": schemaPlatforms(
    getOverwatchConfiguratorSchema("service_ow_rank"),
  ),
  valorant: schemaPlatforms(getValorantConfiguratorSchema("service_val_rank")),
  "rainbow-six-siege": rainbowSixSiegePlatformOptions.map(
    ({ value, label }) => ({ value, label }),
  ),
};
export const applicationGames: ApplicationGame[] = publicGameNavigation.map(
  (game) => ({
    slug: game.slug,
    name: game.name === "VALORANT" ? "Valorant" : game.name,
    platforms: reusablePlatforms[game.slug] ?? [],
  }),
);
