import { NextResponse, type NextRequest } from "next/server";
import { getOrderOperations } from "@/features/orders/server/order-operations-repository";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    return NextResponse.json(await getOrderOperations(id));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load order operations." },
      { status: 403 },
    );
  }
}
