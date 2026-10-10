import { notFound } from "next/navigation";
import { BoosterOrderWorkspace } from "@/components/booster/booster-order-workspace";
import { getAdminOrder, getAdminOrderHistory } from "@/features/admin/server/admin-orders";
import { requireAdmin } from "@/features/auth/server/auth";
import { listOrderMessages } from "@/features/orders/server/order-workspace-repository";

export const dynamic = "force-dynamic";

export default async function AdminOrderWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdmin();
  const { id } = await params;
  const order = await getAdminOrder(id);

  if (
    !order ||
    order.assignment?.kind !== "admin" ||
    order.assignment.assigneeId !== admin.id
  ) {
    notFound();
  }

  const [history, initialMessages] = await Promise.all([
    getAdminOrderHistory(id),
    listOrderMessages(id),
  ]);

  return (
    <BoosterOrderWorkspace
      order={order}
      history={history}
      currentUserId={admin.id}
      initialMessages={initialMessages}
      boosterPayout={null}
      assignmentContext="admin"
      backHref="/admin?view=mine"
      backLabel="My accepted orders"
    />
  );
}
