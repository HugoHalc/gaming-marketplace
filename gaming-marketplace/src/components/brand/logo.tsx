import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="VantaBoost home">
      <span className="grid size-9 place-items-center rounded-xl border border-violet-300/20 bg-gradient-to-br from-violet-500/25 to-cyan-400/10 shadow-[inset_0_1px_0_rgba(255,255,255,.08)]">
        <span className="text-sm font-black tracking-[-0.08em] text-white">VB</span>
      </span>
      <span className="text-[15px] font-bold tracking-[-0.02em] text-white">VantaBoost</span>
    </Link>
  );
}
