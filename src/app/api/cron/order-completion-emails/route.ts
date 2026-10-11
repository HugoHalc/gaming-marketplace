import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { processOrderCompletionEmailOutbox } from "@/features/email/server/order-completion-outbox";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

function secretsMatch(actual: string | null, expected: string) {
  if (!actual) return false;
  const expectedHeader = `Bearer ${expected}`;
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expectedHeader);
  return actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer);
}

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    return NextResponse.json({ error: "Worker is not configured." }, { status: 503 });
  }
  if (!secretsMatch(request.headers.get("authorization"), cronSecret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const enabled =
    process.env.VERCEL_ENV === "production" &&
    process.env.TRUSTPILOT_AFS_ENABLED === "true";
  if (!enabled) {
    return NextResponse.json({ enabled: false, claimed: 0, processed: 0 });
  }

  try {
    const result = await processOrderCompletionEmailOutbox();
    return NextResponse.json({ enabled: true, ...result });
  } catch {
    return NextResponse.json(
      { error: "Unable to process completion emails." },
      { status: 500 },
    );
  }
}
