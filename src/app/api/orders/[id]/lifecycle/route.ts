import { NextResponse, type NextRequest } from "next/server";
import {
  confirmDelivery,
  reportDeliveryProblem,
  transitionOperationalState,
  type OperationalState,
} from "@/features/orders/server/order-operations-repository";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      action?: string;
      nextState?: OperationalState;
      note?: string;
    };

    if (body.action === "confirm_delivery") {
      await confirmDelivery(id);
      return NextResponse.json({ completed: true });
    }

    if (body.action === "report_problem") {
      const state = await reportDeliveryProblem(id, body.note ?? "");
      return NextResponse.json(state);
    }

    if (body.action === "transition" && body.nextState) {
      const state = await transitionOperationalState(id, {
        nextState: body.nextState,
        note: body.note,
      });
      return NextResponse.json(state);
    }

    return NextResponse.json({ error: "Invalid lifecycle action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update lifecycle." },
      { status: 400 },
    );
  }
}
