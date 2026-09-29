import { NextResponse } from "next/server";
import type { ConfiguratorSelection } from "@/features/configurator/types/configurator";
import { calculateRainbowSixSiegeUnratedPricing } from "@/features/pricing/server/rainbow-six-siege-unrated-pricing";

interface RainbowSixSiegeUnratedQuoteBody {
  selection?: ConfiguratorSelection;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    if (!isPlainObject(body) || Object.keys(body).some((key) => key !== "selection")) {
      return NextResponse.json({ error: "Invalid quote request." }, { status: 400 });
    }

    const { selection } = body as RainbowSixSiegeUnratedQuoteBody;
    if (!selection) {
      return NextResponse.json({ error: "Invalid quote request." }, { status: 400 });
    }

    const result = calculateRainbowSixSiegeUnratedPricing(selection);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to calculate quote.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
