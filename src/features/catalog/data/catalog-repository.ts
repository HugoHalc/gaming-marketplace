import { createPublicServerClient } from "@/lib/supabase/server";
import { hasPublicSupabaseEnv } from "@/lib/supabase/env";
import type { CatalogGame, GameAccent, GameStatus, ServiceCategory, ServiceStatus } from "../types/catalog";
import { getCatalogGameBySlug as getMockGameBySlug, getCatalogGames as getMockGames } from "./catalog-selectors";
import { withRocketLeagueServiceNavigation } from "./rocket-league-services";
import { withValorantServiceNavigation } from "./valorant-services";

type DbService = {
  id: string;
  game_id: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  description: string;
  starting_price_cents: number;
  currency: "USD";
  status: ServiceStatus;
  sort_order: number;
};

type DbGame = {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  accent: GameAccent;
  status: GameStatus;
  featured: boolean;
  sort_order: number;
  services: DbService[] | null;
};

function withGameSpecificServiceNavigation(game: CatalogGame) {
  return withValorantServiceNavigation(withRocketLeagueServiceNavigation(game));
}

function mapGame(row: DbGame): CatalogGame {
  const services = (row.services ?? [])
    .filter((service) => service.status === "active")
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((service) => ({
      id: service.id,
      gameId: service.game_id,
      slug: service.slug,
      name: service.name,
      category: service.category,
      description: service.description,
      startingPrice: service.starting_price_cents / 100,
      currency: service.currency,
      status: service.status,
    }));

  return withGameSpecificServiceNavigation({
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    accent: row.accent,
    status: row.status,
    featured: row.featured,
    services,
    startingPrice: services.length ? Math.min(...services.map((service) => service.startingPrice)) : null,
  });
}

export async function listCatalogGames(): Promise<CatalogGame[]> {
  if (!hasPublicSupabaseEnv()) {
    return getMockGames().map(withGameSpecificServiceNavigation);
  }

  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("games")
    .select("id, slug, name, short_description, accent, status, featured, sort_order, services(id, game_id, slug, name, category, description, starting_price_cents, currency, status, sort_order)")
    .eq("status", "active")
    .order("sort_order");

  if (error) {
    console.error("Catalog database read failed; using mock fallback.", error.message);
    return getMockGames().map(withGameSpecificServiceNavigation);
  }

  return (data as unknown as DbGame[]).map(mapGame);
}

export async function findCatalogGameBySlug(slug: string): Promise<CatalogGame | undefined> {
  if (!hasPublicSupabaseEnv()) {
    const game = getMockGameBySlug(slug);
    return game ? withGameSpecificServiceNavigation(game) : undefined;
  }

  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("games")
    .select("id, slug, name, short_description, accent, status, featured, sort_order, services(id, game_id, slug, name, category, description, starting_price_cents, currency, status, sort_order)")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    console.error("Game database read failed; using mock fallback.", error.message);
    const game = getMockGameBySlug(slug);
    return game ? withGameSpecificServiceNavigation(game) : undefined;
  }

  return data ? mapGame(data as unknown as DbGame) : undefined;
}
