import { NextResponse, type NextRequest } from "next/server";
import {
  listChatMessages,
  sendChatMessage,
} from "@/features/orders/server/order-chat-service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const before = request.nextUrl.searchParams.get("before");
    const requestedLimit = Number(
      request.nextUrl.searchParams.get("limit") ?? "60",
    );
    const limit = Number.isFinite(requestedLimit) ? requestedLimit : 60;

    const result = await listChatMessages(id, { before, limit });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to load messages.",
      },
      { status: 403 },
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const payload = (await request.json()) as { body?: unknown };

    if (typeof payload.body !== "string") {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 },
      );
    }

    const result = await sendChatMessage(id, payload.body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to send message.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
