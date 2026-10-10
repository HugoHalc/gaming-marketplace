import "server-only";

import { requireAdmin } from "@/features/auth/server/auth";
import { createAuthServerClient } from "@/lib/supabase/auth";

export async function acceptAdminOrder(orderId: string) {
  const admin = await requireAdmin();
  const supabase = await createAuthServerClient();
  const { data, error } = await supabase.rpc("accept_order_as_admin", {
    p_order_id: orderId,
  });

  if (error) {
    throw new Error(error.message || "Unable to accept this order.");
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result || result.assignment_kind !== "admin") {
    throw new Error("Unable to accept this order.");
  }

  return {
    orderId: result.order_id as string,
    adminId: admin.id,
    assignmentKind: "admin" as const,
    assignedAt: result.assigned_at as string,
  };
}
