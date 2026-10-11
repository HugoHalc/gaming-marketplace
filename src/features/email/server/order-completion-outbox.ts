import "server-only";

import { buildServiceCompletedEmail } from "@/features/email/service-completed-email";
import { sendResendEmail } from "@/features/email/server/resend-email";
import { createSecretServerClient } from "@/lib/supabase/server";

type ClaimedEvent = {
  event_id: string;
  order_id: string;
  order_number: string;
  service_name: string;
  recipient_name: string;
  recipient_email: string;
  attempt_count: number;
  processing_token: string;
  retry_deadline_at: string;
};

function requiredServerEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

function nextRetryAt(attemptCount: number) {
  const delayMinutes = Math.min(60, 2 ** Math.max(0, attemptCount - 1));
  return new Date(Date.now() + delayMinutes * 60_000).toISOString();
}

function getEmailConfiguration() {
  const apiKey = requiredServerEnv("RESEND_API_KEY");
  const from = requiredServerEnv("RESEND_FROM_EMAIL");
  const bcc = requiredServerEnv("TRUSTPILOT_AFS_BCC");
  if (!from.includes("@") || !bcc.includes("@")) {
    throw new Error("Completion email addresses are not configured correctly.");
  }
  return { apiKey, from, bcc };
}

async function resolveEvent(
  event: ClaimedEvent,
  input: {
    outcome: "sent" | "retry" | "failed" | "uncertain";
    providerMessageId?: string;
    error?: string;
    retryAt?: string;
  },
) {
  const supabase = createSecretServerClient();
  const { data, error } = await supabase.rpc(
    "resolve_order_completion_email_event",
    {
      p_event_id: event.event_id,
      p_processing_token: event.processing_token,
      p_outcome: input.outcome,
      p_provider_message_id: input.providerMessageId ?? null,
      p_error: input.error ?? null,
      p_retry_at: input.retryAt ?? null,
    },
  );

  if (error || data !== true) {
    throw new Error("Unable to persist the completion email result.");
  }
}

async function processEvent(
  event: ClaimedEvent,
  fetchImpl: typeof fetch,
  configuration: ReturnType<typeof getEmailConfiguration>,
) {
  const email = buildServiceCompletedEmail({
    orderId: event.order_id,
    orderNumber: event.order_number,
    serviceName: event.service_name,
    recipientName: event.recipient_name,
    recipientEmail: event.recipient_email,
  });
  const result = await sendResendEmail(
    configuration.apiKey,
    {
      from: configuration.from,
      to: event.recipient_email,
      bcc: configuration.bcc,
      subject: email.subject,
      html: email.html,
      text: email.text,
      idempotencyKey: `service-completed/${event.event_id}`,
    },
    fetchImpl,
  );

  if (result.outcome === "sent") {
    await resolveEvent(event, {
      outcome: "sent",
      providerMessageId: result.providerMessageId,
    });
  } else if (result.outcome === "retry") {
    await resolveEvent(event, {
      outcome: "retry",
      error: result.error,
      retryAt: nextRetryAt(event.attempt_count),
    });
  } else {
    await resolveEvent(event, result);
  }

  return result.outcome;
}

export async function processOrderCompletionEmailOutbox(
  fetchImpl: typeof fetch = fetch,
) {
  const configuration = getEmailConfiguration();
  const supabase = createSecretServerClient();
  const { data, error } = await supabase.rpc(
    "claim_order_completion_email_events",
    { p_limit: 10 },
  );

  if (error) throw new Error("Unable to claim completion email events.");

  const events = (data ?? []) as ClaimedEvent[];
  const results = await Promise.allSettled(
    events.map((event) => processEvent(event, fetchImpl, configuration)),
  );

  return {
    claimed: events.length,
    processed: results.filter((result) => result.status === "fulfilled").length,
    errors: results.filter((result) => result.status === "rejected").length,
  };
}
