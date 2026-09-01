"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function ClaimOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function claim() {
    if (claiming) return;
    setClaiming(true);
    setError(null);

    try {
      const response = await fetch(`/api/booster/orders/${orderId}/claim`, {
        method: "POST",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "This order is no longer available.");
      }

      router.push(`/booster/orders/${orderId}`);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to accept order.",
      );
      setClaiming(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={claim}
        disabled={claiming}
        className="inline-flex h-10 items-center justify-center rounded-xl bg-[#39E56F] px-4 text-xs font-semibold text-[#050807] transition-colors hover:bg-[#20C95A] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {claiming ? "Accepting…" : "Accept Order"}
        {!claiming ? <ArrowRight className="ml-2 size-3.5" /> : null}
      </button>
      {error ? (
        <p className="mt-2 max-w-xs text-[10px] leading-4 text-rose-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
