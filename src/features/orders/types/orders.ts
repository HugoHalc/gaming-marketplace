import type { ServiceCategory } from "@/features/catalog/types/catalog";
import type { ConfiguratorSelection, QuoteBreakdownItem } from "@/features/configurator/types/configurator";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "queued"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded";

export interface OrderItemRecord {
  id: string;
  gameName: string;
  serviceName: string;
  serviceCategory: ServiceCategory;
  configuration: ConfiguratorSelection;
  priceBreakdown: QuoteBreakdownItem[];
  ruleSetVersion: string;
  subtotal: number;
  discount: number;
  total: number;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  currency: "USD";
  subtotal: number;
  discount: number;
  total: number;
  customerNote: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemRecord[];
}

export interface OrderStatusEvent {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  note: string | null;
  createdAt: string;
}
