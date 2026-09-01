"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Gamepad2,
  KeyRound,
} from "lucide-react";
import type { OrderRecord, OrderStatusEvent } from "@/features/orders/types/orders";
import type { OrderWorkspaceMessage } from "@/features/orders/server/order-workspace-repository";
import { OrderLiveChat } from "@/components/dashboard/order-live-chat";
import { OrderAccountDetails } from "@/components/dashboard/order-account-details";
import { OrderOperationsPanel } from "@/components/dashboard/order-operations-panel";

const rankAssets: Record<string, string> = {
  bronze: "/ranks/rocket-league/bronze.png",
  silver: "/ranks/rocket-league/silver.png",
  gold: "/ranks/rocket-league/gold.png",
  platinum: "/ranks/rocket-league/platinum.png",
  diamond: "/ranks/rocket-league/diamond.png",
  champion: "/ranks/rocket-league/champion.png",
  "grand-champion": "/ranks/rocket-league/grand-champion.png",
  "supersonic-legend": "/ranks/rocket-league/supersonic-legend.png",
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function formatValue(value: string | number | boolean) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === "play-with-booster") return "Play With Booster";
  if (value === "account") return "Account Boost";
  return formatLabel(String(value));
}

function rankFamily(value: string) {
  if (value === "supersonic-legend") return value;
  return value.replace(/-\d$/, "");
}

function rankLabel(value: string) {
  if (value === "unrated") return "Unrated";
  if (value === "supersonic-legend") return "Supersonic Legend";
  const tier = value.match(/-(\d)$/)?.[1];
  const family = rankFamily(value)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  const roman = tier === "1" ? "I" : tier === "2" ? "II" : tier === "3" ? "III" : "";
  return `${family}${roman ? ` ${roman}` : ""}`;
}

function isRank(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (value === "unrated" || value === "supersonic-legend") return true;
  return Boolean(rankAssets[rankFamily(value)] && /-\d$/.test(value));
}

function RankCompact({ label, rank }: { label: string; rank: string }) {
  const asset = rankAssets[rankFamily(rank)];
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      {asset ? (
        <Image
          src={asset}
          alt=""
          width={38}
          height={38}
          className="size-9 shrink-0 object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,.45)]"
        />
      ) : null}
      <div className="min-w-0">
        <p className="font-gaming-label text-[8px] uppercase tracking-[0.12em] text-[#667069]">
          {label}
        </p>
        <p className="font-gaming-value mt-0.5 truncate text-[11px] font-bold text-[#F4F7F5]">
          {rankLabel(rank)}
        </p>
      </div>
    </div>
  );
}

export function BoosterOrderWorkspace({
  order,
  history,
  currentUserId,
  initialMessages,
  boosterPayout,
}: {
  order: OrderRecord;
  history: OrderStatusEvent[];
  currentUserId: string;
  initialMessages: OrderWorkspaceMessage[];
  boosterPayout: number;
}) {
  const item = order.items[0];
  const config = item?.configuration ?? {};
  const currentValue =
    typeof config.currentRank !== "undefined" ? config.currentRank : config.previousRank;
  const targetValue = config.targetRank;
  const suggestedPlatform =
    typeof config.platform === "string" ? config.platform : undefined;
  const currentRank = isRank(currentValue) ? currentValue : null;
  const targetRank = isRank(targetValue) ? targetValue : null;

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-[#050807]">
      <div className="mx-auto w-full max-w-[1520px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/booster?view=active"
            className="inline-flex items-center text-[10px] font-semibold text-[#A0AAA4] transition-colors hover:text-[#F4F7F5]"
          >
            <ArrowLeft className="mr-1.5 size-3.5" />
            Active Orders
          </Link>

          <div className="flex items-center gap-2 text-[9px] text-[#667069]">
            <span>{order.orderNumber}</span>
            <span className="text-white/[0.12]">•</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
        </div>

        <div className="grid min-h-[720px] gap-4 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_390px]">
          <main className="min-w-0">
            <section className="mb-4 flex flex-col gap-4 rounded-xl border border-white/[0.06] bg-[#0A0F0C] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#39E56F]/10 bg-[#39E56F]/[0.035] text-[#82F5A4]">
                  <Gamepad2 className="size-4" />
                </span>

                <div className="min-w-0">
                  <p className="font-gaming-label text-[8px] uppercase tracking-[0.14em] text-[#667069]">
                    {item?.gameName ?? "Rocket League"}
                  </p>
                  <h1 className="mt-0.5 truncate text-[16px] font-semibold tracking-[-0.02em] text-[#F4F7F5]">
                    {item?.serviceName ?? "Boost Order"}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-5">
                {currentRank ? <RankCompact label="Current" rank={currentRank} /> : null}
                {currentRank && targetRank ? (
                  <ArrowRight className="size-3.5 shrink-0 text-[#667069]" />
                ) : null}
                {targetRank ? <RankCompact label="Target" rank={targetRank} /> : null}
              </div>
            </section>

            <OrderLiveChat
              orderId={order.id}
              currentUserId={currentUserId}
              initialMessages={initialMessages}
            />

            <section className="mt-4 rounded-xl border border-white/[0.06] bg-[#0A0F0C] p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-[#667069]" />
                <h2 className="text-[11px] font-semibold text-[#F4F7F5]">Order Configuration</h2>
              </div>

              <div className="mt-3 grid gap-x-8 gap-y-0 sm:grid-cols-2">
                {Object.entries(config).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4 border-b border-white/[0.045] py-2.5"
                  >
                    <span className="text-[9px] text-[#667069]">{formatLabel(key)}</span>
                    <span className="text-right text-[10px] font-semibold text-[#F4F7F5]">
                      {formatValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </main>

          <aside className="min-w-0 space-y-4 xl:sticky xl:top-20 xl:self-start">
            <section className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#0D120F]">
              <div className="border-b border-white/[0.05] px-4 py-3">
                <p className="font-gaming-label text-[8px] uppercase tracking-[0.14em] text-[#667069]">
                  Order Details
                </p>
              </div>

              <div className="p-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[9px] text-[#667069]">Booster payout</p>
                    <p className="font-gaming-value mt-1 text-2xl font-bold text-[#82F5A4]">
                      {formatMoney(boosterPayout)}
                    </p>
                  </div>

                  <span className="rounded-lg border border-[#39E56F]/12 bg-[#39E56F]/[0.045] px-2.5 py-1.5 text-[9px] font-semibold text-[#82F5A4]">
                    {formatLabel(order.status)}
                  </span>
                </div>

                <dl className="mt-4 divide-y divide-white/[0.045]">
                  <div className="flex items-center justify-between py-2.5">
                    <dt className="text-[9px] text-[#667069]">Order</dt>
                    <dd className="font-gaming-value text-[10px] font-bold text-[#F4F7F5]">
                      {order.orderNumber}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <dt className="text-[9px] text-[#667069]">Payment</dt>
                    <dd className="text-[10px] font-semibold text-[#82F5A4]">
                      {formatLabel(order.paymentStatus)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <dt className="text-[9px] text-[#667069]">Service</dt>
                    <dd className="max-w-[190px] truncate text-right text-[10px] font-semibold text-[#F4F7F5]">
                      {item?.serviceName ?? "Gaming Service"}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            <section className="rounded-xl border border-white/[0.07] bg-[#0D120F] p-4">
              <div className="mb-1 flex items-center gap-2">
                <KeyRound className="size-3.5 text-[#667069]" />
                <p className="font-gaming-label text-[8px] uppercase tracking-[0.14em] text-[#667069]">
                  Secure Access
                </p>
              </div>
              <OrderAccountDetails orderId={order.id} canEdit={false} />
            </section>

            <section className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#0D120F]">
              <OrderOperationsPanel
                orderId={order.id}
                canManage
                suggestedPlatform={suggestedPlatform}
                orderStatus={order.status}
              />
            </section>

            {history.length ? (
              <section className="rounded-xl border border-white/[0.07] bg-[#0D120F] p-4">
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="size-3.5 text-[#667069]" />
                  <p className="font-gaming-label text-[8px] uppercase tracking-[0.14em] text-[#667069]">
                    Order History
                  </p>
                </div>
                <div className="mt-3 space-y-2.5">
                  {history.slice(-4).reverse().map((event) => (
                    <div key={event.id} className="border-l border-white/[0.07] pl-3">
                      <p className="text-[9px] font-semibold text-[#F4F7F5]">
                        {formatLabel(event.toStatus)}
                      </p>
                      <p className="mt-0.5 text-[8px] text-[#667069]">
                        {formatDate(event.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
