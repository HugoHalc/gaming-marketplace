import "server-only";

import { createHash, randomBytes } from "crypto";
import { createSecretServerClient } from "@/lib/supabase/server";

export const SUPPORT_COOKIE_NAME = "bp_support_session";
export const SUPPORT_MAX_MESSAGE_LENGTH = 1500;
export const SUPPORT_MESSAGE_PAGE_SIZE = 50;
export type SupportConversationStatus = "open" | "closed";
export type SupportSenderType = "visitor" | "admin";

export interface SupportMessageRecord { id: string; conversationId: string; senderType: SupportSenderType; senderUserId: string | null; body: string; createdAt: string }
export interface SupportConversationRecord { id: string; customerId: string | null; visitorName: string | null; visitorEmail: string | null; status: SupportConversationStatus; lastMessageAt: string; createdAt: string; updatedAt: string; customerLastReadAt: string | null }
type DbConversation = { id: string; customer_id: string | null; visitor_name: string | null; visitor_email: string | null; status: SupportConversationStatus; last_message_at: string; created_at: string; updated_at: string; customer_last_read_at: string | null };
type DbMessage = { id: string; conversation_id: string; sender_type: SupportSenderType; sender_user_id: string | null; body: string; created_at: string };
const CONVERSATION_COLUMNS = "id, customer_id, visitor_name, visitor_email, status, last_message_at, created_at, updated_at, customer_last_read_at";
const MESSAGE_COLUMNS = "id, conversation_id, sender_type, sender_user_id, body, created_at";

export function createSupportSessionToken() { return randomBytes(32).toString("hex"); }
export function hashSupportSessionToken(token: string) { return createHash("sha256").update(token).digest("hex"); }
export function isValidSupportClientMessageId(value: unknown): value is string { return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); }
function mapConversation(row: DbConversation): SupportConversationRecord { return { id: row.id, customerId: row.customer_id, visitorName: row.visitor_name, visitorEmail: row.visitor_email, status: row.status, lastMessageAt: row.last_message_at, createdAt: row.created_at, updatedAt: row.updated_at, customerLastReadAt: row.customer_last_read_at }; }
function mapMessage(row: DbMessage): SupportMessageRecord { return { id: row.id, conversationId: row.conversation_id, senderType: row.sender_type, senderUserId: row.sender_user_id, body: row.body, createdAt: row.created_at }; }

export async function findSupportConversationByToken(token: string) {
  const { data, error } = await createSecretServerClient().from("support_conversations").select(CONVERSATION_COLUMNS).eq("visitor_token_hash", hashSupportSessionToken(token)).maybeSingle();
  if (error) throw new Error("Unable to load support conversation.");
  return data ? mapConversation(data as DbConversation) : null;
}

export async function createSupportConversation(input: { token: string; customerId?: string | null; visitorName?: string | null; visitorEmail?: string | null }) {
  const now = new Date().toISOString();
  const { data, error } = await createSecretServerClient().from("support_conversations").insert({ visitor_token_hash: hashSupportSessionToken(input.token), customer_id: input.customerId ?? null, visitor_name: input.visitorName ?? null, visitor_email: input.visitorEmail ?? null, status: "open", last_message_at: now, updated_at: now }).select(CONVERSATION_COLUMNS).single();
  if (error || !data) throw new Error("Unable to start support conversation.");
  return mapConversation(data as DbConversation);
}

export async function attachSupportConversationIdentity(conversationId: string, input: { customerId?: string | null; visitorName?: string | null; visitorEmail?: string | null }) {
  const updates: Record<string, string> = {};
  if (input.customerId) updates.customer_id = input.customerId;
  if (input.visitorName) updates.visitor_name = input.visitorName;
  if (input.visitorEmail) updates.visitor_email = input.visitorEmail;
  if (!Object.keys(updates).length) return;
  updates.updated_at = new Date().toISOString();
  const { error } = await createSecretServerClient().from("support_conversations").update(updates).eq("id", conversationId);
  if (error) throw new Error("Unable to update support conversation.");
}

export async function listSupportMessages(conversationId: string, options: { beforeId?: string | null; limit?: number } = {}) {
  const supabase = createSecretServerClient();
  const limit = Math.min(Math.max(options.limit ?? SUPPORT_MESSAGE_PAGE_SIZE, 1), 100);
  let anchor: { id: string; created_at: string } | null = null;
  if (options.beforeId) {
    const result = await supabase.from("support_messages").select("id, created_at").eq("conversation_id", conversationId).eq("id", options.beforeId).maybeSingle();
    if (result.error || !result.data) throw new Error("Invalid support history cursor.");
    anchor = result.data as { id: string; created_at: string };
  }
  let query = supabase.from("support_messages").select(MESSAGE_COLUMNS).eq("conversation_id", conversationId).order("created_at", { ascending: false }).order("id", { ascending: false }).limit(limit + 1);
  if (anchor) query = query.or(`created_at.lt.${anchor.created_at},and(created_at.eq.${anchor.created_at},id.lt.${anchor.id})`);
  const { data, error } = await query;
  if (error) throw new Error("Unable to load support messages.");
  const rows = (data ?? []) as DbMessage[];
  const hasMore = rows.length > limit;
  const messages = rows.slice(0, limit).reverse().map(mapMessage);
  return { messages, hasMore, nextCursor: hasMore ? messages[0]?.id ?? null : null };
}

export async function createSupportMessage(input: { conversationId: string; senderType: SupportSenderType; senderUserId?: string | null; body: string; clientMessageId: string }) {
  const body = input.body.trim();
  if (!body || body.length > SUPPORT_MAX_MESSAGE_LENGTH) throw new Error("Message must be between 1 and 1500 characters.");
  const supabase = createSecretServerClient();
  const prior = await supabase.from("support_messages").select(MESSAGE_COLUMNS).eq("conversation_id", input.conversationId).eq("sender_type", input.senderType).eq("client_message_id", input.clientMessageId).maybeSingle();
  if (prior.error) throw new Error("Unable to validate the support message request.");
  if (prior.data) {
    if (prior.data.body !== body) throw new Error("Unable to safely retry support message.");
    const now = new Date().toISOString();
    const refreshed = await supabase.from("support_conversations").update({ ...(input.senderType === "visitor" ? { status: "open" as const } : {}), last_message_at: prior.data.created_at, updated_at: now }).eq("id", input.conversationId);
    if (refreshed.error) throw new Error("Message was saved, but the conversation could not be refreshed.");
    return mapMessage(prior.data as DbMessage);
  }
  if (input.senderType === "visitor") {
    const since = new Date(Date.now() - 60_000).toISOString();
    const check = await supabase.from("support_messages").select("id", { count: "exact", head: true }).eq("conversation_id", input.conversationId).eq("sender_type", "visitor").gte("created_at", since);
    if (check.error) throw new Error("Unable to validate support message.");
    if ((check.count ?? 0) >= 12) throw new Error("Too many messages. Please wait a moment.");
  }
  const inserted = await supabase.from("support_messages").insert({ conversation_id: input.conversationId, sender_type: input.senderType, sender_user_id: input.senderUserId ?? null, body, client_message_id: input.clientMessageId }).select(MESSAGE_COLUMNS).single();
  let message = inserted.data as DbMessage | null;
  if (inserted.error?.code === "23505") {
    const existing = await supabase.from("support_messages").select(MESSAGE_COLUMNS).eq("conversation_id", input.conversationId).eq("sender_type", input.senderType).eq("client_message_id", input.clientMessageId).maybeSingle();
    if (existing.error || !existing.data || existing.data.body !== body) throw new Error("Unable to safely retry support message.");
    message = existing.data as DbMessage;
  } else if (inserted.error || !message) throw new Error("Unable to send support message.");

  const now = new Date().toISOString();
  const update = await supabase.from("support_conversations").update({ ...(input.senderType === "visitor" ? { status: "open" as const } : {}), last_message_at: message.created_at ?? now, updated_at: now }).eq("id", input.conversationId);
  if (update.error) throw new Error("Message was saved, but the conversation could not be refreshed.");
  return mapMessage(message);
}

export async function markAdminSupportConversationRead(adminUserId: string, conversationId: string, messageId: string) {
  const { error } = await createSecretServerClient().rpc("mark_support_admin_read", { p_admin_user_id: adminUserId, p_conversation_id: conversationId, p_message_id: messageId });
  if (error) throw new Error("Unable to mark support messages as read.");
}
export async function markCustomerSupportConversationRead(conversationId: string, messageId: string) {
  const { error } = await createSecretServerClient().rpc("mark_support_customer_read", { p_conversation_id: conversationId, p_message_id: messageId });
  if (error) throw new Error("Unable to mark support messages as read.");
}

type AdminQueueRow = DbConversation & { latest_message_body: string | null; latest_message_sender_type: SupportSenderType | null; latest_message_created_at: string | null; unread_count: number | string };
export async function listAdminSupportConversations(adminUserId: string, status?: SupportConversationStatus) {
  const { data, error } = await createSecretServerClient().rpc("list_support_admin_queue", { p_admin_user_id: adminUserId, p_status: status ?? null });
  if (error) throw new Error("Unable to load support conversations.");
  return ((data ?? []) as AdminQueueRow[]).map((row) => ({ ...mapConversation(row), latestMessage: row.latest_message_created_at ? { body: row.latest_message_body ?? "", senderType: row.latest_message_sender_type ?? "visitor", createdAt: row.latest_message_created_at } : null, unreadCount: Number(row.unread_count ?? 0) }));
}

export async function listAdminSupportAlerts(adminUserId: string, limit = 100) {
  const supabase = createSecretServerClient();
  const [countResult, listResult] = await Promise.all([
    supabase.from("support_admin_alerts").select("id", { count: "exact", head: true }).eq("admin_user_id", adminUserId).is("read_at", null),
    supabase.from("support_admin_alerts").select("id, conversation_id, message_id, created_at, support_messages!inner(body), support_conversations!inner(visitor_name, visitor_email)").eq("admin_user_id", adminUserId).is("read_at", null).order("created_at", { ascending: false }).limit(Math.min(Math.max(limit, 1), 200)),
  ]);
  if (countResult.error || listResult.error) throw new Error("Unable to load support alerts.");
  type AlertRow = { id: string; conversation_id: string; message_id: string; created_at: string; support_messages: { body: string } | { body: string }[]; support_conversations: { visitor_name: string | null; visitor_email: string | null } | { visitor_name: string | null; visitor_email: string | null }[] };
  return { unreadCount: countResult.count ?? 0, alerts: ((listResult.data ?? []) as unknown as AlertRow[]).map((row) => { const message = Array.isArray(row.support_messages) ? row.support_messages[0] : row.support_messages; const conversation = Array.isArray(row.support_conversations) ? row.support_conversations[0] : row.support_conversations; return { id: row.id, conversationId: row.conversation_id, messageId: row.message_id, body: message?.body ?? "New support message", visitorLabel: conversation?.visitor_name || conversation?.visitor_email || "Website visitor", createdAt: row.created_at }; }) };
}

export async function getAdminSupportConversation(conversationId: string) {
  const { data, error } = await createSecretServerClient().from("support_conversations").select(CONVERSATION_COLUMNS).eq("id", conversationId).maybeSingle();
  if (error) throw new Error("Unable to load support conversation.");
  return data ? mapConversation(data as DbConversation) : null;
}
export async function setSupportConversationStatus(conversationId: string, status: SupportConversationStatus) {
  const { error } = await createSecretServerClient().from("support_conversations").update({ status, updated_at: new Date().toISOString() }).eq("id", conversationId);
  if (error) throw new Error("Unable to update support conversation.");
}
