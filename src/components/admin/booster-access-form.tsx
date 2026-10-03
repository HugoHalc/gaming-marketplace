"use client";

import { useActionState } from "react";
import { saveBoosterAccess } from "@/app/admin/boosters/actions";
import type { BoosterAccount } from "@/features/admin/lib/booster-settings";

const button = "min-h-11 rounded-lg border border-[#39E56F]/25 bg-[#39E56F]/10 px-4 py-2 text-sm font-semibold text-[#82F5A4] hover:bg-[#39E56F]/15 disabled:opacity-50";

export function BoosterAccessForm({ account, games }: { account: BoosterAccount; games: { slug: string; name: string }[] }) {
  const [state, action, pending] = useActionState(saveBoosterAccess, {});
  const [disableState, disableAction, disabling] = useActionState(saveBoosterAccess, {});
  return <div className="space-y-5">
    <form action={action} className="space-y-5">
      <input type="hidden" name="userId" value={account.user_id} />
      <input type="hidden" name="intent" value={account.is_active ? "save" : "enable"} />
      <p className="break-words text-sm text-white/65">{account.email} · {account.role === "admin" ? "Admin access will be preserved." : "Customer and booster access."}</p>
      <div><label htmlFor="payout" className="block text-sm font-medium">Payout (%)</label>
        <input id="payout" name="payout" type="number" inputMode="decimal" min="0" max="100" step="0.01" required defaultValue={(account.payout_rate_bps ?? 5000) / 100} className="mt-2 min-h-11 w-full rounded-lg border border-white/15 bg-[#101512] px-3 sm:max-w-48" />
        <p className="mt-2 text-xs text-white/55">Applies only to orders accepted after this change. Existing payouts stay unchanged.</p>
      </div>
      <fieldset><legend className="text-sm font-medium">Approved games</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">{games.map((game) => <label key={game.slug} className="flex min-h-11 items-center gap-3 rounded-lg border border-white/10 bg-[#101512] px-3 py-2 text-sm"><input type="checkbox" name="games" value={game.slug} defaultChecked={account.game_slugs.includes(game.slug)} className="size-4 shrink-0 accent-[#39E56F]" /><span>{game.name}</span></label>)}</div>
        <p className="mt-2 text-xs text-white/55">Only approved games are available for new orders. Assigned orders remain accessible when an approval is removed.</p>
      </fieldset>
      <div aria-live="polite">{state.error ? <p role="alert" className="text-sm text-rose-300">{state.error}</p> : null}{state.success ? <p className="text-sm text-[#82F5A4]">{state.success}</p> : null}</div>
      <button disabled={pending || disabling} className={`${button} w-full sm:w-auto`}>{pending ? "Saving…" : account.is_active ? "Save Changes" : "Enable Booster Access"}</button>
    </form>
    {account.is_active ? <form action={disableAction} className="space-y-3 border-t border-white/10 pt-5">
      <input type="hidden" name="userId" value={account.user_id} /><input type="hidden" name="intent" value="disable" /><input type="hidden" name="payout" value={(account.payout_rate_bps ?? 5000) / 100} />
      <label className="flex min-h-11 items-center gap-3 text-sm"><input required type="checkbox" name="confirmDisable" value="yes" className="size-4 shrink-0 accent-[#39E56F]" />Confirm disabling booster access. Active orders must be finished first.</label>
      <div aria-live="polite">{disableState.error ? <p role="alert" className="text-sm text-rose-300">{disableState.error}</p> : null}{disableState.success ? <p className="text-sm text-[#82F5A4]">{disableState.success}</p> : null}</div>
      <button disabled={pending || disabling} className="min-h-11 w-full rounded-lg border border-rose-300/25 px-4 py-2 text-sm font-semibold text-rose-200 disabled:opacity-50 sm:w-auto">{disabling ? "Disabling…" : "Disable Booster Access"}</button>
    </form> : null}
  </div>;
}
