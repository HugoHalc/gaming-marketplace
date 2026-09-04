import { NextResponse } from "next/server";
import { requireAdmin } from "@/features/auth/server/auth";
import {
  getAdminSupportConversation,
  listSupportMessages,
  markSupportConversationRead,
  setSupportConversationStatus,
  type SupportConversationStatus,
} from "@/features/support/server/support-repository";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await context.params;
  const conversation = await getAdminSupportConversation(id);
  if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  const messages = await listSupportMessages(id);
  await markSupportConversationRead(id, "admin");
  return NextResponse.json({ conversation, messages });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await context.params;
  const body = (await request.json()) as { status?: SupportConversationStatus };
  if (body.status !== "open" && body.status !== "closed") {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  await setSupportConversationStatus(id, body.status);
  return NextResponse.json({ ok: true });
}
