"use client";

import Image from "next/image";
import Link from "next/link";
import { Award, Crosshair, Gamepad2, GraduationCap, Medal, Sparkles, Trophy } from "lucide-react";
import { OrderLocalDate } from "@/components/booster/order-local-date";
import { memo } from "react";
import { ClaimOrderButton } from "@/components/booster/claim-order-button";
import { OrderWorkspaceConfiguration } from "@/components/orders/order-workspace-configuration";
import { PlatformIcon } from "@/features/configurator/components/platform-icon";
import { elapsedOrderTime } from "@/components/orders/order-board-time";
import { gameLogos, type BoardOrder } from "@/features/booster/presentation/order-board";

import { OrderBoardCard, OrderBoardCardHeader, OrderBoardCardBody, orderBoardConfigurationClass } from "@/components/orders/order-board-primitives";

const categoryIcons: Record<string, typeof Medal> = { rank: Medal, wins: Trophy, placements: Crosshair, coaching: GraduationCap, hero: Sparkles, unrated: Gamepad2 };
const additionalFields = { rankConfidence: "Rank confidence", masteryMode: "Mastery mode", masteryPoints: "Mastery points", marks: "Mastery marks", dotaPlusConfirmed: "Dota Plus confirmed" };

export { elapsedOrderTime } from "@/components/orders/order-board-time";
export const BoosterOrderCardView = memo(function BoosterOrderCardView({ order, shortId, now, isNew, onSeen, onClaimed, onConflict, onPending }: {
  order: BoardOrder; shortId?: string; now: number; isNew: boolean;
  onSeen: (id: string) => void;
  onClaimed: (id: string, payout: number) => void;
  onConflict: (id: string) => void;
  onPending: (pending: boolean) => void;
}) {
  const payout = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(order.payout);
  const ServiceIcon = order.gameSlug === "rocket-league" && /rewards/i.test(order.serviceName) ? Award : order.gameSlug === "rocket-league" && /tournament/i.test(order.serviceName) ? Trophy : categoryIcons[order.serviceCategory ?? ""];
  const elapsed = elapsedOrderTime(order.createdAt, now);
  return <OrderBoardCard id={`board-order-${order.id}`} tabIndex={-1} onFocusCapture={() => onSeen(order.id)} data-order-board-card="" className={`${isNew ? "border-[#39E56F]/45" : "border-white/[0.08]"}`}>
    <OrderBoardCardHeader>
      <span title={`${order.orderNumber} · ${order.id}`} aria-label={`Order ${order.orderNumber || order.id}`} className="min-w-0 break-words text-xs font-semibold text-white">{shortId ?? (order.orderNumber || order.id).slice(-6)}</span>
      <span aria-label={`Booster payout ${payout}`} className="whitespace-nowrap text-sm font-semibold text-[#82F5A4]">{payout}</span>
      {order.bucket === "available" ? <ClaimOrderButton compact orderId={order.id} onClaimed={onClaimed} onConflict={onConflict} onPending={onPending} /> : <Link href={`/booster/orders/${order.id}`} className="flex min-h-11 max-w-28 items-center justify-center rounded-lg px-2 text-center text-xs font-semibold text-white hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-[#39E56F]">{order.bucket === "completed" ? "View Order" : "Open Workspace"}</Link>}
    </OrderBoardCardHeader>
    <OrderBoardCardBody>
    <div className="flex items-center gap-2.5">
      {gameLogos[order.gameSlug] ? <Image src={gameLogos[order.gameSlug]} alt="" width={52} height={38} sizes="52px" className="h-[38px] w-[52px] shrink-0 object-contain" /> : null}
      <div className="min-w-0 flex-1"><p className="text-xs text-[#A4AEA8]">{order.gameName}</p><div className="mt-0.5 flex items-start gap-1.5">{ServiceIcon ? <ServiceIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#82F5A4]" /> : null}<h2 className="break-words text-base font-semibold leading-5 text-white">{order.serviceName}</h2></div></div>
      {typeof order.configuration.platform === "string" ? <PlatformIcon platform={order.configuration.platform} /> : null}
    </div>
    <div className={orderBoardConfigurationClass}>
    <OrderWorkspaceConfiguration gameName={order.gameName} configuration={order.configuration} rankSize="lg" /></div>
    {Object.entries(additionalFields).some(([key]) => order.configuration[key] !== undefined) ? <dl className="mt-2 grid min-w-0 grid-cols-2 gap-3 text-xs">{Object.entries(additionalFields).filter(([key]) => order.configuration[key] !== undefined).map(([key, label]) => <div key={key} className="min-w-0"><dt className="text-[#A4AEA8]">{label}</dt><dd className="mt-0.5 break-words font-semibold">{typeof order.configuration[key] === "boolean" ? order.configuration[key] ? "Yes" : "No" : String(order.configuration[key]).replace(/[-_]/g, " ")}</dd></div>)}</dl> : null}
    {order.extras.length ? <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Selected extras">{order.extras.slice(0, 3).map((extra) => <span key={extra} className="rounded-md border border-white/[0.08] px-2 py-1 text-[11px] text-[#A4AEA8]">{extra}</span>)}{order.extras.length > 3 ? <details className="w-full"><summary className="min-h-11 cursor-pointer py-3 text-xs text-[#82F5A4]">{order.extras.length - 3} more extras</summary><div className="flex flex-wrap gap-1.5">{order.extras.slice(3).map((extra) => <span key={extra} className="rounded-md border border-white/[0.08] px-2 py-1 text-[11px]">{extra}</span>)}</div></details> : null}</div> : null}
    <footer className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-white/[0.06] pt-2 text-xs text-[#A4AEA8]">
      <OrderLocalDate timestamp={order.createdAt} />
      {elapsed ? <span>{elapsed}</span> : null}
      <span className="text-[11px]">{isNew ? "New" : order.bucket === "available" ? "Available" : order.bucket === "active" ? "In Progress" : "Completed"}</span>
    </footer>
    </OrderBoardCardBody>
  </OrderBoardCard>;
}, (previous, next) => previous.shortId === next.shortId && previous.now === next.now && previous.isNew === next.isNew && previous.onSeen === next.onSeen && previous.onClaimed === next.onClaimed && previous.onConflict === next.onConflict && previous.onPending === next.onPending && JSON.stringify(previous.order) === JSON.stringify(next.order));
