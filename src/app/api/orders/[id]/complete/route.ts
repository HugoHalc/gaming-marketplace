import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Direct completion is no longer available. Orders must be delivered and confirmed by the customer or auto-completed after the review window.",
    },
    { status: 410 },
  );
}
