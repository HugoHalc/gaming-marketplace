import { ArrowRight } from "lucide-react";

export function OverviewServiceCardAction({
  label,
}: {
  label: string;
}) {
  return (
    <div className="mt-auto pt-5">
      <div className="mb-4 h-px bg-gradient-to-r from-white/[0.10] to-transparent" />
      <span className="inline-flex items-center text-xs font-semibold text-[#82F5A4] transition-colors group-hover:text-[#B3FFC7] motion-reduce:transition-none">
        {label}
        <ArrowRight className="ml-2 size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
      </span>
    </div>
  );
}
