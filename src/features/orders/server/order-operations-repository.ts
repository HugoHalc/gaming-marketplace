import "server-only";

import { createAuthServerClient } from "@/lib/supabase/auth";
import { createSecretServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/features/auth/server/auth";

export type EvidenceType = "start" | "delivery";
export type OperationalState =
  | "accepted"
  | "in_progress"
  | "waiting_customer"
  | "issue"
  | "delivered"
  | "completed";

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

export interface OperationalHistoryEvent {
  id: string;
  fromState: OperationalState | null;
  toState: OperationalState;
  note: string | null;
  createdAt: string;
}

export interface OrderOperationsState {
  canManage: boolean;
  canAdminister: boolean;
  isCustomer: boolean;
  currentIntegrity: OrderIntegrityRecord | null;
  knownIdentities: OrderIntegrityRecord[];
  startEvidence: OrderEvidenceLink | null;
  deliveryEvidence: OrderEvidenceLink | null;
  operationalState: OperationalState | null;
  operationalNote: string | null;
  deliveredAt: string | null;
  autoCompleteAt: string | null;
  operationalHistory: OperationalHistoryEvent[];
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
  const { supabase, order, canManage, isAdmin, isCustomer } = context;

  const [
    { data: current, error: currentError },
    { data: history, error: historyError },
    { data: evidence, error: evidenceError },
    { data: operational, error: operationalError },
    { data: operationalHistory, error: operationalHistoryError },
  ] = await Promise.all([
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
    supabase
      .from("order_operational_states")
      .select("state, state_note, delivered_at, auto_complete_at")
      .eq("order_id", orderId)
      .maybeSingle(),
    supabase
      .from("order_operational_history")
      .select("id, from_state, to_state, note, created_at")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true }),
  ]);

  if (
    currentError ||
    historyError ||
    evidenceError ||
    operationalError ||
    operationalHistoryError
  ) {
    console.error("Order operations load failed", {
      currentError,
      historyError,
      evidenceError,
      operationalError,
      operationalHistoryError,
    });
    throw new Error("Unable to load order operations.");
  }

  const evidenceRows = evidence ?? [];
  const start = evidenceRows.find((row) => row.evidence_type === "start");
  const delivery = evidenceRows.find((row) => row.evidence_type === "delivery");

  const mapEvidence = (
    row:
      | {
          evidence_type: string;
          url: string;
          submitted_at: string;
          updated_at: string;
        }
      | undefined,
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
    canAdminister: isAdmin,
    isCustomer,
    currentIntegrity: current
      ? mapIntegrity(
          current as {
            order_id: string;
            platform: string;
            player_id: string;
            internal_note: string | null;
            recorded_at: string;
            updated_at: string;
          },
          canManage,
        )
      : null,
    knownIdentities: canManage
      ? (history ?? []).map((row) =>
          mapIntegrity(
            row as {
              order_id: string;
              platform: string;
              player_id: string;
              internal_note: string | null;
              recorded_at: string;
              updated_at: string;
            },
            true,
          ),
        )
      : [],
    startEvidence: mapEvidence(start),
    deliveryEvidence: mapEvidence(delivery),
    operationalState: (operational?.state as OperationalState | undefined) ?? null,
    operationalNote: (operational?.state_note as string | null | undefined) ?? null,
    deliveredAt: (operational?.delivered_at as string | null | undefined) ?? null,
    autoCompleteAt:
      (operational?.auto_complete_at as string | null | undefined) ?? null,
    operationalHistory: (operationalHistory ?? []).map((event) => ({
      id: event.id as string,
      fromState: (event.from_state as OperationalState | null) ?? null,
      toState: event.to_state as OperationalState,
      note: (event.note as string | null) ?? null,
      createdAt: event.created_at as string,
    })),
  };
}

export async function saveOrderIntegrity(
  orderId: string,
  input: { platform: string; playerId: string; internalNote?: string },
) {
  const context = await getOrderAccessContext(orderId);
  if (!context.canManage) throw new Error("Only assigned staff can validate the user.");

  const platform = input.platform.trim();
  const playerId = input.playerId.trim();
  const internalNote = input.internalNote?.trim() || null;

  if (!platform || platform.length > 80) throw new Error("Platform is required.");
  if (!playerId || playerId.length > 160) throw new Error("Player ID is required.");
  if (internalNote && internalNote.length > 500) throw new Error("Internal note is too long.");

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

  if (error) throw new Error("Unable to save User Integrity Validation.");
  return getOrderOperations(orderId);
}

function normalizeHttpsUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 2048) {
    throw new Error("Enter a valid screenshot URL.");
  }

  // Screenshot hosts such as Imgur often copy links without an explicit scheme.
  // Keep evidence transport HTTPS-only while accepting that common paste format.
  const value = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Enter a valid screenshot URL.");
  }

  if (parsed.protocol !== "https:") {
    throw new Error("Screenshot links must use HTTPS.");
  }

  if (!parsed.hostname || parsed.username || parsed.password) {
    throw new Error("Enter a valid screenshot URL.");
  }

  return parsed.toString();
}

export async function saveOrderEvidence(
  orderId: string,
  input: { type: EvidenceType; url: string },
) {
  const context = await getOrderAccessContext(orderId);
  if (!context.canManage) throw new Error("Only assigned staff can add order evidence.");

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

  if (error) throw new Error("Unable to save screenshot link.");
  return getOrderOperations(orderId);
}

export async function transitionOperationalState(
  orderId: string,
  input: { nextState: OperationalState; note?: string },
) {
  await getOrderAccessContext(orderId);
  const supabase = await createAuthServerClient();

  const { error } = await supabase.rpc("transition_order_operational_state", {
    p_order_id: orderId,
    p_next_state: input.nextState,
    p_note: input.note ?? null,
  });

  if (error) throw new Error(error.message || "Unable to update order state.");
  return getOrderOperations(orderId);
}

export async function confirmDelivery(orderId: string) {
  const context = await getOrderAccessContext(orderId);
  if (!context.isCustomer) throw new Error("Only the customer can confirm delivery.");

  const supabase = await createAuthServerClient();
  const { error } = await supabase.rpc("confirm_order_delivery", {
    p_order_id: orderId,
  });

  if (error) throw new Error(error.message || "Unable to confirm delivery.");
  return { completed: true };
}

export async function reportDeliveryProblem(orderId: string, note: string) {
  const context = await getOrderAccessContext(orderId);
  if (!context.isCustomer) throw new Error("Only the customer can report a problem.");

  const supabase = await createAuthServerClient();
  const { error } = await supabase.rpc("report_delivery_problem", {
    p_order_id: orderId,
    p_note: note,
  });

  if (error) throw new Error(error.message || "Unable to report problem.");
  return getOrderOperations(orderId);
}
