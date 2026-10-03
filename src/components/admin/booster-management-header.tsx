import Link from "next/link";
import { applicationButtonClass } from "@/features/booster-applications/types";

export function BoosterManagementHeader({
  view,
}: {
  view: "boosters" | "applications";
}) {
  return (
    <>
      <nav aria-label="Administration" className="mb-6 flex flex-wrap gap-2">
        <Link href="/admin" className={applicationButtonClass}>
          Orders
        </Link>
        <Link href="/admin/boosters" className={applicationButtonClass}>
          Boosters
        </Link>
        <Link href="/admin/support" className={applicationButtonClass}>
          Support
        </Link>
      </nav>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider text-[#82F5A4]">
            ADMINISTRATION
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Booster management</h1>
          <p className="mt-2 text-sm text-white/55">
            Manage access, future payouts and applications.
          </p>
        </div>
        <Link href="/admin/boosters?add=1" className={applicationButtonClass}>
          Add Booster
        </Link>
      </header>
      <nav
        aria-label="Booster management"
        className="mt-5 flex flex-wrap gap-2"
      >
        <Link
          href="/admin/boosters"
          aria-current={view === "boosters" ? "page" : undefined}
          className={`${applicationButtonClass} ${view === "boosters" ? "bg-[#39E56F]/15" : "border-white/15 bg-transparent text-white/65"}`}
        >
          Booster access
        </Link>
        <Link
          href="/admin/boosters?view=applications"
          aria-current={view === "applications" ? "page" : undefined}
          className={`${applicationButtonClass} ${view === "applications" ? "bg-[#39E56F]/15" : "border-white/15 bg-transparent text-white/65"}`}
        >
          Applications
        </Link>
      </nav>
    </>
  );
}
