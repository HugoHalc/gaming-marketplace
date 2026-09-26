import Link from "next/link";
import {
  Clock3,
  ExternalLink,
  LoaderCircle,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

type MarvelRivalsTimingStatus = "loading" | "available" | "unavailable";
type MarvelRivalsBoostMethod = "solo" | "duo";

export function MarvelRivalsOrderGuidance({
  idPrefix,
  boostMethod,
  timingStatus = "unavailable",
  estimatedStart,
  estimatedCompletion,
}: {
  idPrefix: string;
  boostMethod: MarvelRivalsBoostMethod;
  timingStatus?: MarvelRivalsTimingStatus;
  estimatedStart?: string;
  estimatedCompletion?: string;
}) {
  const hasVerifiedEstimate =
    timingStatus === "available" &&
    Boolean(estimatedStart?.trim()) &&
    Boolean(estimatedCompletion?.trim());
  const timingHeadingId = `${idPrefix}-estimated-timing-heading`;
  const verifyHeadingId = `${idPrefix}-verify-order-heading`;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.07] bg-black/15">
      <section className="px-3 py-3" aria-label="Account access guidance">
        <div className="flex items-start gap-2.5">
          <ShieldCheck
            className="mt-0.5 size-3.5 shrink-0 text-[#CEC5FF]/75"
            aria-hidden="true"
          />
          <p className="min-w-0 text-[10px] leading-4 text-white/45">
            {boostMethod === "solo"
              ? "Account details are requested after checkout."
              : "No account access required."}
          </p>
        </div>
      </section>

      <section
        className="border-t border-white/[0.06] px-3 py-3"
        aria-labelledby={timingHeadingId}
      >
        <div className="flex items-start gap-2.5">
          <Clock3
            className="mt-0.5 size-3.5 shrink-0 text-[#CEC5FF]/70"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <h3
              id={timingHeadingId}
              className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#CEC5FF]/70"
            >
              Estimated timing
            </h3>
            <div
              className="mt-1.5 text-[10px] leading-4 text-white/45"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {timingStatus === "loading" ? (
                <span className="inline-flex items-center gap-1.5">
                  <LoaderCircle
                    className="size-3 animate-spin text-[#CEC5FF]/70 motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                  Updating estimate…
                </span>
              ) : hasVerifiedEstimate ? (
                <div className="space-y-1">
                  <p className="flex items-start justify-between gap-3">
                    <span className="text-white/35">Estimated start</span>
                    <span className="min-w-0 text-right font-medium text-white/70">
                      {estimatedStart}
                    </span>
                  </p>
                  <p className="flex items-start justify-between gap-3">
                    <span className="text-white/35">Estimated completion</span>
                    <span className="min-w-0 text-right font-medium text-white/70">
                      {estimatedCompletion}
                    </span>
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="flex items-center justify-between gap-3">
                    <span className="text-white/35">Estimated start</span>
                    <span className="font-medium text-white/55">Unavailable</span>
                  </p>
                  <p className="flex items-center justify-between gap-3">
                    <span className="text-white/35">Estimated completion</span>
                    <span className="font-medium text-white/55">Unavailable</span>
                  </p>
                  <p className="pt-0.5 text-white/32">
                    No verified timing estimate is available for this configuration.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-t border-white/[0.06] px-3 py-3"
        aria-labelledby={verifyHeadingId}
      >
        <div className="flex items-start gap-2.5">
          <UsersRound
            className="mt-0.5 size-3.5 shrink-0 text-[#CEC5FF]/70"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <h3
              id={verifyHeadingId}
              className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#CEC5FF]/70"
            >
              Verify before you order
            </h3>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-2 text-[10px] leading-4">
              <a
                href="https://www.trustpilot.com/review/boostingpedia.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Public Trustpilot reviews (opens in a new tab)"
                className="inline-flex min-h-11 items-center gap-1 text-white/50 underline decoration-white/15 underline-offset-2 transition-colors hover:text-white/78 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A38CFF]/35 motion-reduce:transition-none"
              >
                Public Trustpilot reviews
                <ExternalLink className="size-2.5 shrink-0" aria-hidden="true" />
              </a>
              <Link
                href="/refunds"
                className="inline-flex min-h-11 items-center text-white/50 underline decoration-white/15 underline-offset-2 transition-colors hover:text-white/78 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A38CFF]/35 motion-reduce:transition-none"
              >
                Refund policy
              </Link>
            </div>
            <p className="mt-1.5 text-[9px] leading-4 text-white/30">
              Support is available through BoostingPedia if you need help with your order.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
