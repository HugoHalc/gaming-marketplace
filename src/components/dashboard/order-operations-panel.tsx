"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OrderWorkspaceCard } from "@/components/dashboard/order-workspace-card";
import { ExternalLink, Loader2 } from "lucide-react";

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
      completedCopy: "In-game identity recorded manually.",
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

const primary = "min-h-11 w-full rounded-lg bg-[#39E56F] px-3 text-xs font-semibold text-[#050807] disabled:opacity-40";
const secondary = "min-h-11 w-full rounded-lg border border-white/[0.08] px-3 text-xs font-semibold text-white disabled:opacity-40";
function EvidenceSection({ title, type, evidence, canManage, active, onSaved, children }: {
  title: string; type: "start" | "delivery"; evidence: Evidence | null;
  canManage: boolean; active: boolean;
  onSaved: (type: "start" | "delivery", url: string) => Promise<void>;
  children?: ReactNode;
}) {
  const [url, setUrl] = useState(evidence?.url ?? "");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const expanded = canManage && active && (!evidence || editing);
  const id = `evidence-${type}`;
  async function save() {
    if (saving || !canManage || !active) return;
    setSaving(true); setError(null);
    try { await onSaved(type, url); setEditing(false); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to save screenshot link."); }
    finally { setSaving(false); }
  }
  return <OrderWorkspaceCard title={title}>
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
      <span className={evidence ? "text-[#82F5A4]" : ""}>{evidence ? "Submitted" : active ? "Ready to submit" : "Pending"}</span>
      {evidence && canManage && active ? <button className={secondary + " !w-auto"} type="button" aria-expanded={expanded} aria-controls={id} onClick={() => { setUrl(evidence.url); setEditing(!editing); }}>{editing ? "Cancel edit" : "Edit link"}</button> : null}
    </div>
    <div id={id}>
      {expanded ? <div className="mt-2 space-y-2">
        <p className="text-xs">Paste an HTTPS screenshot link; no file is uploaded.</p>
        <label className="block text-xs">Screenshot URL<input type="url" inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={url} onChange={(event) => setUrl(event.target.value)} aria-describedby={error ? `${id}-error` : undefined} className="mt-1 h-11 w-full rounded-lg border border-white/[0.08] bg-[#090D0B] px-3 text-white" /></label>
        <button type="button" onClick={save} disabled={saving || !url.trim()} className={primary}>{saving ? "Saving…" : evidence ? "Update Screenshot Link" : "Save Screenshot Link"}</button>
      </div> : null}
    </div>
    {evidence ? <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
      <time dateTime={evidence.submittedAt}>{formatDate(evidence.submittedAt)}</time>
      <a href={evidence.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 text-[#82F5A4] underline">View Screenshot<ExternalLink className="size-3" /></a>
    </div> : null}
    {error ? <p id={`${id}-error`} role="alert" className="mt-2 text-xs text-rose-300">{error}</p> : null}
    {children}
  </OrderWorkspaceCard>;
}

export function OrderOperationsPanel({
  orderId,
  suggestedPlatform,
  details,
  accountDetails,
}: {
  orderId: string;
  canManage: boolean;
  suggestedPlatform?: string;
  orderStatus: string;
  details?: ReactNode;
  accountDetails?: ReactNode;
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
  const [editIntegrity, setEditIntegrity] = useState(false);

  async function refresh() {
    const response = await fetch(`/api/orders/${orderId}/operations`, { cache: "no-store" });
    const payload = (await response.json()) as OperationsState & { error?: string };
    if (!response.ok) throw new Error(payload.error || "Unable to load order operations.");
    setState(payload);
    return payload;
  }

  useEffect(() => {
    let active = true;
    fetch(`/api/orders/${orderId}/operations`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as OperationsState & { error?: string };
        if (!response.ok) throw new Error(payload.error || "Unable to load order operations.");
        return payload;
      })
      .then((payload) => {
        if (!active) return;
        setState(payload);
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
        body: JSON.stringify({ platform: suggestedPlatform ?? platform, playerId, internalNote: note }),
      });
      const payload = (await response.json()) as OperationsState & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to save validation.");
      setState(payload); setEditIntegrity(false);
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

  const operational = state?.operationalState;
  // Never render management fields until the server confirms the viewer's permissions.
  const effectiveCanManage = Boolean(state?.canManage);
  const operationalStatus = state ? getOperationalStatusPresentation(state) : null;
  const customerLifecycle = state ? buildCustomerLifecycleStages(state) : [];
  const hasIntegrity = Boolean(state?.currentIntegrity);
  const integrityActive = Boolean(operational && operational !== "delivered" && operational !== "completed");
  const integrityExpanded = effectiveCanManage && ((integrityActive && !hasIntegrity) || (hasIntegrity && editIntegrity));
  const startActive = Boolean(state?.startEvidence || (integrityActive && hasIntegrity));
  const deliveryActive = Boolean((operational === "in_progress" && hasIntegrity && state?.startEvidence) || (operational !== "accepted" && state?.deliveryEvidence));
  const startedAt = state?.operationalHistory.find((event) => event.toState === "in_progress")?.createdAt;

  return <>
    <OrderWorkspaceCard title="Order Details">
      {details}
      {loading ? <p className="mt-2 text-xs"><Loader2 className="mr-2 inline size-3.5 animate-spin" />Loading order operations…</p> : <>
        <p className={`mt-3 text-xs font-semibold ${operational === "issue" ? "text-rose-300" : operational ? "text-[#82F5A4]" : "text-[#A4AEA8]"}`}>{operationalStatus?.title ?? "Not initialized"}</p>
        {operationalStatus?.description ? <p className="mt-1 text-xs leading-4">{operationalStatus.description}</p> : null}
        {startedAt ? <p className="mt-2 text-xs">Started <time dateTime={startedAt}>{formatDate(startedAt)}</time></p> : null}
        {state?.operationalNote ? <p className="mt-2 text-xs">{state.operationalNote}</p> : null}
        {operational === "delivered" && state?.autoCompleteAt ? <p className="mt-2 text-xs">Auto-completes {formatDate(state.autoCompleteAt)}</p> : null}
        {effectiveCanManage && operational && operational !== "completed" ? <details className="mt-2">
          <summary className="min-h-11 cursor-pointer py-3 text-xs font-semibold text-white">Operational actions</summary>
          <div className="space-y-2">
            {operational === "waiting_customer" ? <button onClick={() => lifecycle({ action: "transition", nextState: "in_progress" })} disabled={busy} className={secondary}>Resume Work</button> : null}
            {operational === "in_progress" ? <button onClick={() => lifecycle({ action: "transition", nextState: "waiting_customer" })} disabled={busy} className={secondary}>Waiting for Customer</button> : null}
            {operational !== "delivered" && operational !== "issue" ? <>
              <label className="block text-xs">Issue description<textarea value={issueNote} onChange={(event) => setIssueNote(event.target.value)} maxLength={500} rows={2} className="mt-1 w-full rounded-lg border border-white/[0.08] bg-[#090D0B] p-3 text-white" /></label>
              <button onClick={() => lifecycle({ action: "transition", nextState: "issue", note: issueNote })} disabled={busy || !issueNote.trim()} className={secondary}>Report Issue</button>
            </> : null}
            {operational === "issue" && state?.canAdminister ? <button onClick={() => lifecycle({ action: "transition", nextState: "in_progress", note: "Issue resolved by admin." })} disabled={busy} className={secondary}>Resolve &amp; Resume Work</button> : null}
          </div>
        </details> : null}
        {state ? <details className="mt-2">
          <summary className="min-h-11 cursor-pointer py-3 text-xs font-semibold text-white">Operational History</summary>
          <ol aria-label="Operational history timeline" className="space-y-2 text-xs">{state.operationalHistory.map((event) => <li key={event.id}><span className="font-semibold text-white">{stateLabels[event.toState]}</span> · {formatDate(event.createdAt)}{event.note ? <p>{event.note}</p> : null}</li>)}</ol>
          <ol aria-label="Customer lifecycle" className="mt-3 space-y-2 text-xs">{customerLifecycle.map((stage) => <li key={stage.key}><span className="font-semibold">{stage.title} · {stage.status}</span><p>{stage.description}</p>{stage.timestamp ? <time dateTime={stage.timestamp}>{formatDate(stage.timestamp)}</time> : null}</li>)}</ol>
        </details> : null}
      </>}
      {error ? <p id={`operation-error-${orderId}`} role="alert" className="mt-2 text-xs text-rose-300">{error}</p> : null}
    </OrderWorkspaceCard>

    <OrderWorkspaceCard title="User Integrity Validation">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className={hasIntegrity ? "text-[#82F5A4]" : ""}>{hasIntegrity ? "Validated · recorded manually" : effectiveCanManage && integrityActive ? "Ready to validate" : "Pending"}</span>
        {hasIntegrity && effectiveCanManage ? <button type="button" aria-expanded={integrityExpanded} aria-controls={`integrity-${orderId}`} onClick={() => setEditIntegrity(!editIntegrity)} className={secondary + " !w-auto"}>{editIntegrity ? "Cancel edit" : "Edit identity"}</button> : null}
      </div>
      {state?.currentIntegrity ? <p className="mt-1 break-words text-xs text-white">{state.currentIntegrity.playerId} · {state.currentIntegrity.platform}<br /><time className="text-[#A4AEA8]" dateTime={state.currentIntegrity.recordedAt}>{formatDate(state.currentIntegrity.recordedAt)}</time></p> : !integrityExpanded ? <p className="mt-1 text-xs">Your assigned booster records the in-game identity.</p> : null}
      <div id={`integrity-${orderId}`}>
        {integrityExpanded ? <div className="mt-2 space-y-2">
          <p className="text-xs">Record the customer’s in-game identity manually.</p>
          {!suggestedPlatform && !state?.currentIntegrity?.platform ? <label className="block text-xs">Platform<input value={platform} onChange={(event) => setPlatform(event.target.value)} maxLength={80} className="mt-1 h-11 w-full rounded-lg border border-white/[0.08] bg-[#090D0B] px-3 text-white" /></label> : null}
          <label className="block text-xs">In-game username / Player ID<input value={playerId} onChange={(event) => setPlayerId(event.target.value)} maxLength={160} aria-describedby={error ? `operation-error-${orderId}` : undefined} className="mt-1 h-11 w-full rounded-lg border border-white/[0.08] bg-[#090D0B] px-3 text-white" /></label>
          <details><summary className="min-h-11 cursor-pointer py-3 text-xs">Internal note / previous identities</summary>
            <label className="block text-xs">Internal note (optional)<textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} rows={2} className="mt-1 w-full rounded-lg border border-white/[0.08] bg-[#090D0B] p-3 text-white" /></label>
            {state?.knownIdentities.map((record) => <p key={`${record.orderId}-${record.playerId}`} className="mt-2 text-xs">{record.playerId} · {record.platform} · {formatDate(record.recordedAt)}{record.internalNote ? ` · ${record.internalNote}` : ""}</p>)}
          </details>
          <button type="button" onClick={saveIntegrity} disabled={busy || !platform.trim() || !playerId.trim()} className={primary}>Save Validation</button>
        </div> : null}
      </div>
    </OrderWorkspaceCard>

    <EvidenceSection title="Order Start Screenshot" type="start" evidence={state?.startEvidence ?? null} canManage={effectiveCanManage} active={startActive} onSaved={saveEvidence}>
      {effectiveCanManage && operational === "accepted" ? <button onClick={() => lifecycle({ action: "transition", nextState: "in_progress" })} disabled={busy} className={primary + " mt-2"}>Start Work</button> : null}
    </EvidenceSection>
    <EvidenceSection title="Deliver Order Screenshot" type="delivery" evidence={state?.deliveryEvidence ?? null} canManage={effectiveCanManage} active={deliveryActive} onSaved={saveEvidence}>
      {effectiveCanManage && operational === "in_progress" ? <>
        <button onClick={() => lifecycle({ action: "transition", nextState: "delivered" })} disabled={busy || !readyToDeliver} className={primary + " mt-2"}>Deliver Order</button>
        {!readyToDeliver ? <p className="mt-1 text-xs">Integrity validation and both screenshot links are required before delivery.</p> : null}
      </> : null}
      {operational === "delivered" || operational === "completed" ? <p className="mt-1 text-xs text-[#82F5A4]">{operational === "completed" ? "Completed" : "Delivered"}</p> : null}
      {state?.isCustomer && operational === "delivered" ? <div className="mt-2 space-y-2">
        <p className="text-xs">Confirm delivery, or report a problem within the 48-hour review window.</p>
        <button onClick={() => lifecycle({ action: "confirm_delivery" })} disabled={busy} className={primary}>Confirm Delivery</button>
        <details><summary className="min-h-11 cursor-pointer py-3 text-xs">Report a delivery problem</summary>
          <label className="block text-xs">Problem description<textarea value={customerProblem} onChange={(event) => setCustomerProblem(event.target.value)} maxLength={500} rows={3} className="mt-1 w-full rounded-lg border border-white/[0.08] bg-[#090D0B] p-3 text-white" /></label>
          <button onClick={() => lifecycle({ action: "report_problem", note: customerProblem })} disabled={busy || !customerProblem.trim()} className={secondary + " mt-2"}>Report a Problem</button>
        </details>
      </div> : null}
    </EvidenceSection>
    {accountDetails}
  </>;
}
