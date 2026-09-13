"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import {
  GameRankValue,
  isMarvelRivalsGame,
  isOverwatchGame,
  resolveGameRank,
} from "@/components/orders/game-order-presentation";

type ConfigurationValue = string | number | boolean;
type Configuration = Record<string, ConfigurationValue>;
type PriceLine = {
  label: string;
  amount: number;
};

const PAID_EXTRA_LABEL =
  /(play with booster|live stream|express|rank insurance|streaming|extra win)/i;

const MARVEL_PLATFORM_LABELS: Record<string, string> = {
  pc: "PC",
  xbox: "Xbox",
  playstation: "PlayStation",
};

const MARVEL_REGION_LABELS: Record<string, string> = {
  "north-america": "North America",
  europe: "Europe",
  "middle-east": "Middle East",
  "south-america": "South America",
  "asia-pacific": "Asia-Pacific",
};

const MARVEL_BOOST_METHOD_LABELS: Record<string, string> = {
  solo: "Solo",
  duo: "Duo",
};

const MARVEL_ROLE_LABELS: Record<string, string> = {
  duelist: "Duelist",
  vanguard: "Vanguard",
  strategist: "Strategist",
  any: "Any",
};


const OVERWATCH_SERVER_LABELS: Record<string, string> = {
  "north-america": "North America",
  europe: "Europe",
  asia: "Asia",
  "middle-east": "Middle East",
};

const OVERWATCH_PLATFORM_LABELS: Record<string, string> = {
  pc: "PC",
  xbox: "Xbox",
  playstation: "PlayStation",
  "nintendo-switch": "Nintendo Switch",
};

const OVERWATCH_BOOST_METHOD_LABELS: Record<string, string> = {
  account: "Account Boost",
  duo: "Play With Booster",
};

const OVERWATCH_ROLE_LABELS: Record<string, string> = {
  tank: "Tank",
  damage: "Damage",
  support: "Support",
  "open-queue": "Open Queue",
};

function paidExtras(lines: PriceLine[]) {
  return lines.filter(
    (line) =>
      line.amount > 0 &&
      PAID_EXTRA_LABEL.test(line.label),
  );
}

function stringConfig(configuration: Configuration, key: string) {
  const value = configuration[key];
  return typeof value === "string" ? value : null;
}

function numberConfig(configuration: Configuration, key: string) {
  const value = configuration[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function mappedLabel(value: string | null, labels: Record<string, string>) {
  if (!value) return null;
  return labels[value] ?? null;
}

function MarvelDetailRows({
  rows,
  compact,
}: {
  rows: Array<[string, string]>;
  compact: boolean;
}) {
  if (!rows.length) return null;

  return (
    <div
      className={
        compact
          ? "mt-4 grid gap-x-5 gap-y-3 sm:grid-cols-2"
          : "mt-5 grid gap-x-6 gap-y-4 border-t border-white/[0.06] pt-4 sm:grid-cols-2"
      }
    >
      {rows.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <p className="font-gaming-label text-[8px] uppercase tracking-[0.12em] text-[#CEC5FF]/50">
            {label}
          </p>
          <p
            className={`${compact ? "mt-1 text-[10px]" : "mt-1.5 text-[12px]"} break-words font-semibold text-[#F4F7F5]`}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

function MarvelExtras({
  configuration,
  compact,
}: {
  configuration: Configuration;
  compact: boolean;
}) {
  const extras: string[] = [];

  if (configuration.playOffline === true) extras.push("Play Offline");
  if (configuration.specificHeroes === true) extras.push("Specific Heroes");
  if (configuration.streaming === true) extras.push("Streaming");
  if (configuration.expressDelivery === true) extras.push("Express Delivery");

  if (!extras.length) return null;

  return (
    <div className="mt-5">
      <div className="flex items-center gap-2">
        <Sparkles
          className={
            compact
              ? "size-3.5 text-[#CEC5FF]/60"
              : "size-4 text-[#CEC5FF]/70"
          }
        />
        <p
          className={
            compact
              ? "font-gaming-label text-[8px] uppercase tracking-[0.13em] text-[#667069]"
              : "font-gaming-label text-[10px] uppercase tracking-[0.12em] text-[#6F7B74]"
          }
        >
          Extras
        </p>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {extras.map((extra) => (
          <span
            key={extra}
            className={
              compact
                ? "inline-flex min-h-7 items-center rounded-lg border border-[#A38CFF]/12 bg-[#7A63F2]/[0.035] px-2.5 text-[9px] font-semibold text-[#E5E0FF]"
                : "inline-flex min-h-8 items-center rounded-[10px] border border-[#A38CFF]/18 bg-[#7A63F2]/[0.05] px-3 text-[11px] font-semibold text-[#CEC5FF]"
            }
          >
            {extra}
          </span>
        ))}
      </div>
    </div>
  );
}

function MarvelRivalsConfigurationSummary({
  configuration,
  compact,
}: {
  configuration: Configuration;
  compact: boolean;
}) {
  const currentRankValue = stringConfig(configuration, "currentRank");
  const currentDivision = stringConfig(configuration, "currentDivision");
  const targetRankValue = stringConfig(configuration, "targetRank");
  const targetDivision = stringConfig(configuration, "targetDivision");
  const previousRankValue = stringConfig(configuration, "previousRank");
  const previousDivision = stringConfig(configuration, "previousDivision");

  const currentRank = resolveGameRank(
    "Marvel Rivals",
    currentRankValue,
    currentDivision,
  );
  const targetRank = resolveGameRank(
    "Marvel Rivals",
    targetRankValue,
    targetDivision,
  );
  const previousRank = resolveGameRank(
    "Marvel Rivals",
    previousRankValue,
    previousDivision,
  );

  const wins = numberConfig(configuration, "wins");
  const matches = numberConfig(configuration, "matches");
  const games = numberConfig(configuration, "games");
  const eternityPoints = numberConfig(configuration, "eternityPoints");
  const currentProficiency = numberConfig(configuration, "currentProficiency");
  const targetProficiency = numberConfig(configuration, "targetProficiency");
  const hero = stringConfig(configuration, "hero");

  const platform = mappedLabel(
    stringConfig(configuration, "platform"),
    MARVEL_PLATFORM_LABELS,
  );
  const region = mappedLabel(
    stringConfig(configuration, "region"),
    MARVEL_REGION_LABELS,
  );
  const boostMethod = mappedLabel(
    stringConfig(configuration, "boostMethod"),
    MARVEL_BOOST_METHOD_LABELS,
  );
  const role = mappedLabel(
    stringConfig(configuration, "role"),
    MARVEL_ROLE_LABELS,
  );

  const detailRows: Array<[string, string]> = [];

  if (matches !== null) detailRows.push(["Placement Matches", String(matches)]);
  if (wins !== null) detailRows.push(["Wins", String(wins)]);
  if (currentRankValue === "eternity" && eternityPoints !== null) {
    detailRows.push(["Eternity Points", String(eternityPoints)]);
  }
  if (games !== null) detailRows.push(["Games", String(games)]);
  if (platform) detailRows.push(["Platform", platform]);
  if (region) detailRows.push(["Region", region]);
  if (boostMethod) detailRows.push(["Boost Method", boostMethod]);
  if (role) detailRows.push(["Role", role]);

  const hasHeroProgression =
    Boolean(hero) && currentProficiency !== null && targetProficiency !== null;
  const hasRankProgression = Boolean(currentRank && targetRank);
  const hasSingleRank = Boolean(previousRank || (currentRank && !targetRank));
  const hasExtras =
    configuration.playOffline === true ||
    configuration.specificHeroes === true ||
    configuration.streaming === true ||
    configuration.expressDelivery === true;

  if (
    !hasHeroProgression &&
    !hasRankProgression &&
    !hasSingleRank &&
    !detailRows.length &&
    !hasExtras
  ) {
    return null;
  }

  return (
    <section
      className={
        compact
          ? "border-t border-white/[0.05] pt-5"
          : "rounded-[18px] border border-white/[0.07] bg-[#0B110E] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
      }
    >
      <h2
        className={
          compact
            ? "text-[13px] font-semibold text-[#F4F7F5]"
            : "text-[18px] font-bold tracking-[-0.02em] text-[#F4F7F5]"
        }
      >
        Configuration
      </h2>

      {hasRankProgression ? (
        <div
          className={
            compact
              ? "mt-4 grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4"
              : "mt-5 grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-y border-white/[0.06] py-4 sm:gap-6"
          }
        >
          <GameRankValue
            gameName="Marvel Rivals"
            value={currentRankValue}
            division={currentDivision}
            label="Current Rank"
            size={compact ? "sm" : "md"}
          />
          <ArrowRight className="size-4 shrink-0 text-[#CEC5FF]/35" />
          <GameRankValue
            gameName="Marvel Rivals"
            value={targetRankValue}
            division={targetDivision}
            label="Desired Rank"
            size={compact ? "sm" : "md"}
          />
        </div>
      ) : previousRank ? (
        <div
          className={
            compact
              ? "mt-4"
              : "mt-5 border-y border-white/[0.06] py-4"
          }
        >
          <GameRankValue
            gameName="Marvel Rivals"
            value={previousRankValue}
            division={previousDivision}
            label="Previous Rank"
            size={compact ? "md" : "lg"}
          />
        </div>
      ) : currentRank ? (
        <div
          className={
            compact
              ? "mt-4"
              : "mt-5 border-y border-white/[0.06] py-4"
          }
        >
          <GameRankValue
            gameName="Marvel Rivals"
            value={currentRankValue}
            division={currentDivision}
            label="Current Rank"
            size={compact ? "md" : "lg"}
          />
        </div>
      ) : null}

      {hasHeroProgression ? (
        <div
          className={
            compact
              ? "mt-4 rounded-xl border border-[#A38CFF]/10 bg-[#7A63F2]/[0.025] p-3"
              : "mt-5 rounded-xl border border-[#A38CFF]/12 bg-[#7A63F2]/[0.03] p-4"
          }
        >
          <p className="font-gaming-label text-[8px] uppercase tracking-[0.12em] text-[#CEC5FF]/50">
            Hero
          </p>
          <p className={`${compact ? "mt-1 text-[11px]" : "mt-1.5 text-sm"} font-semibold text-[#F4F7F5]`}>
            {hero}
          </p>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-[#A0AAA4]">
            <span>Proficiency</span>
            <span className="font-gaming-value font-bold text-[#F4F7F5]">
              {currentProficiency}
            </span>
            <ArrowRight className="size-3.5 text-[#CEC5FF]/35" />
            <span className="font-gaming-value font-bold text-[#F4F7F5]">
              {targetProficiency}
            </span>
          </div>
        </div>
      ) : null}

      <MarvelDetailRows rows={detailRows} compact={compact} />
      <MarvelExtras configuration={configuration} compact={compact} />
    </section>
  );
}


function OverwatchDetailRows({
  rows,
  compact,
}: {
  rows: Array<[string, string]>;
  compact: boolean;
}) {
  if (!rows.length) return null;

  return (
    <div
      className={
        compact
          ? "mt-4 grid gap-x-5 gap-y-3 sm:grid-cols-2"
          : "mt-5 grid gap-x-6 gap-y-4 border-t border-white/[0.06] pt-4 sm:grid-cols-2"
      }
    >
      {rows.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <p className="font-gaming-label text-[8px] uppercase tracking-[0.12em] text-amber-200/55">
            {label}
          </p>
          <p
            className={`${compact ? "mt-1 text-[10px]" : "mt-1.5 text-[12px]"} break-words font-semibold text-[#F4F7F5]`}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

function OverwatchExtras({
  configuration,
  compact,
}: {
  configuration: Configuration;
  compact: boolean;
}) {
  const extras: string[] = [];

  if (configuration.playOffline === true) extras.push("Play Offline");
  if (configuration.specificHeroes === true) extras.push("Specific Heroes");
  if (configuration.streaming === true) extras.push("Streaming");
  if (configuration.expressDelivery === true) extras.push("Express Delivery");
  if (configuration.extraWin === true) extras.push("+1 Bonus Win");
  if (configuration.rankInsurance === true) extras.push("Rank Insurance");

  if (!extras.length) return null;

  return (
    <div className="mt-5">
      <div className="flex items-center gap-2">
        <Sparkles className={compact ? "size-3.5 text-amber-200/60" : "size-4 text-amber-200/70"} />
        <p
          className={
            compact
              ? "font-gaming-label text-[8px] uppercase tracking-[0.13em] text-[#667069]"
              : "font-gaming-label text-[10px] uppercase tracking-[0.12em] text-[#6F7B74]"
          }
        >
          Extras
        </p>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {extras.map((extra) => (
          <span
            key={extra}
            className={
              compact
                ? "inline-flex min-h-7 items-center rounded-lg border border-amber-300/12 bg-amber-300/[0.035] px-2.5 text-[9px] font-semibold text-amber-100"
                : "inline-flex min-h-8 items-center rounded-[10px] border border-amber-300/18 bg-amber-300/[0.05] px-3 text-[11px] font-semibold text-amber-100"
            }
          >
            {extra}
          </span>
        ))}
      </div>
    </div>
  );
}

function OverwatchConfigurationSummary({
  serviceName,
  configuration,
  compact,
}: {
  serviceName?: string;
  configuration: Configuration;
  compact: boolean;
}) {
  const normalizedService = serviceName?.trim().toLowerCase() ?? "";
  const isRankBoost = normalizedService === "rank boost" || Boolean(configuration.targetRank);
  const isDrives =
    normalizedService === "competitive drives" ||
    typeof configuration.driveRank !== "undefined" ||
    typeof configuration.currentDrive !== "undefined";
  const isWins =
    normalizedService === "competitive wins" ||
    (typeof configuration.wins !== "undefined" && !isRankBoost && !isDrives);
  const isPlacements =
    normalizedService === "placements boost" ||
    (typeof configuration.matches !== "undefined" &&
      typeof configuration.currentRank !== "undefined" &&
      !isWins &&
      !isDrives);
  const isUnrated =
    normalizedService === "unrated matches" ||
    (typeof configuration.matches !== "undefined" &&
      typeof configuration.currentRank === "undefined" &&
      !isDrives);

  const currentRankValue = stringConfig(configuration, "currentRank");
  const targetRankValue = stringConfig(configuration, "targetRank");
  const driveRankValue = stringConfig(configuration, "driveRank");
  const currentRank = resolveGameRank("Overwatch 2", currentRankValue);
  const targetRank = resolveGameRank("Overwatch 2", targetRankValue);
  const driveRank = resolveGameRank("Overwatch 2", driveRankValue);

  const wins = numberConfig(configuration, "wins");
  const matches = numberConfig(configuration, "matches");
  const currentDrive = numberConfig(configuration, "currentDrive");
  const desiredDrive = numberConfig(configuration, "desiredDrive");
  const boosters = numberConfig(configuration, "boosters");

  const server = mappedLabel(
    stringConfig(configuration, "server"),
    OVERWATCH_SERVER_LABELS,
  );
  const platform = mappedLabel(
    stringConfig(configuration, "platform"),
    OVERWATCH_PLATFORM_LABELS,
  );
  const boostMethodValue = stringConfig(configuration, "boostMethod");
  const boostMethod = mappedLabel(
    boostMethodValue,
    OVERWATCH_BOOST_METHOD_LABELS,
  );
  const role = mappedLabel(
    stringConfig(configuration, "role"),
    OVERWATCH_ROLE_LABELS,
  );

  const detailRows: Array<[string, string]> = [];
  if (isWins && wins !== null) detailRows.push(["Wins", String(wins)]);
  if ((isPlacements || isUnrated) && matches !== null) {
    detailRows.push([isPlacements ? "Placement Matches" : "Matches", String(matches)]);
  }
  if (server) detailRows.push(["Server", server]);
  if (platform) detailRows.push(["Platform", platform]);
  if (boostMethod) detailRows.push(["Boost Method", boostMethod]);
  if (boostMethodValue === "duo" && boosters !== null) {
    detailRows.push(["Boosters", String(boosters)]);
  }
  if (role) detailRows.push(["Role / Queue", role]);

  const hasExtras =
    configuration.playOffline === true ||
    configuration.specificHeroes === true ||
    configuration.streaming === true ||
    configuration.expressDelivery === true ||
    configuration.extraWin === true ||
    configuration.rankInsurance === true;

  const hasPrimaryPresentation =
    Boolean((isRankBoost && (currentRank || targetRank)) ||
      ((isWins || isPlacements) && currentRank) ||
      (isDrives && driveRank));

  if (!hasPrimaryPresentation && !detailRows.length && !hasExtras) return null;

  return (
    <section
      className={
        compact
          ? "border-t border-white/[0.05] pt-5"
          : "rounded-[18px] border border-white/[0.07] bg-[#0B110E] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
      }
    >
      <h2
        className={
          compact
            ? "text-[13px] font-semibold text-[#F4F7F5]"
            : "text-[18px] font-bold tracking-[-0.02em] text-[#F4F7F5]"
        }
      >
        Configuration
      </h2>

      {isRankBoost && (currentRank || targetRank) ? (
        <div
          className={
            compact
              ? "mt-4 grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4"
              : "mt-5 grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-y border-white/[0.06] py-4 sm:gap-6"
          }
        >
          {currentRank ? (
            <GameRankValue
              gameName="Overwatch 2"
              value={currentRankValue}
              label="Current Rank"
              size={compact ? "sm" : "md"}
            />
          ) : <span />}
          <ArrowRight className="size-4 shrink-0 text-amber-200/35" />
          {targetRank ? (
            <GameRankValue
              gameName="Overwatch 2"
              value={targetRankValue}
              label="Target Rank"
              size={compact ? "sm" : "md"}
            />
          ) : <span />}
        </div>
      ) : (isWins || isPlacements) && currentRank ? (
        <div className={compact ? "mt-4" : "mt-5 border-y border-white/[0.06] py-4"}>
          <GameRankValue
            gameName="Overwatch 2"
            value={currentRankValue}
            label={isPlacements ? "Previous Rank" : "Current Rank"}
            size={compact ? "md" : "lg"}
          />
        </div>
      ) : isDrives && driveRank ? (
        <div className={compact ? "mt-4" : "mt-5 border-y border-white/[0.06] py-4"}>
          <GameRankValue
            gameName="Overwatch 2"
            value={driveRankValue}
            label="Drive Rank"
            size={compact ? "md" : "lg"}
          />
          {currentDrive !== null && desiredDrive !== null ? (
            <div className="mt-3 flex min-w-0 items-center gap-2 text-[11px] text-[#A0AAA4]">
              <span>Drive</span>
              <span className="font-gaming-value font-bold text-[#F4F7F5]">
                {currentDrive.toLocaleString("en-US")}
              </span>
              <ArrowRight className="size-3.5 text-amber-200/35" />
              <span className="font-gaming-value font-bold text-[#F4F7F5]">
                {desiredDrive.toLocaleString("en-US")}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      <OverwatchDetailRows rows={detailRows} compact={compact} />
      <OverwatchExtras configuration={configuration} compact={compact} />
    </section>
  );
}

export function OrderConfigurationSummary({
  gameName,
  serviceName,
  configuration,
  priceBreakdown,
  compact = false,
}: {
  gameName: string;
  serviceName?: string;
  configuration: Configuration;
  priceBreakdown: PriceLine[];
  compact?: boolean;
}) {
  if (isMarvelRivalsGame(gameName)) {
    return (
      <MarvelRivalsConfigurationSummary
        configuration={configuration}
        compact={compact}
      />
    );
  }

  if (isOverwatchGame(gameName)) {
    return (
      <OverwatchConfigurationSummary
        serviceName={serviceName}
        configuration={configuration}
        compact={compact}
      />
    );
  }

  const currentValue =
    typeof configuration.currentRank !== "undefined"
      ? configuration.currentRank
      : configuration.previousRank;

  const desiredValue = configuration.targetRank;

  const currentRank = resolveGameRank(gameName, currentValue);
  const desiredRank = resolveGameRank(gameName, desiredValue);
  const extras = paidExtras(priceBreakdown);

  if (!currentRank && !desiredRank && !extras.length) {
    return null;
  }

  return (
    <section
      className={
        compact
          ? "border-t border-white/[0.05] pt-5"
          : "rounded-[18px] border border-white/[0.07] bg-[#0B110E] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
      }
    >
      <h2
        className={
          compact
            ? "text-[13px] font-semibold text-[#F4F7F5]"
            : "text-[18px] font-bold tracking-[-0.02em] text-[#F4F7F5]"
        }
      >
        Configuration
      </h2>

      {(currentRank || desiredRank) ? (
        <div className={compact ? "mt-4 flex min-w-0 items-center gap-4 sm:gap-5" : "mt-5 flex min-w-0 items-center gap-5 border-y border-white/[0.06] py-4 sm:gap-6"}>
          {currentRank ? (
            <GameRankValue
              gameName={gameName}
              value={currentValue}
              label="Current Rank"
              size={compact ? "md" : "lg"}
            />
          ) : null}

          {currentRank && desiredRank ? (
            <ArrowRight className={compact ? "size-4 shrink-0 text-blue-200/30" : "size-4 shrink-0 text-[#4DA3FF]/45"} />
          ) : null}

          {desiredRank ? (
            <GameRankValue
              gameName={gameName}
              value={desiredValue}
              label="Desired Rank"
              size={compact ? "md" : "lg"}
            />
          ) : null}
        </div>
      ) : null}

      {extras.length ? (
        <div className="mt-5">
          <div className="flex items-center gap-2">
            <Sparkles className={compact ? "size-3.5 text-[#82F5A4]/70" : "size-4 text-[#82F5A4]/80"} />
            <p className={compact ? "font-gaming-label text-[8px] uppercase tracking-[0.13em] text-[#667069]" : "font-gaming-label text-[10px] uppercase tracking-[0.12em] text-[#6F7B74]"}>
              Paid Extras
            </p>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {extras.map((extra, index) => (
              <span
                key={`${extra.label}-${index}`}
                className={compact ? "inline-flex min-h-7 items-center rounded-lg border border-[#39E56F]/12 bg-[#39E56F]/[0.035] px-2.5 text-[9px] font-semibold text-[#DDFBE7]" : "inline-flex min-h-8 items-center rounded-[10px] border border-[#39E56F]/18 bg-[#39E56F]/[0.05] px-3 text-[11px] font-semibold text-[#82F5A4]"}
              >
                {extra.label}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
