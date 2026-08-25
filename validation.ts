export function normalizeEmail(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function normalizeText(value: FormDataEntryValue | null, max = 120) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string) {
  return password.length >= 8 && password.length <= 128;
}
