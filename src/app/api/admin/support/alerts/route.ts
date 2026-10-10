import { NextResponse } from "next/server";
import { requireAdmin } from "@/features/auth/server/auth";
import { listAdminSupportAlerts } from "@/features/support/server/support-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const identity = await requireAdmin();
    return NextResponse.json(await listAdminSupportAlerts(identity.id));
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
}
