"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/server/auth";
import { createAuthServerClient } from "@/lib/supabase/auth";

export async function markNotificationReadAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "").trim();
  const href = String(formData.get("href") ?? "/dashboard/notifications").trim();
  if (!id) redirect("/dashboard/notifications");

  const supabase = await createAuthServerClient();
  await supabase.rpc("mark_notification_read", { p_notification_id: id });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");
  redirect(href.startsWith("/dashboard/") ? href : "/dashboard/notifications");
}

export async function markAllNotificationsReadAction() {
  await requireUser();
  const supabase = await createAuthServerClient();
  await supabase.rpc("mark_all_notifications_read");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");
  redirect("/dashboard/notifications");
}
