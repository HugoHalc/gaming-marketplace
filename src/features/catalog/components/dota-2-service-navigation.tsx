import type { ReactNode } from "react";
import { GameServiceWorkspace } from "@/features/configurator/components/game-service-navigation";
import { dota2ServiceFoundations, type Dota2ServiceSlug } from "@/features/catalog/data/dota-2-foundation";

export function Dota2ServiceNavigation({ currentSlug, children }: { currentSlug: Dota2ServiceSlug; children: ReactNode }) {
  return (
    <GameServiceWorkspace gameName="Dota 2" gameSlug="dota-2" activeSlug={currentSlug} items={dota2ServiceFoundations.map((service) => ({ slug: service.slug, label: service.name }))} accentTextClass="text-red-200/75" accentBorderClass="border-red-300/25">
      {children}
    </GameServiceWorkspace>
  );
}
