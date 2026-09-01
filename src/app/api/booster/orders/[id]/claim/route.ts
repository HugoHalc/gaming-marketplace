import { NextResponse, type NextRequest } from "next/server";
import { claimBoosterOrder } from "@/features/booster/server/booster-orders";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const result = await claimBoosterOrder(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to accept order." },
      { status: 409 },
    );
  }
}
