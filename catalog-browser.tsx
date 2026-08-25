"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CatalogGame, ServiceCategory } from "../types/catalog";
import { GameCatalogCard } from "./game-catalog-card";

const filters: Array<{ label: string; value: "all" | ServiceCategory }> = [
  { label: "All services", value: "all" },
  { label: "Rank Boost", value: "rank" },
  { label: "Wins", value: "wins" },
  { label: "Placements", value: "placements" },
  { label: "Coaching", value: "coaching" },
];

export function CatalogBrowser({
  games,
  initialGameSlug,
}: {
  games: CatalogGame[];
  initialGameSlug?: string;
}) {
  const initialGame = games.find((game) => game.slug === initialGameSlug);
  const [query, setQuery] = useState(initialGame?.name ?? "");
  const [category, setCategory] = useState<"all" | ServiceCategory>("all");

  const visibleGames = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return games.filter((game) => {
      const matchesCategory =
        category === "all" || game.services.some((service) => service.category === category);

      if (!matchesCategory) return false;
      if (!normalizedQuery) return true;

      const searchableText = [
        game.name,
        game.shortDescription,
        ...game.services.flatMap((service) => [service.name, service.description]),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [category, games, query]);

  const hasFilters = query.trim().length > 0 || category !== "all";

  function clearFilters() {
    setQuery("");
    setCategory("all");
  }

  return (
    <div id="catalog" className="scroll-mt-24">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <label className="relative block flex-1">
            <span className="sr-only">Search games and services</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search games or services"
              className="h-12 w-full rounded-xl border border-white/[0.09] bg-black/20 pl-11 pr-11 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-violet-300/35 focus:ring-2 focus:ring-violet-400/15"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </label>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:max-w-[58%] lg:pb-0" aria-label="Filter by service type">
            <span className="mr-1 hidden shrink-0 text-[var(--muted-foreground)] sm:inline-flex">
              <SlidersHorizontal className="size-4" />
            </span>
            {filters.map((filter) => {
              const active = category === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(filter.value)}
                  className={
                    active
                      ? "shrink-0 rounded-full border border-violet-300/25 bg-violet-400/[0.12] px-3.5 py-2 text-xs font-semibold text-violet-100"
                      : "shrink-0 rounded-full border border-white/[0.08] bg-black/15 px-3.5 py-2 text-xs font-semibold text-[var(--muted-foreground)] transition-colors hover:border-white/[0.14] hover:text-white"
                  }
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-[var(--muted-foreground)]" aria-live="polite">
          Showing <span className="font-semibold text-white">{visibleGames.length}</span> of {games.length} games
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-semibold text-violet-300 transition-colors hover:text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {visibleGames.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleGames.map((game) => (
            <GameCatalogCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.018] px-6 py-16 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-[var(--muted-foreground)]">
            <Search className="size-5" />
          </span>
          <h2 className="mt-5 text-lg font-semibold text-white">No matching games found</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
            Try a different game name, service type, or clear the current filters.
          </p>
          <Button type="button" variant="secondary" className="mt-6" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
