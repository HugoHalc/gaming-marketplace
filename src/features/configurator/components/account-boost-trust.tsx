"use client";

import { Check, ChevronDown, ShieldCheck } from "lucide-react";
import { useId, useState } from "react";

const ACCOUNT_BOOST_DESCRIPTION =
  "Our booster completes the service directly on your account. Account access is requested securely after your order is placed.";

const securityPoints = [
  "Account access is requested only after your order is placed.",
  "Your order workspace keeps communication with your booster in one place.",
  "Never share payment information with a booster.",
  "Support is available if you have questions before providing account access.",
] as const;

const workflowSteps = [
  "Configure your service.",
  "Complete secure checkout.",
  "Account access is provided through the order process.",
  "Your assigned booster completes the service.",
  "Track progress and communicate through your order workspace.",
] as const;

type AccountBoostAccent = "blue" | "gold";

const accentStyles: Record<
  AccountBoostAccent,
  {
    border: string;
    background: string;
    icon: string;
    label: string;
    focus: string;
  }
> = {
  blue: {
    border: "border-blue-300/[0.12]",
    background: "bg-blue-400/[0.025]",
    icon: "text-blue-200/75",
    label: "text-blue-200/70",
    focus: "focus-visible:ring-blue-300/30",
  },
  gold: {
    border: "border-[#C89B3C]/20",
    background: "bg-[#C89B3C]/[0.035]",
    icon: "text-[#E7C867]/80",
    label: "text-[#E7C867]/80",
    focus: "focus-visible:ring-[#C89B3C]/35",
  },
};

export function AccountBoostCardDescription() {
  return (
    <p className="mt-1 text-[11px] leading-[1.15rem] text-[#A0AAA4]">
      {ACCOUNT_BOOST_DESCRIPTION}
    </p>
  );
}

export function AccountBoostTrust({
  selected,
  accent = "blue",
  showDescription = false,
}: {
  selected: boolean;
  accent?: AccountBoostAccent;
  showDescription?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const styles = accentStyles[accent];

  if (!selected) return null;

  return (
    <div
      className={`mt-3 overflow-hidden rounded-xl border ${styles.border} ${styles.background}`}
    >
      <div className="flex items-start gap-2.5 px-3 py-3">
        <ShieldCheck className={`mt-0.5 size-4 shrink-0 ${styles.icon}`} aria-hidden="true" />
        <div className="min-w-0">
          <p className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${styles.label}`}>
            Account security
          </p>
          {showDescription ? (
            <p className="mt-1.5 text-[11px] leading-[1.1rem] text-white/52">
              {ACCOUNT_BOOST_DESCRIPTION}
            </p>
          ) : null}
          <p className={`${showDescription ? "mt-1.5" : "mt-1"} text-[10px] leading-4 text-white/42`}>
            Account details are only requested after checkout.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        aria-controls={panelId}
        className={`flex min-h-11 w-full items-center justify-between gap-3 border-t border-white/[0.06] px-3 text-left text-[10px] font-semibold text-white/55 outline-none transition-colors hover:bg-white/[0.025] hover:text-white/78 focus-visible:ring-2 focus-visible:ring-inset ${styles.focus} motion-reduce:transition-none`}
      >
        <span>Account security details</span>
        <ChevronDown
          className={`size-3.5 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {expanded ? (
        <div id={panelId} className="border-t border-white/[0.06] px-3 pb-3 pt-3">
          <div className="space-y-2">
            {securityPoints.map((point) => (
              <div key={point} className="flex items-start gap-2 text-[10px] leading-4 text-white/45">
                <Check className="mt-0.5 size-3 shrink-0 text-[#82F5A4]/80" aria-hidden="true" />
                <span>{point}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 border-t border-white/[0.06] pt-3">
            <p className="text-[10px] font-semibold text-[#F4F7F5]">
              Using two-factor authentication?
            </p>
            <p className="mt-1 text-[10px] leading-4 text-white/42">
              Your assigned booster can coordinate any required login verification with you through the order workspace.
            </p>
          </div>

          <div className="mt-3 border-t border-white/[0.06] pt-3">
            <p className="text-[10px] font-semibold text-[#F4F7F5]">How Account Boost works</p>
            <ol className="mt-2 space-y-1.5">
              {workflowSteps.map((step, index) => (
                <li key={step} className="flex items-start gap-2 text-[10px] leading-4 text-white/42">
                  <span className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border ${styles.border} text-[8px] font-bold ${styles.label}`}>
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AccountBoostCheckoutReassurance({
  selected,
  accent = "blue",
}: {
  selected: boolean;
  accent?: AccountBoostAccent;
}) {
  if (!selected) return null;

  const styles = accentStyles[accent];

  return (
    <div className="mt-3 flex items-start gap-2 text-[10px] leading-4 text-white/42">
      <ShieldCheck className={`mt-0.5 size-3.5 shrink-0 ${styles.icon}`} aria-hidden="true" />
      <span>Account access is requested after checkout — never before payment.</span>
    </div>
  );
}
