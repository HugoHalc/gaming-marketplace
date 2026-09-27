import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  dota2ServiceFoundations,
  type Dota2ServiceSlug,
} from "@/features/catalog/data/dota-2-foundation";

export function Dota2ServiceNavigation({
  currentSlug,
  children,
}: {
  currentSlug: Dota2ServiceSlug;
  children: ReactNode;
}) {
  const currentService = dota2ServiceFoundations.find(
    (service) => service.slug === currentSlug,
  );

  return (
    <>
      <details className="group mb-4 overflow-hidden rounded-[1.2rem] border border-white/[0.08] bg-[#080B09] xl:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 outline-none transition-colors hover:bg-white/[0.025] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-300/30 [&::-webkit-details-marker]:hidden">
          <span className="min-w-0">
            <span className="block font-gaming-label text-[9px] font-semibold uppercase tracking-[0.15em] text-red-200/65">
              Explore Dota 2 services
            </span>
            <span className="mt-0.5 block truncate text-xs font-semibold text-white/85">
              {currentService?.name ?? "Dota 2"}
            </span>
          </span>
          <ChevronDown className="size-4 shrink-0 text-white/45 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
        </summary>
        <nav aria-label="Dota 2 services" className="border-t border-white/[0.06] p-2.5">
          <div className="space-y-1">
            <Link
              href="/games/dota-2"
              className="flex min-h-11 items-center rounded-xl border border-transparent px-3.5 py-2.5 text-xs font-semibold text-white/55 outline-none transition-colors hover:border-white/[0.08] hover:bg-[#0E1411] hover:text-white focus-visible:ring-2 focus-visible:ring-red-300/30"
            >
              Dota 2 Overview
            </Link>
            {dota2ServiceFoundations.map((item) => {
              const active = item.slug === currentSlug;
              return (
                <Link
                  key={item.slug}
                  href={item.route}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-xl border px-3.5 py-2.5 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-red-300/30 ${
                    active
                      ? "border-red-300/25 bg-red-400/[0.07] text-white"
                      : "border-transparent text-white/55 hover:border-white/[0.08] hover:bg-[#0E1411] hover:text-white"
                  }`}
                >
                  <span className="min-w-0 flex-1">{item.name}</span>
                  {active ? <span className="size-1.5 shrink-0 rounded-full bg-[#39E56F]" aria-hidden="true" /> : null}
                </Link>
              );
            })}
          </div>
        </nav>
      </details>

      <div className="xl:grid xl:grid-cols-[13.5rem_minmax(0,1fr)] xl:gap-4 2xl:grid-cols-[14.5rem_minmax(0,1fr)] 2xl:gap-5">
        <aside className="hidden xl:block">
          <nav aria-label="Dota 2 services" className="sticky top-24 overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#080B09] p-2.5">
            <div className="px-2.5 pb-3 pt-2">
              <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-red-200/75">
                Dota 2
              </p>
              <p className="mt-1 text-sm font-semibold text-white">Services</p>
            </div>
            <div className="space-y-1.5">
              <Link
                href="/games/dota-2"
                className="flex min-h-11 items-center rounded-xl border border-transparent px-3.5 py-2.5 text-xs font-semibold text-white/52 outline-none transition-colors hover:border-white/[0.08] hover:bg-[#0E1411] hover:text-white focus-visible:ring-2 focus-visible:ring-red-300/30"
              >
                Dota 2 Overview
              </Link>
              {dota2ServiceFoundations.map((item) => {
                const active = item.slug === currentSlug;
                return (
                  <Link
                    key={item.slug}
                    href={item.route}
                    aria-current={active ? "page" : undefined}
                    className={`group flex min-h-11 items-center gap-3 rounded-xl border px-3.5 py-2.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-red-300/30 ${
                      active
                        ? "border-red-300/25 bg-red-400/[0.07] text-white"
                        : "border-transparent bg-transparent text-white/52 hover:border-white/[0.08] hover:bg-[#0E1411] hover:text-white"
                    }`}
                  >
                    <span className="min-w-0 flex-1 text-xs font-semibold">{item.name}</span>
                    {active ? <span className="size-1.5 shrink-0 rounded-full bg-[#39E56F]" aria-hidden="true" /> : null}
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
