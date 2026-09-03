"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Grid2X2, List, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { OrderRecord } from "@/features/orders/types/orders";
import { resolveRocketLeagueRank, RocketLeagueRankValue } from "@/components/orders/rocket-league-rank";

type DashboardOrder = OrderRecord & { operationalState: string | null; autoCompleteAt: string | null };
type FilterKey = "all" | "placed" | "active" | "delivered" | "completed";
type ViewMode = "grid" | "list";

function money(value:number){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(value)}
function date(value:string){return new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric"}).format(new Date(value))}
function label(value:string){return value.replace(/([A-Z])/g," $1").replace(/[_-]/g," ").replace(/^./,l=>l.toUpperCase())}
function status(order:DashboardOrder){if(order.operationalState==='delivered')return'Delivered';if(order.operationalState==='waiting_customer')return'Waiting Customer';if(order.operationalState==='issue')return'Issue';if(order.operationalState==='accepted')return'Booster Assigned';if(order.operationalState==='in_progress')return'In Progress';if(order.operationalState==='completed'||order.status==='completed')return'Completed';if(order.status==='pending_payment')return'Placed';if(order.status==='paid'||order.status==='queued')return'Ready for Assignment';return label(order.status)}
function matches(order:DashboardOrder, filter:FilterKey){if(filter==='all')return true;if(filter==='placed')return['pending_payment','paid','queued'].includes(order.status);if(filter==='active')return order.status==='in_progress'&&order.operationalState!=='delivered'&&order.operationalState!=='completed';if(filter==='delivered')return order.operationalState==='delivered';return order.status==='completed'||order.operationalState==='completed'}
function statusTone(order:DashboardOrder){const s=status(order);if(s==='Completed')return'text-[#82F5A4]';if(s==='Delivered'||s==='In Progress')return'text-cyan-200';if(s==='Issue')return'text-rose-200';return'text-[#A0AAA4]'}

function CoreProgress({order,size='sm'}:{order:DashboardOrder;size?:'sm'|'md'}){
  const item=order.items[0]; const c=item?.configuration??{};
  const current=typeof c.currentRank!=='undefined'?c.currentRank:c.previousRank; const target=c.targetRank;
  const cr=resolveRocketLeagueRank(current); const tr=resolveRocketLeagueRank(target);
  if(cr||tr)return <div className="flex min-w-0 items-center gap-3">{cr?<RocketLeagueRankValue value={current} label="Current" size={size==='sm'?'sm':'md'}/>:null}{cr&&tr?<ArrowRight className="size-3.5 shrink-0 text-blue-200/30"/>:null}{tr?<RocketLeagueRankValue value={target} label="Target" size={size==='sm'?'sm':'md'}/>:null}</div>;
  const wins=typeof c.wins==='number'?c.wins:null; const matches=typeof c.matches==='number'?c.matches:null;
  return <div className="flex items-center gap-5 text-[11px] text-[#A0AAA4]">{wins!==null?<span><b className="font-gaming-value mr-1 text-[14px] text-white">{wins}</b> Wins</span>:null}{matches!==null?<span><b className="font-gaming-value mr-1 text-[14px] text-white">{matches}</b> Matches</span>:null}{typeof c.platform==='string'?<span>{label(c.platform)}</span>:null}</div>
}

function OrderRow({order}:{order:DashboardOrder}){const item=order.items[0];return <Link href={`/dashboard/orders/${order.id}`} className="group grid min-h-[82px] gap-3 border-b border-white/[0.05] px-1 py-4 transition-colors hover:bg-white/[0.018] md:grid-cols-[minmax(210px,1fr)_minmax(260px,1.3fr)_150px_100px_18px] md:items-center">
  <div className="flex min-w-0 items-center gap-3"><span className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-white/[0.07]"><Image src="/game-cards/rocket-league.webp" alt="" fill sizes="40px" className="object-cover"/></span><div className="min-w-0"><p className="font-gaming-value text-[10px] font-bold text-[#7E8A84]">{order.orderNumber}</p><p className="mt-1 truncate text-[14px] font-semibold text-white">{item?.serviceName??'Gaming Service'}</p><p className="mt-0.5 text-[11px] text-[#667069]">{item?.gameName??'Rocket League'}</p></div></div>
  <CoreProgress order={order}/>
  <div><p className={`text-[11px] font-semibold ${statusTone(order)}`}>{status(order)}</p><p className="mt-1 text-[11px] text-[#667069]">{date(order.createdAt)}</p></div>
  <p className="font-gaming-value text-[14px] font-bold text-white md:text-right">{money(order.total)}</p><ArrowRight className="size-4 text-[#667069] transition-transform group-hover:translate-x-0.5"/>
</Link>}

function OrderCard({order}:{order:DashboardOrder}){const item=order.items[0];return <Link href={`/dashboard/orders/${order.id}`} className="group rounded-xl border border-white/[0.07] bg-[#0A0F0C] p-4 transition-colors hover:border-white/[0.12] hover:bg-[#0C120E]">
  <div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2.5"><span className="relative size-8 shrink-0 overflow-hidden rounded-md"><Image src="/game-cards/rocket-league.webp" alt="" fill sizes="32px" className="object-cover"/></span><div><p className="font-gaming-value text-[10px] text-[#78837D]">{order.orderNumber}</p><p className="mt-0.5 text-[14px] font-semibold text-white">{item?.serviceName??'Gaming Service'}</p></div></div><span className="font-gaming-value text-[14px] font-bold text-white">{money(order.total)}</span></div>
  <div className="mt-4 border-y border-white/[0.05] py-3"><CoreProgress order={order} size="md"/></div>
  <div className="mt-3 flex items-center justify-between gap-3"><span className={`text-[11px] font-semibold ${statusTone(order)}`}>{status(order)}</span><span className="text-[11px] text-[#667069]">{date(order.createdAt)}</span></div>
</Link>}

export function DashboardOrdersHub({orders}:{orders:DashboardOrder[]}){
  const [filter,setFilter]=useState<FilterKey>('all'); const [game,setGame]=useState('all'); const [search,setSearch]=useState(''); const [viewMode,setViewMode]=useState<ViewMode>('list');
  const filtered=useMemo(()=>{const needle=search.trim().toLowerCase();return orders.filter(order=>{const item=order.items[0];const ng=item?.gameName?.trim().toLowerCase().replace(/\s+/g,'-');return (game==='all'||ng===game)&&matches(order,filter)&&(!needle||order.orderNumber.toLowerCase().includes(needle)||item?.serviceName?.toLowerCase().includes(needle)||item?.gameName?.toLowerCase().includes(needle))})},[orders,filter,game,search]);
  const counts={all:orders.length,placed:orders.filter(o=>matches(o,'placed')).length,active:orders.filter(o=>matches(o,'active')).length,delivered:orders.filter(o=>matches(o,'delivered')).length,completed:orders.filter(o=>matches(o,'completed')).length};
  const tabs:[FilterKey,string][]=[['all','All'],['placed','Placed'],['active','In Progress'],['delivered','Delivered'],['completed','Completed']];
  return <div className="mx-auto w-full max-w-[1520px] px-4 py-8 sm:px-6 lg:px-8">
    <div><p className="font-gaming-label text-[10px] uppercase tracking-[0.14em] text-[#667069]">Customer Orders</p><h1 className="mt-1 text-[32px] font-bold tracking-[-0.045em] text-white">My Orders</h1><p className="mt-2 text-[13px] text-[#A0AAA4]">Track every service from purchase through completion.</p></div>
    <div className="mt-7 flex flex-col gap-4 border-b border-white/[0.06] lg:flex-row lg:items-end lg:justify-between">
      <div className="flex min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{tabs.map(([key,text])=><button key={key} type="button" onClick={()=>setFilter(key)} className={`relative h-11 shrink-0 px-3 text-[12px] font-semibold transition-colors ${filter===key?'text-white':'text-[#75807A] hover:text-[#B4BDB8]'}`}>{text}<span className="ml-1.5 font-gaming-value text-[10px] opacity-55">{counts[key]}</span>{filter===key?<span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#39E56F]"/>:null}</button>)}</div>
      <div className="flex items-center gap-2 pb-3 lg:pb-2"><div className="flex rounded-lg border border-white/[0.07] bg-[#0A0F0C] p-1"><button type="button" onClick={()=>setGame('all')} className={`h-8 rounded-md px-3 text-[11px] ${game==='all'?'bg-white/[0.06] text-white':'text-[#75807A]'}`}>All Games</button><button type="button" onClick={()=>setGame('rocket-league')} className={`h-8 rounded-md px-3 text-[11px] ${game==='rocket-league'?'bg-white/[0.06] text-white':'text-[#75807A]'}`}>Rocket League</button></div><label className="relative min-w-0 flex-1 lg:w-[230px]"><Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#667069]"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search orders" className="h-10 w-full rounded-lg border border-white/[0.07] bg-[#0A0F0C] pl-9 pr-3 text-[12px] text-white outline-none placeholder:text-[#667069] focus:border-white/[0.14]"/></label><div className="hidden rounded-lg border border-white/[0.07] bg-[#0A0F0C] p-1 sm:flex"><button type="button" onClick={()=>setViewMode('list')} className={`grid size-8 place-items-center rounded-md ${viewMode==='list'?'bg-white/[0.06] text-white':'text-[#667069]'}`} aria-label="List view"><List className="size-3.5"/></button><button type="button" onClick={()=>setViewMode('grid')} className={`grid size-8 place-items-center rounded-md ${viewMode==='grid'?'bg-white/[0.06] text-white':'text-[#667069]'}`} aria-label="Grid view"><Grid2X2 className="size-3.5"/></button></div></div>
    </div>
    {filtered.length?<div className={viewMode==='list'?'mt-2':'mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3'}>{filtered.map(order=>viewMode==='list'?<OrderRow key={order.id} order={order}/>:<OrderCard key={order.id} order={order}/>)}</div>:<div className="py-16 text-center"><p className="text-[14px] font-semibold text-white">No orders found</p><p className="mt-1 text-[12px] text-[#667069]">Try another status, game or search term.</p></div>}
  </div>
}
