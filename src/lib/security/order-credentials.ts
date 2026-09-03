import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";

export interface OrderCredentialPayload {
  accountEmail: string;
  password: string;
}

function normalizeConfiguredKey(value: string) {
  let normalized = value.trim();

  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }

  return normalized;
}

function decodeConfiguredKey(value: string) {
  const normalized = normalizeConfiguredKey(value);

  // Accept a 64-character hex key as a safe operational fallback.
  if (/^[0-9a-f]{64}$/i.test(normalized)) {
    return Buffer.from(normalized, "hex");
  }

  // Accept standard Base64 and Base64URL forms, ignoring accidental whitespace.
  const base64 = normalized
    .replace(/\s+/g, "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padding = base64.length % 4;
  const padded =
    padding === 0 ? base64 : `${base64}${"=".repeat(4 - padding)}`;

  return Buffer.from(padded, "base64");
}

function getEncryptionKey() {
  const configured = process.env.BOOSTINGPEDIA_CREDENTIALS_KEY;

  if (!configured) {
    throw new Error("Credentials encryption key is not configured.");
  }

  const key = decodeConfiguredKey(configured);

  if (key.length !== 32) {
    throw new Error("Credentials encryption key is invalid.");
  }

  return key;
}

export function encryptOrderCredentials(payload: OrderCredentialPayload) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);

  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    encryptionVersion: 1 as const,
  };
}

export function decryptOrderCredentials(input: {
  ciphertext: string;
  iv: string;
  authTag: string;
  encryptionVersion: number;
}): OrderCredentialPayload {
  if (input.encryptionVersion !== 1) {
    throw new Error("Unsupported credential encryption version.");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(input.iv, "base64"),
  );

  decipher.setAuthTag(Buffer.from(input.authTag, "base64"));

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(input.ciphertext, "base64")),
    decipher.final(),
  ]);

  const parsed = JSON.parse(
    plaintext.toString("utf8"),
  ) as Partial<OrderCredentialPayload>;

  if (
    typeof parsed.accountEmail !== "string" ||
    typeof parsed.password !== "string"
  ) {
    throw new Error("Invalid credential payload.");
  }

  return {
    accountEmail: parsed.accountEmail,
    password: parsed.password,
  };
}
