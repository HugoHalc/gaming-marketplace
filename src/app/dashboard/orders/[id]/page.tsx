import { notFound } from "next/navigation";
import { CustomerOrderWorkspace } from "@/components/dashboard/customer-order-workspace";
import { BoosterOrderWorkspace } from "@/components/booster/booster-order-workspace";
import { OrderCheckoutRedirect } from "@/components/checkout/order-checkout-redirect";
import { requireUser } from "@/features/auth/server/auth";
import {
  getCurrentUserOrder,
  getCurrentUserOrderHistory,
} from "@/features/orders/server/order-repository";
import {
  getAssignedBoosterOrder,
  getAssignedBoosterOrderHistory,
} from "@/features/booster/server/booster-orders";
import {
  getOrderBoosterAssignment,
  listOrderMessages,
} from "@/features/orders/server/order-workspace-repository";
import { createSecretServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    checkout?: string;
    paymentError?: string;
    mode?: string;
  }>;
}) {
  const identity = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const supabase = createSecretServerClient();

  const { data: boosterProfile } = await supabase
    .from("booster_profiles")
    .select("user_id")
    .eq("user_id", identity.id)
    .eq("is_active", true)
    .maybeSingle();

  const boosterMode =
    Boolean(boosterProfile) &&
    (query.mode === "booster" || identity.profile?.role === "booster");

  if (boosterMode) {
    const assigned = await getAssignedBoosterOrder(id);
    if (!assigned) notFound();

    const [history, initialMessages] = await Promise.all([
      getAssignedBoosterOrderHistory(id),
      listOrderMessages(id),
    ]);

    return (
      <BoosterOrderWorkspace
        order={assigned.order}
        history={history}
        currentUserId={identity.id}
        initialMessages={initialMessages}
        boosterPayout={assigned.payout}
      />
    );
  }

  const order = await getCurrentUserOrder(id);
  if (!order) notFound();

  const shouldStartCheckout =
    order.status === "pending_payment" &&
    (order.paymentStatus === "unpaid" || order.paymentStatus === "failed") &&
    !query.checkout &&
    !query.paymentError;

  if (shouldStartCheckout) {
    return <OrderCheckoutRedirect orderId={order.id} />;
  }

  const [history, initialMessages, boosterAssignment] = await Promise.all([
    getCurrentUserOrderHistory(order.id),
    listOrderMessages(order.id),
    getOrderBoosterAssignment(order.id),
  ]);

  return (
    <CustomerOrderWorkspace
      order={order}
      history={history}
      checkoutState={query.checkout}
      paymentError={query.paymentError}
      currentUserId={identity.id}
      currentUserRole={identity.profile?.role ?? "customer"}
      initialMessages={initialMessages}
      boosterAssignment={boosterAssignment}
      mode="customer"
    />
  );
}
