import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/marketing/site-header";
import { requireUser } from "@/features/auth/server/auth";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { getCurrentUserOrder, getCurrentUserOrderHistory } from "@/features/orders/server/order-repository";

export const dynamic = "force-dynamic";

function formatMoney(value: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value); }
function formatLabel(value: string) { return value.replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").replace(/^./, (letter) => letter.toUpperCase()); }
function formatValue(value: string | number | boolean) { return typeof value === "boolean" ? (value ? "Yes" : "No") : String(value); }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkout?: string; paymentError?: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const order = await getCurrentUserOrder(id);
  if (!order) notFound();
  const history = await getCurrentUserOrderHistory(order.id);
  const item = order.items[0];
  const canPay = order.status === "pending_payment" && order.paymentStatus !== "paid";

  return <><SiteHeader/><main className="py-12 sm:py-16"><Container>
    <Link href="/dashboard/orders" className="inline-flex items-center text-sm text-[var(--muted-foreground)] hover:text-white"><ArrowLeft className="mr-2 size-4"/>Back to orders</Link>

    {query.checkout === "success" ? <div className="mt-6 rounded-2xl border border-emerald-300/20 bg-emerald-400/[0.07] p-4 text-sm text-emerald-100">Payment submitted successfully. Stripe is confirming the payment and this page will reflect the verified status.</div> : null}
    {query.checkout === "cancelled" ? <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-400/[0.07] p-4 text-sm text-amber-100">Checkout was cancelled. Your order is still saved and you can try payment again.</div> : null}
    {query.paymentError ? <div className="mt-6 rounded-2xl border border-rose-300/20 bg-rose-400/[0.07] p-4 text-sm text-rose-100">We could not start secure checkout. Please try again.</div> : null}

    <div className="mt-6 flex flex-wrap items-start justify-between gap-5"><div><div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{order.orderNumber}</h1><OrderStatusBadge status={order.status}/></div><p className="mt-2 text-sm text-[var(--muted-foreground)]">Created {formatDate(order.createdAt)}</p></div><div className="text-right"><p className="text-xs text-[var(--muted-foreground)]">Order total</p><p className="mt-1 text-3xl font-bold">{formatMoney(order.total)}</p><p className="mt-1 text-xs text-white/40">{order.paymentStatus === "paid" ? "Paid" : order.paymentStatus === "pending" ? "Payment pending" : "Payment not completed"}</p></div></div>

    {canPay ? <section className="mt-6 rounded-3xl border border-violet-300/20 bg-gradient-to-br from-violet-500/[0.12] to-transparent p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div><div className="flex items-center gap-2 text-sm font-semibold text-violet-200"><ShieldCheck className="size-4"/>Secure checkout</div><h2 className="mt-2 text-xl font-semibold">Complete payment with Stripe</h2><p className="mt-2 max-w-2xl text-sm text-[var(--muted-foreground)]">Your stored order total is validated on the server. Payment details are entered on Stripe&apos;s hosted checkout and never pass through VantaBoost.</p></div>
        <form action="/api/checkout" method="post" className="shrink-0"><input type="hidden" name="orderId" value={order.id}/><button className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--primary)] px-6 text-sm font-semibold text-white transition hover:brightness-110"><CreditCard className="mr-2 size-4"/>Pay {formatMoney(order.total)}</button></form>
      </div>
    </section> : null}

    {order.paymentStatus === "paid" ? <section className="mt-6 rounded-3xl border border-emerald-300/20 bg-emerald-400/[0.06] p-5 sm:p-6"><div className="flex gap-3"><CheckCircle2 className="mt-0.5 size-5 text-emerald-300"/><div><p className="font-semibold text-emerald-100">Payment verified</p><p className="mt-1 text-sm text-emerald-100/65">Stripe confirmed this payment. The order can now move into the fulfillment queue.</p></div></div></section> : null}

    <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
      <section className="rounded-3xl border border-white/10 bg-[var(--surface)] p-6">
        <p className="text-xs font-semibold text-violet-300">SERVICE</p><h2 className="mt-2 text-2xl font-semibold">{item?.serviceName ?? "Gaming service"}</h2><p className="mt-1 text-sm text-[var(--muted-foreground)]">{item?.gameName}</p>
        {item ? <><div className="my-6 h-px bg-white/10"/><h3 className="text-sm font-semibold">Configuration</h3><dl className="mt-4 grid gap-3 sm:grid-cols-2">{Object.entries(item.configuration).map(([key,value]) => <div key={key} className="rounded-xl border border-white/[0.07] bg-black/15 p-3"><dt className="text-xs text-[var(--muted-foreground)]">{formatLabel(key)}</dt><dd className="mt-1 text-sm font-medium text-white">{formatValue(value)}</dd></div>)}</dl>
        <div className="my-6 h-px bg-white/10"/><h3 className="text-sm font-semibold">Price breakdown</h3><div className="mt-4 space-y-3">{item.priceBreakdown.map((line,index) => <div key={`${line.label}-${index}`} className="flex justify-between gap-4 text-sm"><span className="text-[var(--muted-foreground)]">{line.label}</span><span className={line.amount < 0 ? "text-emerald-300" : "text-white"}>{line.amount < 0 ? "−" : ""}{formatMoney(Math.abs(line.amount))}</span></div>)}</div><p className="mt-5 text-[10px] text-white/30">Pricing rules: {item.ruleSetVersion}</p></> : null}
      </section>

      <aside className="rounded-3xl border border-white/10 bg-[var(--surface)] p-6"><p className="text-xs font-semibold text-violet-300">STATUS</p><h2 className="mt-2 text-xl font-semibold">Order timeline</h2><div className="mt-6 space-y-5">{history.map((event) => <div key={event.id} className="flex gap-3"><span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-emerald-300/15 bg-emerald-400/[0.07]"><CheckCircle2 className="size-3.5 text-emerald-300"/></span><div><p className="text-sm font-medium">{formatLabel(event.toStatus)}</p><p className="mt-1 text-xs text-[var(--muted-foreground)]">{formatDate(event.createdAt)}</p>{event.note ? <p className="mt-2 text-xs text-white/60">{event.note}</p> : null}</div></div>)}</div></aside>
    </div>
  </Container></main></>;
}
