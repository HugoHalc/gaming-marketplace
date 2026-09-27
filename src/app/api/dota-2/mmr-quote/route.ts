import { NextResponse } from "next/server";
import type { ConfiguratorSelection } from "@/features/configurator/types/configurator";
import { calculateDota2MmrPricing } from "@/features/pricing/server/dota-2-mmr-pricing";

interface Dota2MmrQuoteBody {
  selection?: ConfiguratorSelection;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Dota2MmrQuoteBody;
    if (!body.selection) {
      return NextResponse.json({ error: "Invalid quote request." }, { status: 400 });
    }

    const result = calculateDota2MmrPricing(body.selection);
    if (result.kind === "custom") {
      return NextResponse.json({ customQuote: result.customQuote });
    }

    return NextResponse.json({ quote: result.quote, metadata: result.metadata });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to calculate quote.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
