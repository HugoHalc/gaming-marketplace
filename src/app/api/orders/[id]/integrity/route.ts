import { NextResponse, type NextRequest } from "next/server";
import { saveOrderIntegrity } from "@/features/orders/server/order-operations-repository";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      platform?: string;
      playerId?: string;
      internalNote?: string;
    };

    const state = await saveOrderIntegrity(id, {
      platform: body.platform ?? "",
      playerId: body.playerId ?? "",
      internalNote: body.internalNote,
    });

    return NextResponse.json(state);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save validation." },
      { status: 400 },
    );
  }
}
