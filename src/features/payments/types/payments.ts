export type PaymentProviderStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";

export interface PaymentRecord {
  id: string;
  orderId: string;
  status: PaymentProviderStatus;
  amountCents: number;
  currency: "USD";
  checkoutSessionId: string | null;
  paymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
}
