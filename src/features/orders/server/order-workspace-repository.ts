import "server-only";
import { createSecretServerClient } from "@/lib/supabase/server";
import { requireAdmin, requireUser } from "@/features/auth/server/auth";
import {
  decryptOrderCredentials,
  encryptOrderCredentials,
} from "@/lib/security/order-credentials";

const MODERATION_TERMS = [
  "discord",
  "whatsapp",
  "telegram",
  "paypal",
  "cashapp",
  "cash app",
  "venmo",
  "skrill",
  "wechat",
  "signal",
  "instagram",
  "facebook",
  "snapchat",
] as const;

export interface OrderWorkspaceMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderRole: "customer" | "booster" | "admin";
  senderName: string;
  senderAvatarUrl: string | null;
  body: string;
  flagged: boolean;
  createdAt: string;
}

export interface OrderBoosterAssignment {
  boosterId: string;
  displayName: string;
  avatarUrl: string | null;
  assignedAt: string;
}

export interface OrderConversationParticipant {
  userId: string;
  role: "customer" | "booster";
  displayName: string;
  avatarUrl: string | null;
  timezone: string | null;
  lastSeenAt: string | null;
  online: boolean;
}

export interface OrderConversationState {
  enabled: boolean;
  viewerRole: "customer" | "booster" | "admin";
  participant: OrderConversationParticipant | null;
  booster: OrderBoosterAssignment | null;
}

async function getAuthorizedOrder(orderId: string) {
  const identity = await requireUser();
  const supabase = createSecretServerClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, user_id")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) {
    throw new Error("Order not found.");
  }

  const { data: assignment } = await supabase
    .from("order_booster_assignments")
    .select("order_id")
    .eq("order_id", orderId)
    .eq("booster_id", identity.id)
    .eq("is_active", true)
    .maybeSingle();

  const isAssignedBooster = Boolean(assignment);

  if (
    order.user_id === identity.id ||
    identity.profile?.role === "admin" ||
    isAssignedBooster
  ) {
    return { identity, order, supabase, isAssignedBooster };
  }

  throw new Error("Order access denied.");
}

export async function getOrderBoosterAssignment(
  orderId: string,
): Promise<OrderBoosterAssignment | null> {
  const { supabase } = await getAuthorizedOrder(orderId);

  const { data, error } = await supabase
    .from("order_booster_assignments")
    .select(
      "booster_id, assigned_at, profiles!order_booster_assignments_booster_id_fkey(full_name, gamer_tag, avatar_url)",
    )
    .eq("order_id", orderId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error("Unable to load booster assignment.");
  if (!data) return null;

  const rawProfile = data.profiles as
    | { full_name: string | null; gamer_tag: string | null; avatar_url: string | null }
    | Array<{ full_name: string | null; gamer_tag: string | null; avatar_url: string | null }>
    | null;
  const profile = Array.isArray(rawProfile) ? rawProfile[0] ?? null : rawProfile;

  return {
    boosterId: data.booster_id as string,
    displayName: profile?.gamer_tag || profile?.full_name || "Assigned booster",
    avatarUrl: profile?.avatar_url ?? null,
    assignedAt: data.assigned_at as string,
  };
}


export async function getOrderConversationState(
  orderId: string,
): Promise<OrderConversationState> {
  const { identity, order, supabase, isAssignedBooster } =
    await getAuthorizedOrder(orderId);

  const { data: assignment, error: assignmentError } = await supabase
    .from("order_booster_assignments")
    .select(
      "booster_id, assigned_at, profiles!order_booster_assignments_booster_id_fkey(full_name, gamer_tag, avatar_url)",
    )
    .eq("order_id", orderId)
    .eq("is_active", true)
    .maybeSingle();

  if (assignmentError) {
    throw new Error("Unable to load conversation state.");
  }

  const rawBoosterProfile = assignment?.profiles as
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
    | null
    | undefined;
  const boosterProfile = Array.isArray(rawBoosterProfile)
    ? rawBoosterProfile[0] ?? null
    : rawBoosterProfile ?? null;

  const booster: OrderBoosterAssignment | null = assignment
    ? {
        boosterId: assignment.booster_id as string,
        displayName:
          boosterProfile?.gamer_tag ||
          boosterProfile?.full_name ||
          "Assigned booster",
        avatarUrl: boosterProfile?.avatar_url ?? null,
        assignedAt: assignment.assigned_at as string,
      }
    : null;

  const viewerRole = isAssignedBooster
    ? "booster"
    : identity.profile?.role === "admin"
      ? "admin"
      : "customer";

  if (!assignment) {
    return { enabled: false, viewerRole, participant: null, booster: null };
  }

  if (isAssignedBooster) {
    const { data: customerProfile, error: customerError } = await supabase
      .from("profiles")
      .select("id, full_name, gamer_tag, avatar_url")
      .eq("id", order.user_id)
      .maybeSingle();

    if (customerError || !customerProfile) {
      throw new Error("Unable to load customer profile.");
    }

    const presence = await getUserPresenceMetadata(supabase, order.user_id as string);

    return {
      enabled: true,
      viewerRole,
      booster,
      participant: buildConversationParticipant({
        userId: customerProfile.id as string,
        role: "customer",
        displayName:
          (customerProfile.full_name as string | null) ||
          (customerProfile.gamer_tag as string | null) ||
          "Customer",
        avatarUrl: customerProfile.avatar_url as string | null,
        ...presence,
      }),
    };
  }

  const boosterId = assignment.booster_id as string;
  const presence = await getUserPresenceMetadata(supabase, boosterId);

  return {
    enabled: true,
    viewerRole,
    booster,
    participant: buildConversationParticipant({
      userId: boosterId,
      role: "booster",
      displayName:
        boosterProfile?.gamer_tag ||
        boosterProfile?.full_name ||
        "Assigned booster",
      avatarUrl: boosterProfile?.avatar_url ?? null,
      ...presence,
    }),
  };
}

async function getUserPresenceMetadata(
  supabase: ReturnType<typeof createSecretServerClient>,
  userId: string,
) {
  const { data, error } = await supabase.auth.admin.getUserById(userId);

  if (error || !data.user) {
    return { timezone: null, lastSeenAt: null };
  }

  const metadata = data.user.user_metadata ?? {};
  return {
    timezone:
      typeof metadata.boostingpedia_timezone === "string"
        ? metadata.boostingpedia_timezone
        : null,
    lastSeenAt:
      typeof metadata.boostingpedia_last_seen_at === "string"
        ? metadata.boostingpedia_last_seen_at
        : null,
  };
}

function buildConversationParticipant(input: {
  userId: string;
  role: "customer" | "booster";
  displayName: string;
  avatarUrl: string | null;
  timezone: string | null;
  lastSeenAt: string | null;
}): OrderConversationParticipant {
  const lastSeenMs = input.lastSeenAt
    ? new Date(input.lastSeenAt).getTime()
    : Number.NaN;
  const online =
    Number.isFinite(lastSeenMs) && Date.now() - lastSeenMs <= 75_000;

  return { ...input, online };
}

function detectModerationTerms(body: string) {
  const normalized = body.toLowerCase();
  return MODERATION_TERMS.filter((term) => normalized.includes(term));
}

export async function listOrderMessages(orderId: string): Promise<OrderWorkspaceMessage[]> {
  const { supabase } = await getAuthorizedOrder(orderId);

  const { data, error } = await supabase
    .from("order_messages")
    .select(
      "id, order_id, sender_id, sender_role, body, flagged, created_at, profiles!order_messages_sender_id_fkey(full_name, gamer_tag, avatar_url)",
    )
    .eq("order_id", orderId)
    .order("created_at", { ascending: true })
    .limit(250);

  if (error) throw new Error("Unable to load order messages.");

  return (data ?? []).map((row) => {
    const rawProfile = row.profiles as
      | { full_name: string | null; gamer_tag: string | null; avatar_url: string | null }
      | Array<{ full_name: string | null; gamer_tag: string | null; avatar_url: string | null }>
      | null;
    const profile = Array.isArray(rawProfile) ? rawProfile[0] ?? null : rawProfile;

    return {
      id: row.id as string,
      orderId: row.order_id as string,
      senderId: row.sender_id as string,
      senderRole: row.sender_role as OrderWorkspaceMessage["senderRole"],
      senderName:
        profile?.gamer_tag ||
        profile?.full_name ||
        (row.sender_role === "admin" ? "BoostingPedia" : "User"),
      senderAvatarUrl: profile?.avatar_url ?? null,
      body: row.body as string,
      flagged: Boolean(row.flagged),
      createdAt: row.created_at as string,
    };
  });
}

export async function sendOrderMessage(orderId: string, body: string) {
  const trimmed = body.trim();
  if (!trimmed || trimmed.length > 1500) {
    throw new Error("Message must be between 1 and 1500 characters.");
  }

  const { identity, supabase, isAssignedBooster } =
    await getAuthorizedOrder(orderId);
  const role = identity.profile?.role ?? "customer";
  const senderRole = isAssignedBooster
    ? "booster"
    : role === "admin"
      ? "admin"
      : role === "booster"
        ? "booster"
        : "customer";
  const detectedTerms = detectModerationTerms(trimmed);

  const { data: message, error } = await supabase
    .from("order_messages")
    .insert({
      order_id: orderId,
      sender_id: identity.id,
      sender_role: senderRole,
      body: trimmed,
      flagged: detectedTerms.length > 0,
      detected_terms: detectedTerms,
    })
    .select("id")
    .single();

  if (error || !message) throw new Error("Unable to send message.");

  if (detectedTerms.length > 0) {
    await supabase.from("order_moderation_flags").insert({
      order_id: orderId,
      message_id: message.id,
      sender_id: identity.id,
      detected_terms: detectedTerms,
    });
  }

  return { id: message.id as string, flagged: detectedTerms.length > 0 };
}

export async function markOrderMessagesRead(orderId: string) {
  const { identity, supabase } = await getAuthorizedOrder(orderId);

  const { error } = await supabase.from("order_message_reads").upsert(
    {
      order_id: orderId,
      user_id: identity.id,
      last_read_at: new Date().toISOString(),
    },
    { onConflict: "order_id,user_id" },
  );

  if (error) throw new Error("Unable to update message read state.");
}

export async function getOrderUnreadMessageCount(orderId: string) {
  const { identity, supabase } = await getAuthorizedOrder(orderId);

  const { data: readState } = await supabase
    .from("order_message_reads")
    .select("last_read_at")
    .eq("order_id", orderId)
    .eq("user_id", identity.id)
    .maybeSingle();

  let query = supabase
    .from("order_messages")
    .select("id", { count: "exact", head: true })
    .eq("order_id", orderId)
    .neq("sender_id", identity.id);

  if (readState?.last_read_at) {
    query = query.gt("created_at", readState.last_read_at);
  }

  const { count, error } = await query;
  if (error) throw new Error("Unable to load unread message count.");
  return count ?? 0;
}

export async function saveOrderCredentials(
  orderId: string,
  input: { accountEmail: string; password: string },
) {
  const accountEmail = input.accountEmail.trim();
  const password = input.password;

  if (!accountEmail || accountEmail.length > 320) {
    throw new Error("Enter a valid account email.");
  }
  if (!password || password.length > 256) {
    throw new Error("Enter a valid password.");
  }

  const { identity, order, supabase } = await getAuthorizedOrder(orderId);
  if (order.user_id !== identity.id) {
    throw new Error("Only the customer who owns this order can update credentials.");
  }

  const encrypted = encryptOrderCredentials({ accountEmail, password });

  const { error } = await supabase.from("order_credentials").upsert(
    {
      order_id: orderId,
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      auth_tag: encrypted.authTag,
      encryption_version: encrypted.encryptionVersion,
      updated_by: identity.id,
    },
    { onConflict: "order_id" },
  );

  if (error) throw new Error("Unable to save secure account details.");

  return { saved: true };
}

export async function getOrderCredentialState(orderId: string) {
  const { supabase } = await getAuthorizedOrder(orderId);

  const { data, error } = await supabase
    .from("order_credentials")
    .select("updated_at")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) throw new Error("Unable to load credential state.");

  return {
    hasCredentials: Boolean(data),
    updatedAt: (data?.updated_at as string | undefined) ?? null,
  };
}

export async function revealOrderCredentials(orderId: string) {
  const { supabase } = await getAuthorizedOrder(orderId);

  const { data, error } = await supabase
    .from("order_credentials")
    .select("ciphertext, iv, auth_tag, encryption_version")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) throw new Error("Unable to load secure account details.");
  if (!data) return null;

  return decryptOrderCredentials({
    ciphertext: data.ciphertext as string,
    iv: data.iv as string,
    authTag: data.auth_tag as string,
    encryptionVersion: data.encryption_version as number,
  });
}

export async function assignBoosterToOrder(orderId: string, boosterId: string) {
  const admin = await requireAdmin();
  const supabase = createSecretServerClient();

  const { data: booster, error: boosterError } = await supabase
    .from("booster_profiles")
    .select("user_id, is_active, payout_rate_bps")
    .eq("user_id", boosterId)
    .eq("is_active", true)
    .maybeSingle();

  if (boosterError || !booster) {
    throw new Error("An active booster profile is required.");
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, total_cents")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) throw new Error("Order not found.");

  const payoutRateBps = booster.payout_rate_bps as number;
  const payoutCents = Math.floor(
    (order.total_cents as number) * payoutRateBps / 10000,
  );

  const { error } = await supabase.from("order_booster_assignments").upsert(
    {
      order_id: orderId,
      booster_id: boosterId,
      assigned_by: admin.id,
      assigned_at: new Date().toISOString(),
      is_active: true,
      payout_rate_bps: payoutRateBps,
      payout_cents: payoutCents,
    },
    { onConflict: "order_id" },
  );

  if (error) throw new Error("Unable to assign booster.");
  return { assigned: true };
}
