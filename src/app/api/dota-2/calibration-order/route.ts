import { NextResponse } from "next/server";
import { getCurrentIdentity } from "@/features/auth/server/auth";
import {
  dota2GameFoundation,
  findDota2ServiceFoundation,
} from "@/features/catalog/data/dota-2-foundation";
import type {
  CatalogGame,
  ServiceSummary,
} from "@/features/catalog/types/catalog";
import type { ConfiguratorSelection } from "@/features/configurator/types/configurator";
import {
  MINIMUM_ORDER_ERROR_CODE,
  MINIMUM_ORDER_TOTAL_LABEL,
  MINIMUM_ORDER_TOTAL_USD,
  meetsMinimumOrderTotal,
} from "@/features/orders/minimum-order";
import { createServerValidatedOrder } from "@/features/orders/server/order-repository";
import { calculateDota2CalibrationPricing } from "@/features/pricing/server/dota-2-calibration-pricing";
import { hasSecretSupabaseEnv } from "@/lib/supabase/env";

interface Dota2CalibrationOrderBody {
  selection?: ConfiguratorSelection;
}

const calibrationFoundation = findDota2ServiceFoundation("calibration-matches");
if (!calibrationFoundation) {
  throw new Error("Dota 2 Calibration Matches foundation is unavailable.");
}

const orderService: ServiceSummary = {
  id: calibrationFoundation.id,
  gameId: dota2GameFoundation.id,
  slug: calibrationFoundation.slug,
  name: calibrationFoundation.name,
  category: "placements",
  description: calibrationFoundation.description,
  startingPrice: 0,
  currency: "USD",
  status: "active",
};

const orderGame: CatalogGame = {
  id: dota2GameFoundation.id,
  slug: dota2GameFoundation.slug,
  name: dota2GameFoundation.name,
  shortDescription: dota2GameFoundation.shortDescription,
  accent: "amber",
  status: "active",
  featured: false,
  services: [orderService],
  startingPrice: null,
};

export async function POST(request: Request) {
  const identity = await getCurrentIdentity();
  if (!identity) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }
  if (!hasSecretSupabaseEnv()) {
    return NextResponse.json(
      { error: "Secure order creation is not configured." },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as Dota2CalibrationOrderBody;
    if (!body.selection) {
      return NextResponse.json(
        { error: "Invalid order request." },
        { status: 400 },
      );
    }

    const result = calculateDota2CalibrationPricing(body.selection);
    if (result.kind === "custom") {
      return NextResponse.json(
        {
          error: result.customQuote.message,
          code: "custom_quote_required",
        },
        { status: 400 },
      );
    }

    if (!meetsMinimumOrderTotal(result.quote.total)) {
      return NextResponse.json(
        {
          error: `Minimum order total: ${MINIMUM_ORDER_TOTAL_LABEL}`,
          code: MINIMUM_ORDER_ERROR_CODE,
          minimumTotal: MINIMUM_ORDER_TOTAL_USD,
        },
        { status: 400 },
      );
    }

    const order = await createServerValidatedOrder({
      userId: identity.id,
      game: orderGame,
      service: orderService,
      selection: body.selection,
      quote: result.quote,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
