import type { ReactNode } from "react";
import { GameServiceWorkspace } from "@/features/configurator/components/game-service-navigation";
import { rainbowSixSiegeServiceFoundations, type RainbowSixSiegeServiceSlug } from "@/features/catalog/data/rainbow-six-siege-foundation";

export function RainbowSixSiegeServiceNavigation({ currentSlug, children }: { currentSlug: RainbowSixSiegeServiceSlug; children: ReactNode }) {
  return (
    <GameServiceWorkspace gameName="Rainbow Six Siege" gameSlug="rainbow-six-siege" activeSlug={currentSlug} items={rainbowSixSiegeServiceFoundations.filter((service) => service.status === "active").map((service) => ({ slug: service.slug, label: service.name }))} accentTextClass="text-emerald-200/75" accentBorderClass="border-emerald-300/25">
      {children}
    </GameServiceWorkspace>
  );
}
