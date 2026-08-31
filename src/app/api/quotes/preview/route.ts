import { NextResponse } from "next/server";
import { calculateQuotePreview } from "@/features/pricing/server/calculate-quote";
import type { ConfiguratorSelection } from "@/features/configurator/types/configurator";

interface QuoteRequestBody {
  gameSlug?: string;
  serviceSlug?: string;
  selection?: ConfiguratorSelection;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuoteRequestBody;
    if (!body.gameSlug || !body.serviceSlug || !body.selection) {
      return NextResponse.json({ error: "Invalid quote request." }, { status: 400 });
    }

    const quote = await calculateQuotePreview({
      gameSlug: body.gameSlug,
      serviceSlug: body.serviceSlug,
      selection: body.selection,
    });

    return NextResponse.json({ quote });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to calculate quote.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
