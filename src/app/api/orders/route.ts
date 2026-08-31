import { NextResponse } from "next/server";
import { getCurrentIdentity } from "@/features/auth/server/auth";
import { findCatalogGameBySlug } from "@/features/catalog/data/catalog-repository";
import type { ConfiguratorSelection } from "@/features/configurator/types/configurator";
import { createServerValidatedOrder } from "@/features/orders/server/order-repository";
import { calculateQuotePreview } from "@/features/pricing/server/calculate-quote";
import { hasSecretSupabaseEnv } from "@/lib/supabase/env";

interface CreateOrderBody {
  gameSlug?: string;
  serviceSlug?: string;
  selection?: ConfiguratorSelection;
}

export async function POST(request: Request) {
  const identity = await getCurrentIdentity();
  if (!identity) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!hasSecretSupabaseEnv()) {
    return NextResponse.json({ error: "Secure order creation is not configured." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as CreateOrderBody;
    if (!body.gameSlug || !body.serviceSlug || !body.selection) {
      return NextResponse.json({ error: "Invalid order request." }, { status: 400 });
    }

    const game = await findCatalogGameBySlug(body.gameSlug);
    const service = game?.services.find((item) => item.slug === body.serviceSlug);
    if (!game || !service) return NextResponse.json({ error: "Service not found." }, { status: 404 });

    const quote = await calculateQuotePreview({
      gameSlug: body.gameSlug,
      serviceSlug: body.serviceSlug,
      selection: body.selection,
    });

    if (quote.ruleSetVersion.startsWith("mock-")) {
      return NextResponse.json({ error: "Live pricing is not available for order creation." }, { status: 503 });
    }

    const order = await createServerValidatedOrder({
      userId: identity.id,
      game,
      service,
      selection: body.selection,
      quote,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
