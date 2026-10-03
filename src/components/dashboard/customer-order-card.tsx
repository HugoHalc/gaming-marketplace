"use client";

import Image from "next/image";
import Link from "next/link";
import { elapsedOrderTime } from "@/components/orders/order-board-time";
import { ArrowRight } from "lucide-react";
import { OrderLocalDate } from "@/components/booster/order-local-date";
import { OrderWorkspaceConfiguration } from "@/components/orders/order-workspace-configuration";
import { OrderBoardCard, OrderBoardCardHeader, OrderBoardCardBody, orderBoardConfigurationClass } from "@/components/orders/order-board-primitives";
import { gameLogos } from "@/features/booster/presentation/order-board";
import { normalizedGameSlug } from "@/components/orders/game-order-presentation-data";
import { customerOrderLabel, type CustomerBoardOrder } from "@/features/orders/presentation/customer-order-board";

function statusClass(order: CustomerBoardOrder) {
  const label = customerOrderLabel(order);
  if (label === "Issue" || order.status === "cancelled" || order.status === "refunded") return "border-rose-300/15 text-rose-200";
  if (label === "Delivered") return "border-cyan-300/15 text-cyan-200";
  if (label === "In Progress") return "border-[#39E56F]/20 text-[#82F5A4]";
  return "border-white/[0.08] text-[#A4AEA8]";
}
const extraFields = { currentDrive: "Current drive", desiredDrive: "Desired drive", rankConfidence: "Rank confidence", masteryMode: "Mastery mode", masteryPoints: "Mastery points", marks: "Mastery marks", dotaPlusConfirmed: "Dota Plus confirmed" };
export function CustomerOrderCard({ order, shortId, now }: { order: CustomerBoardOrder; shortId?: string; now?: number }) {
  const elapsed = now === undefined ? null : elapsedOrderTime(order.createdAt, now);
  const total = new Intl.NumberFormat("en-US", { style: "currency", currency: order.currency }).format(order.total);
  return <OrderBoardCard data-customer-order-card="" className="border-white/[0.08]">
    <OrderBoardCardHeader className="!grid-cols-[minmax(0,1fr)_auto]">
      <span title={order.orderNumber || order.id} className="min-w-0 break-words text-xs font-semibold">{shortId ?? order.orderNumber}</span>
      <span aria-label={`Order total ${total}`} className="whitespace-nowrap text-sm font-semibold text-[#82F5A4]">{total}</span>
      <span className={`col-span-2 w-fit max-w-full rounded-md border px-2 py-1 text-[11px] ${statusClass(order)}`}>{customerOrderLabel(order)}</span>
    </OrderBoardCardHeader>
    <OrderBoardCardBody>
      {order.items.map((item, index) => {
        const slug = normalizedGameSlug(item.gameName);
        const configuration = { ...item.configuration };
        if (configuration.driveRank !== undefined && configuration.currentRank === undefined) configuration.currentRank = configuration.driveRank;
        if (configuration.express === true) configuration.expressDelivery = true;
        if (configuration.appearOffline === true) configuration.playOffline = true;
        return <section key={index} aria-label={item.serviceName} className={index ? "mt-3 border-t border-white/[0.06] pt-3" : ""}>
          <div className="flex min-w-0 items-center gap-2.5">
            {gameLogos[slug] ? <Image src={gameLogos[slug]} alt="" width={52} height={38} sizes="52px" className="h-[38px] w-[52px] shrink-0 object-contain" /> : null}
            <div className="min-w-0"><p className="text-xs text-[#A4AEA8]">{item.gameName}</p><h2 className="mt-0.5 break-words text-base font-semibold leading-5">{item.serviceName}</h2></div>
          </div>
          <div className={orderBoardConfigurationClass}><OrderWorkspaceConfiguration gameName={item.gameName} configuration={configuration} rankSize="lg" /></div>
          {Object.entries(extraFields).some(([key]) => configuration[key] !== undefined) ? <dl className="mt-2 grid min-w-0 grid-cols-2 gap-3 text-xs">{Object.entries(extraFields).filter(([key]) => configuration[key] !== undefined).map(([key, label]) => <div key={key} className="min-w-0"><dt className="text-[#A4AEA8]">{label}</dt><dd className="mt-0.5 break-words font-semibold">{typeof configuration[key] === "boolean" ? configuration[key] ? "Yes" : "No" : String(configuration[key]).replace(/[-_]/g, " ")}</dd></div>)}</dl> : null}
        </section>;
      })}
      <footer className="mt-2 flex min-w-0 flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-2 text-xs text-[#A4AEA8]">
        <div className="min-w-0"><p className="text-[11px]">Purchased</p><OrderLocalDate timestamp={order.createdAt} />{elapsed ? <p className="mt-0.5 text-[11px]">{elapsed}</p> : null}</div>
        <Link href={`/dashboard/orders/${order.id}`} aria-label={`Open Order ${order.orderNumber || order.id}`} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 font-semibold text-[#82F5A4] hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-[#39E56F]">Open Order <ArrowRight aria-hidden="true" className="size-3.5 shrink-0" /></Link>
      </footer>
    </OrderBoardCardBody>
  </OrderBoardCard>;
}
