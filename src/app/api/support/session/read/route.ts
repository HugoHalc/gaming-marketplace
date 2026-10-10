import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SUPPORT_COOKIE_NAME, findSupportConversationByToken, markCustomerSupportConversationRead } from "@/features/support/server/support-repository";

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get(SUPPORT_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Support session not found." }, { status: 404 });
    const conversation = await findSupportConversationByToken(token);
    if (!conversation) return NextResponse.json({ error: "Support session not found." }, { status: 404 });
    const payload = (await request.json()) as { messageId?: string };
    if (!payload.messageId) return NextResponse.json({ error: "Message is required." }, { status: 400 });
    await markCustomerSupportConversationRead(conversation.id, payload.messageId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to mark support messages as read." }, { status: 500 });
  }
}
