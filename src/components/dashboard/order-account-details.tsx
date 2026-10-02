"use client";

import { OrderWorkspaceCard } from "@/components/dashboard/order-workspace-card";
import { useEffect, useState } from "react";
import type { OrderCredentialPayload } from "@/lib/security/order-credentials";

export function OrderAccountDetails({ orderId, canEdit, mode = "account", asCard = false, enabled = true }: {
  orderId: string; canEdit: boolean; mode?: "account" | "player" | null; asCard?: boolean; enabled?: boolean;
}) {
  const [hasCredentials, setHasCredentials] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    fetch(`/api/orders/${orderId}/credentials`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load account detail state.");
        return response.json() as Promise<{ hasCredentials?: boolean }>;
      })
      .then((payload) => { if (active) setHasCredentials(Boolean(payload.hasCredentials)); })
      .catch(() => { if (active) setMessage("Unable to load secure account details."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [orderId, enabled]);

  function hide() {
    setRevealed(false); setShowPassword(false); setAccountEmail(""); setPassword(""); setUsername("");
  }
  async function reveal() {
    setMessage(null);
    try {
      const response = await fetch(`/api/orders/${orderId}/credentials?reveal=1`, { cache: "no-store" });
      const payload = await response.json() as { credentials?: OrderCredentialPayload | null; error?: string };
      if (!response.ok || !payload.credentials) throw new Error(payload.error || "No saved account details are available.");
      const data = payload.credentials;
      if (data.kind === "player") setUsername(data.username);
      else { setAccountEmail(data.accountEmail); setPassword(data.password); }
      setShowPassword(false); setRevealed(true);
    } catch (caught) { setMessage(caught instanceof Error ? caught.message : "Unable to load secure account details."); }
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit || saving) return;
    setSaving(true); setMessage(null);
    try {
      const response = await fetch(`/api/orders/${orderId}/credentials`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "player" ? { kind: "player", username } : { accountEmail, password }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to save account details.");
      setHasCredentials(true); hide(); setMessage("Account details saved securely.");
    } catch (caught) { setMessage(caught instanceof Error ? caught.message : "Unable to save account details."); }
    finally { setSaving(false); }
  }
  const inputClass = "mt-1 h-11 w-full rounded-lg border border-white/[0.08] bg-[#090D0B] px-3 text-sm text-[#F4F7F5]";
  const controlClass = "min-h-11 rounded-lg border border-white/[0.08] px-3 text-xs font-semibold text-[#F4F7F5]";
  const messageId = `account-message-${orderId}`;
  // Historical snapshots keep access to saved details, without asking for new unnecessary credentials.
  if (mode === null && (loading || (!hasCredentials && !message))) return null;
  const content = !enabled ? <p className="text-xs">Available after payment is confirmed.</p> : <div>
    {loading ? <p className="text-xs">Loading secure details…</p> : <>
      {hasCredentials ? <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[#82F5A4]">Details saved</p>
        <button type="button" aria-expanded={revealed} aria-controls={`account-content-${orderId}`} onClick={revealed ? hide : reveal} className={controlClass}>{revealed ? "Hide" : canEdit ? "View / edit" : "View details"}</button>
      </div> : !canEdit ? <p className="text-xs">Waiting for the customer’s account details.</p> : null}
      <div id={`account-content-${orderId}`}>
        {canEdit && (!hasCredentials || revealed) ? <form onSubmit={save} className="mt-2 space-y-2">
          {mode === "player" ? <label className="block text-xs">In-game username / Player ID
            <input required maxLength={160} autoComplete="off" value={username} onChange={(event) => setUsername(event.target.value)} aria-describedby={message ? messageId : undefined} className={inputClass} />
          </label> : <>
            <label className="block text-xs">Game account email<input type="email" required maxLength={320} autoComplete="off" value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} aria-describedby={message ? messageId : undefined} className={inputClass} /></label>
            <label className="block text-xs">Password<input type={showPassword ? "text" : "password"} required maxLength={256} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} aria-describedby={message ? messageId : undefined} className={inputClass} /></label>
          </>}
          {mode === "player" ? <p className="text-xs">Your booster uses this name to add you in-game.</p> : <button type="button" aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)} className={controlClass}>{showPassword ? "Mask password" : "Show password"}</button>}
          <button type="submit" disabled={saving || (mode === "player" ? !username.trim() : !accountEmail.trim() || !password)} className="min-h-11 w-full rounded-lg bg-[#39E56F] text-xs font-semibold text-[#050807] disabled:opacity-40">{saving ? "Saving…" : hasCredentials ? "Update securely" : "Save securely"}</button>
        </form> : null}
        {!canEdit && hasCredentials && revealed ? <dl className="mt-2 space-y-2 text-xs">
          {mode === "player" ? <div><dt>In-game username / Player ID</dt><dd className="mt-1 break-words text-white">{username}</dd></div> : <>
            <div><dt>Game account email</dt><dd className="mt-1 break-all text-white">{accountEmail}</dd></div>
            <div><dt>Password</dt><dd className="mt-1 break-all text-white">{showPassword ? password : "••••••••"}</dd></div>
            <button type="button" aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)} className={controlClass}>{showPassword ? "Mask password" : "Show password"}</button>
          </>}
        </dl> : null}
      </div>
    </>}
    {message ? <p id={messageId} role="status" className="mt-2 text-xs">{message}</p> : null}
    <p className="mt-2 text-xs leading-4">Encrypted access for authorized order participants only.</p>
  </div>;
  return asCard ? <OrderWorkspaceCard title="Account Details">{content}</OrderWorkspaceCard> : content;
}
