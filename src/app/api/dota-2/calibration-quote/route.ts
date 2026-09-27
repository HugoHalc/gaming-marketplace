import { NextResponse } from "next/server";
import type { ConfiguratorSelection } from "@/features/configurator/types/configurator";
import { calculateDota2CalibrationPricing } from "@/features/pricing/server/dota-2-calibration-pricing";

interface Dota2CalibrationQuoteBody {
  selection?: ConfiguratorSelection;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Dota2CalibrationQuoteBody;
    if (!body.selection) {
      return NextResponse.json({ error: "Invalid quote request." }, { status: 400 });
    }

    const result = calculateDota2CalibrationPricing(body.selection);
    if (result.kind === "custom") {
      return NextResponse.json({ customQuote: result.customQuote });
    }

    return NextResponse.json({
      quote: result.quote,
      metadata: result.metadata,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to calculate quote.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
