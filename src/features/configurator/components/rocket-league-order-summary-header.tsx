import { Check, LoaderCircle } from "lucide-react";

export function RocketLeagueOrderSummaryHeader({ serviceTitle, isLoading, ready }: { serviceTitle: string; isLoading: boolean; ready: boolean }) {
  return (
    <div className="border-b border-white/[0.07] bg-gradient-to-br from-blue-500/[0.05] via-transparent to-transparent px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-gaming-value text-[1.65rem] font-bold leading-none tracking-[-0.045em] text-[#F4F7F5]">Order Summary</p>
          <p className="mt-1.5 text-[11px] font-medium text-[#A0AAA4]">{serviceTitle}</p>
        </div>
        <span aria-live="polite" role="status">
          {isLoading ? (
            <span className="inline-flex min-w-[6.75rem] items-center justify-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[9px] text-[#A0AAA4]">
              <LoaderCircle className="size-3 animate-spin text-[#82F5A4] motion-reduce:animate-none" /> Updating
            </span>
          ) : ready ? (
            <span className="inline-flex min-w-[6.75rem] items-center justify-center gap-1.5 rounded-full border border-[#39E56F]/18 bg-[#39E56F]/[0.035] px-2.5 py-1 text-[9px] font-medium text-[#82F5A4]">
              <Check className="size-3" strokeWidth={2.5} /> Ready
            </span>
          ) : (
            <span className="inline-flex min-w-[6.75rem] items-center justify-center gap-1.5 rounded-full border border-amber-300/15 bg-amber-300/[0.035] px-2.5 py-1 text-[9px] font-medium text-amber-100/70">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-amber-200/70" /> Needs attention
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
