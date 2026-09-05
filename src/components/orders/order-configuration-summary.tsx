"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import {
  GameRankValue,
  resolveGameRank,
} from "@/components/orders/game-order-presentation";

type ConfigurationValue = string | number | boolean;
type PriceLine = {
  label: string;
  amount: number;
};

const PAID_EXTRA_LABEL =
  /(play with booster|live stream|express|rank insurance|streaming|extra win)/i;

function paidExtras(lines: PriceLine[]) {
  return lines.filter(
    (line) =>
      line.amount > 0 &&
      PAID_EXTRA_LABEL.test(line.label),
  );
}

export function OrderConfigurationSummary({
  gameName,
  configuration,
  priceBreakdown,
  compact = false,
}: {
  gameName: string;
  configuration: Record<string, ConfigurationValue>;
  priceBreakdown: PriceLine[];
  compact?: boolean;
}) {
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
