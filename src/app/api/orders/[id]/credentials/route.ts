import { NextResponse, type NextRequest } from "next/server";
import {
  getOrderCredentialState,
  revealOrderCredentials,
  saveOrderCredentials,
} from "@/features/orders/server/order-workspace-repository";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const reveal = request.nextUrl.searchParams.get("reveal") === "1";

    if (!reveal) {
      return NextResponse.json(await getOrderCredentialState(id));
    }

    const credentials = await revealOrderCredentials(id);
    return NextResponse.json({
      hasCredentials: Boolean(credentials),
      credentials,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load credentials." },
      { status: 403 },
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const payload = (await request.json()) as {
      accountEmail?: unknown;
      password?: unknown;
    };

    if (
      typeof payload.accountEmail !== "string" ||
      typeof payload.password !== "string"
    ) {
      return NextResponse.json(
        { error: "Account email and password are required." },
        { status: 400 },
      );
    }

    await saveOrderCredentials(id, {
      accountEmail: payload.accountEmail,
      password: payload.password,
    });

    return NextResponse.json({ saved: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save credentials." },
      { status: 400 },
    );
  }
}
