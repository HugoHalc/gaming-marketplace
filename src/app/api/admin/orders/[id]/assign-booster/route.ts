import { NextResponse, type NextRequest } from "next/server";
import { assignBoosterToOrder } from "@/features/orders/server/order-workspace-repository";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const payload = (await request.json()) as { boosterId?: unknown };

    if (typeof payload.boosterId !== "string" || !payload.boosterId) {
      return NextResponse.json({ error: "boosterId is required." }, { status: 400 });
    }

    await assignBoosterToOrder(id, payload.boosterId);
    return NextResponse.json({ assigned: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to assign booster." },
      { status: 400 },
    );
  }
}
