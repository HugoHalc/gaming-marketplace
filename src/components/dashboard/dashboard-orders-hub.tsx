"use client";

import Link from "next/link";
import { LayoutGrid, List, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { CustomerOrderCard } from "@/components/dashboard/customer-order-card";
import { OrderBoardToolbar, orderBoardPageClass, orderBoardGridClass, orderBoardControl, orderBoardActiveControl, orderBoardIconControl } from "@/components/orders/order-board-primitives";
import { boardGames, shortBoardOrderIds } from "@/features/booster/presentation/order-board";
import { filterCustomerOrders, matchesCustomerFilter, type CustomerBoardOrder, type CustomerFilter } from "@/features/orders/presentation/customer-order-board";

const filters = [["all", "All"], ["placed", "Placed"], ["active", "In Progress"], ["delivered", "Delivered"], ["completed", "Completed"]] as const;
export function DashboardOrdersHub({ orders, canAccessBooster = false, generatedAt }: { orders: CustomerBoardOrder[]; canAccessBooster?: boolean; generatedAt?: number }) {
  const [filter, setFilter] = useState<CustomerFilter>("all");
  const [game, setGame] = useState("all");
  const [search, setSearch] = useState("");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const visible = useMemo(() => filterCustomerOrders(orders, filter, game, search), [orders, filter, game, search]);
  const shortIds = useMemo(() => shortBoardOrderIds(orders), [orders]);
  return <div className={orderBoardPageClass}>
    <header className="flex min-h-11 flex-wrap items-center justify-between gap-x-3"><h1 className="text-[28px] font-bold tracking-tight">Orders</h1>{canAccessBooster ? <Link href="/dashboard/orders?mode=booster" className="inline-flex min-h-11 items-center text-xs font-medium text-[#A4AEA8] hover:text-white focus-visible:outline-2 focus-visible:outline-[#39E56F]">Booster Orders</Link> : null}</header>
    <OrderBoardToolbar className="mt-3" data-customer-order-toolbar="">
      <div className="flex max-w-full min-w-0 gap-0.5 overflow-x-auto" aria-label="Order status">{filters.map(([key, label]) => <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)} className={`${orderBoardControl} ${filter === key ? orderBoardActiveControl : "text-[#A4AEA8]"}`}>{label} <span className="ml-1 text-[11px] font-normal text-[#A4AEA8]">{orders.filter((order) => matchesCustomerFilter(order, key)).length}</span></button>)}</div>
      <div className="flex w-full min-w-0 flex-wrap items-center gap-1 xl:w-auto xl:flex-nowrap">
        <label className="w-full sm:w-40"><span className="sr-only">Game</span><select value={game} onChange={(event) => setGame(event.target.value)} className="h-11 w-full min-w-0 rounded-lg border border-white/[0.08] bg-[#0B110E] px-2 text-xs focus-visible:outline-2 focus-visible:outline-[#39E56F]"><option value="all">All Games</option>{boardGames.map((entry) => <option key={entry.slug} value={entry.slug}>{entry.name}</option>)}</select></label>
        <label className="relative min-w-0 flex-1 sm:w-40 xl:w-32"><span className="sr-only">Search orders</span><Search aria-hidden="true" className="pointer-events-none absolute left-2.5 top-3.5 size-4 text-[#A4AEA8]" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search orders" className="h-11 w-full min-w-0 rounded-lg border border-white/[0.08] bg-[#050807] pl-8 pr-2 text-xs focus-visible:outline-2 focus-visible:outline-[#39E56F]" /></label>
        <div className="flex shrink-0 rounded-lg border border-white/[0.06]" aria-label="Order layout">{(["grid", "list"] as const).map((view) => { const Icon = view === "grid" ? LayoutGrid : List; return <button key={view} type="button" aria-label={view === "grid" ? "Grid view" : "List view"} aria-pressed={layout === view} onClick={() => setLayout(view)} className={`${orderBoardIconControl} ${layout === view ? orderBoardActiveControl : ""}`}><Icon aria-hidden="true" className="size-4" /></button>; })}</div>
      </div>
    </OrderBoardToolbar>
    {visible.length ? <div className={orderBoardGridClass(layout)}>{visible.map((order) => <CustomerOrderCard key={order.id} order={order} shortId={shortIds.get(order.id)} now={generatedAt} />)}</div> : <div className="mt-3 rounded-xl border border-white/[0.08] bg-[#0B110E] p-6 text-center"><h2 className="text-sm font-semibold">No orders found</h2><p className="mt-2 text-xs text-[#A4AEA8]">Try another status, game or search term.</p></div>}
  </div>;
}
