"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  Filter,
  Languages,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Container } from "@/components/layout/container";
import { rocketLeagueBoosters } from "@/features/boosters/data/rocket-league-boosters";

type BoosterEntry = {
  slug: string;
  nickname: string;
  rank: string;
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
  slug: booster.slug,
  nickname: booster.nickname,
  rank: booster.rank,
  region: booster.region,
  languages: booster.languages,
  experience: booster.experience,
  services: booster.services,
  specialty: booster.specialty,
  image: booster.image,
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
          className="h-10 w-full appearance-none rounded-xl border border-white/[0.07] bg-[#080D0A] px-3 pr-9 text-[13px] font-medium text-[#F4F7F5] outline-none transition-colors focus:border-[#39E56F]/30"
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
    <article className="group overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#0B110E] shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-white/[0.14] hover:shadow-[0_10px_28px_rgba(0,0,0,0.20)]">
      <div className="relative h-[142px] overflow-hidden border-b border-white/[0.06] bg-[#080D0A] sm:h-[150px]">
        <Image
          src={booster.gameCard}
          alt=""
          fill
          sizes="(min-width: 1280px) 40vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover object-[62%_48%] opacity-80 transition-transform duration-300 group-hover:scale-[1.015]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,7,.70),rgba(5,8,7,.14)_52%,rgba(5,8,7,.35)),linear-gradient(0deg,rgba(5,8,7,.52),transparent_62%)]" />

        <div className="absolute bottom-3 left-4 inline-flex items-center gap-2 rounded-lg border border-[#39D5E6]/14 bg-[#050807]/82 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#7DE7F2] backdrop-blur-sm">
          <span className="size-1.5 rounded-full bg-[#39D5E6]/75" />
          {booster.gameName}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-3.5">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-full border border-white/[0.10] bg-[#080D0A]">
            <Image
              src={booster.image}
              alt={`${booster.nickname} booster`}
              fill
              sizes="56px"
              className="object-cover"
              style={{ objectPosition: boosterPortraitPosition[booster.slug] ?? "center 18%" }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-[20px] font-bold tracking-[-0.03em] text-[#F4F7F5]">
                {booster.nickname}
              </h2>
              <CheckCircle2
                className="size-4 shrink-0 text-[#82F5A4]/85"
                aria-label="Verified booster"
              />
            </div>

            <div className="mt-1.5 flex items-center gap-2 text-[13px] text-[#A0AAA4]">
              <Trophy className="size-3.5 text-[#39D5E6]/55" />
              <span className="truncate">{booster.rank}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 divide-x divide-white/[0.06] border-y border-white/[0.06] py-3.5">
          <div className="pr-4">
            <p className="font-gaming-label text-[10px] uppercase tracking-[0.11em] text-[#667069]">
              Experience
            </p>
            <p className="mt-1.5 text-[13px] font-semibold text-[#F4F7F5]">
              {booster.experience}
            </p>
          </div>

          <div className="pl-4">
            <p className="font-gaming-label text-[10px] uppercase tracking-[0.11em] text-[#667069]">
              Region
            </p>
            <p className="mt-1.5 truncate text-[13px] font-semibold text-[#F4F7F5]">
              {booster.region}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2 text-[#667069]">
            <Languages className="size-3.5" />
            <p className="font-gaming-label text-[10px] uppercase tracking-[0.11em]">Languages</p>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {booster.languages.map((language) => (
              <span
                key={language}
                className="inline-flex min-h-7 items-center rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 text-[10px] font-medium text-[#A0AAA4]"
              >
                {language}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 border-t border-white/[0.06] pt-4">
          <p className="font-gaming-label text-[10px] uppercase tracking-[0.11em] text-[#667069]">
            Specialty
          </p>
          <p className="mt-1.5 min-h-10 text-[13px] leading-5 text-[#A0AAA4]">
            {booster.specialty}
          </p>
        </div>

        <Link
          href={booster.profileHref}
          className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-[12px] font-semibold text-[#F4F7F5] transition-colors hover:border-[#39E56F]/18 hover:bg-[#39E56F]/[0.045] hover:text-[#82F5A4]"
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

  const resultLabel = `${filteredBoosters.length} verified ${filteredBoosters.length === 1 ? "booster" : "boosters"} available`;

  return (
    <>
      <section className="border-b border-white/[0.06] bg-[#090D0B]/55">
        <Container className="py-8 sm:py-10 lg:py-11">
          <div className="flex max-w-3xl items-start gap-4 sm:gap-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-[14px] border border-[#39E56F]/14 bg-[#39E56F]/[0.045] text-[#82F5A4]">
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

      <section className="py-7 sm:py-8 lg:py-9">
        <Container>
          <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)] xl:gap-7">
            <aside className="rounded-[17px] border border-white/[0.07] bg-[#0B110E] p-4 lg:sticky lg:top-20">
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3.5">
                <Filter className="size-4 text-[#39D5E6]/65" />
                <h2 className="text-[15px] font-bold text-[#F4F7F5]">Filters</h2>
              </div>

              <div className="mt-4 space-y-4">
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
                      className="h-10 w-full rounded-xl border border-white/[0.07] bg-[#080D0A] pl-10 pr-3 text-[13px] text-[#F4F7F5] outline-none placeholder:text-[#536059] focus:border-[#39E56F]/30"
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
                  className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] text-[11px] font-semibold text-[#A0AAA4] transition-colors hover:bg-white/[0.04] hover:text-[#F4F7F5]"
                >
                  <SlidersHorizontal className="size-3.5" />
                  Reset filters
                </button>
              </div>
            </aside>

            <div className="min-w-0">
              <div className="mb-5 border-b border-white/[0.06] pb-4">
                <p className="font-gaming-label text-[9px] uppercase tracking-[0.12em] text-[#667069]">
                  Booster directory
                </p>
                <p className="mt-1 text-[13px] font-medium text-[#A0AAA4]">{resultLabel}</p>
              </div>

              {filteredBoosters.length ? (
                <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr))]">
                  {filteredBoosters.map((booster) => (
                    <BoosterCard key={`${booster.gameSlug}-${booster.slug}`} booster={booster} />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[320px] items-center justify-center rounded-[18px] border border-dashed border-white/[0.08] bg-[#0B110E] px-6 text-center">
                  <div>
                    <Search className="mx-auto size-5 text-[#667069]" />
                    <h2 className="mt-3 text-[15px] font-bold text-[#F4F7F5]">
                      No boosters match these filters.
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
