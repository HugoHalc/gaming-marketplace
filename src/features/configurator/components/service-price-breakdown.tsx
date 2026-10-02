import type { QuotePreview } from "@/features/configurator/types/configurator";
import { presentServicePriceBreakdown } from "../presentation/service-price-breakdown";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function ServicePriceBreakdown({ quote }: { quote: QuotePreview }) {
  return (
    <div data-service-price-breakdown className="space-y-2 border-t border-white/[0.07] pt-3">
      {presentServicePriceBreakdown(quote).map((line, index) => (
        <div key={`${line.label}-${index}`} data-price-cents={Math.round(line.amount * 100)} className="flex min-h-8 items-start justify-between gap-3 text-xs leading-5">
          <span className="min-w-0 break-words text-[#A0AAA4]">{line.label}</span>
          <span className="shrink-0 font-medium tabular-nums text-white/78">{currency.format(line.amount)}</span>
        </div>
      ))}
    </div>
  );
}
