import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/features/auth/server/auth";
import { getOrderConversationState } from "@/features/orders/server/order-workspace-repository";
import { createSecretServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const state = await getOrderConversationState(id);

    if (state.enabled) {
      return NextResponse.json(state);
    }

    const identity = await requireUser();
    const supabase = createSecretServerClient();

    const { data: order, error } = await supabase
      .from("orders")
      .select("user_id, payment_status")
      .eq("id", id)
      .maybeSingle();

    if (error || !order) {
      throw new Error("Unable to load conversation state.");
    }

    const isPaidCustomer =
      order.user_id === identity.id &&
      order.payment_status === "paid";

    if (isPaidCustomer) {
      return NextResponse.json({
        ...state,
        enabled: true,
      });
    }

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
