import { NextResponse } from "next/server";
import { getCurrentIdentity } from "@/features/auth/server/auth";
import {
  findRainbowSixSiegeServiceFoundation,
  rainbowSixSiegeGameFoundation,
} from "@/features/catalog/data/rainbow-six-siege-foundation";
import type { CatalogGame, ServiceSummary } from "@/features/catalog/types/catalog";
import type { ConfiguratorSelection } from "@/features/configurator/types/configurator";
import {
  MINIMUM_ORDER_ERROR_CODE,
  MINIMUM_ORDER_TOTAL_LABEL,
  MINIMUM_ORDER_TOTAL_USD,
  meetsMinimumOrderTotal,
} from "@/features/orders/minimum-order";
import { createServerValidatedOrder } from "@/features/orders/server/order-repository";
import { calculateRainbowSixSiegeWinsPricing } from "@/features/pricing/server/rainbow-six-siege-wins-pricing";
import { hasSecretSupabaseEnv } from "@/lib/supabase/env";

interface RainbowSixSiegeWinsOrderBody {
  selection?: ConfiguratorSelection;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

const winsFoundation = findRainbowSixSiegeServiceFoundation("competitive-wins");
if (!winsFoundation || winsFoundation.status !== "active") {
  throw new Error("Rainbow Six Siege Competitive Wins foundation is unavailable.");
}

const orderService: ServiceSummary = {
  id: winsFoundation.id,
  gameId: rainbowSixSiegeGameFoundation.id,
  slug: winsFoundation.slug,
  name: winsFoundation.name,
  category: "wins",
  description: winsFoundation.description,
  startingPrice: 0,
  currency: "USD",
  status: "active",
};

const orderGame: CatalogGame = {
  id: rainbowSixSiegeGameFoundation.id,
  slug: rainbowSixSiegeGameFoundation.slug,
  name: rainbowSixSiegeGameFoundation.name,
  shortDescription: rainbowSixSiegeGameFoundation.shortDescription,
  accent: "emerald",
  status: "active",
  featured: false,
  services: [orderService],
  startingPrice: null,
};

export async function POST(request: Request) {
  const identity = await getCurrentIdentity();
  if (!identity) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!hasSecretSupabaseEnv()) {
    return NextResponse.json({ error: "Secure order creation is not configured." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as unknown;
    if (!isPlainObject(body) || Object.keys(body).some((key) => key !== "selection")) {
      return NextResponse.json({ error: "Invalid order request." }, { status: 400 });
    }

    const { selection } = body as RainbowSixSiegeWinsOrderBody;
    if (!selection) {
      return NextResponse.json({ error: "Invalid order request." }, { status: 400 });
    }

    const result = calculateRainbowSixSiegeWinsPricing(selection);
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
      selection: {
        ...selection,
        serviceSlug: "competitive-wins",
        serviceName: orderService.name,
        rankDivision: result.metadata.currentRank.split("-").at(-1) ?? "",
        normalBenchmarkCents: result.metadata.normalBenchmarkCents,
        discountedReferenceCents: result.metadata.discountedReferenceCents,
        basePriceCents: result.metadata.basePriceCents,
        percentageModifiers: JSON.stringify(result.metadata.percentageModifiers),
        fixedChargesCents: result.metadata.fixedChargesCents,
        discountBps: result.metadata.discountBps,
        discountCents: result.metadata.discountCents,
        finalTotalCents: result.metadata.finalTotalCents,
        currency: "USD",
        pricingVersion: result.metadata.pricingVersion,
      },
      quote: result.quote,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
