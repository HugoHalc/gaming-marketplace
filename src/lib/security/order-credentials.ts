import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";

export interface OrderCredentialPayload {
  accountEmail: string;
  password: string;
}

function getEncryptionKey() {
  const encoded = process.env.BOOSTINGPEDIA_CREDENTIALS_KEY;
  if (!encoded) {
    throw new Error("BOOSTINGPEDIA_CREDENTIALS_KEY is not configured.");
  }

  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) {
    throw new Error("BOOSTINGPEDIA_CREDENTIALS_KEY must decode to exactly 32 bytes.");
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

  const parsed = JSON.parse(plaintext.toString("utf8")) as Partial<OrderCredentialPayload>;
  if (typeof parsed.accountEmail !== "string" || typeof parsed.password !== "string") {
    throw new Error("Invalid credential payload.");
  }

  return {
    accountEmail: parsed.accountEmail,
    password: parsed.password,
  };
}
