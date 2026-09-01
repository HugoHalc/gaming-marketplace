import { NextResponse, type NextRequest } from "next/server";
import { completeOperationalOrder } from "@/features/orders/server/order-operations-repository";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    await completeOperationalOrder(id);
    return NextResponse.json({ completed: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to complete order." },
      { status: 400 },
    );
  }
}
