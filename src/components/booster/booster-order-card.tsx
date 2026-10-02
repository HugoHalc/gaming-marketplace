"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { ClaimOrderButton } from "@/components/booster/claim-order-button";
import { OrderWorkspaceConfiguration } from "@/components/orders/order-workspace-configuration";
import { PlatformIcon } from "@/features/configurator/components/platform-icon";
import { gameLogos, type BoardOrder } from "@/features/booster/presentation/order-board";

const additionalFields = { rankConfidence: "Rank confidence", masteryMode: "Mastery mode", masteryPoints: "Mastery points", marks: "Mastery marks", dotaPlusConfirmed: "Dota Plus confirmed" };

export function elapsedOrderTime(createdAt: string, now: number) {
  const created = Date.parse(createdAt);
  if (!Number.isFinite(created)) return null;
  const minutes = Math.max(0, Math.floor((now - created) / 60000));
  return minutes < 1 ? "Just now" : minutes < 60 ? `${minutes}m ago` : minutes < 1440 ? `${Math.floor(minutes / 60)}h ago` : `${Math.floor(minutes / 1440)}d ago`;
}
export const BoosterOrderCardView = memo(function BoosterOrderCardView({ order, now, isNew, onSeen, onClaimed, onConflict, onPending }: {
  order: BoardOrder; now: number; isNew: boolean;
  onSeen: (id: string) => void;
  onClaimed: (id: string, payout: number) => void;
  onConflict: (id: string) => void;
  onPending: (pending: boolean) => void;
}) {
  const payout = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(order.payout);
  const elapsed = elapsedOrderTime(order.createdAt, now);
  return <article id={`board-order-${order.id}`} tabIndex={-1} onFocusCapture={() => onSeen(order.id)} data-order-board-card="" className={`min-w-0 rounded-xl border bg-[#0B110E] p-4 [overflow-wrap:anywhere] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39E56F] ${isNew ? "border-[#39E56F]/45" : "border-white/[0.08]"}`}>
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
      <span className="break-words font-semibold text-white">{order.orderNumber || order.id.slice(0, 8)}</span>
      <span className="text-[#A4AEA8]">{isNew ? "New" : order.bucket === "available" ? "Available" : order.bucket === "active" ? "In Progress" : "Completed"}</span>
    </div>
    <div className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-3">
      <div className="min-w-0"><p className="text-[11px] text-[#A4AEA8]">Booster payout</p><p className="mt-1 break-words text-xl font-semibold text-[#82F5A4]">{payout}</p></div>
      {order.bucket === "available" ? <ClaimOrderButton orderId={order.id} onClaimed={onClaimed} onConflict={onConflict} onPending={onPending} /> : <Link href={`/booster/orders/${order.id}`} className="flex min-h-11 items-center justify-center rounded-lg border border-white/[0.1] px-2 py-2 text-center text-xs font-semibold text-white focus-visible:outline-2 focus-visible:outline-[#39E56F]">{order.bucket === "completed" ? "View Order" : "Open Workspace"}</Link>}
    </div>
    <div className="mt-4 flex items-center gap-3">
      {gameLogos[order.gameSlug] ? <Image src={gameLogos[order.gameSlug]} alt="" width={40} height={32} sizes="40px" className="h-8 w-10 shrink-0 object-contain" /> : null}
      <div className="min-w-0"><p className="text-xs text-[#A4AEA8]">{order.gameName}</p><h2 className="mt-0.5 break-words text-sm font-semibold leading-5 text-white">{order.serviceName}</h2></div>
      {typeof order.configuration.platform === "string" ? <PlatformIcon platform={order.configuration.platform} /> : null}
    </div>
    <OrderWorkspaceConfiguration gameName={order.gameName} configuration={order.configuration} rankSize="md" />
    {Object.entries(additionalFields).some(([key]) => order.configuration[key] !== undefined) ? <dl className="mt-3 grid min-w-0 grid-cols-2 gap-3 text-xs">{Object.entries(additionalFields).filter(([key]) => order.configuration[key] !== undefined).map(([key, label]) => <div key={key} className="min-w-0"><dt className="text-[#A4AEA8]">{label}</dt><dd className="mt-0.5 break-words font-semibold">{typeof order.configuration[key] === "boolean" ? order.configuration[key] ? "Yes" : "No" : String(order.configuration[key]).replace(/[-_]/g, " ")}</dd></div>)}</dl> : null}
    {order.extras.length ? <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Selected extras">{order.extras.slice(0, 3).map((extra) => <span key={extra} className="rounded-md border border-white/[0.08] px-2 py-1 text-[11px] text-[#A4AEA8]">{extra}</span>)}{order.extras.length > 3 ? <details className="w-full"><summary className="min-h-11 cursor-pointer py-3 text-xs text-[#82F5A4]">{order.extras.length - 3} more extras</summary><div className="flex flex-wrap gap-1.5">{order.extras.slice(3).map((extra) => <span key={extra} className="rounded-md border border-white/[0.08] px-2 py-1 text-[11px]">{extra}</span>)}</div></details> : null}</div> : null}
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-3 text-[11px] text-[#A4AEA8]">
      {elapsed !== null ? <time dateTime={order.createdAt}>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(order.createdAt))} UTC</time> : null}
      {elapsed ? <span>{elapsed}</span> : null}
    </div>
  </article>;
}, (previous, next) => previous.now === next.now && previous.isNew === next.isNew && previous.onSeen === next.onSeen && previous.onClaimed === next.onClaimed && previous.onConflict === next.onConflict && previous.onPending === next.onPending && JSON.stringify(previous.order) === JSON.stringify(next.order));
