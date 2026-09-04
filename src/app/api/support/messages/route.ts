import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentIdentity } from "@/features/auth/server/auth";
import {
  SUPPORT_COOKIE_NAME,
  SUPPORT_MAX_MESSAGE_LENGTH,
  createSupportConversation,
  createSupportMessage,
  createSupportSessionToken,
  findSupportConversationByToken,
} from "@/features/support/server/support-repository";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { body?: string; name?: string; email?: string };
    const body = payload.body?.trim() ?? "";
    if (!body || body.length > SUPPORT_MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: "Message must be between 1 and 1500 characters." }, { status: 400 });
    }

    const store = await cookies();
    let token = store.get(SUPPORT_COOKIE_NAME)?.value;
    let conversation = token ? await findSupportConversationByToken(token) : null;
    const identity = await getCurrentIdentity();

    if (!conversation) {
      token = createSupportSessionToken();
      conversation = await createSupportConversation({
        token,
        customerId: identity?.id ?? null,
        visitorName: identity?.profile?.gamer_tag || identity?.profile?.full_name || payload.name?.trim() || null,
        visitorEmail: identity?.email || payload.email?.trim() || null,
      });
    }

    if (conversation.status === "closed") {
      const { setSupportConversationStatus } = await import("@/features/support/server/support-repository");
      await setSupportConversationStatus(conversation.id, "open");
    }

    const message = await createSupportMessage({
      conversationId: conversation.id,
      senderType: "visitor",
      senderUserId: identity?.id ?? null,
      body,
    });

    const response = NextResponse.json({ conversation: { ...conversation, status: "open" }, message }, { status: 201 });
    if (!store.get(SUPPORT_COOKIE_NAME)?.value && token) {
      response.cookies.set(SUPPORT_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 90,
      });
    }
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to send message." }, { status: 400 });
  }
}
