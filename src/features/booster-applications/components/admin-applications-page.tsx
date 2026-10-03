import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { Container } from "@/components/layout/container";
import { BoosterManagementHeader } from "@/components/admin/booster-management-header";
import { UUID_PATTERN } from "@/features/admin/lib/booster-settings";
import { listAdminApplications } from "../server/repository";
import { applicationGames } from "../catalog";
import {
  applicationStatusLabels,
  activeApplicationStatuses,
  applicationDate,
  applicationButtonClass,
  applicationInputClass,
} from "../types";
import { ApplicationReviewForm } from "./review-form";

export async function AdminApplicationsPage({
  params,
}: {
  params: { q?: string; status?: string; page?: string; application?: string };
}) {
  const q = (params.q ?? "").slice(0, 100);
  const status =
    params.status &&
    ["all", ...Object.keys(applicationStatusLabels)].includes(params.status)
      ? params.status
      : "pending";
  const page = Math.min(
    100000,
    Math.max(0, Number.parseInt(params.page ?? "0", 10) || 0),
  );
  const id =
    params.application && UUID_PATTERN.test(params.application)
      ? params.application
      : undefined;
  const [list, detail] = await Promise.all([
    listAdminApplications(q, status, page),
    id ? listAdminApplications("", "all", 0, id) : undefined,
  ]);
  const selected = detail?.applications[0];
  const gamesLabel = (slugs: string[]) =>
    slugs
      .map((slug) => applicationGames.find((game) => game.slug === slug)?.name)
      .filter(Boolean)
      .join(", ");
  const pageHref = (value: number) =>
    `/admin/boosters?${new URLSearchParams({ view: "applications", q, status, page: String(value) })}`;
  return (
    <>
      <SiteHeader />
      <main className="py-8">
        <Container>
          <BoosterManagementHeader view="applications" />
          {selected ? (
            <section className="mt-6 min-w-0 rounded-xl border border-[#39E56F]/15 bg-[#151B17] p-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-words text-lg font-semibold">
                    {selected.full_name || selected.gamer_tag || "Application"}
                  </h2>
                  <p className="mt-1 break-all text-sm text-white/65">
                    {selected.email}
                  </p>
                  <p className="mt-2 text-sm text-[#82F5A4]">
                    {applicationStatusLabels[selected.status]}
                  </p>
                </div>
                <Link href={pageHref(page)} className={applicationButtonClass}>
                  Close
                </Link>
              </div>
              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-white/45">Submitted (UTC)</dt>
                  <dd className="mt-1">
                    {applicationDate(selected.submitted_at)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-white/45">Weekly availability</dt>
                  <dd className="mt-1">
                    {selected.weekly_hours} hours · {selected.timezone}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-white/45">Requested games</dt>
                  <dd className="mt-1 break-words">
                    {gamesLabel(selected.requested_games)}
                  </dd>
                </div>
                {Object.entries(selected.platforms).map(
                  ([gameSlug, platforms]) => (
                    <div key={gameSlug}>
                      <dt className="text-xs text-white/45">
                        {gamesLabel([gameSlug])} platforms
                      </dt>
                      <dd className="mt-1">
                        {platforms
                          .map(
                            (value) =>
                              applicationGames
                                .find((game) => game.slug === gameSlug)
                                ?.platforms.find(
                                  (platform) => platform.value === value,
                                )?.label,
                          )
                          .filter(Boolean)
                          .join(", ")}
                      </dd>
                    </div>
                  ),
                )}
                <div className="sm:col-span-2">
                  <dt className="text-xs text-white/45">Experience</dt>
                  <dd className="mt-1 whitespace-pre-wrap break-words">
                    {selected.experience}
                  </dd>
                </div>
                {selected.rejection_reason ? (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-white/45">
                      Candidate feedback
                    </dt>
                    <dd className="mt-1 whitespace-pre-wrap break-words">
                      {selected.rejection_reason}
                    </dd>
                  </div>
                ) : null}
              </dl>
              {activeApplicationStatuses.includes(selected.status) ? (
                <ApplicationReviewForm
                  key={`${selected.id}:${selected.version}`}
                  application={{
                    id: selected.id,
                    status: selected.status,
                    version: selected.version,
                    requested_games: selected.requested_games,
                    internal_note: selected.internal_note,
                  }}
                  games={applicationGames}
                />
              ) : selected.internal_note ? (
                <div className="mt-5">
                  <h3 className="text-sm font-semibold">Internal note</h3>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-white/65">
                    {selected.internal_note}
                  </p>
                </div>
              ) : null}
              {selected.history.length ? (
                <div className="mt-6 border-t border-white/10 pt-5">
                  <h3 className="text-sm font-semibold">Review history</h3>
                  <ol className="mt-3 space-y-3">
                    {selected.history.map((entry, index) => (
                      <li
                        key={`${entry.created_at}:${index}`}
                        className="text-sm"
                      >
                        <p>
                          {applicationStatusLabels[entry.from_status]} →{" "}
                          {applicationStatusLabels[entry.to_status]}
                        </p>
                        <p className="mt-1 break-all text-xs text-white/45">
                          {applicationDate(entry.created_at)} UTC · Actor{" "}
                          {entry.actor_id}
                        </p>
                        {entry.internal_note ? (
                          <p className="mt-1 whitespace-pre-wrap break-words text-white/65">
                            {entry.internal_note}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </section>
          ) : params.application ? (
            <p role="alert" className="mt-5 text-sm text-rose-200">
              Application not found.
            </p>
          ) : null}
          <section className="mt-6">
            <h2 className="text-lg font-semibold">Applications</h2>
            <form
              role="search"
              className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <input type="hidden" name="view" value="applications" />
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="applications-search"
                  className="text-xs text-white/65"
                >
                  Email, name or gamer tag
                </label>
                <input
                  id="applications-search"
                  name="q"
                  maxLength={100}
                  defaultValue={q}
                  className={applicationInputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="applications-status"
                  className="text-xs text-white/65"
                >
                  Status
                </label>
                <select
                  id="applications-status"
                  name="status"
                  defaultValue={status}
                  className={applicationInputClass}
                >
                  <option value="pending">Pending applications</option>
                  <option value="all">All applications</option>
                  {Object.entries(applicationStatusLabels).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <button className={applicationButtonClass}>Search</button>
            </form>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {list.applications.map((application) => (
                <article
                  key={application.id}
                  className="min-w-0 rounded-xl border border-white/10 bg-[#151B17] p-4"
                >
                  <div className="flex flex-wrap justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words font-semibold">
                        {application.full_name ||
                          application.gamer_tag ||
                          "Application"}
                      </h3>
                      <p className="mt-1 break-all text-sm text-white/55">
                        {application.email}
                      </p>
                    </div>
                    <Link
                      href={`/admin/boosters?view=applications&application=${application.id}`}
                      className={applicationButtonClass}
                    >
                      Review
                    </Link>
                  </div>
                  <p className="mt-3 text-sm text-[#82F5A4]">
                    {applicationStatusLabels[application.status]}
                  </p>
                  <p className="mt-2 break-words text-sm text-white/65">
                    {gamesLabel(application.requested_games)}
                  </p>
                  <p className="mt-2 text-xs text-white/45">
                    Submitted {applicationDate(application.submitted_at)} UTC
                  </p>
                </article>
              ))}
            </div>
            {!list.applications.length ? (
              <p className="py-8 text-sm text-white/55">
                No applications match this search.
              </p>
            ) : null}
            <nav
              aria-label="Application pages"
              className="mt-4 flex flex-wrap items-center gap-3"
            >
              {page > 0 ? (
                <Link
                  className={applicationButtonClass}
                  href={pageHref(page - 1)}
                >
                  Previous
                </Link>
              ) : null}
              <span className="text-sm text-white/55">Page {page + 1}</span>
              {list.hasNextPage ? (
                <Link
                  className={applicationButtonClass}
                  href={pageHref(page + 1)}
                >
                  Next
                </Link>
              ) : null}
            </nav>
          </section>
        </Container>
      </main>
    </>
  );
}
