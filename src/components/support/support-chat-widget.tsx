"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  senderType: "visitor" | "admin";
  body: string;
  createdAt: string;
};

type Conversation = {
  id: string;
  status: "open" | "closed";
};

export function SupportChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unread, setUnread] = useState(0);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async (markOpen = false) => {
    try {
      const response = await fetch(`/api/support/session${markOpen ? "?markRead=1" : ""}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setConversation(data.conversation ?? null);
      setMessages(data.messages ?? []);
      setUnread(markOpen ? 0 : Number(data.unreadCount ?? 0));
    } catch {
      // Keep the widget usable even if a background refresh fails.
    }
  }, []);

  useEffect(() => {
    void refresh(false);
    const id = window.setInterval(() => void refresh(open), open ? 3500 : 15000);
    return () => window.clearInterval(id);
  }, [open, refresh]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      const node = scrollRef.current;
      if (node) node.scrollTop = node.scrollHeight;
    });
  }, [messages, open]);

  if (pathname.startsWith("/admin")) return null;

  async function send(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    try {
      const response = await fetch("/api/support/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send message.");
      setDraft("");
      await refresh(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-[max(18px,env(safe-area-inset-bottom))] right-4 z-[70] sm:bottom-6 sm:right-6">
      {open ? (
        <section className="mb-3 flex h-[min(620px,calc(100dvh-110px))] w-[min(390px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-[#080C0A] shadow-[0_24px_80px_rgba(0,0,0,.48)]">
          <header className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[#39E56F]/15 bg-[#39E56F]/[0.06]">
                <img src="/brand/boostingpedia-mark.png" alt="" className="size-6 object-contain" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-[#F4F7F5]">BoostingPedia Support</p>
                <p className="mt-0.5 text-[10px] text-[#738079]">Questions before you order? We can help.</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="grid size-8 place-items-center rounded-lg text-[#738079] hover:bg-white/[0.04] hover:text-white" aria-label="Close live support">
              <X className="size-4" />
            </button>
          </header>

          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {!messages.length ? (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center px-5 text-center">
                <span className="grid size-11 place-items-center rounded-full border border-white/[0.08] bg-white/[0.025] text-[#8F9A94]"><MessageCircle className="size-5" /></span>
                <h2 className="mt-4 text-[15px] font-semibold text-[#F4F7F5]">How can we help?</h2>
                <p className="mt-2 max-w-[260px] text-[11px] leading-5 text-[#738079]">Ask us about services, delivery times, account security, pricing or anything else before purchasing.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.senderType === "visitor" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-5 ${message.senderType === "visitor" ? "rounded-br-md border border-blue-200/[0.08] bg-blue-300/[0.055] text-[#E7ECE9]" : "rounded-bl-md border border-white/[0.07] bg-white/[0.035] text-[#D6DDD9]"}`}>
                      {message.body}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <footer className="border-t border-white/[0.07] p-3">
            {conversation?.status === "closed" ? <p className="mb-2 text-[10px] text-[#738079]">This conversation was closed. Sending a new message will reopen it.</p> : null}
            <form onSubmit={send} className="flex items-end gap-2 rounded-xl border border-white/[0.08] bg-[#0B100D] p-2 focus-within:border-white/[0.15]">
              <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={1} maxLength={1500} placeholder="Write a message..." className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-1.5 py-2 text-[12px] leading-5 text-white outline-none placeholder:text-[#59645E]" />
              <button type="submit" disabled={!draft.trim() || sending} className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#39E56F] text-[#050807] transition-colors hover:bg-[#55ED82] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send support message">
                <Send className="size-4" />
              </button>
            </form>
            {error ? <p className="mt-2 text-[10px] text-rose-200">{error}</p> : null}
            <p className="mt-2 text-center text-[9px] text-[#59645E]">Keep payments and account credentials inside BoostingPedia.</p>
          </footer>
        </section>
      ) : null}

      <button type="button" onClick={() => { setOpen(true); setUnread(0); void refresh(true); }} className="relative ml-auto grid size-14 place-items-center rounded-full border border-[#39E56F]/20 bg-[#14231A] text-[#82F5A4] shadow-[0_12px_36px_rgba(0,0,0,.36)] transition-transform hover:-translate-y-px hover:bg-[#182B20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39E56F]/40" aria-label="Open live support chat">
        <MessageCircle className="size-6" strokeWidth={1.8} />
        {unread > 0 ? <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-[#39E56F] px-1 text-center text-[9px] font-bold leading-5 text-[#050807]">{unread > 9 ? "9+" : unread}</span> : null}
      </button>
    </div>
  );
}
