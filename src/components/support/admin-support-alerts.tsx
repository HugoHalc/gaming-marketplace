"use client";

import Link from "next/link";
import { Bell, BellOff, Headphones, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createAuthBrowserClient } from "@/lib/supabase/browser";
import { AdminSupportAlert, SupportAlertTracker, createSupportChime, readSeenSupportAlertIds, supportConversationHref } from "@/features/support/client/admin-support-alerts";

const SOUND_KEY = "bp_admin_support_sound_v1";
const SEEN_PREFIX = "bp_admin_support_seen_v1:";
export const SUPPORT_ALERT_EVENT = "boostingpedia:support-alert";
export const SUPPORT_ALERT_REFRESH_EVENT = "boostingpedia:support-alert-refresh";

export function AdminSupportAlerts() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [supabase] = useState(() => createAuthBrowserClient());
  const [adminId, setAdminId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notice, setNotice] = useState<{ count: number; latest: AdminSupportAlert } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(() => typeof window !== "undefined" && localStorage.getItem(SOUND_KEY) === "on");
  const trackerRef = useRef(new SupportAlertTracker());
  const chimeRef = useRef<ReturnType<typeof createSupportChime> | null>(null);
  const reconcileTimerRef = useRef<number | null>(null);
  const currentAdminRef = useRef<string | null>(null);
  const activeConversation = pathname === "/admin/support" ? searchParams.get("conversation") : null;

  const clearAdminState = useCallback(() => {
    currentAdminRef.current = null; trackerRef.current.reset(); setAdminId(null); setUnreadCount(0); setNotice(null);
  }, []);

  const identifyAdmin = useCallback(async () => {
    const claims = await supabase.auth.getClaims();
    const userId = typeof claims.data?.claims?.sub === "string" ? claims.data.claims.sub : null;
    if (!userId) { clearAdminState(); return null; }
    const profile = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
    if (profile.error || profile.data?.role !== "admin") { clearAdminState(); return null; }
    if (currentAdminRef.current !== userId) trackerRef.current.reset();
    currentAdminRef.current = userId;
    setAdminId(userId); return userId;
  }, [clearAdminState, supabase]);

  const reconcile = useCallback(async (userId: string) => {
    try {
      const response = await fetch("/api/admin/support/alerts", { cache: "no-store" });
      if (response.status === 403) { clearAdminState(); return; }
      if (!response.ok) return;
      const data = await response.json() as { unreadCount?: number; alerts?: AdminSupportAlert[] };
      const alerts = Array.isArray(data.alerts) ? data.alerts : [];
      const fresh = trackerRef.current.observe(alerts);
      setUnreadCount(Number(data.unreadCount ?? 0));
      localStorage.setItem(`${SEEN_PREFIX}${userId}`, JSON.stringify({ version: 1, ids: trackerRef.current.ids() }));
      if (!fresh.length) return;
      const visibleConversation = document.visibilityState === "visible" && document.hasFocus() ? activeConversation : null;
      const notify = fresh.filter((alert) => alert.conversationId !== visibleConversation);
      for (const alert of fresh) window.dispatchEvent(new CustomEvent(SUPPORT_ALERT_EVENT, { detail: alert }));
      if (!notify.length) return;
      setNotice((current) => ({ count: (current?.count ?? 0) + notify.length, latest: notify[0] }));
      if (soundEnabled) chimeRef.current?.play();
    } catch { /* Realtime and the site remain usable if reconciliation fails. */ }
  }, [activeConversation, clearAdminState, soundEnabled]);

  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let roleTimer = 0;
    const stopChannel = () => { if (channel) { void supabase.removeChannel(channel); channel = null; } };
    const start = async () => {
      stopChannel();
      if (roleTimer) { window.clearInterval(roleTimer); roleTimer = 0; }
      const userId = await identifyAdmin();
      if (cancelled || !userId) return;
      trackerRef.current.seed(readSeenSupportAlertIds(localStorage.getItem(`${SEEN_PREFIX}${userId}`)));
      await reconcile(userId);
      if (cancelled) return;
      channel = supabase.channel(`support-admin-alerts:${userId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "support_admin_alerts", filter: `admin_user_id=eq.${userId}` }, () => {
        if (reconcileTimerRef.current) window.clearTimeout(reconcileTimerRef.current);
        reconcileTimerRef.current = window.setTimeout(() => void reconcile(userId), 180);
      }).subscribe((status) => { if (status === "SUBSCRIBED") void reconcile(userId); });
      roleTimer = window.setInterval(() => void identifyAdmin().then((userId) => { if (!userId) stopChannel(); }), 60_000);
    };
    void start();
    const auth = supabase.auth.onAuthStateChange(() => window.setTimeout(() => { if (!cancelled) void start(); }, 0));
    const onVisible = () => { if (document.visibilityState === "visible") void identifyAdmin().then((userId) => { if (userId) return reconcile(userId); }); };
    const onStorage = (event: StorageEvent) => { if (event.key?.startsWith(SEEN_PREFIX)) trackerRef.current.seed(readSeenSupportAlertIds(event.newValue)); };
    const onRefresh = () => void identifyAdmin().then((userId) => { if (userId) return reconcile(userId); });
    document.addEventListener("visibilitychange", onVisible); window.addEventListener("storage", onStorage); window.addEventListener(SUPPORT_ALERT_REFRESH_EVENT, onRefresh);
    return () => { cancelled = true; auth.data.subscription.unsubscribe(); stopChannel(); if (roleTimer) window.clearInterval(roleTimer); if (reconcileTimerRef.current) window.clearTimeout(reconcileTimerRef.current); document.removeEventListener("visibilitychange", onVisible); window.removeEventListener("storage", onStorage); window.removeEventListener(SUPPORT_ALERT_REFRESH_EVENT, onRefresh); };
  }, [identifyAdmin, reconcile, supabase]);

  useEffect(() => () => { void chimeRef.current?.close(); }, []);
  if (!adminId) return null;

  async function toggleSound() {
    if (soundEnabled) { setSoundEnabled(false); localStorage.setItem(SOUND_KEY, "off"); return; }
    const AudioCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    chimeRef.current ??= createSupportChime(new AudioCtor()); await chimeRef.current.unlock(); setSoundEnabled(true); localStorage.setItem(SOUND_KEY, "on");
  }

  return <aside className="fixed right-3 top-[4.5rem] z-[90] flex max-w-[calc(100vw-24px)] flex-col items-end gap-2 sm:right-5" aria-label="Admin support alerts">
    {notice ? <div role="status" aria-live="polite" className="w-[min(360px,calc(100vw-24px))] rounded-xl border border-[#39E56F]/20 bg-[#0B100D]/[0.98] p-4 text-white backdrop-blur-xl">
      <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#39E56F]/10 text-[#82F5A4]"><Headphones className="size-4" /></span><div className="min-w-0 flex-1"><p className="text-xs font-semibold">{notice.count === 1 ? "New support message" : `${notice.count} new support messages`}</p><p className="mt-1 truncate text-[11px] text-[#A0AAA4]">{notice.latest.visitorLabel}</p><p className="mt-1 line-clamp-2 break-words text-[11px] leading-4 text-[#75807A]">{notice.latest.body}</p></div><button type="button" onClick={() => setNotice(null)} aria-label="Dismiss support alert" className="grid size-8 place-items-center rounded-lg text-[#75807A] hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39E56F]/40"><X className="size-4" /></button></div>
      <Link href={supportConversationHref(notice.latest.conversationId)} onClick={() => setNotice(null)} className="mt-3 inline-flex min-h-9 items-center rounded-lg bg-[#39E56F] px-3 text-[11px] font-bold text-[#050807] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82F5A4]">Open conversation</Link>
    </div> : null}
    <div className="flex items-center overflow-hidden rounded-full border border-white/10 bg-[#0B100D]/95 text-[11px] text-white backdrop-blur-xl"><Link href="/admin/support" className="inline-flex min-h-10 items-center gap-2 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#39E56F]/40"><Bell className="size-3.5 text-[#82F5A4]"/><span>Support</span><span className="min-w-5 rounded-full bg-[#39E56F] px-1 text-center text-[9px] font-bold leading-5 text-[#050807]">{unreadCount > 99 ? "99+" : unreadCount}</span></Link><button type="button" onClick={() => void toggleSound()} aria-label={soundEnabled ? "Mute support alert sound" : "Enable support alert sound"} aria-pressed={soundEnabled} className="grid min-h-10 w-10 place-items-center border-l border-white/10 text-[#A0AAA4] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#39E56F]/40">{soundEnabled ? <Bell className="size-3.5"/> : <BellOff className="size-3.5"/>}</button></div>
  </aside>;
}
