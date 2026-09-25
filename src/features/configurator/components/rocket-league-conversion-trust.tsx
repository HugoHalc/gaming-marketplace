"use client";

import Link from "next/link";
import { Clock3, ExternalLink, LoaderCircle, ShieldCheck, UsersRound } from "lucide-react";

type RocketLeagueEstimateStatus = "loading" | "available" | "unavailable";

interface RocketLeagueTimingEstimateProps {
  status?: RocketLeagueEstimateStatus;
  estimatedStart?: string;
  estimatedCompletion?: string;
}

export function RocketLeagueTimingEstimate({
  status = "unavailable",
  estimatedStart,
  estimatedCompletion,
}: RocketLeagueTimingEstimateProps) {
  const hasVerifiedEstimate =
    status === "available" &&
    Boolean(estimatedStart?.trim()) &&
    Boolean(estimatedCompletion?.trim());

  return (
    <div className="border-t border-white/[0.06] px-3 py-3">
      <div className="flex items-start gap-2.5">
        <Clock3 className="mt-0.5 size-3.5 shrink-0 text-blue-200/65" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-200/65">
            Estimated timing
          </p>
          <div
            className="mt-1.5 text-[10px] leading-4 text-white/45"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {status === "loading" ? (
              <span className="inline-flex items-center gap-1.5">
                <LoaderCircle
                  className="size-3 animate-spin text-blue-200/70 motion-reduce:animate-none"
                  aria-hidden="true"
                />
                Updating estimate…
              </span>
            ) : hasVerifiedEstimate ? (
              <div className="space-y-1">
                <p>
                  <span className="text-white/35">Estimated start:</span>{" "}
                  <span className="font-medium text-white/70">{estimatedStart}</span>
                </p>
                <p>
                  <span className="text-white/35">Estimated completion:</span>{" "}
                  <span className="font-medium text-white/70">{estimatedCompletion}</span>
                </p>
                <p className="pt-0.5 text-white/32">Timing is an estimate, not a guaranteed deadline.</p>
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
    </div>
  );
}

export function RocketLeagueConversionTrust({
  accountBoost,
}: {
  accountBoost: boolean;
}) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.07] bg-black/15">
      <div className="flex items-start gap-2.5 px-3 py-3">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[#82F5A4]/80" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">
            Before checkout
          </p>
          <p className="mt-1 text-[10px] leading-4 text-white/45">
            {accountBoost
              ? "Account details are requested after checkout."
              : "No account access required."}
          </p>
        </div>
      </div>

      <RocketLeagueTimingEstimate />

      <div className="border-t border-white/[0.06] px-3 py-3">
        <div className="flex items-start gap-2.5">
          <UsersRound className="mt-0.5 size-3.5 shrink-0 text-blue-200/65" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-200/65">
              Verify before you order
            </p>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] leading-4">
              <Link
                href="/boosters/rocket-league"
                className="text-white/50 underline decoration-white/15 underline-offset-2 transition-colors hover:text-white/78 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/35"
              >
                Rocket League booster profiles
              </Link>
              <a
                href="https://www.trustpilot.com/review/boostingpedia.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-white/50 underline decoration-white/15 underline-offset-2 transition-colors hover:text-white/78 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/35"
              >
                Public Trustpilot reviews
                <ExternalLink className="size-2.5" aria-hidden="true" />
              </a>
              <Link
                href="/refunds"
                className="text-white/50 underline decoration-white/15 underline-offset-2 transition-colors hover:text-white/78 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/35"
              >
                Refund policy
              </Link>
            </div>
            <p className="mt-1.5 text-[9px] leading-4 text-white/30">
              Support is available through BoostingPedia if you need help with your order.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
