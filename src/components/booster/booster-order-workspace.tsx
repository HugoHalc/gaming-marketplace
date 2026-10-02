"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import type {
  OrderRecord,
  OrderStatusEvent,
} from "@/features/orders/types/orders";
import type { OrderWorkspaceMessage } from "@/features/orders/server/order-workspace-repository";
import { OrderLiveChat } from "@/components/dashboard/order-live-chat";
import { OrderAccountDetails } from "@/components/dashboard/order-account-details";
import { getAccountDetailsMode } from "@/features/orders/presentation/account-details-mode";
import { OrderOperationsPanel } from "@/components/dashboard/order-operations-panel";
import { gameCardAsset } from "@/components/orders/game-order-presentation";
import { OrderWorkspaceConfiguration } from "@/components/orders/order-workspace-configuration";

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
    default:
      return {
        label: formatLabel(status),
        className:
          "border-white/[0.08] bg-white/[0.025] text-[#A0AAA4]",
      };
  }
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

  const accountDetailsMode = getAccountDetailsMode(item?.gameName ?? "", config);
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

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#667069]">
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
                src={gameCardAsset(item?.gameName)}
                alt=""
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0">
              <p className="font-gaming-label text-[8px] uppercase tracking-[0.14em] text-[#667069]">
                {item?.gameName ?? "Gaming service"}
              </p>
              <h1 className="mt-1 break-words text-xl font-semibold tracking-[-0.03em] text-[#F4F7F5]">
                {item?.serviceName ?? "Boost Order"}
              </h1>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 text-[8px] font-semibold ${status.className}`}
                >
                  {status.label}
                </span>
                <span className="text-xs text-[#A4AEA8]">
                  Paid order
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px] 2xl:grid-cols-[minmax(0,1fr)_410px]">
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

          <aside className="min-w-0 xl:self-start">
            <div className="space-y-3">
              <OrderOperationsPanel
              orderId={order.id}
              canManage={true}
              suggestedPlatform={suggestedPlatform}
              orderStatus={order.status}
              details={<><p className="mb-2 text-xs font-semibold text-white">{item?.gameName}</p>
                <div className="flex flex-wrap items-end justify-between gap-4">
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

                <dl className="mt-4 space-y-1">
                  <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 py-1">
                    <dt className="text-xs text-[#A4AEA8]">Order</dt>
                    <dd className="text-right font-gaming-value text-xs font-bold text-[#F4F7F5]">
                      {order.orderNumber}
                    </dd>
                  </div>
                  <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 py-1">
                    <dt className="text-xs text-[#A4AEA8]">Payment</dt>
                    <dd className="text-right text-xs font-semibold text-[#82F5A4]">
                      {formatLabel(order.paymentStatus)}
                    </dd>
                  </div>
                  <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 py-1">
                    <dt className="text-xs text-[#A4AEA8]">Service</dt>
                    <dd className="min-w-0 break-words text-right text-xs font-semibold text-[#F4F7F5]">
                      {item?.serviceName ?? "Gaming Service"}
                    </dd>
                  </div>
                  
                </dl>
                {item ? (
                  <div className="mt-4">
                    <OrderWorkspaceConfiguration gameName={item.gameName} configuration={item.configuration} priceBreakdown={item.priceBreakdown} rankSize="lg" />
                  </div>
                ) : null}
              </>}
              accountDetails={<OrderAccountDetails orderId={order.id} canEdit={false} mode={accountDetailsMode} asCard />}
            />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
