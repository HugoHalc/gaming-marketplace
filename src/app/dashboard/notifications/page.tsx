import Link from "next/link";
import { Bell, BellRing, CheckCheck, CircleDot } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/marketing/site-header";
import { requireUser } from "@/features/auth/server/auth";
import { listCurrentUserNotifications } from "@/features/notifications/server/notification-repository";
import { markAllNotificationsReadAction, markNotificationReadAction } from "./actions";

export const metadata = { title: "Notifications | VantaBoost" };
export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default async function NotificationsPage() {
  await requireUser();
  const notifications = await listCurrentUserNotifications();
  const unread = notifications.filter((item) => !item.readAt).length;

  return <><SiteHeader/><main className="py-12 sm:py-16"><Container>
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div><p className="text-sm font-semibold text-violet-300">ACCOUNT</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Notifications</h1><p className="mt-3 text-[var(--muted-foreground)]">Payment and fulfillment updates for your orders.</p></div>
      {unread > 0 ? <form action={markAllNotificationsReadAction}><button className="inline-flex items-center rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/5"><CheckCheck className="mr-2 size-4"/>Mark all as read</button></form> : null}
    </div>

    <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[var(--surface)]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6"><div className="flex items-center gap-2"><BellRing className="size-4 text-violet-300"/><span className="text-sm font-semibold">Activity</span></div><span className="text-xs text-[var(--muted-foreground)]">{unread} unread</span></div>
      {notifications.length === 0 ? <div className="px-6 py-16 text-center"><Bell className="mx-auto size-8 text-white/25"/><h2 className="mt-4 font-semibold">No notifications yet</h2><p className="mt-2 text-sm text-[var(--muted-foreground)]">Order updates will appear here automatically.</p><Link href="/dashboard/orders" className="mt-5 inline-flex text-sm font-semibold text-violet-300">View orders</Link></div> : <div className="divide-y divide-white/[0.07]">{notifications.map((notification) => {
        const href = notification.href ?? "/dashboard/notifications";
        return <form key={notification.id} action={markNotificationReadAction}><input type="hidden" name="id" value={notification.id}/><input type="hidden" name="href" value={href}/><button className={`grid w-full grid-cols-[auto_1fr_auto] gap-4 px-5 py-5 text-left transition hover:bg-white/[0.025] sm:px-6 ${notification.readAt ? "opacity-70" : "bg-violet-400/[0.035]"}`}>
          <span className={`mt-1 grid size-9 place-items-center rounded-full border ${notification.readAt ? "border-white/10 bg-white/[0.03]" : "border-violet-300/20 bg-violet-400/10"}`}>{notification.readAt ? <Bell className="size-4 text-white/45"/> : <CircleDot className="size-4 text-violet-300"/>}</span>
          <span><span className="block text-sm font-semibold text-white">{notification.title}</span><span className="mt-1 block text-sm text-[var(--muted-foreground)]">{notification.message}</span><span className="mt-2 block text-xs text-white/35">{formatDate(notification.createdAt)}</span></span>
          {!notification.readAt ? <span className="mt-2 size-2 rounded-full bg-violet-400" aria-label="Unread"/> : <span/>}
        </button></form>;
      })}</div>}
    </div>
  </Container></main></>;
}
