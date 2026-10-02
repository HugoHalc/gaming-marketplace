"use client";

import { Bell, BellOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function OrderSoundControl({ enabled, saved, error, onEnable, onMute, onTest }: {
  enabled: boolean; saved: boolean; error: string | null;
  onEnable: () => Promise<void>; onMute: () => void; onTest: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const label = enabled ? "Order sounds on" : muted ? "Order sounds muted" : "Enable order sounds";
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } };
    const outside = (event: PointerEvent) => { if (!panel.current?.contains(event.target as Node)) setOpen(false); };
    window.addEventListener("keydown", close); window.addEventListener("pointerdown", outside);
    return () => { window.removeEventListener("keydown", close); window.removeEventListener("pointerdown", outside); };
  }, [open]);
  return <div ref={panel} className="relative" onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <button ref={trigger} type="button" aria-label={label} title={label} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? "order-board-sound-settings" : undefined} onClick={() => setOpen((value) => !value)} className="grid size-11 place-items-center rounded-lg text-[#A4AEA8] hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-[#39E56F]">
      {enabled ? <Bell aria-hidden="true" className="size-4 text-[#82F5A4]" /> : <BellOff aria-hidden="true" className="size-4" />}
    </button>
    {open ? <div id="order-board-sound-settings" role="dialog" aria-label="Order sound settings" className="absolute left-0 top-full sm:left-auto sm:right-0 z-40 mt-1 w-56 max-w-[calc(100vw-2rem)] rounded-xl border border-white/[0.12] bg-[#101713] p-3 text-xs">
      <p className="font-semibold text-white">Order sounds</p>
      <p className="mt-1 text-[#A4AEA8]">{enabled ? "On" : muted ? "Muted" : "Off"}{saved && !enabled ? " · Activate for this browser session" : ""}</p>
      <div className="mt-2 flex gap-2"><button type="button" aria-pressed={enabled} onClick={async () => { setMuted(false); await onEnable(); }} className="min-h-11 flex-1 rounded-lg border border-white/[0.1] focus-visible:outline-2 focus-visible:outline-[#39E56F]">On</button><button type="button" aria-pressed={!enabled} onClick={() => { setMuted(true); onMute(); }} className="min-h-11 flex-1 rounded-lg border border-white/[0.1] focus-visible:outline-2 focus-visible:outline-[#39E56F]">Off</button></div>
      <button type="button" onClick={async () => { await onTest(); }} className="mt-1 min-h-11 w-full rounded-lg text-[#82F5A4] focus-visible:outline-2 focus-visible:outline-[#39E56F]">Test sound</button>
      {error ? <p role="status" className="mt-1 break-words text-rose-300">{error}</p> : null}
    </div> : null}
  </div>;
}
