"use client";

import { useRef, useState } from "react";

export function ClaimOrderButton({ orderId, onClaimed, onConflict, onPending, compact = false }: {
  orderId: string;
  compact?: boolean;
  onClaimed?: (orderId: string, payout: number) => void;
  onConflict?: (orderId: string) => void;
  onPending?: (pending: boolean) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  async function accept(event: React.FormEvent<HTMLFormElement>) {
    if (!onClaimed) return; // Preserve the existing native form redirect without JavaScript.
    event.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setPending(true); setError(null); onPending?.(true);
    try {
      const response = await fetch(`/api/booster/orders/${orderId}/claim`, { method: "POST", headers: { Accept: "application/json" } });
      const payload = await response.json() as { orderId?: string; payout?: number; error?: string };
      if (!response.ok) {
        const message = payload.error || "Unable to accept this order. Please try again.";
        if (response.status === 409 && /not available|no longer available/i.test(message)) onConflict?.(orderId);
        throw new Error(message === "NEXT_REDIRECT" ? "Your booster session is unavailable. Please sign in again." : message);
      }
      if (payload.orderId !== orderId || typeof payload.payout !== "number" || !Number.isFinite(payload.payout) || payload.payout < 0) throw new Error("Unable to confirm the assignment. Refresh the board before trying again.");
      onClaimed(orderId, payload.payout);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to accept this order. Please try again."); }
    finally { lock.current = false; setPending(false); onPending?.(false); }
  }
  return <form action={`/api/booster/orders/${orderId}/claim`} method="post" onSubmit={accept} className="min-w-0">
    <button type="submit" disabled={pending} aria-describedby={error ? `claim-error-${orderId}` : undefined} className={`inline-flex min-h-11 items-center justify-center rounded-lg text-xs font-semibold text-[#050807] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39E56F] disabled:opacity-50 ${compact ? "w-auto" : "w-full bg-[#39E56F] px-3 py-2 hover:bg-[#55ED82]"}`}><span className={compact ? "inline-flex min-h-10 items-center justify-center rounded-lg bg-[#39E56F] px-3 transition-colors hover:bg-[#55ED82]" : undefined}>{pending ? "Accepting…" : "Accept Order"}</span></button>
    {error ? <p id={`claim-error-${orderId}`} role="alert" className="mt-2 break-words text-xs text-rose-300">{error}</p> : null}
  </form>;
}
