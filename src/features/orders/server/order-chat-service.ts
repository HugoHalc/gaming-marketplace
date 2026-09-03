import "server-only";
import { requireUser } from "@/features/auth/server/auth";
import { createSecretServerClient } from "@/lib/supabase/server";

export type OrderChatSenderRole = "customer" | "booster" | "admin" | "system";

export interface OrderChatMessage {
  id: string;
  orderId: string;
  senderId: string | null;
  senderRole: OrderChatSenderRole;
  senderName: string;
  senderAvatarUrl: string | null;
  body: string;
  flagged: boolean;
  messageType: "user" | "system";
  systemEventType: string | null;
  riskStatus: "clear" | "review";
  createdAt: string;
  editedAt: string | null;
}

async function getAuthorizedChatOrder(orderId: string) {
  const identity = await requireUser();
  const supabase = createSecretServerClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, user_id, status")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) throw new Error("Order not found.");

  const { data: assignment } = await supabase
    .from("order_booster_assignments")
    .select("booster_id")
    .eq("order_id", orderId)
    .eq("booster_id", identity.id)
    .eq("is_active", true)
    .maybeSingle();

  const isCustomerOwner = order.user_id === identity.id;
  const isAssignedBooster = Boolean(assignment);
  const isAdmin = identity.profile?.role === "admin";

  if (!isCustomerOwner && !isAssignedBooster && !isAdmin) {
    throw new Error("Order access denied.");
  }

  return {
    identity,
    order,
    supabase,
    isCustomerOwner,
    isAssignedBooster,
    isAdmin,
  };
}

function mapMessage(row: Record<string, unknown>): OrderChatMessage {
  const rawProfile = row.profiles as
    | {
        full_name: string | null;
        gamer_tag: string | null;
        avatar_url: string | null;
      }
    | Array<{
        full_name: string | null;
        gamer_tag: string | null;
        avatar_url: string | null;
      }>
    | null;

  const profile = Array.isArray(rawProfile) ? rawProfile[0] ?? null : rawProfile;
  const senderRole = row.sender_role as OrderChatSenderRole;

  return {
    id: row.id as string,
    orderId: row.order_id as string,
    senderId: (row.sender_id as string | null) ?? null,
    senderRole,
    senderName:
      senderRole === "system"
        ? "BoostingPedia"
        : profile?.gamer_tag ||
          profile?.full_name ||
          (senderRole === "admin" ? "BoostingPedia" : "User"),
    senderAvatarUrl: profile?.avatar_url ?? null,
    body: row.body as string,
    flagged: Boolean(row.flagged),
    messageType: (row.message_type as "user" | "system" | null) ?? "user",
    systemEventType: (row.system_event_type as string | null) ?? null,
    riskStatus: (row.risk_status as "clear" | "review" | null) ?? "clear",
    createdAt: row.created_at as string,
    editedAt: (row.edited_at as string | null) ?? null,
  };
}

export async function listChatMessages(
  orderId: string,
  options?: { before?: string | null; limit?: number },
) {
  const { supabase } = await getAuthorizedChatOrder(orderId);
  const limit = Math.min(Math.max(options?.limit ?? 60, 20), 100);

  let query = supabase
    .from("order_messages")
    .select(
      "id, order_id, sender_id, sender_role, body, flagged, message_type, system_event_type, risk_status, created_at, edited_at, profiles!order_messages_sender_id_fkey(full_name, gamer_tag, avatar_url)",
    )
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (options?.before) query = query.lt("created_at", options.before);

  const { data, error } = await query;
  if (error) throw new Error("Unable to load order messages.");

  const rows = data ?? [];
  const hasMore = rows.length > limit;

  const messages = rows
    .slice(0, limit)
    .reverse()
    .map((row) => mapMessage(row as Record<string, unknown>));

  return { messages, hasMore };
}

function normalizeForRiskDetection(input: string) {
  const ascii = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/\$/g, "s");

  return {
    raw: input.toLowerCase(),
    normalized: ascii.replace(/\s+/g, " ").trim(),
    collapsed: ascii.replace(/[^a-z0-9]/g, ""),
  };
}

function detectRiskPatterns(body: string) {
  const text = normalizeForRiskDetection(body);
  const signals = new Set<string>();

  const keywordSignals: Array<[string, string]> = [
    ["discord", "discord"],
    ["whatsapp", "whatsapp"],
    ["telegram", "telegram"],
    ["paypal", "paypal"],
    ["cashapp", "cashapp"],
    ["venmo", "venmo"],
    ["crypto", "crypto"],
    ["bitcoin", "bitcoin"],
  ];

  for (const [needle, label] of keywordSignals) {
    if (text.collapsed.includes(needle)) signals.add(label);
  }

  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(body)) {
    signals.add("external_email");
  }

  if (/(?:https?:\/\/|www\.)[^\s]+/i.test(body)) {
    signals.add("external_url");
  }

  if (
    /(?:discord\.gg|discord(?:app)?\.com\/invite)\/[a-z0-9-]+/i.test(text.raw)
  ) {
    signals.add("discord_invite");
  }

  const digits = body.replace(/\D/g, "");
  if (
    digits.length >= 8 &&
    /(?:\+?\d[\d\s().-]{6,}\d)/.test(body)
  ) {
    signals.add("phone_number");
  }

  const phraseSignals: Array<[RegExp, string]> = [
    [/\bpay\s+me\s+direct(?:ly)?\b/i, "pay_directly"],
    [/\bcheaper\s+(?:outside|off(?:\s|-)?site)\b/i, "cheaper_outside"],
    [/\bmessage\s+me\s+(?:outside|off(?:\s|-)?site)\b/i, "message_outside"],
    [/\bcontact\s+me\s+(?:outside|direct(?:ly)?)\b/i, "contact_outside"],
  ];

  for (const [pattern, label] of phraseSignals) {
    if (pattern.test(text.normalized)) signals.add(label);
  }

  return [...signals];
}

export async function sendChatMessage(orderId: string, body: string) {
  const trimmed = body.trim();

  if (!trimmed || trimmed.length > 1500) {
    throw new Error("Message must be between 1 and 1500 characters.");
  }

  const {
    identity,
    supabase,
    isCustomerOwner,
    isAssignedBooster,
    isAdmin,
  } = await getAuthorizedChatOrder(orderId);

  const senderRole: Exclude<OrderChatSenderRole, "system"> = isCustomerOwner
    ? "customer"
    : isAssignedBooster
      ? "booster"
      : isAdmin
        ? "admin"
        : "customer";

  const detectedPatterns = detectRiskPatterns(trimmed);
  const flagged = detectedPatterns.length > 0;

  const { data: message, error } = await supabase
    .from("order_messages")
    .insert({
      order_id: orderId,
      sender_id: identity.id,
      sender_role: senderRole,
      body: trimmed,
      flagged,
      detected_terms: detectedPatterns,
      detected_patterns: detectedPatterns,
      risk_status: flagged ? "review" : "clear",
      moderation_status: "unreviewed",
      message_type: "user",
    })
    .select("id")
    .single();

  if (error || !message) throw new Error("Unable to send message.");

  if (flagged) {
    await supabase.from("order_moderation_flags").insert({
      order_id: orderId,
      message_id: message.id,
      sender_id: identity.id,
      detected_terms: detectedPatterns,
    });
  }

  return { id: message.id as string, flagged };
}
