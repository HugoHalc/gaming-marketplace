import { notFound } from "next/navigation";
import { BoosterOrderWorkspace } from "@/components/booster/booster-order-workspace";
import {
  getAdminOrder,
  getAdminOrderHistory,
  getAdminWorkspaceMode,
} from "@/features/admin/server/admin-orders";
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

  if (!order) notFound();
  const workspaceMode = getAdminWorkspaceMode(order, admin.id);
  if (!workspaceMode) notFound();

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
      assignmentContext={order.assignment?.kind ?? "booster"}
      assigneeName={order.assignment?.displayName ?? "Assigned staff"}
      supervisionMode={workspaceMode === "supervisor"}
      backHref={workspaceMode === "operator" ? "/admin?view=mine" : "/admin?status=in_progress"}
      backLabel={workspaceMode === "operator" ? "My accepted orders" : "In-progress orders"}
    />
  );
}
