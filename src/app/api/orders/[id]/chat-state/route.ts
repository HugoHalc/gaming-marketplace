import { NextResponse, type NextRequest } from "next/server";
import { getOrderConversationState } from "@/features/orders/server/order-workspace-repository";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const state = await getOrderConversationState(id);

    return NextResponse.json(state);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load conversation state.",
      },
      { status: 403 },
    );
  }
}
