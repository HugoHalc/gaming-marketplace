"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function ClaimOrderButton({
  orderId,
  compact = false,
}: {
  orderId: string;
  compact?: boolean;
}) {
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
        className={`inline-flex items-center justify-center bg-[#39E56F] font-semibold text-[#050807] transition-colors hover:bg-[#20C95A] disabled:cursor-not-allowed disabled:opacity-50 ${
          compact
            ? "h-8 rounded-lg px-3 text-[9px]"
            : "h-10 rounded-xl px-4 text-xs"
        }`}
      >
        {claiming ? "Accepting…" : compact ? "Accept" : "Accept Order"}
        {!claiming && !compact ? <ArrowRight className="ml-2 size-3.5" /> : null}
      </button>
      {error ? (
        <p className="mt-2 max-w-xs text-[10px] leading-4 text-rose-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
