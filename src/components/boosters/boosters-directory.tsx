"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  Filter,
  Gamepad2,
  Languages,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Container } from "@/components/layout/container";
import { rocketLeagueBoosters } from "@/features/boosters/data/rocket-league-boosters";

type BoosterEntry = {
  slug: string;
  nickname: string;
  rank: string;
  rating: number;
  region: string;
  languages: readonly string[];
  experience: string;
  services: string;
  specialty: string;
  image: string;
  gameSlug: string;
  gameName: string;
  gameCard: string;
  profileHref: string;
};

const boosters: BoosterEntry[] = rocketLeagueBoosters.map((booster) => ({
  ...booster,
  gameSlug: "rocket-league",
  gameName: "Rocket League",
  gameCard: "/game-cards/rocket-league.webp",
  profileHref: "/boosters/rocket-league",
}));

const boosterPortraitPosition: Record<string, string> = {
  brunspart: "center 18%",
  fastbooster: "58% 18%",
};

const gameOptions = Array.from(
  new Map(boosters.map((booster) => [booster.gameSlug, booster.gameName])).entries(),
).map(([slug, name]) => ({ slug, name }));

const regionOptions = Array.from(new Set(boosters.map((booster) => booster.region))).sort();

const languageOptions = Array.from(
  new Set(boosters.flatMap((booster) => [...booster.languages])),
).sort();

function SelectShell({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-gaming-label text-[10px] uppercase tracking-[0.12em] text-[#6F7B74]">
        {label}
      </span>
      <div className="relative mt-2">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-[#080D0A] px-3 pr-9 text-[13px] font-medium text-[#F4F7F5] outline-none transition-colors focus:border-[#39E56F]/30"
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#667069]" />
      </div>
    </label>
  );
}

function BoosterCard({ booster }: { booster: BoosterEntry }) {
  return (
    <article className="group overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#0B110E] transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-white/[0.14]">
      <div className="relative h-[178px] overflow-hidden border-b border-white/[0.06]">
        <Image
          src={booster.gameCard}
          alt=""
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,7,.08),rgba(5,8,7,.18)_42%,rgba(5,8,7,.92)_100%)]" />

        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-[#39E56F]/16 bg-[#050807]/80 px-3 py-1.5 text-[10px] font-semibold text-[#82F5A4] backdrop-blur-sm">
          <ShieldCheck className="size-3.5" />
          Verified
        </div>

        <div className="absolute right-4 top-4 rounded-lg border border-white/[0.08] bg-[#050807]/80 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#A0AAA4] backdrop-blur-sm">
          {booster.gameName}
        </div>

        <div className="absolute -bottom-8 left-4 size-[82px] overflow-hidden rounded-full border-[3px] border-[#0B110E] bg-[#080D0A] shadow-[0_6px_18px_rgba(0,0,0,.22)]">
          <Image
            src={booster.image}
            alt={`${booster.nickname} booster`}
            fill
            sizes="82px"
            className="object-cover"
            style={{ objectPosition: boosterPortraitPosition[booster.slug] ?? "center 18%" }}
          />
        </div>
      </div>

      <div className="px-4 pb-4 pt-11 sm:px-5 sm:pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-[20px] font-bold tracking-[-0.03em] text-[#F4F7F5]">
                {booster.nickname}
              </h2>
              <CheckCircle2
                className="size-4 shrink-0 text-[#4DA3FF]/80"
                aria-label="Verified booster"
              />
            </div>

            <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[#A0AAA4]">
              <Trophy className="size-3.5 text-[#667069]" />
              <span className="truncate">{booster.rank}</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.08] bg-[#080D0A] px-2.5 py-1.5 text-[11px] font-semibold text-[#F4F7F5]">
            <Star className="size-3.5 fill-[#F4F7F5] text-[#F4F7F5]" />
            {booster.rating.toFixed(1)}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-white/[0.06] bg-[#080D0A] p-3">
            <p className="font-gaming-label text-[8px] uppercase tracking-[0.11em] text-[#667069]">
              Experience
            </p>
            <p className="mt-1.5 text-[12px] font-semibold text-[#F4F7F5]">
              {booster.experience}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#080D0A] p-3">
            <p className="font-gaming-label text-[8px] uppercase tracking-[0.11em] text-[#667069]">
              Region
            </p>
            <p className="mt-1.5 truncate text-[12px] font-semibold text-[#F4F7F5]">
              {booster.region}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {booster.languages.map((language) => (
            <span
              key={language}
              className="inline-flex min-h-7 items-center rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 text-[10px] font-medium text-[#A0AAA4]"
            >
              {language}
            </span>
          ))}
        </div>

        <div className="mt-4 border-t border-white/[0.06] pt-4">
          <p className="font-gaming-label text-[8px] uppercase tracking-[0.11em] text-[#667069]">
            Specialty
          </p>
          <p className="mt-1.5 line-clamp-2 text-[12px] leading-5 text-[#A0AAA4]">
            {booster.specialty}
          </p>
        </div>

        <Link
          href={booster.profileHref}
          className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl border border-[#39E56F]/14 bg-[#39E56F]/[0.045] text-[11px] font-semibold text-[#82F5A4] transition-colors hover:border-[#39E56F]/22 hover:bg-[#39E56F]/[0.075]"
        >
          View booster details
        </Link>
      </div>
    </article>
  );
}

export function BoostersDirectory() {
  const [game, setGame] = useState("all");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [language, setLanguage] = useState("all");

  const filteredBoosters = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return boosters.filter((booster) => {
      if (game !== "all" && booster.gameSlug !== game) return false;
      if (region !== "all" && booster.region !== region) return false;
      if (language !== "all" && !booster.languages.some((item) => item === language)) {
        return false;
      }

      if (!normalizedQuery) return true;

      return [
        booster.nickname,
        booster.gameName,
        booster.rank,
        booster.region,
        booster.specialty,
        booster.services,
        ...booster.languages,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [game, language, query, region]);

  function resetFilters() {
    setGame("all");
    setQuery("");
    setRegion("all");
    setLanguage("all");
  }

  return (
    <>
      <section className="border-b border-white/[0.06] bg-[#090D0B]/55">
        <Container className="py-10 sm:py-12 lg:py-14">
          <div className="flex max-w-3xl items-start gap-4 sm:gap-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-[15px] border border-[#39E56F]/14 bg-[#39E56F]/[0.045] text-[#82F5A4]">
              <ShieldCheck className="size-5" />
            </span>

            <div>
              <p className="font-gaming-label text-[10px] uppercase tracking-[0.16em] text-[#82F5A4]/75">
                Verified boosters
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#F4F7F5] sm:text-4xl">
                Meet the players behind the services.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#A0AAA4] sm:text-[15px]">
                Browse the current verified BoostingPedia roster and filter profiles by game, region, language, or name.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-8 sm:py-10 lg:py-12">
        <Container>
          <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="rounded-[18px] border border-white/[0.08] bg-[#0B110E] p-4 lg:sticky lg:top-20">
              <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-2">
                  <Filter className="size-4 text-[#39D5E6]/70" />
                  <h2 className="text-[15px] font-bold text-[#F4F7F5]">
                    Filters
                  </h2>
                </div>

                <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[9px] font-semibold text-[#A0AAA4]">
                  {filteredBoosters.length} found
                </span>
              </div>

              <div className="mt-4 space-y-5">
                <SelectShell label="Game" value={game} onChange={setGame}>
                  <option value="all">All games</option>
                  {gameOptions.map((option) => (
                    <option key={option.slug} value={option.slug}>
                      {option.name}
                    </option>
                  ))}
                </SelectShell>

                <label className="block">
                  <span className="font-gaming-label text-[10px] uppercase tracking-[0.12em] text-[#6F7B74]">
                    Search
                  </span>
                  <div className="relative mt-2">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#667069]" />
                    <input
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Username, rank..."
                      className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#080D0A] pl-10 pr-3 text-[13px] text-[#F4F7F5] outline-none placeholder:text-[#536059] focus:border-[#39E56F]/30"
                    />
                  </div>
                </label>

                <SelectShell label="Region" value={region} onChange={setRegion}>
                  <option value="all">All regions</option>
                  {regionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </SelectShell>

                <SelectShell label="Language" value={language} onChange={setLanguage}>
                  <option value="all">All languages</option>
                  {languageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </SelectShell>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] text-[11px] font-semibold text-[#A0AAA4] transition-colors hover:bg-white/[0.04] hover:text-[#F4F7F5]"
                >
                  <SlidersHorizontal className="size-3.5" />
                  Reset filters
                </button>
              </div>
            </aside>

            <div className="min-w-0">
              <div className="mb-5 flex flex-col gap-3 border-b border-white/[0.06] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-gaming-label text-[9px] uppercase tracking-[0.12em] text-[#667069]">
                    Booster directory
                  </p>
                  <p className="mt-1 text-[13px] text-[#A0AAA4]">
                    {filteredBoosters.length === boosters.length
                      ? `${boosters.length} verified profiles available`
                      : `${filteredBoosters.length} of ${boosters.length} profiles shown`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#667069]">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] px-2.5 py-1.5">
                    <Gamepad2 className="size-3" />
                    {game === "all"
                      ? "All games"
                      : gameOptions.find((option) => option.slug === game)?.name}
                  </span>
                  {region !== "all" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] px-2.5 py-1.5">
                      <MapPin className="size-3" />
                      {region}
                    </span>
                  ) : null}
                  {language !== "all" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] px-2.5 py-1.5">
                      <Languages className="size-3" />
                      {language}
                    </span>
                  ) : null}
                </div>
              </div>

              {filteredBoosters.length ? (
                <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                  {filteredBoosters.map((booster) => (
                    <BoosterCard key={`${booster.gameSlug}-${booster.slug}`} booster={booster} />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[320px] items-center justify-center rounded-[18px] border border-dashed border-white/[0.08] bg-[#0B110E] px-6 text-center">
                  <div>
                    <Search className="mx-auto size-5 text-[#667069]" />
                    <h2 className="mt-3 text-[15px] font-bold text-[#F4F7F5]">
                      No boosters match these filters
                    </h2>
                    <p className="mt-2 text-[12px] text-[#A0AAA4]">
                      Reset the filters to view the full verified roster.
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-4 rounded-xl border border-[#39E56F]/14 bg-[#39E56F]/[0.045] px-4 py-2 text-[11px] font-semibold text-[#82F5A4]"
                    >
                      Reset filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
