import { NextResponse } from "next/server";
import { requireAdmin } from "@/features/auth/server/auth";
import { listAdminSupportConversations, type SupportConversationStatus } from "@/features/support/server/support-repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await requireAdmin();
  const value = new URL(request.url).searchParams.get("status");
  const status: SupportConversationStatus | undefined = value === "open" || value === "closed" ? value : undefined;
  const conversations = await listAdminSupportConversations(status);
  return NextResponse.json({ conversations });
}
