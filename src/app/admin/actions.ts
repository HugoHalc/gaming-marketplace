"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/features/auth/server/auth";
import { createAuthServerClient } from "@/lib/supabase/auth";
import type { OrderStatus } from "@/features/orders/types/orders";

const allowedAdminStatuses = new Set<OrderStatus>(["queued", "in_progress", "completed", "cancelled"]);

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as OrderStatus;
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);

  if (!orderId || !allowedAdminStatuses.has(status)) {
    redirect(`/admin?error=${encodeURIComponent("Invalid fulfillment request.")}`);
  }

  const supabase = await createAuthServerClient();
  const { error } = await supabase.rpc("admin_update_order_status", {
    p_order_id: orderId,
    p_status: status,
    p_note: note || null,
  });

  if (error) {
    redirect(`/admin/orders/${orderId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/dashboard/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?updated=1`);
}
