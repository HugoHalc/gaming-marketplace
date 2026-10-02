import { NextResponse, type NextRequest } from "next/server";
import {
  getOrderCredentialState,
  revealOrderCredentials,
  saveOrderCredentials,
} from "@/features/orders/server/order-workspace-repository";

export const dynamic = "force-dynamic";

function safeCredentialError(error: unknown, action: "load" | "save") {
  const message = error instanceof Error ? error.message : "";

  const safeMessages = new Set([
    "Enter a valid account email.",
    "Enter a valid password.",
    "Enter a valid in-game username.",
    "Account details do not match the order method.",
    "Only the customer who owns this order can update credentials.",
    "Order not found.",
    "Order access denied.",
  ]);

  if (safeMessages.has(message)) {
    return { message, status: 400 };
  }

  console.error(
    `[secure-account-access] Unable to ${action} credentials`,
    error instanceof Error ? error.name : "UnknownError",
  );

  return {
    message:
      "Secure Account Access is temporarily unavailable. Please try again shortly.",
    status: 500,
  };
}

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
    const safe = safeCredentialError(error, "load");

    return NextResponse.json(
      { error: safe.message },
      { status: safe.status },
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
      kind?: unknown;
      username?: unknown;
      accountEmail?: unknown;
      password?: unknown;
    };

    if (payload.kind === "player") {
      if (typeof payload.username !== "string") {
        return NextResponse.json({ error: "Enter a valid in-game username." }, { status: 400 });
      }
      await saveOrderCredentials(id, { kind: "player", username: payload.username });
    } else {
      if (typeof payload.accountEmail !== "string" || typeof payload.password !== "string") {
        return NextResponse.json({ error: "Account email and password are required." }, { status: 400 });
      }
      await saveOrderCredentials(id, { accountEmail: payload.accountEmail, password: payload.password });
    }

    return NextResponse.json({ saved: true });
  } catch (error) {
    const safe = safeCredentialError(error, "save");

    return NextResponse.json(
      { error: safe.message },
      { status: safe.status },
    );
  }
}
