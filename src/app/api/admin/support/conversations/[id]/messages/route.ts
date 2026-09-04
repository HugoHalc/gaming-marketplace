import { NextResponse } from "next/server";
import { requireAdmin } from "@/features/auth/server/auth";
import {
  SUPPORT_MAX_MESSAGE_LENGTH,
  createSupportMessage,
  getAdminSupportConversation,
  setSupportConversationStatus,
} from "@/features/support/server/support-repository";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const identity = await requireAdmin();
  const { id } = await context.params;
  const conversation = await getAdminSupportConversation(id);
  if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });

  const payload = (await request.json()) as { body?: string };
  const body = payload.body?.trim() ?? "";
  if (!body || body.length > SUPPORT_MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Message must be between 1 and 1500 characters." }, { status: 400 });
  }

  if (conversation.status === "closed") await setSupportConversationStatus(id, "open");
  const message = await createSupportMessage({ conversationId: id, senderType: "admin", senderUserId: identity.id, body });
  return NextResponse.json({ message }, { status: 201 });
}
