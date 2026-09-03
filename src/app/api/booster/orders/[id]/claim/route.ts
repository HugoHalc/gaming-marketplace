import { NextResponse, type NextRequest } from "next/server";
import { claimBoosterOrder } from "@/features/booster/server/booster-orders";

function expectsHtml(request: NextRequest) {
  return request.headers.get("accept")?.includes("text/html") ?? false;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const result = await claimBoosterOrder(id);

    if (expectsHtml(request)) {
      return NextResponse.redirect(
        new URL(`/dashboard/orders/${id}?mode=booster`, request.url),
        { status: 303 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to accept order.";

    if (expectsHtml(request)) {
      const target = new URL("/dashboard/orders", request.url);
      target.searchParams.set("mode", "booster");
      target.searchParams.set("claimError", message);
      return NextResponse.redirect(target, { status: 303 });
    }

    return NextResponse.json({ error: message }, { status: 409 });
  }
}
