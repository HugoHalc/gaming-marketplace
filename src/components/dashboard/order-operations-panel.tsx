"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ExternalLink,
  ImageIcon,
  Loader2,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

interface IntegrityRecord {
  platform: string;
  playerId: string;
  internalNote: string | null;
  recordedAt: string;
  updatedAt: string;
  orderId: string;
}

interface Evidence {
  type: "start" | "delivery";
  url: string;
  submittedAt: string;
  updatedAt: string;
}

interface OperationsState {
  canManage: boolean;
  currentIntegrity: IntegrityRecord | null;
  knownIdentities: IntegrityRecord[];
  startEvidence: Evidence | null;
  deliveryEvidence: Evidence | null;
}

function EvidenceSection({
  title,
  description,
  type,
  evidence,
  canManage,
  onSaved,
}: {
  title: string;
  description: string;
  type: "start" | "delivery";
  evidence: Evidence | null;
  canManage: boolean;
  onSaved: (type: "start" | "delivery", url: string) => Promise<void>;
}) {
  const [url, setUrl] = useState(evidence?.url ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUrl(evidence?.url ?? "");
  }, [evidence?.url]);

  async function save() {
    setSaving(true);
    try {
      await onSaved(type, url);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="p-5">
      <div className="flex items-center gap-2.5">
        <ImageIcon className="size-4 text-[#667069]" />
        <h2 className="text-sm font-semibold text-[#F4F7F5]">{title}</h2>
      </div>

      <p className="mt-2 text-[10px] leading-4 text-[#667069]">{description}</p>

      {canManage ? (
        <div className="mt-4">
          <input
            type="url"
            inputMode="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://i.imgur.com/..."
            className="h-10 w-full rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 text-[11px] text-[#F4F7F5] outline-none placeholder:text-[#667069] focus:border-[#39E56F]/35"
          />
          <button
            type="button"
            onClick={save}
            disabled={saving || !url.trim()}
            className="mt-2 inline-flex h-9 w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-[10px] font-semibold text-[#F4F7F5] hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? <Loader2 className="mr-2 size-3 animate-spin" /> : null}
            {evidence ? "Update Screenshot Link" : "Save Screenshot Link"}
          </button>
        </div>
      ) : null}

      {evidence ? (
        <a
          href={evidence.url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex items-center justify-between rounded-xl border border-[#39E56F]/10 bg-[#39E56F]/[0.025] px-3 py-2.5 text-[10px] font-medium text-[#82F5A4] hover:bg-[#39E56F]/[0.05]"
        >
          <span className="flex items-center gap-2">
            <Check className="size-3.5" />
            Screenshot recorded
          </span>
          <span className="flex items-center gap-1.5">
            View Screenshot
            <ExternalLink className="size-3" />
          </span>
        </a>
      ) : (
        <div className="mt-3 flex min-h-12 items-center justify-center rounded-xl border border-dashed border-white/[0.07] bg-[#090D0B] px-3 text-center">
          <p className="text-[9px] text-[#667069]">No screenshot link recorded yet.</p>
        </div>
      )}
    </section>
  );
}

export function OrderOperationsPanel({
  orderId,
  canManage,
  suggestedPlatform,
  orderStatus,
}: {
  orderId: string;
  canManage: boolean;
  suggestedPlatform?: string;
  orderStatus: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<OperationsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [platform, setPlatform] = useState(suggestedPlatform ?? "");
  const [playerId, setPlayerId] = useState("");
  const [note, setNote] = useState("");
  const [savingIntegrity, setSavingIntegrity] = useState(false);
  const [completing, setCompleting] = useState(false);

  async function refresh() {
    const response = await fetch(`/api/orders/${orderId}/operations`, {
      cache: "no-store",
    });
    const payload = (await response.json()) as OperationsState & { error?: string };
    if (!response.ok) throw new Error(payload.error || "Unable to load order operations.");
    setState(payload);
    return payload;
  }

  useEffect(() => {
    let active = true;
    refresh()
      .then((payload) => {
        if (!active) return;
        if (payload.currentIntegrity) {
          setPlatform(payload.currentIntegrity.platform);
          setPlayerId(payload.currentIntegrity.playerId);
          setNote(payload.currentIntegrity.internalNote ?? "");
        }
      })
      .catch((caught) => {
        if (active) setError(caught instanceof Error ? caught.message : "Unable to load order operations.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orderId]);

  async function saveIntegrity() {
    setSavingIntegrity(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}/integrity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, playerId, internalNote: note }),
      });
      const payload = (await response.json()) as OperationsState & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to save validation.");
      setState(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save validation.");
    } finally {
      setSavingIntegrity(false);
    }
  }

  async function saveEvidence(type: "start" | "delivery", url: string) {
    setError(null);
    const response = await fetch(`/api/orders/${orderId}/evidence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, url }),
    });
    const payload = (await response.json()) as OperationsState & { error?: string };
    if (!response.ok) throw new Error(payload.error || "Unable to save screenshot link.");
    setState(payload);
  }

  async function completeOrder() {
    setCompleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}/complete`, {
        method: "POST",
      });
      const payload = (await response.json()) as { completed?: boolean; error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to complete order.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to complete order.");
      setCompleting(false);
    }
  }

  const readyToComplete = useMemo(
    () =>
      Boolean(
        state?.currentIntegrity &&
          state?.startEvidence &&
          state?.deliveryEvidence,
      ),
    [state],
  );

  if (loading) {
    return (
      <div className="p-5">
        <div className="flex items-center gap-2 text-[10px] text-[#667069]">
          <Loader2 className="size-3.5 animate-spin" />
          Loading order operations…
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="p-5">
        <div className="flex items-center gap-2.5">
          <UserRoundCheck className="size-4 text-[#667069]" />
          <h2 className="text-sm font-semibold text-[#F4F7F5]">User Integrity Validation</h2>
        </div>

        <p className="mt-2 text-[10px] leading-4 text-[#667069]">
          Record the customer's in-game/platform ID so it can be recognized on future orders.
        </p>

        {canManage ? (
          <div className="mt-4 space-y-2">
            <input
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
              placeholder="Platform (Epic Games, Steam, PSN...)"
              maxLength={80}
              className="h-10 w-full rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 text-[11px] text-[#F4F7F5] outline-none placeholder:text-[#667069] focus:border-[#39E56F]/35"
            />
            <input
              value={playerId}
              onChange={(event) => setPlayerId(event.target.value)}
              placeholder="Player ID / Account ID"
              maxLength={160}
              className="h-10 w-full rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 text-[11px] text-[#F4F7F5] outline-none placeholder:text-[#667069] focus:border-[#39E56F]/35"
            />
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Internal note (optional)"
              maxLength={500}
              rows={2}
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 py-2.5 text-[11px] text-[#F4F7F5] outline-none placeholder:text-[#667069] focus:border-[#39E56F]/35"
            />
            <button
              type="button"
              onClick={saveIntegrity}
              disabled={savingIntegrity || !platform.trim() || !playerId.trim()}
              className="inline-flex h-9 w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-[10px] font-semibold text-[#F4F7F5] hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {savingIntegrity ? <Loader2 className="mr-2 size-3 animate-spin" /> : null}
              {state?.currentIntegrity ? "Update Validation" : "Save Validation"}
            </button>
          </div>
        ) : null}

        {state?.currentIntegrity ? (
          <div className="mt-3 rounded-xl border border-[#39E56F]/10 bg-[#39E56F]/[0.025] px-3 py-3">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#82F5A4]" />
              <div className="min-w-0">
                <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-[#667069]">
                  Recorded identity
                </p>
                <p className="mt-1 truncate text-xs font-semibold text-[#F4F7F5]">
                  {state.currentIntegrity.platform} — {state.currentIntegrity.playerId}
                </p>
                {canManage && state.currentIntegrity.internalNote ? (
                  <p className="mt-1.5 text-[9px] leading-4 text-[#A0AAA4]">
                    {state.currentIntegrity.internalNote}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-[9px] text-[#667069]">No identity recorded for this order.</p>
        )}

        {canManage && state?.knownIdentities.length ? (
          <div className="mt-4 border-t border-white/[0.05] pt-3">
            <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-[#667069]">
              Previously seen IDs
            </p>
            <div className="mt-2 space-y-1.5">
              {state.knownIdentities.slice(0, 4).map((identity) => (
                <button
                  key={`${identity.orderId}-${identity.platform}-${identity.playerId}`}
                  type="button"
                  onClick={() => {
                    setPlatform(identity.platform);
                    setPlayerId(identity.playerId);
                    setNote(identity.internalNote ?? "");
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/[0.025]"
                >
                  <span className="min-w-0">
                    <span className="block text-[9px] text-[#667069]">{identity.platform}</span>
                    <span className="mt-0.5 block truncate text-[10px] font-medium text-[#A0AAA4]">
                      {identity.playerId}
                    </span>
                  </span>
                  <span className="text-[9px] text-[#667069]">Use</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <div className="h-px bg-white/[0.06]" />

      <EvidenceSection
        title="Start Order Screenshot"
        description="Paste an HTTPS image link (Imgur or another image host). No file is uploaded to BoostingPedia."
        type="start"
        evidence={state?.startEvidence ?? null}
        canManage={canManage}
        onSaved={saveEvidence}
      />

      <div className="h-px bg-white/[0.06]" />

      <EvidenceSection
        title="Deliver Order Screenshot"
        description="Paste the final proof image link before completing the order."
        type="delivery"
        evidence={state?.deliveryEvidence ?? null}
        canManage={canManage}
        onSaved={saveEvidence}
      />

      {canManage ? (
        <>
          <div className="h-px bg-white/[0.06]" />
          <section className="p-5">
            <p className="font-gaming-label text-[9px] uppercase tracking-[0.12em] text-[#667069]">
              Completion Gate
            </p>
            <div className="mt-3 space-y-2 text-[10px]">
              {[
                ["User Integrity Validation", Boolean(state?.currentIntegrity)],
                ["Start Screenshot", Boolean(state?.startEvidence)],
                ["Deliver Screenshot", Boolean(state?.deliveryEvidence)],
              ].map(([label, ready]) => (
                <div key={String(label)} className="flex items-center justify-between">
                  <span className="text-[#A0AAA4]">{label}</span>
                  <span className={ready ? "text-[#82F5A4]" : "text-[#667069]"}>
                    {ready ? "Ready" : "Required"}
                  </span>
                </div>
              ))}
            </div>

            {orderStatus === "in_progress" ? (
              <button
                type="button"
                onClick={completeOrder}
                disabled={!readyToComplete || completing}
                className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#39E56F] text-[10px] font-bold text-[#050807] hover:bg-[#20C95A] disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-[#667069]"
              >
                {completing ? <Loader2 className="mr-2 size-3 animate-spin" /> : null}
                Complete Order
              </button>
            ) : orderStatus === "completed" ? (
              <div className="mt-4 flex h-10 items-center justify-center rounded-xl border border-[#39E56F]/10 bg-[#39E56F]/[0.025] text-[10px] font-semibold text-[#82F5A4]">
                Order Completed
              </div>
            ) : null}
          </section>
        </>
      ) : null}

      {error ? (
        <div className="border-t border-rose-300/10 px-5 py-3 text-[9px] leading-4 text-rose-300">
          {error}
        </div>
      ) : null}
    </>
  );
}
