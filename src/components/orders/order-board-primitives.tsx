import type { ComponentProps } from "react";

export const orderBoardPageClass = "mx-auto w-full max-w-[1520px] px-3 py-4 text-[#F4F7F5] sm:px-6 lg:px-8";
export const orderBoardControl = "min-h-11 shrink-0 rounded-lg px-3 py-2 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39E56F]";
export const orderBoardIconControl = "grid size-11 shrink-0 place-items-center rounded-lg text-[#A4AEA8] hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-[#39E56F]";
export const orderBoardActiveControl = "border-[#39E56F]/30 bg-[#39E56F]/[0.07] text-[#82F5A4]";
export const orderBoardConfigurationClass = "[&>div]:mt-2 [&>div]:space-y-2 [&_dl]:gap-y-1.5 [&_.font-gaming-label]:text-[10px] [&_.font-gaming-label]:text-[#A4AEA8]";
export function orderBoardGridClass(layout: "grid" | "list") {
  return `mt-3 grid min-w-0 items-start gap-3 ${layout === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`;
}
export function OrderBoardToolbar({ className = "", ...props }: ComponentProps<"div">) {
  return <div {...props} className={`flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-[#0B110E] p-1 xl:flex-nowrap ${className}`} />;
}
export function OrderBoardCard({ className = "", ...props }: ComponentProps<"article">) {
  return <article {...props} className={`min-w-0 overflow-visible rounded-xl border bg-[#0B110E] [overflow-wrap:anywhere] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39E56F] ${className}`} />;
}
export function OrderBoardCardHeader({ className = "", ...props }: ComponentProps<"header">) {
  return <header {...props} className={`grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 rounded-t-xl border-b border-white/[0.06] bg-[#111814] px-3 py-1.5 ${className}`} />;
}
export function OrderBoardCardBody(props: ComponentProps<"div">) {
  return <div {...props} className="min-w-0 px-3 pb-3 pt-2.5" />;
}
