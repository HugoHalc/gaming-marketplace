export type NotificationType =
  | "order_created"
  | "payment_confirmed"
  | "order_queued"
  | "order_started"
  | "order_completed"
  | "order_cancelled"
  | "order_refunded";

export interface NotificationRecord {
  id: string;
  orderId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
}
