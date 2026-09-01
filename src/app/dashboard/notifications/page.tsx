import Link from "next/link";
import { Bell, BellRing, CheckCheck, CircleDot } from "lucide-react";
import { listCurrentUserNotifications } from "@/features/notifications/server/notification-repository";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "./actions";

export const metadata = { title: "Notifications | BoostingPedia" };
export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function NotificationsPage() {
  const notifications = await listCurrentUserNotifications();
  const unread = notifications.filter((item) => !item.readAt).length;

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-200/60">
            Account
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#F4F7F5] sm:text-3xl">
            Notifications
          </h1>
          <p className="mt-2 text-sm text-[#A0AAA4]">
            Payment and fulfillment updates for your orders.
          </p>
        </div>

        {unread > 0 ? (
          <form action={markAllNotificationsReadAction}>
            <button className="inline-flex items-center rounded-xl border border-white/[0.08] bg-[#0E1411] px-4 py-2.5 text-xs font-semibold text-[#F4F7F5] hover:bg-[#131B17]">
              <CheckCheck className="mr-2 size-4" />
              Mark all as read
            </button>
          </form>
        ) : null}
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.4rem] border border-white/[0.07] bg-[#0E1411]">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <BellRing className="size-4 text-blue-200/65" />
            <span className="text-sm font-semibold text-[#F4F7F5]">
              Activity
            </span>
          </div>
          <span className="text-xs text-[#667069]">{unread} unread</span>
        </div>

        {notifications.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Bell className="mx-auto size-7 text-[#667069]" />
            <h2 className="mt-4 text-sm font-semibold text-[#F4F7F5]">
              No notifications yet
            </h2>
            <p className="mt-2 text-xs text-[#A0AAA4]">
              Order updates will appear here automatically.
            </p>
            <Link
              href="/dashboard/orders"
              className="mt-5 inline-flex text-xs font-semibold text-blue-200/75"
            >
              View orders
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {notifications.map((notification) => {
              const href = notification.href ?? "/dashboard/notifications";
              return (
                <form key={notification.id} action={markNotificationReadAction}>
                  <input type="hidden" name="id" value={notification.id} />
                  <input type="hidden" name="href" value={href} />
                  <button
                    className={`grid w-full grid-cols-[auto_1fr_auto] gap-4 px-5 py-5 text-left transition-colors hover:bg-white/[0.025] sm:px-6 ${
                      notification.readAt ? "opacity-70" : "bg-blue-400/[0.025]"
                    }`}
                  >
                    <span
                      className={`mt-1 grid size-9 place-items-center rounded-full border ${
                        notification.readAt
                          ? "border-white/[0.08] bg-white/[0.02]"
                          : "border-blue-300/[0.16] bg-blue-400/[0.06]"
                      }`}
                    >
                      {notification.readAt ? (
                        <Bell className="size-4 text-[#667069]" />
                      ) : (
                        <CircleDot className="size-4 text-blue-200/70" />
                      )}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[#F4F7F5]">
                        {notification.title}
                      </span>
                      <span className="mt-1 block text-sm text-[#A0AAA4]">
                        {notification.message}
                      </span>
                      <span className="mt-2 block text-[10px] text-[#667069]">
                        {formatDate(notification.createdAt)}
                      </span>
                    </span>
                    {!notification.readAt ? (
                      <span
                        className="mt-2 size-2 rounded-full bg-[#39E56F]"
                        aria-label="Unread"
                      />
                    ) : (
                      <span />
                    )}
                  </button>
                </form>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
