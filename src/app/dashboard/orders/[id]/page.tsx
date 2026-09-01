import { notFound } from "next/navigation";
import { CustomerOrderWorkspace } from "@/components/dashboard/customer-order-workspace";
import { requireUser } from "@/features/auth/server/auth";
import {
  getCurrentUserOrder,
  getCurrentUserOrderHistory,
} from "@/features/orders/server/order-repository";
import {
  getOrderBoosterAssignment,
  listOrderMessages,
} from "@/features/orders/server/order-workspace-repository";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkout?: string; paymentError?: string }>;
}) {
  const identity = await requireUser();
  const { id } = await params;
  const query = await searchParams;

  const order = await getCurrentUserOrder(id);
  if (!order) notFound();

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
    />
  );
}
