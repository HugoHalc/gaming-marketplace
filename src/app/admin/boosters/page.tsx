import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/marketing/site-header";
import { BoosterAccessForm } from "@/components/admin/booster-access-form";
import { requireAdmin } from "@/features/auth/server/auth";
import { publicGameNavigation } from "@/features/catalog/data/launch-games";
import { listBoosterAccounts } from "@/features/admin/server/admin-boosters";
import { UUID_PATTERN } from "@/features/admin/lib/booster-settings";

export const metadata = { title: "Booster Management | BoostingPedia" };
export const dynamic = "force-dynamic";
const link = "inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5";

export default async function BoostersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; add?: string; user?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const q = (params.q ?? "").slice(0, 100);
  const page = Math.min(100000, Math.max(0, Number.parseInt(params.page ?? "0", 10) || 0));
  const adding = params.add === "1";
  const userId = params.user && UUID_PATTERN.test(params.user) ? params.user : undefined;
  const { accounts, hasNextPage } = await listBoosterAccounts(q, page, !adding);
  const selected = userId ? (await listBoosterAccounts("", 0, false, userId)).accounts[0] : undefined;
  const games = publicGameNavigation.map((game) => ({ slug: game.slug, name: game.name === "VALORANT" ? "Valorant" : game.name }));
  const paginationHref = (value: number) => `/admin/boosters?${new URLSearchParams({ q, page: String(value), ...(adding ? { add: "1" } : {}) })}`;
  return <><SiteHeader /><main className="py-8"><Container>
    <nav aria-label="Administration" className="mb-6 flex flex-wrap gap-2"><Link href="/admin" className={link}>Orders</Link><Link href="/admin/boosters" aria-current="page" className={`${link} border-[#39E56F]/25 text-[#82F5A4]`}>Boosters</Link><Link href="/admin/support" className={link}>Support</Link></nav>
    <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-semibold tracking-wider text-[#82F5A4]">ADMINISTRATION</p><h1 className="mt-2 text-2xl font-semibold">Booster management</h1><p className="mt-2 text-sm text-white/55">Manage access, future payouts and approved games.</p></div><Link href="/admin/boosters?add=1" className={`${link} border-[#39E56F]/25 bg-[#39E56F]/10 text-[#82F5A4]`}>Add Booster</Link></header>
    {selected ? <section className="mt-6 min-w-0 rounded-xl border border-[#39E56F]/15 bg-[#151B17] p-4 sm:p-6"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="break-words text-lg font-semibold">{selected.is_active ? "Edit Booster" : "Enable Booster Access"} · {selected.full_name || selected.gamer_tag || selected.email}</h2><Link href="/admin/boosters" className={link}>Close</Link></div><BoosterAccessForm key={`${selected.user_id}:${selected.is_active}`} account={selected} games={games} /></section> : params.user ? <p role="alert" className="mt-5 text-sm text-rose-300">Account not found.</p> : null}
    <section className="mt-6"><h2 className="mb-3 text-lg font-semibold">{adding ? "Find an existing account" : "Boosters"}</h2><form className="flex flex-col gap-2 sm:flex-row" role="search"><input type="hidden" name="add" value={adding ? "1" : "0"} /><label className="sr-only" htmlFor="account-search">Search by email, name or gamer tag</label><input id="account-search" name="q" maxLength={100} defaultValue={q} placeholder="Email, name or gamer tag" className="min-h-11 min-w-0 flex-1 rounded-lg border border-white/15 bg-[#101512] px-3 text-sm" /><button className={link}>Search</button>{adding ? <Link href="/admin/boosters" className={link}>Back to boosters</Link> : null}</form>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">{accounts.map((account) => <article key={account.user_id} className="min-w-0 rounded-xl border border-white/10 bg-[#151B17] p-4"><div className="flex flex-wrap justify-between gap-3"><div className="min-w-0"><h3 className="break-words font-semibold">{account.full_name || account.gamer_tag || "Account"}</h3><p className="mt-1 break-all text-sm text-white/55">{account.email}</p>{account.gamer_tag ? <p className="mt-1 break-words text-xs text-white/55">{account.gamer_tag}</p> : null}</div><Link href={`/admin/boosters?user=${account.user_id}`} className={link}>{adding ? "Select" : "Edit"}</Link></div><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-white/45">Status</dt><dd>{account.is_active ? "Active" : account.is_active === false ? "Disabled" : "No booster access"}{account.role === "admin" ? " · Admin" : ""}</dd></div><div><dt className="text-xs text-white/45">Payout</dt><dd>{account.payout_rate_bps === null ? "—" : `${account.payout_rate_bps / 100}%`}</dd></div><div className="col-span-2"><dt className="text-xs text-white/45">Approved games</dt><dd className="mt-1 break-words">{account.game_slugs.map((slug) => games.find((game) => game.slug === slug)?.name).filter(Boolean).join(", ") || "No games approved"}</dd></div><div className="col-span-2"><dt className="text-xs text-white/45">Activated (UTC)</dt><dd>{account.activated_at ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(account.activated_at)) : "Not recorded"}</dd></div></dl></article>)}</div>
      {!accounts.length ? <p className="py-8 text-sm text-white/55">No accounts match this search.</p> : null}
      <nav aria-label="Account pages" className="mt-4 flex flex-wrap items-center gap-3">{page > 0 ? <Link href={paginationHref(page - 1)} className={link}>Previous</Link> : null}<span className="text-sm text-white/55">Page {page + 1}</span>{hasNextPage ? <Link href={paginationHref(page + 1)} className={link}>Next</Link> : null}</nav>
    </section>
  </Container></main></>;
}
