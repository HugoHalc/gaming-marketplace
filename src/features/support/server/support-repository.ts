import "server-only";

import { createHash, randomBytes } from "crypto";
import { createSecretServerClient } from "@/lib/supabase/server";

export const SUPPORT_COOKIE_NAME = "bp_support_session";
export const SUPPORT_MAX_MESSAGE_LENGTH = 1500;

export type SupportConversationStatus = "open" | "closed";
export type SupportSenderType = "visitor" | "admin";

export interface SupportMessageRecord {
  id: string;
  conversationId: string;
  senderType: SupportSenderType;
  senderUserId: string | null;
  body: string;
  createdAt: string;
}

export interface SupportConversationRecord {
  id: string;
  customerId: string | null;
  visitorName: string | null;
  visitorEmail: string | null;
  status: SupportConversationStatus;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  adminLastReadAt: string | null;
  customerLastReadAt: string | null;
}

type DbConversation = {
  id: string;
  customer_id: string | null;
  visitor_name: string | null;
  visitor_email: string | null;
  status: SupportConversationStatus;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  admin_last_read_at: string | null;
  customer_last_read_at: string | null;
};

type DbMessage = {
  id: string;
  conversation_id: string;
  sender_type: SupportSenderType;
  sender_user_id: string | null;
  body: string;
  created_at: string;
};

export function createSupportSessionToken() {
  return randomBytes(32).toString("hex");
}

export function hashSupportSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function mapConversation(row: DbConversation): SupportConversationRecord {
  return {
    id: row.id,
    customerId: row.customer_id,
    visitorName: row.visitor_name,
    visitorEmail: row.visitor_email,
    status: row.status,
    lastMessageAt: row.last_message_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    adminLastReadAt: row.admin_last_read_at,
    customerLastReadAt: row.customer_last_read_at,
  };
}

function mapMessage(row: DbMessage): SupportMessageRecord {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderType: row.sender_type,
    senderUserId: row.sender_user_id,
    body: row.body,
    createdAt: row.created_at,
  };
}

export async function findSupportConversationByToken(token: string) {
  const supabase = createSecretServerClient();
  const tokenHash = hashSupportSessionToken(token);
  const { data, error } = await supabase
    .from("support_conversations")
    .select("id, customer_id, visitor_name, visitor_email, status, last_message_at, created_at, updated_at, admin_last_read_at, customer_last_read_at")
    .eq("visitor_token_hash", tokenHash)
    .maybeSingle();

  if (error) throw new Error("Unable to load support conversation.");
  return data ? mapConversation(data as DbConversation) : null;
}

export async function createSupportConversation(input: {
  token: string;
  customerId?: string | null;
  visitorName?: string | null;
  visitorEmail?: string | null;
}) {
  const supabase = createSecretServerClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("support_conversations")
    .insert({
      visitor_token_hash: hashSupportSessionToken(input.token),
      customer_id: input.customerId ?? null,
      visitor_name: input.visitorName ?? null,
      visitor_email: input.visitorEmail ?? null,
      status: "open",
      last_message_at: now,
      updated_at: now,
    })
    .select("id, customer_id, visitor_name, visitor_email, status, last_message_at, created_at, updated_at, admin_last_read_at, customer_last_read_at")
    .single();

  if (error || !data) throw new Error("Unable to start support conversation.");
  return mapConversation(data as DbConversation);
}

export async function attachSupportConversationIdentity(
  conversationId: string,
  input: { customerId?: string | null; visitorName?: string | null; visitorEmail?: string | null },
) {
  const updates: Record<string, string | null> = {};
  if (input.customerId) updates.customer_id = input.customerId;
  if (input.visitorName) updates.visitor_name = input.visitorName;
  if (input.visitorEmail) updates.visitor_email = input.visitorEmail;
  if (!Object.keys(updates).length) return;

  updates.updated_at = new Date().toISOString();
  const supabase = createSecretServerClient();
  await supabase.from("support_conversations").update(updates).eq("id", conversationId);
}

export async function listSupportMessages(conversationId: string) {
  const supabase = createSecretServerClient();
  const { data, error } = await supabase
    .from("support_messages")
    .select("id, conversation_id, sender_type, sender_user_id, body, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(300);

  if (error) throw new Error("Unable to load support messages.");
  return ((data ?? []) as DbMessage[]).map(mapMessage);
}

export async function createSupportMessage(input: {
  conversationId: string;
  senderType: SupportSenderType;
  senderUserId?: string | null;
  body: string;
}) {
  const body = input.body.trim();
  if (!body || body.length > SUPPORT_MAX_MESSAGE_LENGTH) {
    throw new Error("Message must be between 1 and 1500 characters.");
  }

  const supabase = createSecretServerClient();
  const since = new Date(Date.now() - 60_000).toISOString();
  if (input.senderType === "visitor") {
    const { count } = await supabase
      .from("support_messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", input.conversationId)
      .eq("sender_type", "visitor")
      .gte("created_at", since);
    if ((count ?? 0) >= 12) throw new Error("Too many messages. Please wait a moment.");
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("support_messages")
    .insert({
      conversation_id: input.conversationId,
      sender_type: input.senderType,
      sender_user_id: input.senderUserId ?? null,
      body,
    })
    .select("id, conversation_id, sender_type, sender_user_id, body, created_at")
    .single();

  if (error || !data) throw new Error("Unable to send support message.");

  const conversationUpdate = {
    ...(input.senderType === "visitor" ? { status: "open" as const } : {}),
    ...(input.senderType === "admin" ? { admin_last_read_at: now } : {}),
    last_message_at: now,
    updated_at: now,
  };

  await supabase
    .from("support_conversations")
    .update(conversationUpdate)
    .eq("id", input.conversationId);

  return mapMessage(data as DbMessage);
}

export async function markSupportConversationRead(conversationId: string, reader: "visitor" | "admin") {
  const supabase = createSecretServerClient();
  const now = new Date().toISOString();
  await supabase
    .from("support_conversations")
    .update(reader === "admin" ? { admin_last_read_at: now } : { customer_last_read_at: now })
    .eq("id", conversationId);
}

export async function listAdminSupportConversations(status?: SupportConversationStatus) {
  const supabase = createSecretServerClient();
  let query = supabase
    .from("support_conversations")
    .select("id, customer_id, visitor_name, visitor_email, status, last_message_at, created_at, updated_at, admin_last_read_at, customer_last_read_at")
    .order("last_message_at", { ascending: false })
    .limit(100);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new Error("Unable to load support conversations.");

  const conversations = ((data ?? []) as DbConversation[]).map(mapConversation);
  const ids = conversations.map((item) => item.id);
  if (!ids.length) return [];

  const { data: messages } = await supabase
    .from("support_messages")
    .select("conversation_id, body, sender_type, created_at")
    .in("conversation_id", ids)
    .order("created_at", { ascending: false });

  const latest = new Map<string, { body: string; senderType: SupportSenderType; createdAt: string }>();
  const unread = new Map<string, number>();
  for (const row of messages ?? []) {
    const conversationId = row.conversation_id as string;
    if (!latest.has(conversationId)) {
      latest.set(conversationId, {
        body: row.body as string,
        senderType: row.sender_type as SupportSenderType,
        createdAt: row.created_at as string,
      });
    }
    const conversation = conversations.find((item) => item.id === conversationId);
    if (
      conversation &&
      row.sender_type === "visitor" &&
      (!conversation.adminLastReadAt || new Date(row.created_at as string) > new Date(conversation.adminLastReadAt))
    ) {
      unread.set(conversationId, (unread.get(conversationId) ?? 0) + 1);
    }
  }

  return conversations.map((conversation) => ({
    ...conversation,
    latestMessage: latest.get(conversation.id) ?? null,
    unreadCount: unread.get(conversation.id) ?? 0,
  }));
}

export async function getAdminSupportConversation(conversationId: string) {
  const supabase = createSecretServerClient();
  const { data, error } = await supabase
    .from("support_conversations")
    .select("id, customer_id, visitor_name, visitor_email, status, last_message_at, created_at, updated_at, admin_last_read_at, customer_last_read_at")
    .eq("id", conversationId)
    .maybeSingle();
  if (error) throw new Error("Unable to load support conversation.");
  if (!data) return null;
  return mapConversation(data as DbConversation);
}

export async function setSupportConversationStatus(conversationId: string, status: SupportConversationStatus) {
  const supabase = createSecretServerClient();
  const { error } = await supabase
    .from("support_conversations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", conversationId);
  if (error) throw new Error("Unable to update support conversation.");
}
