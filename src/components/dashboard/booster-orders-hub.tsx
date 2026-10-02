"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BoosterOrderCardView } from "@/components/booster/booster-order-card";
import { boardGames, filterBoardOrders, gameLogos, mergeConfirmedClaims, type BoardBucket, type BoardOrder } from "@/features/booster/presentation/order-board";
import { canRefreshBoard, createOrderChime, OrderAlertTracker, readSeenIds } from "@/features/booster/presentation/order-alerts";

const control = "min-h-11 rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39E56F]";
const activeControl = "border-[#39E56F]/30 bg-[#39E56F]/[0.07] text-[#82F5A4]";
const bucketLabels = { available: "Available", active: "In Progress", completed: "Completed" };

export function BoosterOrdersHub({ orders, viewerId, generatedAt, initialBucket = "available", initialGame = "all", initialSearch = "", initialLayout = "grid" }: {
  orders: BoardOrder[]; viewerId: string; generatedAt: number;
  initialBucket?: BoardBucket; initialGame?: string; initialSearch?: string; initialLayout?: "grid" | "list";
}) {
  const router = useRouter();
  const [bucket, setBucket] = useState(initialBucket);
  const [game, setGame] = useState(initialGame);
  const [search, setSearch] = useState(initialSearch);
  const [layout, setLayout] = useState(initialLayout);
  const [confirmed, setConfirmed] = useState<BoardOrder[]>([]);
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [claiming, setClaiming] = useState(0);
  const [notice, setNotice] = useState<BoardOrder[] | null>(null);
  const [newIds, setNewIds] = useState<string[]>([]);
  const [preferred, setPreferred] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [claimNotice, setClaimNotice] = useState<string | null>(null);
  const [refreshing, startRefresh] = useTransition();
  const tracker = useRef<OrderAlertTracker | null>(null);
  const chime = useRef<ReturnType<typeof createOrderChime> | null>(null);
  const soundsOn = useRef(false);
  const latest = useRef(orders);
  const seenKey = `boostingpedia:order-board:seen:v1:${viewerId}`;
  const soundKey = `boostingpedia:order-board:sounds:v1:${viewerId}`;

  useEffect(() => { latest.current = orders; }, [orders]);
  useEffect(() => {
    let mounted = true;
    void Promise.resolve().then(() => {
      if (!mounted) return;
      try {
        const saved = JSON.parse(localStorage.getItem(soundKey) ?? "null");
        if (saved?.version === 1) setPreferred(saved.enabled === true);
      } catch { /* Audio remains off when browser storage is unavailable. */ }
    });
    return () => { mounted = false; void chime.current?.close().catch(() => {}); };
  }, [soundKey]);
  useEffect(() => {
    if (!tracker.current) tracker.current = new OrderAlertTracker();
    try { tracker.current.merge(readSeenIds(localStorage.getItem(seenKey))); } catch { /* Session dedupe still works. */ }
    const fresh = tracker.current.observe(orders);
    try { localStorage.setItem(seenKey, JSON.stringify({ version: 1, ids: tracker.current.ids() })); } catch { /* Private browsing may disable storage. */ }
    if (fresh.length) {
      setNotice(fresh); setNewIds((previous) => [...new Set([...previous, ...fresh.map((order) => order.id)])]);
      if (soundsOn.current) chime.current?.play();
    }
  }, [orders, seenKey]);
  useEffect(() => {
    const mergeSeen = (event: StorageEvent) => { if (event.key === seenKey) tracker.current?.merge(readSeenIds(event.newValue)); };
    window.addEventListener("storage", mergeSeen);
    return () => window.removeEventListener("storage", mergeSeen);
  }, [seenKey]);
  useEffect(() => {
    const refresh = () => {
      if (canRefreshBoard(document.visibilityState === "visible", refreshing, claiming > 0)) startRefresh(() => router.refresh());
    };
    const timer = window.setInterval(refresh, 15000);
    document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, [claiming, refreshing, router]);
  useEffect(() => {
    if (!newIds.length) return;
    const timer = window.setTimeout(() => setNewIds([]), 20000);
    return () => window.clearTimeout(timer);
  }, [newIds]);

  const merged = useMemo(() => mergeConfirmedClaims(orders, confirmed).filter((order) => order.bucket !== "available" || !unavailable.includes(order.id)), [orders, confirmed, unavailable]);
  const visible = useMemo(() => filterBoardOrders(merged, bucket, game, search), [merged, bucket, game, search]);
  const counts = { available: merged.filter((order) => order.bucket === "available").length, active: merged.filter((order) => order.bucket === "active").length, completed: merged.filter((order) => order.bucket === "completed").length };
  const onSeen = useCallback((id: string) => setNewIds((previous) => previous.filter((known) => known !== id)), []);
  const onPending = useCallback((pending: boolean) => setClaiming((count) => Math.max(0, count + (pending ? 1 : -1))), []);
  const onClaimed = useCallback((id: string, payout: number) => {
    setClaimNotice(null);
    const order = latest.current.find((entry) => entry.id === id);
    if (order) setConfirmed((previous) => [...previous.filter((entry) => entry.id !== id), { ...order, bucket: "active", payout, assignedAt: null }]);
    startRefresh(() => router.refresh());
  }, [router]);
  const onConflict = useCallback((id: string) => {
    setClaimNotice("This order is no longer available. The board is being refreshed.");
    setUnavailable((previous) => [...new Set([...previous, id])]);
    startRefresh(() => router.refresh());
  }, [router]);
  async function unlockAudio() {
    setAudioError(null);
    try {
      if (!chime.current) {
        const Audio = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Audio) throw new Error("Order sounds are unavailable in this browser.");
        chime.current = createOrderChime(new Audio());
      }
      await chime.current.unlock(); setUnlocked(true); return true;
    } catch { setAudioError("Order sounds could not be enabled. Try again after interacting with this page."); return false; }
  }
  async function enableSounds() {
    if (!await unlockAudio()) return;
    soundsOn.current = true; setPreferred(true);
    try { localStorage.setItem(soundKey, JSON.stringify({ version: 1, enabled: true })); } catch { /* Current-session preference remains usable. */ }
  }
  function muteSounds() {
    soundsOn.current = false; setPreferred(false);
    try { localStorage.setItem(soundKey, JSON.stringify({ version: 1, enabled: false })); } catch { /* Current-session preference remains usable. */ }
  }
  async function testSound() { if (await unlockAudio()) chime.current?.play(); }
  function showNewOrder() {
    const id = notice?.[0]?.id;
    setBucket("available"); setGame("all"); setSearch("");
    if (id) window.requestAnimationFrame(() => document.getElementById(`board-order-${id}`)?.focus());
  }
  const noResults = search.trim() || game !== "all";
  return <main className="mx-auto w-full max-w-[1520px] px-3 py-5 text-[#F4F7F5] sm:px-6 lg:px-8">
    <header className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-3xl font-bold tracking-tight">Orders</h1><p className="mt-1 text-xs text-[#A4AEA8]">Accept eligible work and manage your assigned orders.</p></div><Link href="/dashboard/orders?mode=customer" className={control}>Customer Orders</Link></header>
    <div className="mt-5 grid min-w-0 gap-4 xl:grid-cols-[168px_minmax(0,1fr)]">
      <aside className="min-w-0" aria-label="Filter orders by game">
        <label className="block text-xs xl:hidden">Game<select value={game} onChange={(event) => setGame(event.target.value)} className="mt-1 h-11 w-full min-w-0 rounded-lg border border-white/[0.08] bg-[#0B110E] px-3 text-sm"><option value="all">All Games</option>{boardGames.map((entry) => <option key={entry.slug} value={entry.slug}>{entry.name}</option>)}</select></label>
        <div className="hidden space-y-1 rounded-xl border border-white/[0.08] bg-[#0B110E] p-2 xl:block">
          <button type="button" aria-pressed={game === "all"} onClick={() => setGame("all")} className={`${control} w-full text-left ${game === "all" ? activeControl : "text-[#A4AEA8]"}`}>All Games</button>
          {boardGames.map((entry) => <button key={entry.slug} type="button" aria-pressed={game === entry.slug} onClick={() => setGame(entry.slug)} className={`${control} flex w-full items-center gap-2 text-left ${game === entry.slug ? activeControl : "text-[#A4AEA8]"}`}>{gameLogos[entry.slug] ? <Image src={gameLogos[entry.slug]} alt="" width={24} height={20} sizes="24px" className="h-5 w-6 shrink-0 object-contain" /> : null}{entry.name}</button>)}
        </div>
      </aside>
      <section className="min-w-0" aria-label="Booster order board">
        <div className="space-y-3 rounded-xl border border-white/[0.08] bg-[#0B110E] p-3">
          <div className="flex flex-wrap gap-2" aria-label="Order status">{(Object.keys(bucketLabels) as BoardBucket[]).map((key) => <button key={key} type="button" aria-pressed={bucket === key} onClick={() => setBucket(key)} className={`${control} ${bucket === key ? activeControl : "text-[#A4AEA8]"}`}>{bucketLabels[key]} <span className="ml-1 text-[#A4AEA8]">{counts[key]}</span></button>)}</div>
          <label className="block text-xs text-[#A4AEA8]">Search orders<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Order ID, game, service, platform or region" className="mt-1 h-11 w-full min-w-0 rounded-lg border border-white/[0.08] bg-[#050807] px-3 text-sm text-white focus-visible:outline-2 focus-visible:outline-[#39E56F]" /></label>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1" aria-label="Order layout">{(["grid", "list"] as const).map((view) => <button key={view} type="button" aria-pressed={layout === view} onClick={() => setLayout(view)} className={`${control} ${layout === view ? activeControl : "text-[#A4AEA8]"}`}>{view === "grid" ? "Grid" : "List"}</button>)}</div>
            <button type="button" aria-pressed={preferred && unlocked} onClick={preferred && unlocked ? muteSounds : enableSounds} className={control}>{preferred && unlocked ? "Order sounds: On" : "Enable order sounds"}</button>
            <button type="button" onClick={testSound} className={control}>Test sound</button>
            <button type="button" disabled={refreshing || claiming > 0} onClick={() => startRefresh(() => router.refresh())} className={control + " disabled:opacity-40"}>{refreshing ? "Refreshing…" : "Refresh"}</button>
          </div>
          <p className="text-[11px] text-[#A4AEA8]">Auto-refresh every 15 seconds while this tab is visible. Counts reflect loaded orders.</p>
          {preferred && !unlocked ? <p className="text-xs text-[#A4AEA8]">Your sound preference is saved. Activate sounds for this browser session.</p> : null}
          {audioError ? <p role="status" className="text-xs text-rose-300">{audioError}</p> : null}
        </div>
        {claimNotice ? <p role="alert" className="mt-3 rounded-lg border border-white/[0.08] bg-[#0B110E] p-3 text-xs text-[#A4AEA8]">{claimNotice}</p> : null}
        <div aria-live="polite" aria-atomic="true">{notice ? <div key={notice.map((order) => order.id).join("-")} className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#39E56F]/25 bg-[#0B110E] p-3">
          <div className="min-w-0 [overflow-wrap:anywhere]"><p className="text-sm font-semibold text-[#82F5A4]">New order available</p><p className="mt-1 break-words text-xs text-[#A4AEA8]">{notice[0].orderNumber} · {notice[0].gameName} · {notice[0].serviceName}{notice.length > 1 ? ` · ${notice.length - 1} more` : ""}</p></div><div className="flex gap-2"><button type="button" onClick={showNewOrder} className={control}>Show order</button><button type="button" onClick={() => setNotice(null)} className={control}>Dismiss</button></div>
        </div> : null}</div>
        {visible.length ? <div className={`mt-4 grid min-w-0 items-start gap-3 ${layout === "grid" ? "grid-cols-1 md:grid-cols-2 2xl:grid-cols-3" : "grid-cols-1"}`} aria-busy={refreshing}>{visible.map((order) => <BoosterOrderCardView key={order.id} order={order} now={Math.floor(generatedAt / 60000) * 60000} isNew={newIds.includes(order.id)} onSeen={onSeen} onClaimed={onClaimed} onConflict={onConflict} onPending={onPending} />)}</div> : <div className="mt-4 rounded-xl border border-white/[0.08] bg-[#0B110E] p-6 text-center"><h2 className="text-sm font-semibold">{noResults ? "No search results" : bucket === "available" ? "No available orders" : bucket === "active" ? "No in-progress orders" : "No completed orders"}</h2><p className="mt-2 text-xs text-[#A4AEA8]">{noResults ? "Try another game or search term." : bucket === "available" ? "New eligible orders will appear here." : bucket === "active" ? "Accepted orders will appear here." : "Your completed orders will appear here."}</p></div>}
      </section>
    </div>
  </main>;
}
