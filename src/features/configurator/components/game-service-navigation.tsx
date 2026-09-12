import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export type GameServiceNavigationItem = {
  slug: string;
  label: string;
  mobileLabel?: string;
};

export function GameServiceNavigation({
  gameName,
  gameSlug,
  activeSlug,
  items,
  accentTextClass,
  accentBorderClass,
}: {
  gameName: string;
  gameSlug: string;
  activeSlug: string;
  items: readonly GameServiceNavigationItem[];
  accentTextClass: string;
  accentBorderClass: string;
}) {
  return (
    <>
      <nav aria-label={`${gameName} services`} className="mb-3 sm:mb-4 xl:hidden">
        <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max gap-2">
            {items.map((item) => {
              const active = item.slug === activeSlug;
              return (
                <Link
                  key={item.slug}
                  href={`/games/${gameSlug}/${item.slug}`}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex h-11 items-center justify-center whitespace-nowrap rounded-xl border px-3.5 text-xs font-semibold transition-[border-color,background-color,color] duration-200 ease-out motion-reduce:transition-none sm:h-10 ${
                    active
                      ? `${accentBorderClass} bg-[#131B17] text-[#F4F7F5]`
                      : "border-white/[0.08] bg-[#090D0B] text-white/55 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
                  }`}
                >
                  {active ? <span className="mr-2 size-1.5 rounded-full bg-[#39E56F]" aria-hidden="true" /> : null}
                  {item.mobileLabel ?? item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <aside className="hidden xl:block">
        <nav
          aria-label={`${gameName} services`}
          className="sticky top-24 overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#080B09] p-2.5"
        >
          <div className="px-2.5 pb-3 pt-2">
            <p className={`font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] ${accentTextClass}`}>
              {gameName}
            </p>
            <p className="mt-1 text-sm font-semibold text-[#F4F7F5]">Services</p>
          </div>

          <div className="space-y-1.5">
            {items.map((item) => {
              const active = item.slug === activeSlug;
              return (
                <Link
                  key={item.slug}
                  href={`/games/${gameSlug}/${item.slug}`}
                  aria-current={active ? "page" : undefined}
                  className={`group flex min-h-11 items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-[border-color,background-color,color] duration-200 ease-out motion-reduce:transition-none ${
                    active
                      ? `${accentBorderClass} bg-[#131B17] text-[#F4F7F5]`
                      : "border-transparent bg-transparent text-white/52 hover:border-white/[0.08] hover:bg-[#0E1411] hover:text-white"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold">{item.label}</span>
                  {active ? <span className="size-1.5 shrink-0 rounded-full bg-[#39E56F]" aria-hidden="true" /> : null}
                </Link>
              );
            })}
          </div>

          <div className="mx-2.5 my-3 h-px bg-white/[0.06]" />
          <Link
            href={`/games/${gameSlug}`}
            className="flex items-center px-3 pb-2 text-[10px] font-medium text-white/35 transition-colors duration-200 hover:text-white/65 motion-reduce:transition-none"
          >
            <ArrowLeft className="mr-2 size-3" />
            {gameName} overview
          </Link>
        </nav>
      </aside>
    </>
  );
}
