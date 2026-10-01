export const ROCKET_LEAGUE_WINS_MIN = 1;
export const ROCKET_LEAGUE_WINS_MAX = 12;

export function isRocketLeagueWinsQuantity(value: unknown): boolean {
  return typeof value === "number" && Number.isInteger(value)
    && value >= ROCKET_LEAGUE_WINS_MIN && value <= ROCKET_LEAGUE_WINS_MAX;
}
