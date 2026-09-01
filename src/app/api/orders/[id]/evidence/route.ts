import { NextResponse, type NextRequest } from "next/server";
import {
  saveOrderEvidence,
  type EvidenceType,
} from "@/features/orders/server/order-operations-repository";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { type?: string; url?: string };

    const state = await saveOrderEvidence(id, {
      type: body.type as EvidenceType,
      url: body.url ?? "",
    });

    return NextResponse.json(state);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save screenshot link." },
      { status: 400 },
    );
  }
}
