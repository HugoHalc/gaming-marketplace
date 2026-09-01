import { NextResponse, type NextRequest } from "next/server";
import {
  listOrderMessages,
  sendOrderMessage,
} from "@/features/orders/server/order-workspace-repository";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const messages = await listOrderMessages(id);
    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load messages." },
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
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const result = await sendOrderMessage(id, payload.body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send message.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
