import { notFound } from "next/navigation";
import { CustomerOrderWorkspace } from "@/components/dashboard/customer-order-workspace";
import { requireBooster } from "@/features/auth/server/auth";
import {
  getAssignedBoosterOrder,
  getAssignedBoosterOrderHistory,
} from "@/features/booster/server/booster-orders";
import {
  getOrderBoosterAssignment,
  listOrderMessages,
} from "@/features/orders/server/order-workspace-repository";

export const dynamic = "force-dynamic";

export default async function BoosterOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const identity = await requireBooster();
  const { id } = await params;

  const assigned = await getAssignedBoosterOrder(id);
  if (!assigned) notFound();

  const [history, initialMessages, boosterAssignment] = await Promise.all([
    getAssignedBoosterOrderHistory(id),
    listOrderMessages(id),
    getOrderBoosterAssignment(id),
  ]);

  return (
    <CustomerOrderWorkspace
      order={assigned.order}
      history={history}
      currentUserId={identity.id}
      currentUserRole={identity.profile?.role ?? "customer"}
      initialMessages={initialMessages}
      boosterAssignment={boosterAssignment}
      mode="booster"
      boosterPayout={assigned.payout}
      backHref="/booster?view=active"
      backLabel="Back to active orders"
    />
  );
}
