import { NextResponse, type NextRequest } from "next/server";
import { acceptAdminOrder } from "@/features/admin/server/admin-order-acceptance";

function expectsHtml(request: NextRequest) {
  return request.headers.get("accept")?.includes("text/html") ?? false;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const result = await acceptAdminOrder(id);

    if (expectsHtml(request)) {
      return NextResponse.redirect(
        new URL(`/admin/orders/${id}/workspace`, request.url),
        { status: 303 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to accept this order.";

    if (expectsHtml(request)) {
      const target = new URL(`/admin/orders/${id}`, request.url);
      target.searchParams.set("error", message);
      return NextResponse.redirect(target, { status: 303 });
    }

    return NextResponse.json({ error: message }, { status: 409 });
  }
}
