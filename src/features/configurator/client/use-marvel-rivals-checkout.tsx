"use client";

import { useCallback, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCheckoutIntentContinuity } from "./checkout-intent";
import type { ConfiguratorSelection } from "../types/configurator";

export function useMarvelRivalsCheckout({
  serviceSlug,
  orderSelection,
  continuitySelection,
  restoreSelection,
  canCheckout,
}: {
  serviceSlug: string;
  orderSelection: ConfiguratorSelection;
  continuitySelection: ConfiguratorSelection;
  restoreSelection: (selection: ConfiguratorSelection) => void;
  canCheckout: boolean;
}) {
  const router = useRouter();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const continuitySelectionRef = useRef(continuitySelection);
  const restoreSelectionRef = useRef(restoreSelection);

  continuitySelectionRef.current = continuitySelection;
  restoreSelectionRef.current = restoreSelection;

  const setContinuitySelection = useCallback<
    Dispatch<SetStateAction<ConfiguratorSelection>>
  >((next) => {
    const current = continuitySelectionRef.current;
    const resolved = typeof next === "function" ? next(current) : next;
    restoreSelectionRef.current(resolved);
  }, []);

  async function createOrder() {
    if (!canCheckout || isCreatingOrder) return;

    setIsCreatingOrder(true);
    setOrderError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameSlug: "marvel-rivals",
          serviceSlug,
          selection: orderSelection,
        }),
      });
      const payload = (await response.json()) as {
        order?: { id: string; orderNumber: string };
        error?: string;
      };

      if (response.status === 401) {
        checkoutIntent.saveForAuthentication();
        router.push(
          `/login?next=${encodeURIComponent(`/games/marvel-rivals/${serviceSlug}`)}`,
        );
        return;
      }

      if (!response.ok || !payload.order) {
        throw new Error(payload.error ?? "Unable to create order.");
      }

      checkoutIntent.clearAfterOrder();
      router.push(`/dashboard/orders/${payload.order.id}`);
      router.refresh();
    } catch (requestError) {
      setOrderError(
        requestError instanceof Error ? requestError.message : "Unable to create order.",
      );
    } finally {
      setIsCreatingOrder(false);
    }
  }

  const checkoutIntent = useCheckoutIntentContinuity({
    gameSlug: "marvel-rivals",
    serviceSlug,
    selection: continuitySelection,
    setSelection: setContinuitySelection,
    canAutoResume: canCheckout,
    busy: isCreatingOrder,
    onResume: createOrder,
  });

  return {
    createOrder,
    isCreatingOrder,
    orderError,
  };
}

export function MarvelRivalsCheckoutButton({
  onClick,
  disabled,
  loading,
  mobile = false,
}: {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  mobile?: boolean;
}) {
  return (
    <Button
      type="button"
      size={mobile ? "md" : "lg"}
      disabled={disabled || loading}
      onClick={onClick}
      className={
        mobile
          ? "h-11 shrink-0 px-3 text-[11px] font-semibold sm:px-5 sm:text-sm"
          : "mt-4 h-12 w-full rounded-xl font-semibold"
      }
    >
      {loading ? (
        <>
          <span className={mobile ? "sr-only sm:not-sr-only" : undefined}>Preparing checkout</span>
          <LoaderCircle className={`${mobile ? "sm:ml-2" : "ml-2"} size-4 animate-spin`} />
        </>
      ) : (
        <>
          <span>Checkout</span>
          <ArrowRight className="ml-2 size-4" />
        </>
      )}
    </Button>
  );
}
