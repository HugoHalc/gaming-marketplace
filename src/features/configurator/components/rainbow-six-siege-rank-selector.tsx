"use client";

import { Check } from "lucide-react";
import type { KeyboardEvent } from "react";
import {
  availableSiegeRankOptions,
  rankTier,
  resolveSiegeRankTierSelection,
  siegeRankTierOptions,
  type SiegeRankOption,
} from "../data/rainbow-six-siege-rank-selection";
import { RainbowSixSiegeRankBadge } from "@/features/catalog/components/rainbow-six-siege-rank-badge";

function handleRadioKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
  const group = event.currentTarget.closest('[role="radiogroup"]');
  if (!group) return;
  const radios = Array.from(group.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)'));
  const index = radios.indexOf(event.currentTarget);
  if (index < 0 || !radios.length) return;
  event.preventDefault();
  const next = event.key === "Home" ? 0 : event.key === "End" ? radios.length - 1
    : event.key === "ArrowLeft" || event.key === "ArrowUp"
      ? (index - 1 + radios.length) % radios.length : (index + 1) % radios.length;
  radios[next]?.focus();
  radios[next]?.click();
}

export function RainbowSixSiegeRankSelector({
  label,
  value,
  options,
  minimumIndex = -1,
  excludeFinalRank = false,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly SiegeRankOption[];
  minimumIndex?: number;
  excludeFinalRank?: boolean;
  onChange: (value: string) => void;
}) {
  const selected = options.find((option) => option.value === value);
  const selectedTier = selected ? rankTier(selected) : null;
  const available = availableSiegeRankOptions(options, minimumIndex, excludeFinalRank);
  const divisions = options.filter((option) => rankTier(option) === selectedTier && option.division);

  return (
    <fieldset className="min-w-0 rounded-xl border border-white/[0.07] bg-[#070A08] p-3 sm:p-4">
      <legend className="px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">{label}</legend>
      <div className="mb-4 flex min-h-14 items-center gap-3 rounded-xl border border-emerald-300/15 bg-emerald-400/[0.035] px-3 py-2">
        {selected ? <RainbowSixSiegeRankBadge rank={selected.value} size={48} /> : null}
        <span className="min-w-0">
          <span className="block text-[10px] text-white/40">Selected {label.toLowerCase()}</span>
          <span className="block truncate text-sm font-semibold text-white">{selected?.label ?? "Choose a rank"}</span>
        </span>
      </div>

      <div role="radiogroup" aria-label={`${label} tier`} className="grid grid-cols-4 gap-2">
        {siegeRankTierOptions(options).map((option) => {
          const tier = rankTier(option);
          const enabled = available.some((candidate) => rankTier(candidate) === tier);
          const active = selectedTier === tier;
          return (
            <button
              key={tier}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`Select ${tier} tier for ${label.toLowerCase()}`}
              disabled={!enabled}
              tabIndex={active ? 0 : -1}
              onKeyDown={handleRadioKeyDown}
              onClick={() => {
                const next = resolveSiegeRankTierSelection(options, value, tier, minimumIndex, excludeFinalRank);
                if (next) onChange(next);
              }}
              className={`flex min-h-[5.5rem] min-w-0 flex-col items-center justify-center rounded-xl border px-1 py-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-300/40 motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-30 ${active ? "border-emerald-300/30 bg-emerald-400/[0.07] ring-1 ring-inset ring-white/[0.08]" : "border-white/[0.08] bg-[#090D0B] hover:border-white/[0.17] hover:bg-[#0E1411]"}`}
            >
              <RainbowSixSiegeRankBadge rank={option.value} size={40} />
              <span className={`mt-1 truncate text-[10px] font-semibold ${active ? "text-white" : "text-white/60"}`}>{option.tier ?? option.label}</span>
              {active ? <span className="sr-only">Selected</span> : null}
            </button>
          );
        })}
      </div>

      {divisions.length ? (
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">Division</p>
          <div role="radiogroup" aria-label={`${label} division`} className="grid grid-cols-5 gap-1.5">
            {divisions.map((option) => {
              const enabled = available.some((candidate) => candidate.value === option.value);
              const active = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={`Select ${option.label} for ${label.toLowerCase()}`}
                  disabled={!enabled}
                  tabIndex={active ? 0 : -1}
                  onKeyDown={handleRadioKeyDown}
                  onClick={() => onChange(option.value)}
                  className={`flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-lg border px-1 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-300/40 motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-30 ${active ? "border-emerald-300/30 bg-emerald-400/[0.08] text-white" : "border-white/[0.08] bg-[#090D0B] text-white/55 hover:border-white/[0.17] hover:text-white"}`}
                >
                  {option.division}
                  {active ? <Check className="size-3 text-emerald-300" aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </fieldset>
  );
}
