import { createAuthServerClient } from "@/lib/supabase/auth";
import type { NotificationRecord, NotificationType } from "../types/notifications";

type DbNotification = {
  id: string;
  order_id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  href: string | null;
  read_at: string | null;
  created_at: string;
};

function mapNotification(row: DbNotification): NotificationRecord {
  return {
    id: row.id,
    orderId: row.order_id,
    type: row.type,
    title: row.title,
    message: row.message,
    href: row.href,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

export async function listCurrentUserNotifications(limit = 50): Promise<NotificationRecord[]> {
  const supabase = await createAuthServerClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, order_id, type, title, message, href, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error("Unable to load notifications.");
  return (data as DbNotification[] | null ?? []).map(mapNotification);
}

export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createAuthServerClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  if (error) return 0;
  return count ?? 0;
}
