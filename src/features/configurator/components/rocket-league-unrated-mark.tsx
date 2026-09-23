export function RocketLeagueUnratedMark({ className = "size-9" }: { className?: string }) {
  return (
    <span role="img" aria-label="Unrated" className={`relative grid shrink-0 place-items-center rounded-full border border-dashed border-white/[0.18] bg-white/[0.025] ${className}`}>
      <span aria-hidden="true" className="font-gaming-label text-[9px] font-bold uppercase tracking-[0.08em] text-white/55">UR</span>
    </span>
  );
}
