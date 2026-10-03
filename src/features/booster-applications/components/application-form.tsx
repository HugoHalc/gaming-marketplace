"use client";
import { useActionState, useState } from "react";
import { submitApplication } from "@/app/become-a-booster/actions";
import type { ApplicationGame } from "../catalog";
import {
  applicationConfirmations,
  applicationInputClass,
  applicationButtonClass,
} from "../types";

export function ApplicationForm({
  requestId,
  games,
  timezones,
}: {
  requestId: string;
  games: ApplicationGame[];
  timezones: string[];
}) {
  const [state, action, pending] = useActionState(submitApplication, {});
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState<string[]>([]);
  const [values, setValues] = useState({
    experience: "",
    weeklyHours: "",
    timezone: "",
  });
  const error = (key: string) =>
    state.fields?.[key] ? (
      <p id={`application-${key}-error`} className="mt-2 text-sm text-rose-200">
        {state.fields[key]}
      </p>
    ) : null;
  const describedBy = (key: string) =>
    state.fields?.[key] ? `application-${key}-error` : undefined;
  return (
    <form action={action} className="space-y-6">
      <input name="requestId" type="hidden" value={requestId} />
      <fieldset
        aria-describedby={describedBy("games")}
        aria-invalid={Boolean(state.fields?.games)}
      >
        <legend className="text-sm font-semibold">
          Games you want to apply for
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {games.map((game) => (
            <label
              key={game.slug}
              className="flex min-h-11 items-center gap-3 rounded-lg border border-white/10 bg-[#0B110E] px-3 py-2 text-sm"
            >
              <input
                name="games"
                type="checkbox"
                value={game.slug}
                checked={selectedGames.includes(game.slug)}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setSelectedGames((current) =>
                    checked
                      ? [...current, game.slug]
                      : current.filter((slug) => slug !== game.slug),
                  );
                  if (!checked)
                    setSelectedPlatforms((current) =>
                      current.filter(
                        (value) => !value.startsWith(`${game.slug}:`),
                      ),
                    );
                }}
                className="size-4 shrink-0 accent-[#39E56F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#82F5A4]"
              />
              <span>{game.name}</span>
            </label>
          ))}
        </div>
        {error("games")}
      </fieldset>
      {games
        .filter(
          (game) => selectedGames.includes(game.slug) && game.platforms.length,
        )
        .map((game) => (
          <fieldset key={game.slug} aria-describedby={describedBy("platforms")}>
            <legend className="text-sm font-semibold">
              {game.name} platforms{" "}
              <span className="font-normal text-white/55">(optional)</span>
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {game.platforms.map((platform) => (
                <label
                  key={platform.value}
                  className="flex min-h-11 items-center gap-3 rounded-lg border border-white/10 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    name="platforms"
                    value={`${game.slug}:${platform.value}`}
                    checked={selectedPlatforms.includes(
                      `${game.slug}:${platform.value}`,
                    )}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      const value = `${game.slug}:${platform.value}`;
                      setSelectedPlatforms((current) =>
                        checked
                          ? [...current, value]
                          : current.filter((item) => item !== value),
                      );
                    }}
                    className="size-4 accent-[#39E56F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#82F5A4]"
                  />
                  {platform.label}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      {error("platforms")}
      <div>
        <label
          htmlFor="application-experience"
          className="text-sm font-semibold"
        >
          Relevant experience
        </label>
        <p
          id="experience-help"
          className="mt-1 text-xs leading-5 text-white/55"
        >
          Describe your experience in the games you selected. Do not include
          passwords, financial information or identity documents.
        </p>
        <textarea
          id="application-experience"
          name="experience"
          value={values.experience}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              experience: event.target.value,
            }))
          }
          required
          maxLength={3000}
          rows={5}
          aria-invalid={Boolean(state.fields?.experience)}
          aria-describedby={["experience-help", describedBy("experience")]
            .filter(Boolean)
            .join(" ")}
          className={applicationInputClass}
        />
        {error("experience")}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="application-hours" className="text-sm font-semibold">
            Weekly availability (hours)
          </label>
          <input
            id="application-hours"
            name="weeklyHours"
            value={values.weeklyHours}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                weeklyHours: event.target.value,
              }))
            }
            type="number"
            inputMode="numeric"
            min={0}
            max={168}
            step={1}
            required
            aria-invalid={Boolean(state.fields?.weeklyHours)}
            aria-describedby={describedBy("weeklyHours")}
            className={applicationInputClass}
          />
          {error("weeklyHours")}
        </div>
        <div>
          <label
            htmlFor="application-timezone"
            className="text-sm font-semibold"
          >
            Time zone
          </label>
          <input
            id="application-timezone"
            name="timezone"
            value={values.timezone}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                timezone: event.target.value,
              }))
            }
            list="application-timezones"
            required
            maxLength={100}
            placeholder="America/Mexico_City"
            aria-invalid={Boolean(state.fields?.timezone)}
            aria-describedby={describedBy("timezone")}
            className={applicationInputClass}
          />
          <datalist id="application-timezones">
            {timezones.map((zone) => (
              <option key={zone} value={zone} />
            ))}
          </datalist>
          {error("timezone")}
        </div>
      </div>
      <fieldset aria-describedby={describedBy("confirmations")}>
        <legend className="text-sm font-semibold">Before you submit</legend>
        <div className="mt-2 space-y-1">
          {applicationConfirmations.map((item) => (
            <label
              key={item.name}
              className="flex min-h-11 items-start gap-3 py-2 text-sm leading-6 text-white/75"
            >
              <input
                type="checkbox"
                required
                name={item.name}
                value="yes"
                checked={confirmed.includes(item.name)}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setConfirmed((current) =>
                    checked
                      ? [...current, item.name]
                      : current.filter((name) => name !== item.name),
                  );
                }}
                className="mt-1 size-4 shrink-0 accent-[#39E56F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#82F5A4]"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
        {error("confirmations")}
      </fieldset>
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
        {pending ? "Submitting…" : "Submit Application"}
      </button>
    </form>
  );
}
