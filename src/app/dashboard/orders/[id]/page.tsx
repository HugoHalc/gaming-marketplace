import { notFound } from "next/navigation";
import { CustomerOrderWorkspace } from "@/components/dashboard/customer-order-workspace";
import {
  getCurrentUserOrder,
  getCurrentUserOrderHistory,
} from "@/features/orders/server/order-repository";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkout?: string; paymentError?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;

  const order = await getCurrentUserOrder(id);
  if (!order) notFound();

  const history = await getCurrentUserOrderHistory(order.id);

  return (
    <CustomerOrderWorkspace
      order={order}
      history={history}
      checkoutState={query.checkout}
      paymentError={query.paymentError}
    />
  );
}
