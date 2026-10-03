"use client";
import { useActionState, useState } from "react";
import { reviewApplication } from "@/app/admin/boosters/application-actions";
import type { ApplicationGame } from "../catalog";
import {
  applicationButtonClass,
  applicationInputClass,
  type AdminApplication,
} from "../types";

type ReviewIntent = "under_review" | "approved" | "rejected";
const labels: Record<ReviewIntent, string> = {
  under_review: "Mark as under review",
  approved: "Approve",
  rejected: "Reject",
};
export function ApplicationReviewForm({
  application,
  games,
}: {
  application: Pick<
    AdminApplication,
    "id" | "status" | "version" | "requested_games" | "internal_note"
  >;
  games: ApplicationGame[];
}) {
  const [intent, setIntent] = useState<ReviewIntent>(
    application.status === "under_review" ? "approved" : "under_review",
  );
  const [state, action, pending] = useActionState(reviewApplication, {});
  const [values, setValues] = useState({
    payout: "",
    internalNote: application.internal_note,
    rejectionReason: "",
  });
  const [gamesSelected, setGamesSelected] = useState(
    application.requested_games,
  );
  const [confirmed, setConfirmed] = useState(false);
  const error = (key: string) =>
    state.fields?.[key] ? (
      <p id={`review-${key}-error`} className="mt-2 text-sm text-rose-200">
        {state.fields[key]}
      </p>
    ) : null;
  const describedBy = (key: string) =>
    state.fields?.[key] ? `review-${key}-error` : undefined;
  return (
    <form
      action={action}
      className="mt-6 space-y-5 border-t border-white/10 pt-5"
    >
      <input type="hidden" name="applicationId" value={application.id} />
      <input type="hidden" name="version" value={application.version} />
      <div>
        <label htmlFor="review-intent" className="text-sm font-semibold">
          Review action
        </label>
        <select
          id="review-intent"
          name="intent"
          value={intent}
          onChange={(event) => {
            setIntent(event.target.value as ReviewIntent);
            setConfirmed(false);
          }}
          className={applicationInputClass}
        >
          {application.status === "submitted" ? (
            <option value="under_review">Mark as under review</option>
          ) : null}
          <option value="approved">Approve</option>
          <option value="rejected">Reject</option>
        </select>
      </div>
      {intent === "approved" ? (
        <>
          <div>
            <label htmlFor="review-payout" className="text-sm font-semibold">
              Payout (%)
            </label>
            <input
              id="review-payout"
              name="payout"
              value={values.payout}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  payout: event.target.value,
                }))
              }
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step="0.01"
              required
              className={applicationInputClass}
              aria-invalid={Boolean(state.fields?.payout)}
              aria-describedby={describedBy("payout")}
            />
            {error("payout")}
            <p className="mt-2 text-xs text-white/55">
              Applies to subsequently accepted orders.
            </p>
          </div>
          <fieldset aria-describedby={describedBy("games")}>
            <legend className="text-sm font-semibold">Authorized games</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {games.map((game) => (
                <label
                  key={game.slug}
                  className="flex min-h-11 items-center gap-3 rounded-lg border border-white/10 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    name="games"
                    value={game.slug}
                    checked={gamesSelected.includes(game.slug)}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setGamesSelected((current) =>
                        checked
                          ? [...current, game.slug]
                          : current.filter((slug) => slug !== game.slug),
                      );
                    }}
                    className="size-4 shrink-0 accent-[#39E56F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#82F5A4]"
                  />
                  {game.name}
                </label>
              ))}
            </div>
            {error("games")}
          </fieldset>
        </>
      ) : null}
      <div>
        <label htmlFor="review-note" className="text-sm font-semibold">
          Internal note (optional)
        </label>
        <textarea
          id="review-note"
          name="internalNote"
          maxLength={2000}
          rows={3}
          value={values.internalNote}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              internalNote: event.target.value,
            }))
          }
          className={applicationInputClass}
          aria-invalid={Boolean(state.fields?.internalNote)}
          aria-describedby={describedBy("internalNote")}
        />
        {error("internalNote")}
        <p className="mt-1 text-xs text-white/55">
          Visible only to administrators.
        </p>
      </div>
      {intent === "rejected" ? (
        <div>
          <label htmlFor="review-reason" className="text-sm font-semibold">
            Reason shown to the candidate (optional)
          </label>
          <textarea
            id="review-reason"
            name="rejectionReason"
            value={values.rejectionReason}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                rejectionReason: event.target.value,
              }))
            }
            maxLength={1000}
            rows={3}
            className={applicationInputClass}
            aria-invalid={Boolean(state.fields?.rejectionReason)}
            aria-describedby={describedBy("rejectionReason")}
          />
          {error("rejectionReason")}
        </div>
      ) : null}
      {intent !== "under_review" ? (
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="confirmDecision"
            value="yes"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
            required
            className="size-4 shrink-0 accent-[#39E56F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#82F5A4]"
            aria-describedby={describedBy("confirmDecision")}
          />
          {intent === "approved"
            ? "Confirm approval and the booster access settings above."
            : "Confirm that this application is not approved."}
        </label>
      ) : null}
      {error("confirmDecision")}
      <div aria-live="polite">
        {state.error ? (
          <p role="alert" className="text-sm text-rose-200">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-[#82F5A4]">{state.success}</p>
        ) : null}
      </div>
      <button
        disabled={pending}
        className={`${applicationButtonClass} w-full sm:w-auto`}
      >
        {pending ? "Saving…" : labels[intent]}
      </button>
    </form>
  );
}
