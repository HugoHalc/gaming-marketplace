import "server-only";

import { createAuthServerClient } from "@/lib/supabase/auth";
import { createSecretServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/features/auth/server/auth";

export type EvidenceType = "start" | "delivery";

export interface OrderIntegrityRecord {
  platform: string;
  playerId: string;
  internalNote: string | null;
  recordedAt: string;
  updatedAt: string;
  orderId: string;
}

export interface OrderEvidenceLink {
  type: EvidenceType;
  url: string;
  submittedAt: string;
  updatedAt: string;
}

export interface OrderOperationsState {
  canManage: boolean;
  currentIntegrity: OrderIntegrityRecord | null;
  knownIdentities: OrderIntegrityRecord[];
  startEvidence: OrderEvidenceLink | null;
  deliveryEvidence: OrderEvidenceLink | null;
}

async function getOrderAccessContext(orderId: string) {
  const identity = await requireUser();
  const supabase = createSecretServerClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, user_id, status, payment_status")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) throw new Error("Order not found.");

  const { data: assignment } = await supabase
    .from("order_booster_assignments")
    .select("booster_id")
    .eq("order_id", orderId)
    .eq("is_active", true)
    .maybeSingle();

  const isAdmin = identity.profile?.role === "admin";
  const isCustomer = order.user_id === identity.id;
  const isAssignedBooster = assignment?.booster_id === identity.id;

  if (!isAdmin && !isCustomer && !isAssignedBooster) {
    throw new Error("Order access denied.");
  }

  return {
    identity,
    order: {
      id: order.id as string,
      userId: order.user_id as string,
      status: order.status as string,
      paymentStatus: order.payment_status as string,
    },
    supabase,
    isAdmin,
    isCustomer,
    isAssignedBooster,
    canManage: isAdmin || isAssignedBooster,
  };
}

function mapIntegrity(
  row: {
    order_id: string;
    platform: string;
    player_id: string;
    internal_note: string | null;
    recorded_at: string;
    updated_at: string;
  },
  includeNote: boolean,
): OrderIntegrityRecord {
  return {
    orderId: row.order_id,
    platform: row.platform,
    playerId: row.player_id,
    internalNote: includeNote ? row.internal_note : null,
    recordedAt: row.recorded_at,
    updatedAt: row.updated_at,
  };
}

export async function getOrderOperations(
  orderId: string,
): Promise<OrderOperationsState> {
  const context = await getOrderAccessContext(orderId);
  const { supabase, order, canManage } = context;

  const [{ data: current, error: currentError }, { data: history, error: historyError }, { data: evidence, error: evidenceError }] =
    await Promise.all([
      supabase
        .from("order_integrity_records")
        .select("order_id, platform, player_id, internal_note, recorded_at, updated_at")
        .eq("order_id", orderId)
        .maybeSingle(),
      supabase
        .from("order_integrity_records")
        .select("order_id, platform, player_id, internal_note, recorded_at, updated_at")
        .eq("customer_user_id", order.userId)
        .neq("order_id", orderId)
        .order("updated_at", { ascending: false })
        .limit(8),
      supabase
        .from("order_evidence_links")
        .select("evidence_type, url, submitted_at, updated_at")
        .eq("order_id", orderId),
    ]);

  if (currentError || historyError || evidenceError) {
    console.error("Order operations load failed", {
      currentError,
      historyError,
      evidenceError,
    });
    throw new Error("Unable to load order operations.");
  }

  const evidenceRows = evidence ?? [];
  const start = evidenceRows.find((row) => row.evidence_type === "start");
  const delivery = evidenceRows.find((row) => row.evidence_type === "delivery");

  const mapEvidence = (
    row: { evidence_type: string; url: string; submitted_at: string; updated_at: string } | undefined,
  ): OrderEvidenceLink | null =>
    row
      ? {
          type: row.evidence_type as EvidenceType,
          url: row.url,
          submittedAt: row.submitted_at,
          updatedAt: row.updated_at,
        }
      : null;

  return {
    canManage,
    currentIntegrity: current
      ? mapIntegrity(current as typeof current & {
          order_id: string;
          platform: string;
          player_id: string;
          internal_note: string | null;
          recorded_at: string;
          updated_at: string;
        }, canManage)
      : null,
    knownIdentities: (history ?? []).map((row) =>
      mapIntegrity(
        row as {
          order_id: string;
          platform: string;
          player_id: string;
          internal_note: string | null;
          recorded_at: string;
          updated_at: string;
        },
        canManage,
      ),
    ),
    startEvidence: mapEvidence(start),
    deliveryEvidence: mapEvidence(delivery),
  };
}

export async function saveOrderIntegrity(
  orderId: string,
  input: { platform: string; playerId: string; internalNote?: string },
) {
  const context = await getOrderAccessContext(orderId);
  if (!context.canManage) throw new Error("Only assigned staff can validate the user.");

  if (
    context.order.status === "cancelled" ||
    context.order.status === "refunded"
  ) {
    throw new Error("This order can no longer be updated.");
  }

  const platform = input.platform.trim();
  const playerId = input.playerId.trim();
  const internalNote = input.internalNote?.trim() || null;

  if (!platform || platform.length > 80) {
    throw new Error("Platform is required.");
  }
  if (!playerId || playerId.length > 160) {
    throw new Error("Player ID is required.");
  }
  if (internalNote && internalNote.length > 500) {
    throw new Error("Internal note is too long.");
  }

  const { error } = await context.supabase
    .from("order_integrity_records")
    .upsert(
      {
        order_id: orderId,
        customer_user_id: context.order.userId,
        platform,
        player_id: playerId,
        internal_note: internalNote,
        recorded_by: context.identity.id,
        recorded_at: new Date().toISOString(),
      },
      { onConflict: "order_id" },
    );

  if (error) {
    console.error("Integrity save failed", error);
    throw new Error("Unable to save User Integrity Validation.");
  }

  return getOrderOperations(orderId);
}

function normalizeHttpsUrl(raw: string) {
  const value = raw.trim();
  if (!value || value.length > 2048) {
    throw new Error("Enter a valid screenshot URL.");
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Enter a valid screenshot URL.");
  }

  if (parsed.protocol !== "https:") {
    throw new Error("Screenshot links must use HTTPS.");
  }

  return parsed.toString();
}

export async function saveOrderEvidence(
  orderId: string,
  input: { type: EvidenceType; url: string },
) {
  const context = await getOrderAccessContext(orderId);
  if (!context.canManage) throw new Error("Only assigned staff can add order evidence.");

  if (!["start", "delivery"].includes(input.type)) {
    throw new Error("Invalid evidence type.");
  }

  if (
    context.order.status === "cancelled" ||
    context.order.status === "refunded"
  ) {
    throw new Error("This order can no longer be updated.");
  }

  if (context.order.status === "completed" && !context.isAdmin) {
    throw new Error("Completed order evidence is locked.");
  }

  const url = normalizeHttpsUrl(input.url);

  const { error } = await context.supabase
    .from("order_evidence_links")
    .upsert(
      {
        order_id: orderId,
        evidence_type: input.type,
        url,
        submitted_by: context.identity.id,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "order_id,evidence_type" },
    );

  if (error) {
    console.error("Evidence save failed", error);
    throw new Error("Unable to save screenshot link.");
  }

  return getOrderOperations(orderId);
}

export async function completeOperationalOrder(orderId: string) {
  const context = await getOrderAccessContext(orderId);
  if (!context.canManage) throw new Error("Only assigned staff can complete this order.");

  const supabase = await createAuthServerClient();
  const { error } = await supabase.rpc("complete_booster_order", {
    p_order_id: orderId,
  });

  if (error) {
    throw new Error(error.message || "Unable to complete order.");
  }

  return { completed: true };
}
