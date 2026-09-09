"use client";

import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ConfiguratorSelection } from "../types/configurator";

const CHECKOUT_INTENT_VERSION = 1 as const;
const CHECKOUT_INTENT_SESSION_KEY = "boostingpedia.checkout-intent.v1";
const CHECKOUT_INTENT_FALLBACK_KEY = "boostingpedia.checkout-intent.v1.fallback";
const CHECKOUT_INTENT_MAX_AGE_MS = 30 * 60 * 1000;
const MAX_SELECTION_KEYS = 64;
const MAX_SELECTION_STRING_LENGTH = 512;
const MAX_SERIALIZED_LENGTH = 16_384;

const SENSITIVE_SELECTION_KEY =
  /(password|passcode|credential|secret|token|payment|stripe|card|cvc|cvv|otp|2fa|two[-_ ]?factor|backup[-_ ]?code)/i;

interface StoredCheckoutIntent {
  version: typeof CHECKOUT_INTENT_VERSION;
  id: string;
  gameSlug: string;
  serviceSlug: string;
  selection: ConfiguratorSelection;
  createdAt: number;
  resumeRequested: boolean;
}

type CheckoutIntentSource = "session" | "fallback";

interface ReadCheckoutIntentResult {
  intent: StoredCheckoutIntent;
  source: CheckoutIntentSource;
}

interface UseCheckoutIntentContinuityOptions {
  gameSlug: string;
  serviceSlug: string;
  selection: ConfiguratorSelection;
  setSelection: Dispatch<SetStateAction<ConfiguratorSelection>>;
  canAutoResume: boolean;
  busy: boolean;
  onResume: () => Promise<void> | void;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function selectionFingerprint(selection: ConfiguratorSelection) {
  return JSON.stringify(
    Object.keys(selection)
      .sort()
      .map((key) => [key, selection[key]]),
  );
}

function sanitizeSelection(
  candidate: unknown,
  template: ConfiguratorSelection,
): ConfiguratorSelection | null {
  if (!isPlainObject(candidate)) return null;

  const templateKeys = Object.keys(template).sort();
  const candidateKeys = Object.keys(candidate).sort();

  if (
    templateKeys.length === 0 ||
    templateKeys.length > MAX_SELECTION_KEYS ||
    candidateKeys.length !== templateKeys.length ||
    candidateKeys.some((key, index) => key !== templateKeys[index])
  ) {
    return null;
  }

  const sanitized: ConfiguratorSelection = {};

  for (const key of templateKeys) {
    if (
      key === "__proto__" ||
      key === "prototype" ||
      key === "constructor" ||
      SENSITIVE_SELECTION_KEY.test(key)
    ) {
      return null;
    }

    const expected = template[key];
    const value = candidate[key];

    if (typeof value !== typeof expected) return null;

    if (typeof value === "string") {
      if (value.length > MAX_SELECTION_STRING_LENGTH) return null;
      sanitized[key] = value;
      continue;
    }

    if (typeof value === "number") {
      if (!Number.isFinite(value)) return null;
      sanitized[key] = value;
      continue;
    }

    if (typeof value === "boolean") {
      sanitized[key] = value;
      continue;
    }

    return null;
  }

  return sanitized;
}

function isSafeSlug(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 100 &&
    /^[a-z0-9-]+$/i.test(value)
  );
}

function validateIntentEnvelope(candidate: unknown): StoredCheckoutIntent | null {
  if (!isPlainObject(candidate)) return null;
  if (candidate.version !== CHECKOUT_INTENT_VERSION) return null;
  if (typeof candidate.id !== "string" || candidate.id.length < 8 || candidate.id.length > 128) {
    return null;
  }
  if (!isSafeSlug(candidate.gameSlug) || !isSafeSlug(candidate.serviceSlug)) return null;
  if (typeof candidate.createdAt !== "number" || !Number.isFinite(candidate.createdAt)) return null;
  if (typeof candidate.resumeRequested !== "boolean") return null;
  if (!isPlainObject(candidate.selection)) return null;

  const age = Date.now() - candidate.createdAt;
  if (age < -60_000 || age > CHECKOUT_INTENT_MAX_AGE_MS) return null;

  return {
    version: CHECKOUT_INTENT_VERSION,
    id: candidate.id,
    gameSlug: candidate.gameSlug,
    serviceSlug: candidate.serviceSlug,
    selection: candidate.selection as ConfiguratorSelection,
    createdAt: candidate.createdAt,
    resumeRequested: candidate.resumeRequested,
  };
}

function getStorage(type: CheckoutIntentSource): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return type === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

function storageKey(type: CheckoutIntentSource) {
  return type === "session" ? CHECKOUT_INTENT_SESSION_KEY : CHECKOUT_INTENT_FALLBACK_KEY;
}

function removeStoredIntent(type: CheckoutIntentSource) {
  const storage = getStorage(type);
  if (!storage) return;

  try {
    storage.removeItem(storageKey(type));
  } catch {
    // Storage may be disabled. Checkout must continue without continuity rather than fail.
  }
}

function parseStoredIntent(
  type: CheckoutIntentSource,
): StoredCheckoutIntent | null {
  const storage = getStorage(type);
  if (!storage) return null;

  try {
    const raw = storage.getItem(storageKey(type));
    if (!raw) return null;
    if (raw.length > MAX_SERIALIZED_LENGTH) {
      removeStoredIntent(type);
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    const intent = validateIntentEnvelope(parsed);
    if (!intent) removeStoredIntent(type);
    return intent;
  } catch {
    removeStoredIntent(type);
    return null;
  }
}

function readMatchingCheckoutIntent(
  gameSlug: string,
  serviceSlug: string,
  template: ConfiguratorSelection,
): ReadCheckoutIntentResult | null {
  for (const source of ["session", "fallback"] as const) {
    const intent = parseStoredIntent(source);
    if (!intent) continue;

    // A valid intent for a different service is left untouched.
    if (intent.gameSlug !== gameSlug || intent.serviceSlug !== serviceSlug) continue;

    const selection = sanitizeSelection(intent.selection, template);
    if (!selection) {
      removeStoredIntent(source);
      continue;
    }

    return {
      intent: { ...intent, selection },
      source,
    };
  }

  return null;
}

function writeIntentToStorage(type: CheckoutIntentSource, intent: StoredCheckoutIntent) {
  const storage = getStorage(type);
  if (!storage) return false;

  try {
    const serialized = JSON.stringify(intent);
    if (serialized.length > MAX_SERIALIZED_LENGTH) return false;
    storage.setItem(storageKey(type), serialized);
    return true;
  } catch {
    return false;
  }
}

function createIntentId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function saveCheckoutIntent(
  gameSlug: string,
  serviceSlug: string,
  selection: ConfiguratorSelection,
) {
  if (!isSafeSlug(gameSlug) || !isSafeSlug(serviceSlug)) return false;

  const safeSelection = sanitizeSelection(selection, selection);
  if (!safeSelection) return false;

  const intent: StoredCheckoutIntent = {
    version: CHECKOUT_INTENT_VERSION,
    id: createIntentId(),
    gameSlug,
    serviceSlug,
    selection: safeSelection,
    createdAt: Date.now(),
    resumeRequested: true,
  };

  const sessionSaved = writeIntentToStorage("session", intent);
  // Short-lived fallback allows email-confirmation links opened in another tab
  // to restore the same non-sensitive configuration. It never auto-submits there.
  writeIntentToStorage("fallback", intent);

  return sessionSaved;
}

function updateIntentResumeState(id: string, resumeRequested: boolean) {
  for (const source of ["session", "fallback"] as const) {
    const storage = getStorage(source);
    if (!storage) continue;

    try {
      const raw = storage.getItem(storageKey(source));
      if (!raw || raw.length > MAX_SERIALIZED_LENGTH) continue;
      const parsed = JSON.parse(raw) as unknown;
      if (!isPlainObject(parsed) || parsed.id !== id) continue;
      storage.setItem(
        storageKey(source),
        JSON.stringify({ ...parsed, resumeRequested }),
      );
    } catch {
      removeStoredIntent(source);
    }
  }
}

function clearMatchingCheckoutIntent(gameSlug: string, serviceSlug: string) {
  for (const source of ["session", "fallback"] as const) {
    const storage = getStorage(source);
    if (!storage) continue;

    try {
      const raw = storage.getItem(storageKey(source));
      if (!raw || raw.length > MAX_SERIALIZED_LENGTH) continue;
      const parsed = JSON.parse(raw) as unknown;
      if (
        isPlainObject(parsed) &&
        parsed.gameSlug === gameSlug &&
        parsed.serviceSlug === serviceSlug
      ) {
        storage.removeItem(storageKey(source));
      }
    } catch {
      removeStoredIntent(source);
    }
  }
}

export function useCheckoutIntentContinuity({
  gameSlug,
  serviceSlug,
  selection,
  setSelection,
  canAutoResume,
  busy,
  onResume,
}: UseCheckoutIntentContinuityOptions) {
  const contextKey = `${gameSlug}:${serviceSlug}`;
  const templateRef = useRef<{ contextKey: string; selection: ConfiguratorSelection }>({
    contextKey,
    selection: { ...selection },
  });
  const onResumeRef = useRef(onResume);
  const validationCycleStartedRef = useRef(false);
  const [resumeTarget, setResumeTarget] = useState<{
    id: string;
    fingerprint: string;
  } | null>(null);

  if (templateRef.current.contextKey !== contextKey) {
    templateRef.current = { contextKey, selection: { ...selection } };
  }

  useEffect(() => {
    onResumeRef.current = onResume;
  }, [onResume]);

  useEffect(() => {
    validationCycleStartedRef.current = false;
    setResumeTarget(null);

    const restored = readMatchingCheckoutIntent(
      gameSlug,
      serviceSlug,
      templateRef.current.selection,
    );

    if (!restored) return;

    setSelection(restored.intent.selection);

    if (restored.intent.resumeRequested) {
      // Claim once before any order request. Same-tab session intents may auto-resume.
      // Fallback/local intents restore only, avoiding cross-tab duplicate order creation.
      updateIntentResumeState(restored.intent.id, false);

      if (restored.source === "session") {
        setResumeTarget({
          id: restored.intent.id,
          fingerprint: selectionFingerprint(restored.intent.selection),
        });
      }
    }
  }, [contextKey, gameSlug, serviceSlug, setSelection]);

  useEffect(() => {
    if (!resumeTarget) return;

    const currentFingerprint = selectionFingerprint(selection);
    if (currentFingerprint !== resumeTarget.fingerprint) {
      setResumeTarget(null);
      clearMatchingCheckoutIntent(gameSlug, serviceSlug);
      return;
    }

    if (!canAutoResume) {
      validationCycleStartedRef.current = true;
      return;
    }

    if (!validationCycleStartedRef.current || busy) return;

    // Disarm before invoking the request so rerenders / Strict Mode cannot submit twice.
    setResumeTarget(null);
    void Promise.resolve(onResumeRef.current()).catch(() => {
      // createOrder owns customer-facing error handling.
    });
  }, [busy, canAutoResume, gameSlug, resumeTarget, selection, serviceSlug]);

  const saveForAuthentication = useCallback(
    () => saveCheckoutIntent(gameSlug, serviceSlug, selection),
    [gameSlug, selection, serviceSlug],
  );

  const clearAfterOrder = useCallback(() => {
    clearMatchingCheckoutIntent(gameSlug, serviceSlug);
  }, [gameSlug, serviceSlug]);

  return {
    saveForAuthentication,
    clearAfterOrder,
  };
}
