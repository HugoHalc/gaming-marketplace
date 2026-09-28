import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, LockKeyhole } from "lucide-react";
import {
  rainbowSixSiegeServiceFoundations,
  type RainbowSixSiegeServiceSlug,
} from "@/features/catalog/data/rainbow-six-siege-foundation";

function ServiceItem({
  slug,
  currentSlug,
}: {
  slug: RainbowSixSiegeServiceSlug;
  currentSlug: RainbowSixSiegeServiceSlug;
}) {
  const item = rainbowSixSiegeServiceFoundations.find((service) => service.slug === slug);
  if (!item) return null;

  const active = item.slug === currentSlug;
  if (item.status !== "active") {
    return (
      <span
        aria-disabled="true"
        className="flex min-h-11 cursor-not-allowed items-center gap-3 rounded-xl border border-transparent px-3.5 py-2.5 text-xs font-semibold text-white/30"
      >
        <span className="min-w-0 flex-1">{item.name}</span>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.02] px-2 py-1 text-[8px] uppercase tracking-[0.08em] text-white/35">
          <LockKeyhole className="size-2.5" aria-hidden="true" />
          Coming soon
        </span>
      </span>
    );
  }

  return (
    <Link
      href={item.route}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-xl border px-3.5 py-2.5 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-300/30 motion-reduce:transition-none ${
        active
          ? "border-emerald-300/25 bg-emerald-400/[0.07] text-white"
          : "border-transparent text-white/55 hover:border-white/[0.08] hover:bg-[#0E1411] hover:text-white"
      }`}
    >
      <span className="min-w-0 flex-1">{item.name}</span>
      {active ? <span className="size-1.5 shrink-0 rounded-full bg-[#39E56F]" aria-hidden="true" /> : null}
    </Link>
  );
}

export function RainbowSixSiegeServiceNavigation({
  currentSlug,
  children,
}: {
  currentSlug: RainbowSixSiegeServiceSlug;
  children: ReactNode;
}) {
  const currentService = rainbowSixSiegeServiceFoundations.find(
    (service) => service.slug === currentSlug,
  );

  return (
    <>
      <details className="group mb-4 overflow-hidden rounded-[1.2rem] border border-white/[0.08] bg-[#080B09] xl:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 outline-none transition-colors hover:bg-white/[0.025] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-300/30 [&::-webkit-details-marker]:hidden">
          <span className="min-w-0">
            <span className="block font-gaming-label text-[9px] font-semibold uppercase tracking-[0.15em] text-emerald-200/65">
              Explore Rainbow Six Siege services
            </span>
            <span className="mt-0.5 block truncate text-xs font-semibold text-white/85">
              {currentService?.name ?? "Rainbow Six Siege"}
            </span>
          </span>
          <ChevronDown className="size-4 shrink-0 text-white/45 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
        </summary>
        <nav aria-label="Rainbow Six Siege services" className="border-t border-white/[0.06] p-2.5">
          <div className="space-y-1">
            <Link
              href="/games/rainbow-six-siege"
              className="flex min-h-11 items-center rounded-xl border border-transparent px-3.5 py-2.5 text-xs font-semibold text-white/55 outline-none transition-colors hover:border-white/[0.08] hover:bg-[#0E1411] hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-300/30"
            >
              Rainbow Six Siege Overview
            </Link>
            {rainbowSixSiegeServiceFoundations.map((item) => (
              <ServiceItem key={item.slug} slug={item.slug} currentSlug={currentSlug} />
            ))}
          </div>
        </nav>
      </details>

      <div className="xl:grid xl:grid-cols-[14rem_minmax(0,1fr)] xl:gap-4 2xl:grid-cols-[15rem_minmax(0,1fr)] 2xl:gap-5">
        <aside className="hidden xl:block">
          <nav aria-label="Rainbow Six Siege services" className="sticky top-24 overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#080B09] p-2.5">
            <div className="px-2.5 pb-3 pt-2">
              <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200/75">
                Rainbow Six Siege
              </p>
              <p className="mt-1 text-sm font-semibold text-white">Services</p>
            </div>
            <div className="space-y-1.5">
              <Link
                href="/games/rainbow-six-siege"
                className="flex min-h-11 items-center rounded-xl border border-transparent px-3.5 py-2.5 text-xs font-semibold text-white/52 outline-none transition-colors hover:border-white/[0.08] hover:bg-[#0E1411] hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-300/30"
              >
                Overview
              </Link>
              {rainbowSixSiegeServiceFoundations.map((item) => (
                <ServiceItem key={item.slug} slug={item.slug} currentSlug={currentSlug} />
              ))}
            </div>
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
