"use client";

import { Check, MessageCircle, RotateCcw, Send } from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

type ConversationSummary = {
  id: string;
  visitorName: string | null;
  visitorEmail: string | null;
  customerId: string | null;
  status: "open" | "closed";
  lastMessageAt: string;
  unreadCount: number;
  latestMessage: { body: string; senderType: "visitor" | "admin"; createdAt: string } | null;
};
type Message = { id: string; senderType: "visitor" | "admin"; body: string; createdAt: string };
type Detail = ConversationSummary & { createdAt: string };

function shortTime(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export function AdminSupportConsole() {
  const [filter, setFilter] = useState<"open" | "closed">("open");
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadList = useCallback(async () => {
    const response = await fetch(`/api/admin/support/conversations?status=${filter}`, { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    setConversations(data.conversations ?? []);
    setSelectedId((current) => current && (data.conversations ?? []).some((item: ConversationSummary) => item.id === current) ? current : (data.conversations?.[0]?.id ?? null));
  }, [filter]);

  const loadDetail = useCallback(async (id: string) => {
    const response = await fetch(`/api/admin/support/conversations/${id}`, { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    setDetail(data.conversation);
    setMessages(data.messages ?? []);
  }, []);

  useEffect(() => { void loadList(); const timer = window.setInterval(() => void loadList(), 4000); return () => window.clearInterval(timer); }, [loadList]);
  useEffect(() => { if (!selectedId) { setDetail(null); setMessages([]); return; } void loadDetail(selectedId); const timer = window.setInterval(() => void loadDetail(selectedId), 3000); return () => window.clearInterval(timer); }, [selectedId, loadDetail]);
  useEffect(() => { requestAnimationFrame(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }); }, [messages]);

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!selectedId || !draft.trim() || sending) return;
    setSending(true);
    const body = draft.trim();
    setDraft("");
    const response = await fetch(`/api/admin/support/conversations/${selectedId}/messages`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ body }) });
    if (!response.ok) setDraft(body);
    await Promise.all([loadDetail(selectedId), loadList()]);
    setSending(false);
  }

  async function toggleStatus() {
    if (!selectedId || !detail) return;
    const status = detail.status === "open" ? "closed" : "open";
    await fetch(`/api/admin/support/conversations/${selectedId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
    setFilter(status === "closed" ? "open" : "closed");
    setSelectedId(null);
    await loadList();
  }

  return (
    <div className="grid min-h-[680px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080C0A] lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="border-b border-white/[0.07] lg:border-b-0 lg:border-r">
        <div className="border-b border-white/[0.07] p-3">
          <div className="flex rounded-lg border border-white/[0.07] bg-white/[0.02] p-1">
            {(["open", "closed"] as const).map((value) => <button key={value} type="button" onClick={() => { setFilter(value); setSelectedId(null); }} className={`h-8 flex-1 rounded-md text-[11px] font-semibold capitalize ${filter === value ? "bg-white/[0.07] text-white" : "text-[#75807A] hover:text-white"}`}>{value}</button>)}
          </div>
        </div>
        <div className="max-h-[620px] overflow-y-auto">
          {conversations.map((conversation) => (
            <button key={conversation.id} type="button" onClick={() => setSelectedId(conversation.id)} className={`block w-full border-b border-white/[0.05] px-4 py-4 text-left transition-colors ${selectedId === conversation.id ? "bg-white/[0.045]" : "hover:bg-white/[0.02]"}`}>
              <div className="flex items-center justify-between gap-3"><p className="truncate text-[12px] font-semibold text-white">{conversation.visitorName || conversation.visitorEmail || "Website visitor"}</p>{conversation.unreadCount > 0 ? <span className="min-w-5 rounded-full bg-[#39E56F] px-1 text-center text-[9px] font-bold leading-5 text-[#050807]">{conversation.unreadCount}</span> : null}</div>
              <p className="mt-1.5 line-clamp-2 text-[11px] leading-4 text-[#75807A]">{conversation.latestMessage?.body || "No messages yet"}</p>
              <p className="mt-2 text-[9px] text-[#59645E]">{shortTime(conversation.lastMessageAt)}</p>
            </button>
          ))}
          {!conversations.length ? <div className="px-6 py-16 text-center"><MessageCircle className="mx-auto size-5 text-[#59645E]"/><p className="mt-3 text-[11px] text-[#75807A]">No {filter} conversations.</p></div> : null}
        </div>
      </aside>

      <section className="flex min-h-[680px] min-w-0 flex-col">
        {detail ? <>
          <header className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-4">
            <div className="min-w-0"><p className="truncate text-[14px] font-semibold text-white">{detail.visitorName || "Website visitor"}</p><p className="mt-1 truncate text-[10px] text-[#75807A]">{detail.visitorEmail || (detail.customerId ? "Signed-in customer" : "Anonymous visitor")}</p></div>
            <button type="button" onClick={toggleStatus} className="inline-flex h-9 items-center rounded-lg border border-white/[0.08] px-3 text-[10px] font-semibold text-[#AAB5AF] hover:bg-white/[0.04] hover:text-white">{detail.status === "open" ? <><Check className="mr-1.5 size-3.5"/>Close conversation</> : <><RotateCcw className="mr-1.5 size-3.5"/>Reopen</>}</button>
          </header>
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            <div className="space-y-3">{messages.map((message) => <div key={message.id} className={`flex ${message.senderType === "admin" ? "justify-end" : "justify-start"}`}><div className={`max-w-[72%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-5 ${message.senderType === "admin" ? "rounded-br-md border border-[#39E56F]/10 bg-[#39E56F]/[0.055] text-[#E7ECE9]" : "rounded-bl-md border border-white/[0.07] bg-white/[0.035] text-[#D6DDD9]"}`}>{message.body}<p className="mt-1.5 text-[8px] text-[#59645E]">{shortTime(message.createdAt)}</p></div></div>)}</div>
          </div>
          <form onSubmit={send} className="border-t border-white/[0.07] p-4"><div className="flex items-end gap-2 rounded-xl border border-white/[0.08] bg-[#0B100D] p-2 focus-within:border-white/[0.15]"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={1} maxLength={1500} placeholder="Reply as BoostingPedia Support..." className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-1.5 py-2 text-[12px] text-white outline-none placeholder:text-[#59645E]"/><button type="submit" disabled={!draft.trim() || sending} className="grid size-9 place-items-center rounded-lg bg-[#39E56F] text-[#050807] disabled:opacity-40"><Send className="size-4"/></button></div></form>
        </> : <div className="grid flex-1 place-items-center px-6 text-center"><div><MessageCircle className="mx-auto size-6 text-[#59645E]"/><h2 className="mt-4 text-[15px] font-semibold text-white">Select a conversation</h2><p className="mt-2 text-[11px] text-[#75807A]">Open a customer question from the support queue.</p></div></div>}
      </section>
    </div>
  );
}
