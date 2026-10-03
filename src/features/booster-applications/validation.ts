import { applicationGames } from "./catalog";
import { applicationConfirmations } from "./types";
import type { ApplicationActionState } from "./types";

export function parseApplicationForm(form: FormData) {
  const fields: NonNullable<ApplicationActionState["fields"]> = {};
  const games = form.getAll("games").map(String);
  const allowedGames = new Set(applicationGames.map((game) => game.slug));
  if (
    !games.length ||
    games.some((game) => !allowedGames.has(game)) ||
    new Set(games).size !== games.length
  )
    fields.games = "Select at least one supported game.";
  const platforms: Record<string, string[]> = {};
  for (const raw of form.getAll("platforms").map(String)) {
    const [game, value, extra] = raw.split(":");
    const options =
      applicationGames.find((item) => item.slug === game)?.platforms ?? [];
    if (
      extra ||
      !games.includes(game) ||
      !options.some((option) => option.value === value) ||
      platforms[game]?.includes(value)
    )
      fields.platforms = "Select platforms listed for your chosen games.";
    else (platforms[game] ??= []).push(value);
  }
  const experience = String(form.get("experience") ?? "").trim();
  if (!experience || experience.length > 3000)
    fields.experience =
      "Describe your relevant experience using at most 3,000 characters.";
  const hours = String(form.get("weeklyHours") ?? "");
  const weeklyHours = Number(hours);
  if (
    !/^\d{1,3}$/.test(hours) ||
    !Number.isInteger(weeklyHours) ||
    weeklyHours > 168
  )
    fields.weeklyHours = "Enter weekly availability from 0 to 168 hours.";
  const timezone = String(form.get("timezone") ?? "").trim();
  try {
    if (!timezone || timezone.length > 100) throw new Error();
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
  } catch {
    fields.timezone =
      "Choose a valid time zone, such as America/Mexico_City or UTC.";
  }
  const confirmations = applicationConfirmations.map(
    (item) => form.get(item.name) === "yes",
  );
  if (confirmations.some((value) => !value))
    fields.confirmations = "Confirm each statement before submitting.";
  return {
    fields,
    games,
    platforms,
    experience,
    weeklyHours,
    timezone,
    confirmations,
  };
}
