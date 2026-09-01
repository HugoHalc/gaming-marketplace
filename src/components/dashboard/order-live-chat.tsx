"use client";

import { Send, ShieldAlert } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { OrderWorkspaceMessage } from "@/features/orders/server/order-workspace-repository";

interface OrderLiveChatProps {
  orderId: string;
  currentUserId: string;
  initialMessages: OrderWorkspaceMessage[];
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function OrderLiveChat({
  orderId,
  currentUserId,
  initialMessages,
}: OrderLiveChatProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const refreshMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/messages`, {
        cache: "no-store",
      });
      if (!response.ok) return;
      const payload = (await response.json()) as { messages?: OrderWorkspaceMessage[] };
      if (Array.isArray(payload.messages)) {
        setMessages(payload.messages);
        void fetch(`/api/orders/${orderId}/messages/read`, { method: "POST" });
      }
    } catch {
      // Keep the current conversation visible when a polling request fails.
    }
  }, [orderId]);

  useEffect(() => {
    void fetch(`/api/orders/${orderId}/messages/read`, { method: "POST" });
    const timer = window.setInterval(refreshMessages, 3000);
    return () => window.clearInterval(timer);
  }, [orderId, refreshMessages]);

  useEffect(() => {
    const element = scrollerRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages.length]);

  async function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = body.trim();
    if (!message || sending) return;

    setSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: message }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Unable to send message.");
      }

      setBody("");
      await refreshMessages();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[1.2rem] border border-white/[0.07] bg-[#070A08]">
      <div className="flex min-h-[430px] flex-col sm:min-h-[520px] xl:min-h-[600px]">
        <div className="flex items-center justify-between border-b border-white/[0.05] px-4 py-3.5 sm:px-5">
          <div>
            <p className="text-xs font-semibold text-[#F4F7F5]">Order conversation</p>
            <p className="mt-0.5 text-[10px] text-[#667069]">
              Customer, assigned booster and BoostingPedia staff
            </p>
          </div>
          <span className="size-2 rounded-full bg-[#39E56F]" title="Chat active" />
        </div>

        <div
          ref={scrollerRef}
          className="min-h-0 flex-1 overflow-y-auto px-4 py-5 [scrollbar-color:rgba(255,255,255,.10)_transparent] [scrollbar-width:thin] sm:px-5"
        >
          {messages.length ? (
            <div className="space-y-4">
              {messages.map((message) => {
                const mine = message.senderId === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[82%] sm:max-w-[72%] ${mine ? "text-right" : ""}`}>
                      <div className="mb-1.5 flex items-center gap-2 text-[9px] text-[#667069]">
                        {!mine ? <span>{message.senderName}</span> : null}
                        <span>{formatTime(message.createdAt)}</span>
                        {message.flagged ? (
                          <ShieldAlert
                            className="size-3 text-amber-300/70"
                            aria-label="Message flagged for moderation review"
                          />
                        ) : null}
                      </div>
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-left text-xs leading-5 ${
                          mine
                            ? "rounded-br-md bg-[#131B17] text-[#F4F7F5]"
                            : "rounded-bl-md border border-white/[0.06] bg-[#0E1411] text-[#F4F7F5]"
                        }`}
                      >
                        {message.body}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-full min-h-[300px] items-center justify-center text-center">
              <div>
                <p className="text-sm font-semibold text-[#F4F7F5]">No messages yet</p>
                <p className="mt-1.5 max-w-sm text-xs leading-5 text-[#A0AAA4]">
                  Use this conversation for updates related to this order.
                </p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={submitMessage} className="border-t border-white/[0.05] bg-[#090D0B] p-3">
          {error ? <p className="mb-2 text-[10px] text-rose-300">{error}</p> : null}
          <div className="flex items-end gap-2 rounded-xl border border-white/[0.08] bg-[#050807] px-3 py-1.5">
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={1500}
              rows={1}
              placeholder="Write a message..."
              className="max-h-28 min-h-9 min-w-0 flex-1 resize-none bg-transparent py-2 text-xs text-[#F4F7F5] outline-none placeholder:text-[#667069]"
            />
            <button
              type="submit"
              disabled={!body.trim() || sending}
              className="mb-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-[#39E56F] text-[#050807] transition-colors hover:bg-[#20C95A] disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Send message"
            >
              <Send className="size-4" strokeWidth={1.9} />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
