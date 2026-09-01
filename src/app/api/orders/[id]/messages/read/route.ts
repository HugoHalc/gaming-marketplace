import { NextResponse, type NextRequest } from "next/server";
import { markOrderMessagesRead } from "@/features/orders/server/order-workspace-repository";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    await markOrderMessagesRead(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update read state." },
      { status: 400 },
    );
  }
}
