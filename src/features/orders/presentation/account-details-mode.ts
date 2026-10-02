/** Interpret the immutable service configuration, never the viewer's submitted mode. */
export type AccountDetailsMode = "account" | "player" | null;
export function getAccountDetailsMode(gameName: string, configuration: Record<string, unknown>): AccountDetailsMode {
  const method = configuration.boostMethod ??
    (gameName === "Valorant" ? configuration.queue : undefined) ??
    (gameName === "Rainbow Six Siege" ? configuration.gameMode : undefined);
  if (method === "duo") return "player";
  if (method === "account" || method === "solo") return "account";
  return null;
}
