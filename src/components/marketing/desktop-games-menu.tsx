"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { LaunchGameCard } from "@/features/catalog/data/launch-games";

interface DesktopGamesMenuProps {
  games: LaunchGameCard[];
}

const gameNavigationVisuals = {
  "rocket-league": "/game-cards/rocket-league.webp",
  "league-of-legends": "/game-cards/league-of-legends.webp",
  valorant: "/game-cards/valorant.webp",
  "marvel-rivals": "/game-cards/marvel-rivals.webp",
  "overwatch-2": "/game-cards/overwatch.webp",
  "dota-2": "/game-cards/dota-2.webp",
  "rainbow-six-siege": "/game-cards/rainbow-six-siege.webp",
} as const;

export function DesktopGamesMenu({ games }: DesktopGamesMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    };

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="true"
        className={`inline-flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition-[background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39E56F]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050807] ${
          open
            ? "bg-white/[0.055] text-[#F4F7F5]"
            : "text-[#A0AAA4] hover:bg-white/[0.035] hover:text-[#F4F7F5]"
        }`}
      >
        Games
        <ChevronDown
          className={`size-3.5 transition-transform duration-150 motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          className="absolute left-1/2 top-[calc(100%+0.8rem)] z-[70] w-[min(46rem,calc(100vw-2rem))] -translate-x-1/2 rounded-[19px] border border-white/[0.10] bg-[#090D0B]/[0.985] p-5 shadow-[0_28px_80px_-32px_rgba(0,0,0,.92)] backdrop-blur-xl motion-safe:animate-[gamesMenuIn_180ms_ease-out]"
          aria-label="Game library"
        >
          <div className="border-b border-white/[0.07] pb-4">
            <p className="font-gaming-label text-[10px] uppercase tracking-[0.16em] text-[#7C8780]">
              GAME LIBRARY
            </p>
            <p className="mt-1.5 text-xl font-semibold tracking-[-0.025em] text-[#F4F7F5]">
              Choose your game
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-3">
            {games.map((game) => {
              const imageSrc =
                gameNavigationVisuals[game.slug as keyof typeof gameNavigationVisuals];

              const visual = (
                <span className="relative h-11 w-16 shrink-0 overflow-hidden rounded-[10px] bg-[#0E1411]">
                  <Image
                    src={imageSrc}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover object-center"
                  />
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent to-[#050807]/18" />
                </span>
              );

              if (!game.ready && !game.overviewReady) {
                return (
                  <div
                    key={game.slug}
                    aria-label={`${game.displayName}, Coming soon`}
                    className="flex min-h-[64px] cursor-default items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.018] px-3 py-2.5 opacity-65"
                  >
                    {visual}
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[#D7DDD9]">
                        {game.displayName}
                      </span>
                      <span className="mt-1 inline-flex rounded-full border border-white/[0.08] bg-white/[0.025] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-[#A0AAA4]">
                        Coming soon
                      </span>
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={game.slug}
                  href={`/games/${game.slug}`}
                  onClick={() => setOpen(false)}
                  className="group flex min-h-[64px] items-center gap-3 rounded-xl px-3 py-2.5 transition-[background-color,color] duration-150 hover:bg-white/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39E56F]/35 motion-reduce:transition-none"
                >
                  {visual}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[#D7DDD9] transition-colors group-hover:text-[#F4F7F5]">
                      {game.displayName}
                    </span>
                    <span className="mt-1 block text-[10px] text-[#667069]">
                      {game.ready ? game.category : "Coming soon"}
                    </span>
                  </span>
                  <ArrowRight
                    className="size-3.5 shrink-0 text-[#667069] transition-[color,transform] duration-150 group-hover:translate-x-0.5 group-hover:text-[#82F5A4] motion-reduce:transform-none motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>

          <div className="mt-4 flex justify-end border-t border-white/[0.07] pt-4">
            <Link
              href="/games"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-[#A0AAA4] transition-colors hover:text-[#F4F7F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39E56F]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090D0B]"
            >
              View all games
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          <style>{`
            @keyframes gamesMenuIn {
              from { opacity: 0; transform: translate(-50%, -6px); }
              to { opacity: 1; transform: translate(-50%, 0); }
            }
          `}</style>
        </div>
      ) : null}
    </div>
  );
}
