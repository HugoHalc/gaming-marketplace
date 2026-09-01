import { notFound } from "next/navigation";
import { BoosterOrderWorkspace } from "@/components/booster/booster-order-workspace";
import { requireBooster } from "@/features/auth/server/auth";
import {
  getAssignedBoosterOrder,
  getAssignedBoosterOrderHistory,
} from "@/features/booster/server/booster-orders";
import { listOrderMessages } from "@/features/orders/server/order-workspace-repository";

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
