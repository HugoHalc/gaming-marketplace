"use client";

import type { ReactNode } from "react";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GameConfiguratorColumns({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 pb-[calc(5.25rem+env(safe-area-inset-bottom))] xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-start xl:pb-0">
      {children}
    </div>
  );
}

export function GameConfiguratorPanel({
  eyebrow,
  description,
  accentTextClass,
  accentGradientClass,
  statusLabel,
  children,
}: {
  eyebrow: string;
  description: string;
  accentTextClass: string;
  accentGradientClass: string;
  statusLabel?: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-[#080b09]/95 shadow-[0_28px_90px_-48px_rgba(0,0,0,.98)]">
      <div className={`flex flex-col gap-2 border-b border-white/[0.07] bg-gradient-to-br ${accentGradientClass} via-transparent to-transparent px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-4`}>
        <div>
          <div className={`flex items-center gap-2 font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] ${accentTextClass}`}>
            <Sparkles className="size-3.5" />
            {eyebrow}
          </div>
          <p className="mt-1 hidden text-sm text-[var(--muted-foreground)] sm:block">{description}</p>
        </div>
        {statusLabel ? (
          <span className="hidden w-fit items-center rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1 text-[10px] font-medium text-white/45 sm:inline-flex">
            {statusLabel}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function GameOrderAside({
  gameLabel,
  statusLabel,
  statusTone = "pending",
  progression,
  metadata,
  totalLabel = "Pricing pending",
  children,
}: {
  gameLabel: string;
  statusLabel: string;
  statusTone?: "pending" | "ready";
  progression?: ReactNode;
  metadata?: ReactNode;
  totalLabel?: string;
  children?: ReactNode;
}) {
  const ready = statusTone === "ready";
  return (
    <aside id="boost-summary" className="scroll-mt-28 xl:scroll-mt-24 xl:sticky xl:top-24">
      <div className="space-y-3">
        <div className="overflow-hidden rounded-[1.6rem] border border-white/[0.09] bg-[#070A08] shadow-[0_26px_70px_-46px_rgba(0,0,0,.95)]">
          <div className="border-b border-white/[0.07] bg-gradient-to-br from-violet-500/[0.05] via-transparent to-transparent px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-gaming-value text-[1.65rem] font-bold leading-none tracking-[-0.045em] text-[#F4F7F5]">
                  Order Summary
                </p>
                <p className="mt-1.5 text-[11px] font-medium text-[#A0AAA4]">{gameLabel}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-medium ${
                ready
                  ? "border border-[#39E56F]/18 bg-[#39E56F]/[0.035] text-[#82F5A4]"
                  : "border border-white/[0.07] bg-white/[0.025] text-[#A0AAA4]"
              }`}>
                {statusLabel}
              </span>
            </div>
          </div>

          <div className="p-4">
            {progression}
            {metadata}

            <div className="my-4 h-px bg-white/[0.08]" />

            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-[#A0AAA4]">Total</p>
                <p className="font-gaming-value mt-1 whitespace-nowrap text-[2.35rem] font-bold leading-none tracking-[-0.05em] text-white/30">
                  —
                </p>
                <p className="mt-2 text-[9px] font-medium uppercase tracking-[0.11em] text-white/35">
                  {totalLabel}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[9px] font-medium text-white/45">
                USD
              </span>
            </div>

            {children}

            <Button
              className="mt-4 h-12 w-full cursor-not-allowed rounded-xl border border-white/[0.06] bg-white/[0.055] font-semibold text-white/35 opacity-100 shadow-none hover:bg-white/[0.055] hover:text-white/35"
              size="lg"
              disabled
            >
              Checkout unavailable
            </Button>

            <p className="mt-3 text-center text-[10px] leading-4 text-white/35">
              Final order details will be validated before checkout.
            </p>
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-white/[0.08] bg-[#080B09] p-3.5">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-violet-300/[0.14] bg-violet-400/[0.045] text-violet-200/75">
              <ShieldCheck className="size-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-[#F4F7F5]">Secure payment</p>
              <p className="mt-1 text-[10px] leading-4 text-white/40">
                Encrypted checkout and account protection are built into the BoostingPedia order flow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function GameMobileOrderBar({ label }: { label: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-black/90 px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl sm:px-4 sm:pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pt-3 xl:hidden">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">Your total</p>
          <div className="mt-0.5 flex items-baseline gap-2">
            <p className="font-gaming-value whitespace-nowrap text-[1.55rem] font-bold leading-none tracking-[-0.045em] text-white/30">—</p>
            <span className="text-[9px] text-[#A0AAA4]">{label}</span>
          </div>
        </div>
        <a
          href="#boost-summary"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.055] px-5 text-sm font-bold text-white/55 transition-colors hover:border-white/[0.16] hover:text-white"
        >
          View order
          <ArrowRight className="ml-2 size-4" />
        </a>
      </div>
    </div>
  );
}
