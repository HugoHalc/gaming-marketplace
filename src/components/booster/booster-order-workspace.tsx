"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  KeyRound,
  Package,
  ReceiptText,
} from "lucide-react";
import type {
  OrderRecord,
  OrderStatusEvent,
} from "@/features/orders/types/orders";
import type { OrderWorkspaceMessage } from "@/features/orders/server/order-workspace-repository";
import { OrderLiveChat } from "@/components/dashboard/order-live-chat";
import { OrderAccountDetails } from "@/components/dashboard/order-account-details";
import { OrderOperationsPanel } from "@/components/dashboard/order-operations-panel";
import {
  resolveRocketLeagueRank,
  RocketLeagueRankValue,
} from "@/components/orders/rocket-league-rank";

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

function statusPresentation(status: string) {
  switch (status) {
    case "in_progress":
      return {
        label: "In Progress",
        className:
          "border-cyan-300/15 bg-cyan-300/[0.055] text-cyan-200",
      };
    case "completed":
      return {
        label: "Completed",
        className:
          "border-[#39E56F]/15 bg-[#39E56F]/[0.055] text-[#82F5A4]",
      };
    case "queued":
    case "paid":
      return {
        label: "Ready",
        className:
          "border-blue-300/15 bg-blue-300/[0.05] text-blue-200",
      };
    case "cancelled":
    case "refunded":
      return {
        label: formatLabel(status),
        className:
          "border-white/[0.08] bg-white/[0.025] text-[#A0AAA4]",
      };
    default:
      return {
        label: formatLabel(status),
        className:
          "border-white/[0.08] bg-white/[0.025] text-[#A0AAA4]",
      };
  }
}

function ConfigurationRows({
  configuration,
}: {
  configuration: Record<string, string | number | boolean>;
}) {
  const rows = Object.entries(configuration).filter(
    ([key]) =>
      key !== "currentRank" &&
      key !== "previousRank" &&
      key !== "targetRank",
  );

  if (!rows.length) return null;

  return (
    <section className="border-t border-white/[0.05] pt-5">
      <div className="flex items-center gap-2">
        <ReceiptText className="size-3.5 text-[#667069]" />
        <h2 className="text-[13px] font-semibold text-[#F4F7F5]">
          Configuration
        </h2>
      </div>

      <div className="mt-3 grid gap-x-8 sm:grid-cols-2">
        {rows.map(([key, value]) => (
          <div
            key={key}
            className="flex items-center justify-between gap-4 border-b border-white/[0.045] py-2.5"
          >
            <span className="text-[9px] text-[#667069]">
              {formatLabel(key)}
            </span>
            <span className="max-w-[62%] text-right text-[10px] font-semibold text-[#F4F7F5]">
              {formatValue(value)}
            </span>
          </div>
        ))}
      </div>
    </section>
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
    typeof config.currentRank !== "undefined"
      ? config.currentRank
      : config.previousRank;

  const targetValue = config.targetRank;
  const currentRank = resolveRocketLeagueRank(currentValue);
  const targetRank = resolveRocketLeagueRank(targetValue);
  const suggestedPlatform =
    typeof config.platform === "string" ? config.platform : undefined;

  const status = statusPresentation(order.status);

  return (
    <div className="min-h-[calc(100dvh-56px)] bg-[#050807]">
      <div className="mx-auto w-full max-w-[1520px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.05] pb-3">
          <Link
            href="/booster/orders?view=active"
            className="inline-flex items-center text-[10px] font-semibold text-[#A0AAA4] transition-colors hover:text-[#F4F7F5]"
          >
            <ArrowLeft className="mr-1.5 size-3.5" />
            Orders
          </Link>

          <div className="flex items-center gap-2 text-[9px] text-[#667069]">
            <span className="font-gaming-value">
              {order.orderNumber}
            </span>
            <span className="text-white/[0.12]">•</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
        </div>

        <header className="flex flex-col gap-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-white/[0.07] bg-[#0E1411]">
              <Image
                src="/game-cards/rocket-league.webp"
                alt=""
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0">
              <p className="font-gaming-label text-[8px] uppercase tracking-[0.14em] text-[#667069]">
                {item?.gameName ?? "Rocket League"}
              </p>
              <h1 className="mt-1 truncate text-xl font-semibold tracking-[-0.03em] text-[#F4F7F5]">
                {item?.serviceName ?? "Boost Order"}
              </h1>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 text-[8px] font-semibold ${status.className}`}
                >
                  {status.label}
                </span>
                <span className="text-[9px] text-[#667069]">
                  Paid order
                </span>
              </div>
            </div>
          </div>

          {(currentRank || targetRank) ? (
            <div className="flex min-w-0 items-center gap-4 lg:justify-end">
              {currentRank ? (
                <RocketLeagueRankValue
                  value={currentValue}
                  label="Current"
                  size="lg"
                />
              ) : null}

              {currentRank && targetRank ? (
                <ArrowRight className="size-4 shrink-0 text-blue-200/30" />
              ) : null}

              {targetRank ? (
                <RocketLeagueRankValue
                  value={targetValue}
                  label="Target"
                  size="lg"
                />
              ) : null}
            </div>
          ) : null}
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px] 2xl:grid-cols-[minmax(0,1fr)_410px]">
          <main className="min-w-0">
            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-gaming-label text-[8px] uppercase tracking-[0.13em] text-[#667069]">
                    Order Communication
                  </p>
                  <h2 className="mt-1 text-[15px] font-semibold text-[#F4F7F5]">
                    Conversation
                  </h2>
                </div>

                <span className="hidden text-[9px] text-[#667069] sm:block">
                  Customer ↔ Booster
                </span>
              </div>

              <OrderLiveChat
                orderId={order.id}
                currentUserId={currentUserId}
                initialMessages={initialMessages}
              />
            </section>

            <div className="mt-6 space-y-6">
              {(currentRank || targetRank) ? (
                <section className="border-t border-white/[0.05] pt-5">
                  <div className="flex items-center gap-2">
                    <Package className="size-3.5 text-[#667069]" />
                    <h2 className="text-[13px] font-semibold text-[#F4F7F5]">
                      Service Progression
                    </h2>
                  </div>

                  <div className="mt-4 flex items-center gap-5">
                    {currentRank ? (
                      <RocketLeagueRankValue
                        value={currentValue}
                        label="Current Rank"
                        size="md"
                      />
                    ) : null}

                    {currentRank && targetRank ? (
                      <ArrowRight className="size-3.5 shrink-0 text-blue-200/30" />
                    ) : null}

                    {targetRank ? (
                      <RocketLeagueRankValue
                        value={targetValue}
                        label="Target Rank"
                        size="md"
                      />
                    ) : null}
                  </div>
                </section>
              ) : null}

              <ConfigurationRows configuration={config} />

              {history.length ? (
                <section className="border-t border-white/[0.05] pt-5">
                  <div className="flex items-center gap-2">
                    <Clock3 className="size-3.5 text-[#667069]" />
                    <h2 className="text-[13px] font-semibold text-[#F4F7F5]">
                      Recent Activity
                    </h2>
                  </div>

                  <div className="mt-3 divide-y divide-white/[0.045] border-y border-white/[0.045]">
                    {history
                      .slice(-4)
                      .reverse()
                      .map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between gap-4 py-3"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <CheckCircle2 className="size-3.5 shrink-0 text-[#82F5A4]/70" />
                            <span className="truncate text-[10px] font-medium text-[#F4F7F5]">
                              {formatLabel(event.toStatus)}
                            </span>
                          </div>
                          <span className="shrink-0 text-[8px] text-[#667069]">
                            {formatDate(event.createdAt)}
                          </span>
                        </div>
                      ))}
                  </div>
                </section>
              ) : null}
            </div>
          </main>

          <aside className="min-w-0 xl:sticky xl:top-[72px] xl:self-start">
            <div className="border-y border-white/[0.06]">
              <section className="py-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-gaming-label text-[8px] uppercase tracking-[0.13em] text-[#667069]">
                      Booster Payout
                    </p>
                    <p className="font-gaming-value mt-1 text-2xl font-bold tracking-[-0.02em] text-[#82F5A4]">
                      {formatMoney(boosterPayout)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-[8px] font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                <dl className="mt-4 divide-y divide-white/[0.045]">
                  <div className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-[9px] text-[#667069]">
                      Order
                    </dt>
                    <dd className="font-gaming-value text-[10px] font-bold text-[#F4F7F5]">
                      {order.orderNumber}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-[9px] text-[#667069]">
                      Payment
                    </dt>
                    <dd className="text-[10px] font-semibold text-[#82F5A4]">
                      {formatLabel(order.paymentStatus)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-[9px] text-[#667069]">
                      Service
                    </dt>
                    <dd className="max-w-[220px] truncate text-right text-[10px] font-semibold text-[#F4F7F5]">
                      {item?.serviceName ?? "Gaming Service"}
                    </dd>
                  </div>
                  {suggestedPlatform ? (
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-[9px] text-[#667069]">
                        Platform
                      </dt>
                      <dd className="text-[10px] font-semibold text-[#F4F7F5]">
                        {formatLabel(suggestedPlatform)}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </section>

              <section className="border-t border-white/[0.05] py-4">
                <div className="mb-2 flex items-center gap-2">
                  <KeyRound className="size-3.5 text-[#667069]" />
                  <div>
                    <p className="font-gaming-label text-[8px] uppercase tracking-[0.13em] text-[#667069]">
                      Secure Account Access
                    </p>
                    <p className="mt-0.5 text-[9px] text-[#A0AAA4]">
                      Customer credentials for this order
                    </p>
                  </div>
                </div>

                <OrderAccountDetails
                  orderId={order.id}
                  canEdit={false}
                />
              </section>

              <section className="border-t border-white/[0.05]">
                <OrderOperationsPanel
                  orderId={order.id}
                  canManage
                  suggestedPlatform={suggestedPlatform}
                  orderStatus={order.status}
                />
              </section>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
