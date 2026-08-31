import Link from "next/link";
import { Bell, ListChecks, ShieldCheck, UserRound } from "lucide-react";
import { requireUser } from "@/features/auth/server/auth";
import { SiteHeader } from "@/components/marketing/site-header";
import { Container } from "@/components/layout/container";
import { listCurrentUserOrders } from "@/features/orders/server/order-repository";
import { getUnreadNotificationCount } from "@/features/notifications/server/notification-repository";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const identity = await requireUser();
  const [orders, unread] = await Promise.all([listCurrentUserOrders(), getUnreadNotificationCount()]);
  const activeOrders = orders.filter((order) => ["paid", "queued", "in_progress"].includes(order.status)).length;
  const pendingPayment = orders.filter((order) => order.status === "pending_payment").length;

  return <><SiteHeader/><main className="py-12 sm:py-16"><Container>
    <p className="text-sm font-semibold text-violet-300">ACCOUNT</p>
    <h1 className="mt-2 text-4xl font-semibold tracking-tight">Welcome{identity.profile?.full_name ? `, ${identity.profile.full_name.split(" ")[0]}` : ""}</h1>
    <p className="mt-3 max-w-2xl text-[var(--muted-foreground)]">Track active services, payment status, and fulfillment updates from one secure account.</p>

    <section className="mt-8 grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-5"><p className="text-xs text-[var(--muted-foreground)]">Active services</p><p className="mt-2 text-3xl font-semibold">{activeOrders}</p></div>
      <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-5"><p className="text-xs text-[var(--muted-foreground)]">Awaiting payment</p><p className="mt-2 text-3xl font-semibold">{pendingPayment}</p></div>
      <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-5"><p className="text-xs text-[var(--muted-foreground)]">Unread updates</p><p className="mt-2 text-3xl font-semibold">{unread}</p></div>
    </section>

    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Link href="/dashboard/orders" className="rounded-2xl border border-white/10 bg-[var(--surface)] p-5 transition hover:border-white/20"><ListChecks className="size-5 text-violet-300"/><p className="mt-4 font-semibold">Orders</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">Review active services and your complete order history.</p></Link>
      <Link href="/dashboard/notifications" className="relative rounded-2xl border border-white/10 bg-[var(--surface)] p-5 transition hover:border-white/20"><Bell className="size-5 text-violet-300"/>{unread > 0 ? <span className="absolute right-4 top-4 rounded-full bg-violet-500 px-2 py-0.5 text-[10px] font-bold text-white">{unread}</span> : null}<p className="mt-4 font-semibold">Notifications</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">See payment and fulfillment updates as they happen.</p></Link>
      <Link href="/dashboard/profile" className="rounded-2xl border border-white/10 bg-[var(--surface)] p-5 transition hover:border-white/20"><UserRound className="size-5 text-violet-300"/><p className="mt-4 font-semibold">Profile</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">Update your gaming identity and contact details.</p></Link>
      {identity.profile?.role === "admin" ? <Link href="/admin" className="rounded-2xl border border-violet-400/20 bg-violet-400/10 p-5 transition hover:bg-violet-400/[0.13]"><ShieldCheck className="size-5 text-violet-200"/><p className="mt-4 font-semibold">Admin</p><p className="mt-1 text-sm text-violet-200/70">Open order operations and fulfillment controls.</p></Link> : null}
    </div>

    <form action="/auth/signout" method="post" className="mt-8"><button className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/5">Sign out</button></form>
  </Container></main></>;
}
