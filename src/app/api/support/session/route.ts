import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentIdentity } from "@/features/auth/server/auth";
import {
  SUPPORT_COOKIE_NAME,
  attachSupportConversationIdentity,
  findSupportConversationByToken,
  listSupportMessages,
} from "@/features/support/server/support-repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const store = await cookies();
  const token = store.get(SUPPORT_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ conversation: null, messages: [], unreadCount: 0 });

  const conversation = await findSupportConversationByToken(token);
  if (!conversation) return NextResponse.json({ conversation: null, messages: [], unreadCount: 0 });

  const identity = await getCurrentIdentity();
  if (identity) {
    await attachSupportConversationIdentity(conversation.id, {
      customerId: identity.id,
      visitorName: identity.profile?.gamer_tag || identity.profile?.full_name || null,
      visitorEmail: identity.email || null,
    });
  }

  const beforeId = new URL(request.url).searchParams.get("before");
  const page = await listSupportMessages(conversation.id, { beforeId });
  const unreadCount = page.messages.filter(
    (message) =>
      message.senderType === "admin" &&
      (!conversation.customerLastReadAt || new Date(message.createdAt) > new Date(conversation.customerLastReadAt)),
  ).length;

  return NextResponse.json({ conversation, messages: page.messages, unreadCount, page: { hasMore: page.hasMore, nextCursor: page.nextCursor } });
}
