import { NextResponse } from "next/server";
import { requireAdmin } from "@/features/auth/server/auth";
import { markAdminSupportConversationRead } from "@/features/support/server/support-repository";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const identity = await requireAdmin();
    const { id } = await context.params;
    const payload = (await request.json()) as { messageId?: string };
    if (!payload.messageId) return NextResponse.json({ error: "Message is required." }, { status: 400 });
    await markAdminSupportConversationRead(identity.id, id, payload.messageId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to mark support messages as read." }, { status: 500 });
  }
}
