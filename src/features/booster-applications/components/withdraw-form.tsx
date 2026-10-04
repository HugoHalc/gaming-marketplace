"use client";
import { useActionState } from "react";
import { withdrawApplication } from "@/app/become-a-booster/actions";
import { applicationButtonClass } from "../types";
import {
  applicationChoiceClass,
  applicationCheckboxClass,
  applicationCheckboxIndicatorClass,
} from "./checkbox-styles";

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
      <label className={applicationChoiceClass}>
        <input
          type="checkbox"
          name="confirmWithdraw"
          value="yes"
          required
          className={applicationCheckboxClass}
        />
        <span aria-hidden="true" className={applicationCheckboxIndicatorClass} />
        <span className="min-w-0 break-words">
          I want to withdraw this application.
        </span>
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
