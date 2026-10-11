import "server-only";

export interface ResendEmailPayload {
  from: string;
  to: string;
  bcc: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
}

export type ResendEmailResult =
  | { outcome: "sent"; providerMessageId: string }
  | { outcome: "retry" | "failed" | "uncertain"; error: string };

function safeProviderError(status: number, payload: unknown) {
  const record = payload && typeof payload === "object" ? payload as Record<string, unknown> : null;
  const code = typeof record?.name === "string"
    ? record.name
    : typeof record?.code === "string"
      ? record.code
      : "unknown";
  return `resend_${status}_${code}`.slice(0, 200);
}

export async function sendResendEmail(
  apiKey: string,
  payload: ResendEmailPayload,
  fetchImpl: typeof fetch = fetch,
): Promise<ResendEmailResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": payload.idempotencyKey,
      },
      body: JSON.stringify({
        from: payload.from,
        to: [payload.to],
        bcc: [payload.bcc],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
      signal: controller.signal,
    });

    const responseBody = await response.json().catch(() => null) as
      | { id?: unknown; name?: unknown; code?: unknown }
      | null;

    if (response.ok && typeof responseBody?.id === "string" && responseBody.id) {
      return { outcome: "sent", providerMessageId: responseBody.id };
    }

    const error = safeProviderError(response.status, responseBody);
    if (
      response.status === 408 ||
      response.status === 425 ||
      response.status === 429 ||
      response.status >= 500 ||
      (response.status === 409 && responseBody?.name === "concurrent_idempotent_requests")
    ) {
      return { outcome: "retry", error };
    }

    return { outcome: "failed", error };
  } catch {
    return {
      outcome: "uncertain",
      error: "resend_network_result_ambiguous_manual_reconciliation_required",
    };
  } finally {
    clearTimeout(timeout);
  }
}
