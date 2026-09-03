import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/features/auth/server/auth";
import { createSecretServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function normalizeTimezone(value: unknown) {
  if (typeof value !== "string") return null;
  const timezone = value.trim();
  if (!timezone || timezone.length > 80) return null;

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format();
    return timezone;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await requireUser();
    const body = (await request.json().catch(() => ({}))) as {
      timezone?: unknown;
    };
    const timezone = normalizeTimezone(body.timezone);
    const supabase = createSecretServerClient();

    const { data: currentUser, error: loadError } =
      await supabase.auth.admin.getUserById(identity.id);

    if (loadError || !currentUser.user) {
      throw new Error("Unable to update presence.");
    }

    const userMetadata = {
      ...(currentUser.user.user_metadata ?? {}),
      boostingpedia_last_seen_at: new Date().toISOString(),
      ...(timezone ? { boostingpedia_timezone: timezone } : {}),
    };

    const { error } = await supabase.auth.admin.updateUserById(identity.id, {
      user_metadata: userMetadata,
    });

    if (error) throw new Error("Unable to update presence.");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to update presence.",
      },
      { status: 401 },
    );
  }
}
