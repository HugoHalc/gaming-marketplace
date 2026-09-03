"use client";

import {
  ArrowDown,
  MessageSquare,
  Send,
  Shield,
  ShieldAlert,
} from "lucide-react";
import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  OrderBoosterAssignment,
  OrderConversationParticipant,
  OrderWorkspaceMessage,
} from "@/features/orders/server/order-workspace-repository";
import { createAuthBrowserClient } from "@/lib/supabase/browser";

interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string | null;
  senderRole: "customer" | "booster" | "admin" | "system";
  senderName: string;
  senderAvatarUrl: string | null;
  body: string;
  flagged: boolean;
  createdAt: string;
  messageType?: "user" | "system";
  systemEventType?: string | null;
  riskStatus?: "clear" | "review";
  editedAt?: string | null;
}

interface OrderLiveChatProps {
  orderId: string;
  currentUserId: string;
  initialMessages: OrderWorkspaceMessage[];
}

function normalizeInitialMessage(message: OrderWorkspaceMessage): ChatMessage {
  return {
    ...message,
    senderId: message.senderId,
    senderRole: message.senderRole,
    messageType: "user",
    systemEventType: null,
    riskStatus: message.flagged ? "review" : "clear",
    editedAt: null,
  };
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function dateKey(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function dateLabel(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (dateKey(value) === dateKey(today.toISOString())) return "Today";
  if (dateKey(value) === dateKey(yesterday.toISOString())) return "Yesterday";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function withinFiveMinutes(a: string, b: string) {
  return (
    Math.abs(new Date(a).getTime() - new Date(b).getTime()) <=
    5 * 60 * 1000
  );
}

function formatTimezone(timezone: string) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    const offset = parts.find((part) => part.type === "timeZoneName")?.value;
    return offset ? `${offset} · ${timezone.replaceAll("_", " ")}` : timezone;
  } catch {
    return timezone;
  }
}

function formatParticipantPresence(participant: OrderConversationParticipant | null) {
  if (!participant) return "Unavailable";
  if (participant.online) return "Online";
  if (!participant.lastSeenAt) return "Offline";

  const lastSeen = new Date(participant.lastSeenAt);
  const elapsedMs = Date.now() - lastSeen.getTime();
  const elapsedMinutes = Math.max(1, Math.floor(elapsedMs / 60_000));

  if (elapsedMinutes < 60) return `Last seen ${elapsedMinutes}m ago`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `Last seen ${elapsedHours}h ago`;

  return `Last seen ${new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(lastSeen)}`;
}

export function OrderLiveChat({
  orderId,
  currentUserId,
  initialMessages,
}: OrderLiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages.map(normalizeInitialMessage),
  );
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(initialMessages.length >= 60);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [chatState, setChatState] = useState<{
    loaded: boolean;
    enabled: boolean;
    booster: OrderBoosterAssignment | null;
    participant: OrderConversationParticipant | null;
  }>({
    loaded: false,
    enabled: false,
    booster: null,
    participant: null,
  });

  const scrollerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const shouldStickRef = useRef(true);
  const previousMessageCountRef = useRef(initialMessages.length);

  const markRead = useCallback(() => {
    void fetch(`/api/orders/${orderId}/messages/read`, {
      method: "POST",
    });
  }, [orderId]);

  const refreshLatest = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/messages?limit=60`, {
        cache: "no-store",
      });

      if (!response.ok) return;

      const payload = (await response.json()) as {
        messages?: ChatMessage[];
        hasMore?: boolean;
      };

      if (!Array.isArray(payload.messages)) return;

      setMessages(payload.messages);
      setHasMore(Boolean(payload.hasMore));
    } catch {
      // Preserve the current conversation on transient network failures.
    }
  }, [orderId]);

  useEffect(() => {
    let active = true;

    const loadChatState = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}/chat-state`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load conversation state.");
        }

        const payload = (await response.json()) as {
          enabled?: boolean;
          booster?: OrderBoosterAssignment | null;
          participant?: OrderConversationParticipant | null;
        };

        if (!active) return;

        setChatState({
          loaded: true,
          enabled: Boolean(payload.enabled),
          booster: payload.booster ?? null,
          participant: payload.participant ?? null,
        });
      } catch {
        if (active) {
          setChatState({
            loaded: true,
            enabled: false,
            booster: null,
            participant: null,
          });
        }
      }
    };

    void loadChatState();
    const timer = window.setInterval(() => void loadChatState(), 30_000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [orderId]);

  useEffect(() => {
    const supabase = createAuthBrowserClient();
    let fallbackTimer: number | null = null;

    const channel = supabase
      .channel(`order-chat:${orderId}:${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "order_messages",
          filter: `order_id=eq.${orderId}`,
        },
        () => {
          void refreshLatest();
        },
      )
      .subscribe((status) => {
        if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          if (fallbackTimer === null) {
            fallbackTimer = window.setInterval(() => void refreshLatest(), 30000);
          }
        }

        if (status === "SUBSCRIBED" && fallbackTimer !== null) {
          window.clearInterval(fallbackTimer);
          fallbackTimer = null;
        }
      });

    return () => {
      if (fallbackTimer !== null) {
        window.clearInterval(fallbackTimer);
      }

      void supabase.removeChannel(channel);
    };
  }, [currentUserId, orderId, refreshLatest]);

  useEffect(() => {
    const element = scrollerRef.current;
    if (!element) return;

    element.scrollTop = element.scrollHeight;
    shouldStickRef.current = true;
    markRead();
  }, [markRead]);

  useEffect(() => {
    const element = scrollerRef.current;
    if (!element) return;

    const previousCount = previousMessageCountRef.current;
    const added = Math.max(messages.length - previousCount, 0);
    previousMessageCountRef.current = messages.length;

    if (shouldStickRef.current) {
      element.scrollTo({
        top: element.scrollHeight,
        behavior: added ? "smooth" : "auto",
      });

      setNewMessageCount(0);

      if (added) {
        markRead();
      }
    } else if (added) {
      setNewMessageCount((count) => count + added);
    }
  }, [markRead, messages.length]);

  function handleScroll() {
    const element = scrollerRef.current;
    if (!element) return;

    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    const nearBottom = distanceFromBottom < 120;
    shouldStickRef.current = nearBottom;

    if (nearBottom) {
      setNewMessageCount(0);
      markRead();
    }
  }

  function jumpToLatest() {
    const element = scrollerRef.current;
    if (!element) return;

    shouldStickRef.current = true;

    element.scrollTo({
      top: element.scrollHeight,
      behavior: "smooth",
    });

    setNewMessageCount(0);
    markRead();
  }

  async function loadEarlier() {
    if (!messages.length || loadingEarlier || !hasMore) return;

    const element = scrollerRef.current;
    const previousHeight = element?.scrollHeight ?? 0;

    setLoadingEarlier(true);

    try {
      const before = encodeURIComponent(messages[0].createdAt);

      const response = await fetch(
        `/api/orders/${orderId}/messages?limit=60&before=${before}`,
        { cache: "no-store" },
      );

      const payload = (await response.json()) as {
        messages?: ChatMessage[];
        hasMore?: boolean;
      };

      if (!response.ok || !Array.isArray(payload.messages)) {
        return;
      }

      setMessages((current) => [...(payload.messages ?? []), ...current]);
      setHasMore(Boolean(payload.hasMore));

      window.requestAnimationFrame(() => {
        if (!element) return;
        element.scrollTop = element.scrollHeight - previousHeight;
      });
    } finally {
      setLoadingEarlier(false);
    }
  }

  async function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = body.trim();

    if (!message || sending || !chatState.enabled) {
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: message,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to send message.");
      }

      setBody("");
      shouldStickRef.current = true;
      await refreshLatest();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to send message.",
      );
    } finally {
      setSending(false);
    }
  }

  function handleComposerKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (coarsePointer) return;

    event.preventDefault();
    formRef.current?.requestSubmit();
  }

  const booster = chatState.booster;
  const participant = chatState.participant;
  const participantRoleLabel =
    participant?.role === "booster" ? "Booster" : "Customer";
  const participantPresence = formatParticipantPresence(participant);

  return (
    <section className="overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0B100D] shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
      <div className="pointer-events-none h-px w-full bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent" />

      <div className="flex h-[min(760px,calc(100dvh-150px))] min-h-[560px] flex-col max-sm:h-[calc(100dvh-158px)] max-sm:min-h-[520px]">
        <header className="shrink-0 border-b border-white/[0.06] bg-[linear-gradient(180deg,rgba(19,27,23,0.95),rgba(11,16,13,0.95))] px-4 py-3.5 sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {participant?.avatarUrl ? (
                <img
                  src={participant.avatarUrl}
                  alt=""
                  className="size-10 shrink-0 rounded-full border border-white/[0.08] object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-[#0E1411] text-[#667069]">
                  <MessageSquare className="size-4" />
                </span>
              )}

              <div className="min-w-0">
                <p className="font-gaming-label text-[8px] uppercase tracking-[0.13em] text-[#667069]">
                  Order communication
                </p>
                <p className="truncate text-sm font-semibold text-[#F4F7F5]">
                  {participant?.displayName ?? booster?.displayName ?? "Conversation"}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[9px] text-[#A0AAA4]">
                  {participant ? (
                    <>
                      <span>{participantRoleLabel}</span>
                      {participant.timezone ? (
                        <>
                          <span className="text-[#4B544F]">•</span>
                          <span>{formatTimezone(participant.timezone)}</span>
                        </>
                      ) : null}
                      <span className="text-[#4B544F]">•</span>
                      <span
                        className={
                          participant.online ? "text-[#82F5A4]" : "text-[#8B9590]"
                        }
                      >
                        {participantPresence}
                      </span>
                    </>
                  ) : (
                    <span>{booster ? "Assigned booster" : "Customer ↔ Booster"}</span>
                  )}
                </div>
              </div>
            </div>

            {chatState.loaded ? (
              <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-[#667069]">
                {chatState.enabled ? "Chat active" : "Awaiting booster"}
              </span>
            ) : null}
          </div>
        </header>

        {!chatState.loaded ? (
          <div className="flex flex-1 items-center justify-center bg-[#080B09] text-[10px] text-[#667069]">
            Loading conversation…
          </div>
        ) : !chatState.enabled ? (
          <div className="flex flex-1 items-center justify-center bg-[#080B09] px-6 text-center">
            <div>
              <MessageSquare className="mx-auto size-5 text-[#667069]" />
              <h3 className="mt-3 text-sm font-semibold text-[#F4F7F5]">Conversation</h3>
              <p className="mt-1.5 max-w-sm text-[11px] leading-5 text-[#A0AAA4]">
                Chat becomes available once a booster is assigned to your order.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 bg-[#080B09] p-3 sm:p-4">
              <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(6,8,7,0.98),rgba(10,12,11,1))]">
                <div
                  ref={scrollerRef}
                  onScroll={handleScroll}
                  className="relative min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4 [scrollbar-color:rgba(255,255,255,.10)_transparent] [scrollbar-width:thin]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(130,245,164,0.02),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.025),transparent_32%)]" />

                  <div className="relative z-[1]">
                    {hasMore ? (
                      <div className="mb-4 flex justify-center">
                        <button
                          type="button"
                          onClick={loadEarlier}
                          disabled={loadingEarlier}
                          className="rounded-lg border border-white/[0.07] bg-[#0E1411] px-3 py-1.5 text-[9px] font-semibold text-[#A0AAA4] transition-colors hover:border-white/[0.12] hover:text-[#F4F7F5] disabled:opacity-50"
                        >
                          {loadingEarlier ? "Loading…" : "Load earlier messages"}
                        </button>
                      </div>
                    ) : null}

                    {messages.length ? (
                      <div className="space-y-1.5">
                        {messages.map((message, index) => {
                          const previous = messages[index - 1];
                          const next = messages[index + 1];

                          const newDate =
                            !previous ||
                            dateKey(previous.createdAt) !== dateKey(message.createdAt);

                          const mine = message.senderId === currentUserId;

                          const system =
                            message.messageType === "system" ||
                            message.senderRole === "system";

                          const groupedWithPrevious =
                            Boolean(previous) &&
                            previous.senderId === message.senderId &&
                            previous.senderRole === message.senderRole &&
                            !system &&
                            withinFiveMinutes(previous.createdAt, message.createdAt) &&
                            dateKey(previous.createdAt) === dateKey(message.createdAt);

                          const groupedWithNext =
                            Boolean(next) &&
                            next.senderId === message.senderId &&
                            next.senderRole === message.senderRole &&
                            !system &&
                            withinFiveMinutes(message.createdAt, next.createdAt) &&
                            dateKey(next.createdAt) === dateKey(message.createdAt);

                          return (
                            <Fragment key={message.id}>
                              {newDate ? (
                                <div className="flex items-center gap-3 py-4">
                                  <span className="h-px flex-1 bg-white/[0.04]" />
                                  <span className="text-[8px] font-medium text-[#667069]">
                                    {dateLabel(message.createdAt)}
                                  </span>
                                  <span className="h-px flex-1 bg-white/[0.04]" />
                                </div>
                              ) : null}

                              {system ? (
                                <div className="flex justify-center py-2">
                                  <p className="flex items-center gap-1.5 rounded-full border border-white/[0.05] bg-white/[0.015] px-3 py-1.5 text-[9px] text-[#667069]">
                                    <span className="text-[#82F5A4]">✓</span>
                                    {message.body}
                                    <span>·</span>
                                    {formatTime(message.createdAt)}
                                  </p>
                                </div>
                              ) : (
                                <div
                                  className={`flex ${mine ? "justify-end" : "justify-start"} ${groupedWithPrevious ? "pt-0" : "pt-2"}`}
                                >
                                  <div
                                    className={`flex max-w-[88%] items-end gap-2 sm:max-w-[70%] ${mine ? "flex-row-reverse" : ""}`}
                                  >
                                    {!mine ? (
                                      groupedWithPrevious ? (
                                        <span className="size-8 shrink-0" />
                                      ) : message.senderAvatarUrl ? (
                                        <img
                                          src={message.senderAvatarUrl}
                                          alt=""
                                          className="size-8 shrink-0 rounded-full border border-white/[0.07] object-cover"
                                          referrerPolicy="no-referrer"
                                        />
                                      ) : (
                                        <span className="grid size-8 shrink-0 place-items-center rounded-full border border-white/[0.07] bg-[#0E1411] text-[8px] font-bold text-[#A0AAA4]">
                                          {message.senderName.slice(0, 1).toUpperCase()}
                                        </span>
                                      )
                                    ) : null}

                                    <div className={`min-w-0 ${mine ? "text-right" : ""}`}>
                                      {!mine && !groupedWithPrevious ? (
                                        <p className="mb-1 pl-1 text-[8px] font-medium text-[#667069]">
                                          {message.senderName}
                                        </p>
                                      ) : null}

                                      <div
                                        className={`rounded-[16px] border px-3.5 py-2.5 text-left text-xs leading-5 ${
                                          mine
                                            ? "border-blue-300/[0.12] bg-[#131B17] text-[#F4F7F5]"
                                            : "border-white/[0.06] bg-[#0E1411] text-[#F4F7F5]"
                                        } ${
                                          groupedWithPrevious
                                            ? mine
                                              ? "rounded-tr-md"
                                              : "rounded-tl-md"
                                            : ""
                                        } ${
                                          groupedWithNext
                                            ? mine
                                              ? "rounded-br-md"
                                              : "rounded-bl-md"
                                            : ""
                                        }`}
                                      >
                                        {message.body}
                                      </div>

                                      {!groupedWithNext ? (
                                        <div
                                          className={`mt-1 flex items-center gap-1.5 text-[8px] text-[#667069] ${mine ? "justify-end" : "justify-start"}`}
                                        >
                                          <span>{formatTime(message.createdAt)}</span>

                                          {message.flagged ? (
                                            <ShieldAlert
                                              className="size-2.5 text-amber-300/60"
                                              aria-label="Message queued for moderation review"
                                            />
                                          ) : null}
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Fragment>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex h-full min-h-[300px] items-center justify-center px-6 text-center">
                        <div>
                          <MessageSquare className="mx-auto size-5 text-[#667069]" />
                          <h3 className="mt-3 text-sm font-semibold text-[#F4F7F5]">Start the conversation</h3>
                          <p className="mt-1.5 max-w-sm text-[11px] leading-5 text-[#A0AAA4]">
                            Your booster can now message you about this order.
                          </p>
                          <p className="mt-1 text-[9px] text-[#667069]">
                            Keep all order communication here.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {newMessageCount > 0 ? (
                    <button
                      type="button"
                      onClick={jumpToLatest}
                      className="sticky bottom-2 left-1/2 z-10 mx-auto flex -translate-x-1/2 items-center rounded-full border border-white/[0.08] bg-[#131B17] px-3 py-1.5 text-[9px] font-semibold text-[#F4F7F5] shadow-lg"
                    >
                      {newMessageCount} new message{newMessageCount === 1 ? "" : "s"}
                      <ArrowDown className="ml-1.5 size-3" />
                    </button>
                  ) : null}
                </div>

                <div className="shrink-0 border-t border-white/[0.05] bg-[#0B100D] px-3 py-3 sm:px-4 sm:py-4 pb-[max(.85rem,env(safe-area-inset-bottom))]">
                  <form ref={formRef} onSubmit={submitMessage}>
                    {error ? (
                      <div className="mb-2 flex items-center justify-between gap-3 rounded-xl border border-rose-300/12 bg-rose-300/[0.045] px-3 py-2 text-[9px] text-rose-200">
                        <span>Message failed to send. {error}</span>

                        <button
                          type="button"
                          onClick={() => formRef.current?.requestSubmit()}
                          className="font-semibold text-[#F4F7F5] underline underline-offset-2"
                        >
                          Retry
                        </button>
                      </div>
                    ) : null}

                    <div className="flex items-end gap-2 rounded-[16px] border border-white/[0.08] bg-[#0E1411] px-3 py-1.5 transition-colors focus-within:border-white/[0.16]">
                      <textarea
                        value={body}
                        onChange={(event) => setBody(event.target.value)}
                        onKeyDown={handleComposerKeyDown}
                        maxLength={1500}
                        rows={1}
                        placeholder="Write a message..."
                        className="max-h-32 min-h-[42px] min-w-0 flex-1 resize-none bg-transparent py-2.5 text-xs text-[#F4F7F5] outline-none placeholder:text-[#667069]"
                      />

                      <button
                        type="submit"
                        disabled={!body.trim() || sending}
                        className="mb-1 grid size-9 shrink-0 place-items-center rounded-xl bg-[#39E56F] text-[#050807] transition-colors hover:bg-[#20C95A] disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label="Send message"
                      >
                        <Send className="size-4" strokeWidth={1.9} />
                      </button>
                    </div>
                  </form>

                  <div className="mt-2 flex flex-col gap-1 px-1 text-[8px] leading-4 text-[#667069] sm:flex-row sm:items-center sm:justify-between">
                    <span className="inline-flex items-center gap-1.5">
                      <Shield className="size-2.5" />
                      Keep communication and payments inside BoostingPedia for your protection.
                    </span>

                    <span>
                      Never send account passwords in chat. Use Secure Account Access instead.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
