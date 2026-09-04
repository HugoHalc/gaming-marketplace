"use client";

const rankMeta: Record<string, { label: string; family: string; mark: string; classes: string }> = {
  "iron-1": { label: "Iron 1", family: "Iron", mark: "I", classes: "border-zinc-500/35 bg-zinc-400/[0.08] text-zinc-200" },
  "iron-2": { label: "Iron 2", family: "Iron", mark: "II", classes: "border-zinc-500/35 bg-zinc-400/[0.08] text-zinc-200" },
  "iron-3": { label: "Iron 3", family: "Iron", mark: "III", classes: "border-zinc-500/35 bg-zinc-400/[0.08] text-zinc-200" },
  "bronze-1": { label: "Bronze 1", family: "Bronze", mark: "I", classes: "border-amber-700/40 bg-amber-700/[0.10] text-amber-300" },
  "bronze-2": { label: "Bronze 2", family: "Bronze", mark: "II", classes: "border-amber-700/40 bg-amber-700/[0.10] text-amber-300" },
  "bronze-3": { label: "Bronze 3", family: "Bronze", mark: "III", classes: "border-amber-700/40 bg-amber-700/[0.10] text-amber-300" },
  "silver-1": { label: "Silver 1", family: "Silver", mark: "I", classes: "border-slate-300/30 bg-slate-200/[0.08] text-slate-200" },
  "silver-2": { label: "Silver 2", family: "Silver", mark: "II", classes: "border-slate-300/30 bg-slate-200/[0.08] text-slate-200" },
  "silver-3": { label: "Silver 3", family: "Silver", mark: "III", classes: "border-slate-300/30 bg-slate-200/[0.08] text-slate-200" },
  "gold-1": { label: "Gold 1", family: "Gold", mark: "I", classes: "border-yellow-300/30 bg-yellow-300/[0.08] text-yellow-200" },
  "gold-2": { label: "Gold 2", family: "Gold", mark: "II", classes: "border-yellow-300/30 bg-yellow-300/[0.08] text-yellow-200" },
  "gold-3": { label: "Gold 3", family: "Gold", mark: "III", classes: "border-yellow-300/30 bg-yellow-300/[0.08] text-yellow-200" },
  "platinum-1": { label: "Platinum 1", family: "Platinum", mark: "I", classes: "border-cyan-300/30 bg-cyan-300/[0.08] text-cyan-200" },
  "platinum-2": { label: "Platinum 2", family: "Platinum", mark: "II", classes: "border-cyan-300/30 bg-cyan-300/[0.08] text-cyan-200" },
  "platinum-3": { label: "Platinum 3", family: "Platinum", mark: "III", classes: "border-cyan-300/30 bg-cyan-300/[0.08] text-cyan-200" },
  "diamond-1": { label: "Diamond 1", family: "Diamond", mark: "I", classes: "border-fuchsia-300/30 bg-fuchsia-300/[0.08] text-fuchsia-200" },
  "diamond-2": { label: "Diamond 2", family: "Diamond", mark: "II", classes: "border-fuchsia-300/30 bg-fuchsia-300/[0.08] text-fuchsia-200" },
  "diamond-3": { label: "Diamond 3", family: "Diamond", mark: "III", classes: "border-fuchsia-300/30 bg-fuchsia-300/[0.08] text-fuchsia-200" },
  "ascendant-1": { label: "Ascendant 1", family: "Ascendant", mark: "I", classes: "border-emerald-300/30 bg-emerald-300/[0.08] text-emerald-200" },
  "ascendant-2": { label: "Ascendant 2", family: "Ascendant", mark: "II", classes: "border-emerald-300/30 bg-emerald-300/[0.08] text-emerald-200" },
  "ascendant-3": { label: "Ascendant 3", family: "Ascendant", mark: "III", classes: "border-emerald-300/30 bg-emerald-300/[0.08] text-emerald-200" },
  immortal: { label: "Immortal", family: "Immortal", mark: "IMM", classes: "border-rose-300/35 bg-rose-400/[0.10] text-rose-200" },
  unrated: { label: "Unrated", family: "Unrated", mark: "—", classes: "border-white/15 bg-white/[0.04] text-white/60" },
};

export function getValorantRankLabel(value: unknown) {
  return rankMeta[String(value)]?.label ?? String(value ?? "");
}

export function ValorantRankValue({
  value,
  label,
  compact = false,
}: {
  value: unknown;
  label: string;
  compact?: boolean;
}) {
  const meta = rankMeta[String(value)] ?? rankMeta.unrated;

  return (
    <div className={`flex items-center gap-3 ${compact ? "" : "min-w-0"}`}>
      <div
        className={`grid shrink-0 place-items-center border ${meta.classes} ${
          compact ? "size-10 rounded-xl" : "size-14 rounded-2xl"
        }`}
        aria-hidden="true"
      >
        <div className={`grid rotate-45 place-items-center border border-current/35 ${compact ? "size-5" : "size-7"}`}>
          <span className={`-rotate-45 font-bold tracking-[-0.05em] ${compact ? "text-[8px]" : "text-[10px]"}`}>
            {meta.mark}
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">{label}</p>
        <p className={`truncate font-semibold text-[#F4F7F5] ${compact ? "mt-0.5 text-xs" : "mt-1 text-sm"}`}>
          {meta.label}
        </p>
        {!compact ? <p className="mt-0.5 text-[10px] text-white/30">{meta.family}</p> : null}
      </div>
    </div>
  );
}
