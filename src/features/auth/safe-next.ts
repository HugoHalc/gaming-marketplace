const SAFE_REDIRECT_BASE = "https://boostingpedia.invalid";

export function safeNextPath(value: unknown, fallback = "/dashboard") {
  if (typeof value !== "string") return fallback;

  const candidate = value.trim();
  if (
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(candidate)
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(candidate, SAFE_REDIRECT_BASE);
    if (parsed.origin !== SAFE_REDIRECT_BASE) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
