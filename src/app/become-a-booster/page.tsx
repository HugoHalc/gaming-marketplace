import { randomUUID } from "node:crypto";
import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { getCurrentIdentity } from "@/features/auth/server/auth";
import { ApplicationForm } from "@/features/booster-applications/components/application-form";
import { WithdrawApplicationForm } from "@/features/booster-applications/components/withdraw-form";
import { getCandidateApplications } from "@/features/booster-applications/server/repository";
import { applicationGames } from "@/features/booster-applications/catalog";
import {
  activeApplicationStatuses,
  applicationStatusLabels,
  applicationButtonClass,
  applicationDate,
  type CandidateApplication,
} from "@/features/booster-applications/types";

export const metadata = {
  title: "Become a Booster",
  description:
    "Apply to complete orders within BoostingPedia. Applications are reviewed manually.",
};
export const dynamic = "force-dynamic";
const surface =
  "min-w-0 rounded-xl border border-[#39E56F]/15 bg-[#111814] p-4 sm:p-6";
export default async function BecomeBoosterPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; apply?: string }>;
}) {
  const [identity, params] = await Promise.all([
    getCurrentIdentity(),
    searchParams,
  ]);
  const page = Math.min(
    100000,
    Math.max(0, Number.parseInt(params.page ?? "0", 10) || 0),
  );
  const data = identity ? await getCandidateApplications(page) : undefined;
  const latest = data?.latest;
  const hasActiveApplication =
    latest && activeApplicationStatuses.includes(latest.status);
  const canApply = data && !data.activeBooster && !hasActiveApplication;
  const showForm = canApply && (!latest || params.apply === "1");
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-6">
          <p className="text-xs font-semibold tracking-wider text-[#82F5A4]">
            BOOSTINGPEDIA
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Become a Booster
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">
            Apply to complete orders within BoostingPedia. Every application is
            reviewed manually; submitting one does not grant booster access.
          </p>
        </header>
        {!identity ? (
          <section className={surface}>
            <h2 className="text-lg font-semibold">Sign in to apply</h2>
            <p className="mt-2 text-sm leading-6 text-white/65">
              You need a BoostingPedia account to submit an application and
              follow its status.
            </p>
            <Link
              href="/login?next=%2Fbecome-a-booster"
              className={`${applicationButtonClass} mt-5 w-full sm:w-auto`}
            >
              Sign in to continue
            </Link>
          </section>
        ) : null}
        {data?.activeBooster ? (
          <section className={`${surface} mb-5`}>
            <h2 className="text-lg font-semibold">Booster access active</h2>
            <p className="mt-2 text-sm text-white/65">
              Your account already has booster access.
            </p>
            <Link
              href="/booster/orders"
              className={`${applicationButtonClass} mt-4 w-full sm:w-auto`}
            >
              Open Booster Dashboard
            </Link>
          </section>
        ) : null}
        {latest ? (
          <section className={`${surface} mb-5`}>
            <ApplicationStatus application={latest} />
            {hasActiveApplication ? (
              <WithdrawApplicationForm
                key={`${latest.id}:${latest.version}`}
                id={latest.id}
                version={latest.version}
              />
            ) : null}
            {latest.status === "approved" && !data?.activeBooster ? (
              <p className="mt-3 text-sm text-white/65">
                Booster access is currently inactive.
              </p>
            ) : null}
            {canApply && !showForm ? (
              <Link
                href="/become-a-booster?apply=1"
                className={`${applicationButtonClass} mt-5 w-full sm:w-auto`}
              >
                Submit a new application
              </Link>
            ) : null}
          </section>
        ) : null}
        {showForm ? (
          <section className={surface}>
            <h2 className="mb-5 text-lg font-semibold">Your application</h2>
            <ApplicationForm
              requestId={randomUUID()}
              games={applicationGames}
              timezones={["UTC", ...Intl.supportedValuesOf("timeZone")]}
            />
          </section>
        ) : null}
        {data?.applications.some((item) => item.id !== latest?.id) ? (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">Application history</h2>
            <div className="space-y-3">
              {data.applications
                .filter((item) => item.id !== latest?.id)
                .map((item) => (
                  <article key={item.id} className={surface}>
                    <ApplicationStatus application={item} />
                  </article>
                ))}
            </div>
          </section>
        ) : null}
        {data && (page > 0 || data.hasNextPage) ? (
          <nav
            aria-label="Application history pages"
            className="mt-5 flex flex-wrap items-center gap-3"
          >
            {page > 0 ? (
              <Link
                className={applicationButtonClass}
                href={`/become-a-booster?page=${page - 1}`}
              >
                Previous
              </Link>
            ) : null}
            <span className="text-sm text-white/55">Page {page + 1}</span>
            {data.hasNextPage ? (
              <Link
                className={applicationButtonClass}
                href={`/become-a-booster?page=${page + 1}`}
              >
                Next
              </Link>
            ) : null}
          </nav>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
function ApplicationStatus({
  application,
}: {
  application: CandidateApplication;
}) {
  return (
    <>
      <h2 className="text-lg font-semibold text-[#82F5A4]">
        {applicationStatusLabels[application.status]}
      </h2>
      <dl className="mt-3 space-y-3 text-sm">
        <div>
          <dt className="text-xs text-white/45">Submitted (UTC)</dt>
          <dd className="mt-1">{applicationDate(application.submitted_at)}</dd>
        </div>
        <div>
          <dt className="text-xs text-white/45">Requested games</dt>
          <dd className="mt-1 break-words">
            {application.requested_games
              .map(
                (slug) =>
                  applicationGames.find((game) => game.slug === slug)?.name,
              )
              .filter(Boolean)
              .join(", ")}
          </dd>
        </div>
        {application.status === "rejected" && application.rejection_reason ? (
          <div>
            <dt className="text-xs text-white/45">Review feedback</dt>
            <dd className="mt-1 whitespace-pre-wrap break-words">
              {application.rejection_reason}
            </dd>
          </div>
        ) : null}
      </dl>
    </>
  );
}
