"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  Clock3,
  ExternalLink,
  ImageIcon,
  Loader2,
  Play,
  RotateCcw,
  Send,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

type OperationalState =
  | "accepted"
  | "in_progress"
  | "waiting_customer"
  | "issue"
  | "delivered"
  | "completed";

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
interface HistoryEvent {
  id: string;
  fromState: OperationalState | null;
  toState: OperationalState;
  note: string | null;
  createdAt: string;
}
interface OperationsState {
  canManage: boolean;
  canAdminister: boolean;
  isCustomer: boolean;
  currentIntegrity: IntegrityRecord | null;
  knownIdentities: IntegrityRecord[];
  startEvidence: Evidence | null;
  deliveryEvidence: Evidence | null;
  operationalState: OperationalState | null;
  operationalNote: string | null;
  deliveredAt: string | null;
  autoCompleteAt: string | null;
  operationalHistory: HistoryEvent[];
}

const stateLabels: Record<OperationalState, string> = {
  accepted: "Accepted",
  in_progress: "In Progress",
  waiting_customer: "Waiting for Customer",
  issue: "Issue Reported",
  delivered: "Delivered",
  completed: "Completed",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

type CustomerLifecycleStageStatus = "completed" | "current" | "upcoming";

interface CustomerLifecycleStage {
  key:
    | "accepted"
    | "integrity"
    | "start_evidence"
    | "in_progress"
    | "delivery_evidence"
    | "customer_confirmation"
    | "completed";
  title: string;
  description: string;
  timestamp: string | null;
  status: CustomerLifecycleStageStatus;
}

function getFirstHistoryEvent(
  history: HistoryEvent[],
  toState: OperationalState,
) {
  return history.find((event) => event.toState === toState) ?? null;
}

function getLastHistoryEvent(
  history: HistoryEvent[],
  toState: OperationalState,
) {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index]?.toState === toState) return history[index];
  }
  return null;
}

function getOperationalStatusPresentation(state: OperationsState) {
  const operational = state.operationalState;

  if (!operational) {
    return {
      title: "Waiting for Booster",
      description: "Waiting for an eligible booster to accept the order.",
    };
  }

  if (operational === "issue") {
    return {
      title: "Issue Reported",
      description: "An operational issue is being reviewed before the order continues.",
    };
  }

  if (operational === "completed") {
    return {
      title: "Completed",
      description: "The order has reached its finalized operational state.",
    };
  }

  if (operational === "delivered") {
    return {
      title: "Awaiting Customer Confirmation",
      description: "The delivered order is ready for customer review.",
    };
  }

  if (!state.currentIntegrity) {
    return {
      title: "Validation Required",
      description: "Customer integrity validation must be recorded before delivery.",
    };
  }

  if (!state.startEvidence) {
    return {
      title: "Awaiting Start Evidence",
      description: "Initial order evidence has not been submitted yet.",
    };
  }

  if (operational === "accepted") {
    return {
      title: "Ready to Start",
      description: "Required pre-service records are ready and work can begin.",
    };
  }

  if (operational === "waiting_customer") {
    return {
      title: "Customer Action Required",
      description: "The booster is waiting for customer input before continuing.",
    };
  }

  if (operational === "in_progress" && !state.deliveryEvidence) {
    return {
      title: "In Progress",
      description: "The booster is actively fulfilling the service.",
    };
  }

  if (operational === "in_progress" && state.deliveryEvidence) {
    return {
      title: "Awaiting Delivery Handoff",
      description: "Completion evidence is recorded and the order is awaiting delivery.",
    };
  }

  return {
    title: stateLabels[operational],
    description: "Current operational state for this order.",
  };
}

function buildCustomerLifecycleStages(
  state: OperationsState,
): CustomerLifecycleStage[] {
  const acceptedEvent = getFirstHistoryEvent(
    state.operationalHistory,
    "accepted",
  );
  const inProgressEvent = getFirstHistoryEvent(
    state.operationalHistory,
    "in_progress",
  );
  const completedEvent = getLastHistoryEvent(
    state.operationalHistory,
    "completed",
  );

  const completionNote = completedEvent?.note?.toLowerCase() ?? "";
  const customerConfirmed = completionNote.includes("customer confirmed delivery");
  const autoCompleted = completionNote.includes("automatically completed");

  const confirmationCompletedCopy = customerConfirmed
    ? "Customer confirmed delivery."
    : autoCompleted
      ? "Review window completed automatically."
      : "Customer review stage resolved by the existing completion flow.";

  const rawStages = [
    {
      key: "accepted" as const,
      title: "Accepted",
      done: Boolean(acceptedEvent),
      timestamp: acceptedEvent?.createdAt ?? null,
      completedCopy: "Your booster accepted the order.",
      currentCopy: "Waiting for a booster to accept the order.",
      pendingCopy: "Waiting for booster acceptance.",
    },
    {
      key: "integrity" as const,
      title: "User Integrity Validation",
      done: Boolean(state.currentIntegrity),
      timestamp: state.currentIntegrity?.recordedAt ?? null,
      completedCopy: "Customer validation completed.",
      currentCopy: "Customer validation in progress.",
      pendingCopy: "Waiting for customer validation.",
    },
    {
      key: "start_evidence" as const,
      title: "Order Started Evidence",
      done: Boolean(state.startEvidence),
      timestamp: state.startEvidence?.submittedAt ?? null,
      completedCopy: "Initial order evidence submitted.",
      currentCopy: "Waiting for initial evidence.",
      pendingCopy: "Waiting for initial evidence.",
    },
    {
      key: "in_progress" as const,
      title: "In Progress",
      done: Boolean(inProgressEvent),
      timestamp: inProgressEvent?.createdAt ?? null,
      completedCopy: "Service fulfillment started.",
      currentCopy:
        state.operationalState === "waiting_customer"
          ? "Service is paused while customer input is required."
          : state.operationalState === "issue"
            ? "An issue is being resolved before work continues."
            : "Your booster is actively fulfilling the service.",
      pendingCopy: "Waiting for service fulfillment to begin.",
    },
    {
      key: "delivery_evidence" as const,
      title: "Order Delivered Evidence",
      done: Boolean(state.deliveryEvidence),
      timestamp: state.deliveryEvidence?.submittedAt ?? null,
      completedCopy: "Completion evidence submitted.",
      currentCopy: "Waiting for delivery evidence.",
      pendingCopy: "Waiting for delivery evidence.",
    },
    {
      key: "customer_confirmation" as const,
      title: "Customer Confirmation",
      done:
        state.operationalState === "completed" &&
        Boolean(completedEvent),
      timestamp: completedEvent?.createdAt ?? null,
      completedCopy: confirmationCompletedCopy,
      currentCopy:
        state.operationalState === "delivered"
          ? "Please review the delivered order."
          : state.operationalState === "issue"
            ? "A delivery issue is under review."
            : "Waiting for customer approval.",
      pendingCopy: "Waiting for customer approval.",
    },
    {
      key: "completed" as const,
      title: "Completed",
      done:
        state.operationalState === "completed" &&
        Boolean(completedEvent),
      timestamp: completedEvent?.createdAt ?? null,
      completedCopy: "Order successfully completed.",
      currentCopy: "Finalizing order completion.",
      pendingCopy: "Pending final completion.",
    },
  ];

  let progressionOpen = true;

  return rawStages.map((stage) => {
    if (progressionOpen && stage.done) {
      return {
        key: stage.key,
        title: stage.title,
        description: stage.completedCopy,
        timestamp: stage.timestamp,
        status: "completed" as const,
      };
    }

    if (progressionOpen) {
      progressionOpen = false;
      return {
        key: stage.key,
        title: stage.title,
        description: stage.currentCopy,
        timestamp: stage.timestamp,
        status: "current" as const,
      };
    }

    return {
      key: stage.key,
      title: stage.title,
      description: stage.pendingCopy,
      timestamp: null,
      status: "upcoming" as const,
    };
  });
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

  useEffect(() => setUrl(evidence?.url ?? ""), [evidence?.url]);

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
            type="text"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://imgur.com/... or i.imgur.com/..."
            className="h-10 w-full rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 text-[11px] text-[#F4F7F5] outline-none placeholder:text-[#667069] focus:border-[#39E56F]/35"
          />
          <button
            type="button"
            onClick={save}
            disabled={saving || !url.trim()}
            className="mt-2 inline-flex h-9 w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-[10px] font-semibold text-[#F4F7F5] hover:bg-white/[0.05] disabled:opacity-40"
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
          className="mt-3 flex items-center justify-between rounded-xl border border-[#39E56F]/10 bg-[#39E56F]/[0.025] px-3 py-2.5 text-[10px] font-medium text-[#82F5A4]"
        >
          <span className="flex items-center gap-2">
            <Check className="size-3.5" />
            Screenshot recorded
          </span>
          <span className="flex items-center gap-1.5">
            View Screenshot <ExternalLink className="size-3" />
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
  const [issueNote, setIssueNote] = useState("");
  const [customerProblem, setCustomerProblem] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const response = await fetch(`/api/orders/${orderId}/operations`, { cache: "no-store" });
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
      .catch((caught) => active && setError(caught instanceof Error ? caught.message : "Unable to load order operations."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [orderId]);

  async function saveIntegrity() {
    setBusy(true); setError(null);
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
    } finally { setBusy(false); }
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

  async function lifecycle(body: Record<string, unknown>) {
    setBusy(true); setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}/lifecycle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as OperationsState & { completed?: boolean; error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to update order.");
      if (payload.completed) {
        await refresh();
        router.refresh();
      } else {
        setState(payload);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update order.");
    } finally { setBusy(false); }
  }

  const readyToDeliver = useMemo(
    () => Boolean(state?.currentIntegrity && state?.startEvidence && state?.deliveryEvidence),
    [state],
  );

  if (loading) {
    return <div className="p-5 text-[10px] text-[#667069]"><Loader2 className="mr-2 inline size-3.5 animate-spin" />Loading order operations…</div>;
  }

  const operational = state?.operationalState;
  const effectiveCanManage = state?.canManage ?? canManage;
  const operationalStatus = state
    ? getOperationalStatusPresentation(state)
    : null;
  const customerLifecycle = state
    ? buildCustomerLifecycleStages(state)
    : [];

  return (
    <>
      <section className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-gaming-label text-[9px] uppercase tracking-[0.12em] text-[#667069]">
              Operational Status
            </p>
            <p className="mt-1 text-sm font-semibold text-[#F4F7F5]">
              {operationalStatus?.title ?? "Not initialized"}
            </p>
            {operationalStatus?.description ? (
              <p className="mt-1 text-[10px] leading-4 text-[#667069]">
                {operationalStatus.description}
              </p>
            ) : null}
          </div>
          {operational === "delivered" && state?.autoCompleteAt ? (
            <div className="shrink-0 text-right">
              <p className="text-[9px] text-[#667069]">Auto-completes</p>
              <p className="mt-1 text-[10px] font-medium text-[#A0AAA4]">{formatDate(state.autoCompleteAt)}</p>
            </div>
          ) : null}
        </div>
        {state?.operationalNote ? (
          <p className="mt-3 rounded-lg bg-white/[0.025] px-3 py-2 text-[9px] leading-4 text-[#A0AAA4]">{state.operationalNote}</p>
        ) : null}
      </section>

      <div className="h-px bg-white/[0.06]" />

      <section className="p-5">
        <div className="flex items-center gap-2.5">
          <UserRoundCheck className="size-4 text-[#667069]" />
          <h2 className="text-sm font-semibold text-[#F4F7F5]">User Integrity Validation</h2>
        </div>
        <p className="mt-2 text-[10px] leading-4 text-[#667069]">Record the customer's platform identity for operational history.</p>

        {effectiveCanManage ? (
          <div className="mt-4 space-y-2">
            <input value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="Platform (Epic Games, Steam, PSN...)" maxLength={80} className="h-10 w-full rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 text-[11px] text-[#F4F7F5] outline-none" />
            <input value={playerId} onChange={(e) => setPlayerId(e.target.value)} placeholder="Player ID / Account ID" maxLength={160} className="h-10 w-full rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 text-[11px] text-[#F4F7F5] outline-none" />
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note (optional)" maxLength={500} rows={2} className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 py-2.5 text-[11px] text-[#F4F7F5] outline-none" />
            <button type="button" onClick={saveIntegrity} disabled={busy || !platform.trim() || !playerId.trim()} className="h-9 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] text-[10px] font-semibold text-[#F4F7F5] disabled:opacity-40">
              {state?.currentIntegrity ? "Update Validation" : "Save Validation"}
            </button>
          </div>
        ) : null}

        {state?.currentIntegrity ? (
          <div className="mt-3 rounded-xl border border-[#39E56F]/10 bg-[#39E56F]/[0.025] px-3 py-3">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 text-[#82F5A4]" />
              <div>
                <p className="text-[9px] uppercase tracking-[0.08em] text-[#667069]">Recorded identity</p>
                <p className="mt-1 text-xs font-semibold text-[#F4F7F5]">{state.currentIntegrity.platform} — {state.currentIntegrity.playerId}</p>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <div className="h-px bg-white/[0.06]" />

      <EvidenceSection title="Start Order Screenshot" description="Paste an HTTPS image link. No image file is uploaded to BoostingPedia." type="start" evidence={state?.startEvidence ?? null} canManage={effectiveCanManage} onSaved={saveEvidence} />

      <div className="h-px bg-white/[0.06]" />

      <EvidenceSection title="Deliver Order Screenshot" description="Paste the final proof link before marking the order Delivered." type="delivery" evidence={state?.deliveryEvidence ?? null} canManage={effectiveCanManage} onSaved={saveEvidence} />

      {effectiveCanManage && operational && operational !== "completed" ? (
        <>
          <div className="h-px bg-white/[0.06]" />
          <section className="p-5">
            <p className="font-gaming-label text-[9px] uppercase tracking-[0.12em] text-[#667069]">Booster Controls</p>

            <div className="mt-3 grid gap-2">
              {operational === "accepted" ? (
                <button onClick={() => lifecycle({ action: "transition", nextState: "in_progress" })} disabled={busy} className="flex h-10 items-center justify-center rounded-xl bg-[#39E56F] text-[10px] font-bold text-[#050807]"><Play className="mr-2 size-3" />Start Work</button>
              ) : null}

              {operational === "waiting_customer" ? (
                <button onClick={() => lifecycle({ action: "transition", nextState: "in_progress" })} disabled={busy} className="flex h-10 items-center justify-center rounded-xl border border-white/[0.08] text-[10px] font-semibold text-[#F4F7F5]"><RotateCcw className="mr-2 size-3" />Resume Work</button>
              ) : null}

              {operational === "in_progress" ? (
                <>
                  <button onClick={() => lifecycle({ action: "transition", nextState: "waiting_customer" })} disabled={busy} className="flex h-10 items-center justify-center rounded-xl border border-white/[0.08] text-[10px] font-semibold text-[#F4F7F5]"><Clock3 className="mr-2 size-3" />Waiting for Customer</button>
                  <button onClick={() => lifecycle({ action: "transition", nextState: "delivered" })} disabled={busy || !readyToDeliver} className="flex h-10 items-center justify-center rounded-xl bg-[#39E56F] text-[10px] font-bold text-[#050807] disabled:bg-white/[0.06] disabled:text-[#667069]"><Send className="mr-2 size-3" />Deliver Order</button>
                  {!readyToDeliver ? <p className="text-[9px] leading-4 text-[#667069]">Integrity validation and both screenshot links are required before delivery.</p> : null}
                </>
              ) : null}

              {operational !== "delivered" && operational !== "issue" ? (
                <div className="mt-2">
                  <textarea value={issueNote} onChange={(e) => setIssueNote(e.target.value)} placeholder="Describe the issue..." maxLength={500} rows={2} className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 py-2 text-[10px] text-[#F4F7F5] outline-none" />
                  <button onClick={() => lifecycle({ action: "transition", nextState: "issue", note: issueNote })} disabled={busy || !issueNote.trim()} className="mt-2 flex h-9 w-full items-center justify-center rounded-xl border border-amber-300/15 bg-amber-300/[0.04] text-[10px] font-semibold text-amber-100 disabled:opacity-40"><AlertTriangle className="mr-2 size-3" />Report Issue</button>
                </div>
              ) : null}

              {operational === "issue" && state?.canAdminister ? (
                <button onClick={() => lifecycle({ action: "transition", nextState: "in_progress", note: "Issue resolved by admin." })} disabled={busy} className="flex h-10 items-center justify-center rounded-xl border border-[#39E56F]/15 text-[10px] font-semibold text-[#82F5A4]">Resolve & Resume Work</button>
              ) : null}
            </div>
          </section>
        </>
      ) : null}

      {state?.isCustomer && operational === "delivered" ? (
        <>
          <div className="h-px bg-white/[0.06]" />
          <section className="p-5">
            <p className="font-gaming-label text-[9px] uppercase tracking-[0.12em] text-[#667069]">Review Delivery</p>
            <h3 className="mt-2 text-sm font-semibold text-[#F4F7F5]">Is everything correct?</h3>
            <p className="mt-2 text-[10px] leading-4 text-[#A0AAA4]">Confirm the delivery, or report a problem before the 48-hour review window ends.</p>
            <button onClick={() => lifecycle({ action: "confirm_delivery" })} disabled={busy} className="mt-4 h-10 w-full rounded-xl bg-[#39E56F] text-[10px] font-bold text-[#050807]">Confirm Delivery</button>
            <textarea value={customerProblem} onChange={(e) => setCustomerProblem(e.target.value)} placeholder="Describe the problem..." maxLength={500} rows={3} className="mt-3 w-full resize-none rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 py-2.5 text-[10px] text-[#F4F7F5] outline-none" />
            <button onClick={() => lifecycle({ action: "report_problem", note: customerProblem })} disabled={busy || !customerProblem.trim()} className="mt-2 h-9 w-full rounded-xl border border-rose-300/15 bg-rose-300/[0.03] text-[10px] font-semibold text-rose-200 disabled:opacity-40">Report a Problem</button>
          </section>
        </>
      ) : null}

      {state ? (
        <>
          <div className="h-px bg-white/[0.06]" />
          <section className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-gaming-label text-[9px] uppercase tracking-[0.12em] text-[#667069]">
                  Operational History
                </p>
                <p className="mt-1 text-[10px] leading-4 text-[#A0AAA4]">
                  Customer-facing lifecycle
                </p>
              </div>
              <Clock3 className="size-4 text-[#667069]" aria-hidden="true" />
            </div>

            <ol className="mt-4" aria-label="Operational history timeline">
              {customerLifecycle.map((stage, index) => {
                const hasNext = index < customerLifecycle.length - 1;
                const isCompleted = stage.status === "completed";
                const isCurrent = stage.status === "current";
                const timeLabel = stage.timestamp
                  ? formatDate(stage.timestamp)
                  : isCurrent &&
                      (stage.key === "in_progress" ||
                        stage.key === "customer_confirmation")
                    ? "Now"
                    : "Pending";

                return (
                  <li
                    key={stage.key}
                    className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-3"
                    aria-label={`${stage.title} — ${
                      isCompleted
                        ? "Completed"
                        : isCurrent
                          ? "Current"
                          : "Pending"
                    }`}
                  >
                    <div className="relative flex justify-center">
                      {hasNext ? (
                        <span
                          className={`absolute left-1/2 top-5 bottom-0 w-px -translate-x-1/2 ${
                            isCompleted
                              ? "bg-[#39E56F]/18"
                              : "bg-white/[0.08]"
                          }`}
                          aria-hidden="true"
                        />
                      ) : null}

                      <span
                        className={`relative z-[1] mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${
                          isCurrent
                            ? "border-[#39E56F] bg-[#39E56F] text-[#050807]"
                            : isCompleted
                              ? "border-[#39E56F]/30 bg-[#0B110E] text-[#82F5A4]"
                              : "border-white/[0.12] bg-[#0B110E] text-[#667069]"
                        }`}
                        aria-hidden="true"
                      >
                        {isCurrent ? (
                          <>
                            <span className="absolute -inset-1.5 rounded-full border border-[#39E56F]/25 opacity-70 animate-ping [animation-duration:1.8s] [animation-timing-function:ease-in-out] motion-reduce:animate-none" />
                            <span className="relative size-1.5 rounded-full bg-[#050807]" />
                          </>
                        ) : isCompleted ? (
                          <Check className="size-2.5" strokeWidth={2.5} />
                        ) : (
                          <span className="size-1.5 rounded-full border border-white/[0.24]" />
                        )}
                      </span>
                    </div>

                    <div className={hasNext ? "pb-5" : ""}>
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <p
                          className={`min-w-0 text-[11px] font-semibold leading-4 ${
                            isCurrent
                              ? "text-[#82F5A4]"
                              : isCompleted
                                ? "text-[#F4F7F5]"
                                : "text-[#7C8780]"
                          }`}
                        >
                          {stage.title}
                        </p>

                        <span
                          className={`rounded-md border px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] ${
                            isCurrent
                              ? "border-[#39E56F]/18 bg-[#39E56F]/[0.045] text-[#82F5A4]"
                              : isCompleted
                                ? "border-white/[0.07] bg-white/[0.02] text-[#667069]"
                                : "border-white/[0.05] bg-transparent text-[#56605A]"
                          }`}
                        >
                          {isCompleted
                            ? "Completed"
                            : isCurrent
                              ? "Current"
                              : "Pending"}
                        </span>
                      </div>

                      <p
                        className={`mt-1.5 break-words text-[9px] leading-4 ${
                          stage.status === "upcoming"
                            ? "text-[#56605A]"
                            : "text-[#A0AAA4]"
                        }`}
                      >
                        {stage.description}
                      </p>

                      <p className="mt-1 text-[9px] text-[#667069]">
                        {timeLabel}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </>
      ) : null}

      {error ? <div className="border-t border-rose-300/10 px-5 py-3 text-[9px] leading-4 text-rose-300">{error}</div> : null}
    </>
  );
}
