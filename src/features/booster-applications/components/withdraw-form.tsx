"use client";
import { useActionState } from "react";
import { withdrawApplication } from "@/app/become-a-booster/actions";
import { applicationButtonClass } from "../types";

export function WithdrawApplicationForm({
  id,
  version,
}: {
  id: string;
  version: number;
}) {
  const [state, action, pending] = useActionState(withdrawApplication, {});
  return (
    <form
      action={action}
      className="mt-5 space-y-3 border-t border-white/10 pt-4"
    >
      <input type="hidden" name="applicationId" value={id} />
      <input type="hidden" name="version" value={version} />
      <label className="flex min-h-11 items-center gap-3 text-sm text-white/75">
        <input
          type="checkbox"
          name="confirmWithdraw"
          value="yes"
          required
          className="size-4 shrink-0 accent-[#39E56F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#82F5A4]"
        />
        I want to withdraw this application.
      </label>
      <div aria-live="polite">
        {state.error ? (
          <p role="alert" className="text-sm text-rose-200">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-[#82F5A4]">{state.success}</p>
        ) : null}
      </div>
      <button
        disabled={pending}
        className={`${applicationButtonClass} w-full sm:w-auto`}
      >
        {pending ? "Withdrawing…" : "Withdraw Application"}
      </button>
    </form>
  );
}
