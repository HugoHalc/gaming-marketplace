"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Check,
  ChevronDown,
  Crosshair,
  EyeOff,
  MonitorPlay,
  Target,
  Users,
  Zap,
} from "lucide-react";
import type { MarvelRivalsServiceFoundation } from "@/features/catalog/data/marvel-rivals-foundation";
import {
  GameConfiguratorColumns,
  GameMobileOrderBar,
} from "./game-configurator-family-shell";
import { AccountBoostTrust } from "./account-boost-trust";
import { MarvelRivalsOrderGuidance } from "./marvel-rivals-order-guidance";
import { MarvelRivalsOrderSummary } from "./marvel-rivals-order-summary";
import { MarvelRivalsConfiguratorBlock } from "./marvel-rivals-configurator-block";
import { handleMarvelRivalsRadioGroupKeyDown } from "./marvel-rivals-radio-group";
import {
  MarvelRivalsCheckoutButton,
  useMarvelRivalsCheckout,
} from "@/features/configurator/client/use-marvel-rivals-checkout";
import {
  formatMarvelQuoteUsd,
  useMarvelRivalsQuote,
} from "@/features/configurator/client/use-marvel-rivals-quote";
import type { ConfiguratorSelection } from "@/features/configurator/types/configurator";
import {
  parseWholeNumberQuantity,
  quantitySelectionValue,
} from "@/features/configurator/client/whole-number-quantity";
import { MinimumOrderNotice } from "./minimum-order-notice";
import {
  meetsMinimumOrderTotal,
  minimumOrderShortfallCents,
} from "@/features/orders/minimum-order";
import { PlatformIcon } from "./platform-icon";


type BoostMethod = "solo" | "duo";
type ExtraKey = "playOffline" | "specificHeroes" | "streaming" | "expressDelivery";

type Selection = {
  games: string | number;
  region: string;
  platform: string;
  boostMethod: BoostMethod;
  extras: Record<ExtraKey, boolean>;
};

const MAX_GAMES = 10;

const regions = [
  { value: "north-america", label: "North America" },
  { value: "europe", label: "Europe" },
  { value: "middle-east", label: "Middle East" },
  { value: "south-america", label: "South America" },
  { value: "asia-pacific", label: "Asia-Pacific" },
] as const;

const platforms = [
  { value: "pc", label: "PC", color: "text-sky-300" },
  { value: "xbox", label: "Xbox", color: "text-green-300" },
  { value: "playstation", label: "PlayStation", color: "text-blue-300" },
] as const;

const extraDefinitions: Array<{
  key: ExtraKey;
  title: string;
  price: string;
  description: string;
  icon: ReactNode;
}> = [
  {
    key: "playOffline",
    title: "Play Offline",
    price: "FREE",
    description: "Keep your account presence discreet during the service.",
    icon: <EyeOff className="size-4" />,
  },
  {
    key: "specificHeroes",
    title: "Specific Heroes",
    price: "FREE",
    description: "Include hero preferences with your service configuration.",
    icon: <Crosshair className="size-4" />,
  },
  {
    key: "streaming",
    title: "Streaming",
    price: "+$10",
    description: "Watch the service through the supported streaming option.",
    icon: <MonitorPlay className="size-4" />,
  },
  {
    key: "expressDelivery",
    title: "Express Delivery",
    price: "+20%",
    description: "Prioritize your order when this option is available.",
    icon: <Zap className="size-4" />,
  },
];

function GamesSelector({ rawValue, error, onChange }: { rawValue: string | number; error: string | null; onChange: (games: string | number) => void }) {
  const parsed = parseWholeNumberQuantity(rawValue, 1, MAX_GAMES);
  const sliderValue = parsed.valid ? parsed.value : 1;
  const progress = ((sliderValue - 1) / (MAX_GAMES - 1)) * 100;
  const errorId = "marvel-unrated-games-error";
  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><label htmlFor="marvel-unrated-games" className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A0AAA4]">Unrated games</label><div className="mt-1 flex items-end gap-2"><span className="font-gaming-value text-[2.5rem] font-bold leading-none tracking-[-0.045em] text-[#F4F7F5]">{String(rawValue)}</span><span className="pb-1 text-xs font-medium text-[#A0AAA4]">games selected</span></div></div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Decrease unrated games"
            disabled={!parsed.valid || parsed.value <= 1}
            onClick={() => onChange(parsed.valid ? Math.max(1, parsed.value - 1) : rawValue)}
            className="grid size-11 place-items-center rounded-xl border border-white/[0.08] bg-[#090D0B] text-lg font-semibold text-white/60 outline-none transition-colors hover:border-white/[0.14] hover:text-white focus-visible:ring-2 focus-visible:ring-[#A38CFF]/35 disabled:cursor-not-allowed disabled:opacity-30"
          >
            −
          </button>
          <div className="flex h-11 items-center rounded-xl border border-white/[0.09] bg-black/20 px-3">
            <input id="marvel-unrated-games" type="text" inputMode="numeric" value={rawValue} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} onChange={(event) => onChange(quantitySelectionValue(event.target.value, 1, MAX_GAMES))} className="font-gaming-value w-12 bg-transparent text-center text-base font-bold text-white outline-none" />
          </div>
          <button
            type="button"
            aria-label="Increase unrated games"
            disabled={!parsed.valid || parsed.value >= MAX_GAMES}
            onClick={() => onChange(parsed.valid ? Math.min(MAX_GAMES, parsed.value + 1) : rawValue)}
            className="grid size-11 place-items-center rounded-xl border border-white/[0.08] bg-[#090D0B] text-lg font-semibold text-white/60 outline-none transition-colors hover:border-white/[0.14] hover:text-white focus-visible:ring-2 focus-visible:ring-[#A38CFF]/35 disabled:cursor-not-allowed disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between gap-3"><p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.13em] text-[#CEC5FF]/65">Games</p><span className="text-[10px] font-medium text-white/38">1–10 games</span></div>
        <div className="mt-3 grid grid-cols-10 gap-1.5">{Array.from({ length: MAX_GAMES }, (_, index) => <span key={index} className={`grid h-3.5 w-full place-items-center rounded-full border transition-[border-color,background-color] duration-200 ${index < sliderValue ? "border-[#A38CFF]/55 bg-[#7A63F2]/80" : "border-white/[0.10] bg-white/[0.03]"}`} />)}</div>
      </div>
      <input aria-label="Unrated games slider" type="range" min={1} max={MAX_GAMES} step={1} value={sliderValue} onChange={(event) => onChange(Number(event.target.value))} className="mt-5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/[0.07] accent-[#7A63F2]" style={{ background: `linear-gradient(to right, rgba(122,99,242,.68) 0%, rgba(122,99,242,.68) ${progress}%, rgba(255,255,255,.07) ${progress}%, rgba(255,255,255,.07) 100%)` }} />
      <div className="mt-2 flex justify-between text-[9px] font-medium text-white/30">{Array.from({ length: MAX_GAMES }, (_, index) => <span key={index}>{index + 1}</span>)}</div>
      {error ? <p id={errorId} className="mt-2 text-[10px] leading-4 text-rose-200">{error}</p> : null}
    </div>
  );
}

function ExtraCard({
  checked,
  onChange,
  icon,
  title,
  price,
  description,
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  icon: ReactNode;
  title: string;
  price: string;
  description: string;
  disabled?: boolean;
}) {
  const isFree = price === "FREE";

  return (
    <button
      type="button"
      aria-pressed={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onChange}
      className={`group/extra flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left outline-none transition-[border-color,background-color] duration-200 focus-visible:ring-2 focus-visible:ring-[#A38CFF]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A08] motion-reduce:transition-none ${
        disabled
          ? "cursor-not-allowed border-white/[0.05] bg-[#090D0B] opacity-40"
          : checked
            ? "border-[#A38CFF]/[0.16] bg-[#131B17]"
            : "border-white/[0.07] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"
      }`}
    >
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-lg border ${
          checked
            ? "border-[#A38CFF]/[0.14] bg-black/20 text-[#CEC5FF]/80"
            : "border-white/[0.07] bg-white/[0.025] text-white/55 group-hover/extra:text-white/75"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-xs font-semibold text-[#F4F7F5]">{title}</span>
          <span
            className={`shrink-0 text-[10px] font-bold ${
              disabled
                ? "text-white/35"
                : isFree
                  ? "text-[#82F5A4]"
                  : "text-[#CEC5FF]/70"
            }`}
          >
            {disabled ? "Solo only" : price}
          </span>
        </span>
        <span className="mt-0.5 block truncate text-[10px] text-[#A0AAA4]" title={description}>
          {description}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`grid size-4 shrink-0 place-items-center rounded-full border ${
          checked
            ? "border-[#39E56F]/40 bg-[#39E56F] text-[#050807]"
            : "border-white/[0.12] bg-white/[0.02] text-transparent"
        }`}
      >
        <Check className="size-2.5" strokeWidth={3} />
      </span>
    </button>
  );
}

function GamesSummary({ games }: { games: string | number }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#090D0B] px-3 py-3">
      <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">
        Unrated Games
      </p>
      <p className="font-gaming-value mt-1 text-base font-bold text-[#F4F7F5]">
        {String(games)} {String(games) === "1" ? "Unrated Game" : "Unrated Games"}
      </p>
    </div>
  );
}

function SummaryRows({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="mt-2 divide-y divide-white/[0.06]">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-4 py-2 text-[11px]">
          <span className="text-white/40">{label}</span>
          <span className="max-w-[12rem] text-right font-medium text-white/78">{value}</span>
        </div>
      ))}
    </div>
  );
}

export function MarvelRivalsUnratedConfigurator({
  service,
}: {
  service: MarvelRivalsServiceFoundation;
}) {
  const [selection, setSelection] = useState<Selection>({
    games: 1,
    region: "north-america",
    platform: "pc",
    boostMethod: "solo",
    extras: {
      playOffline: false,
      specificHeroes: false,
      streaming: false,
      expressDelivery: false,
    },
  });

  function toggleExtra(key: ExtraKey) {
    setSelection((current) => {
      if (key === "playOffline" && current.boostMethod === "duo") return current;

      return {
        ...current,
        extras: { ...current.extras, [key]: !current.extras[key] },
      };
    });
  }

  const selectedExtras = useMemo(
    () => extraDefinitions.filter((item) => selection.extras[item.key]).map((item) => item.title),
    [selection.extras],
  );

  const gamesResult = parseWholeNumberQuantity(selection.games, 1, 10);
  const regionValid = regions.some((item) => item.value === selection.region);
  const platformValid = platforms.some((item) => item.value === selection.platform);
  const boostMethodValid = selection.boostMethod === "solo" || selection.boostMethod === "duo";
  const playOfflineValid = !(selection.extras.playOffline && selection.boostMethod === "duo");
  const serviceSelectionValid = true;
  const selectionIsValid = gamesResult.valid && regionValid && platformValid && boostMethodValid && playOfflineValid && serviceSelectionValid;

  const quoteSelection = useMemo<ConfiguratorSelection>(
    () => ({
      games: selection.games,
      region: selection.region,
      platform: selection.platform,
      boostMethod: selection.boostMethod,
      playOffline: selection.extras.playOffline,
      specificHeroes: selection.extras.specificHeroes,
      streaming: selection.extras.streaming,
      expressDelivery: selection.extras.expressDelivery,
    }),
    [selection],
  );
  const { quote, error: quoteError, isLoading: quoteLoading } = useMarvelRivalsQuote(
    service.slug,
    quoteSelection,
    selectionIsValid,
  );
  const totalPrice = quote ? formatMarvelQuoteUsd(quote.total) : undefined;
  const belowMinimum = Boolean(quote && !meetsMinimumOrderTotal(quote.total));
  const minimumShortfallCents = quote ? minimumOrderShortfallCents(quote.total) : 0;
  const minimumNoticeId = `marvel-${service.slug}-minimum-order`;
  const canCheckout = Boolean(selectionIsValid && quote && !quoteLoading && !quoteError && !belowMinimum);
  const checkout = useMarvelRivalsCheckout({
    serviceSlug: service.slug,
    orderSelection: quoteSelection,
    continuitySelection: quoteSelection,
    canCheckout,
    restoreSelection: (restored) =>
      setSelection((current) => ({
        ...current,
        games: typeof restored.games === "string" || typeof restored.games === "number" ? restored.games : 1,
        region: String(restored.region),
        platform: String(restored.platform),
        boostMethod: restored.boostMethod as BoostMethod,
        extras: {
          playOffline: Boolean(restored.playOffline),
          specificHeroes: Boolean(restored.specificHeroes),
          streaming: Boolean(restored.streaming),
          expressDelivery: Boolean(restored.expressDelivery),
        },
      })),
  });

  const summaryRows = useMemo(() => {
    const serverLabel = regions.find((item) => item.value === selection.region)?.label ?? "North America";
    const platformLabel = platforms.find((item) => item.value === selection.platform)?.label ?? "PC";
    const rows: Array<[string, string]> = [
      ["Server", serverLabel],
      ["Platform", platformLabel],
      ["Boost Method", selection.boostMethod === "solo" ? "Solo" : "Duo"],
    ];

    return rows;
  }, [selection.boostMethod, selection.platform, selection.region]);

  return (
    <>
      <GameConfiguratorColumns>
        <section className="min-w-0 space-y-4 sm:space-y-5">
            <MarvelRivalsConfiguratorBlock ariaLabel="Games">
              <GamesSelector
                rawValue={selection.games}
                error={gamesResult.valid ? null : "Enter a whole number between 1 and 10."}
                onChange={(games) => setSelection((current) => ({ ...current, games }))}
              />
            </MarvelRivalsConfiguratorBlock>

            <MarvelRivalsConfiguratorBlock ariaLabel="Server and platform">
              <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                  Server
                </p>
                <div className="relative mt-3">
                  <select
                    value={selection.region}
                    onChange={(event) =>
                      setSelection((current) => ({ ...current, region: event.target.value }))
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-[#090D0B] px-3 pr-10 text-xs font-semibold text-white outline-none transition-colors hover:border-white/[0.14] focus:border-[#A38CFF]/[0.18] focus:ring-2 focus:ring-[#A38CFF]/15"
                  >
                    {regions.map((region) => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
                </div>
              </div>

              <div>
                <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                  Platform
                </p>
                <div role="radiogroup" aria-label="Platform" onKeyDown={handleMarvelRivalsRadioGroupKeyDown} className="mt-3 grid gap-2 sm:grid-cols-3">
                  {platforms.map((platform) => {
                    const active = selection.platform === platform.value;
                    return (
                      <button
                        key={platform.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        tabIndex={active ? 0 : -1}
                        onClick={() =>
                          setSelection((current) => ({ ...current, platform: platform.value }))
                        }
                        className={`flex h-11 min-w-0 items-center justify-between gap-2 rounded-xl border px-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#A38CFF]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A08] ${
                          active
                            ? "border-[#A38CFF]/[0.18] bg-[#131B17] text-white"
                            : "border-white/[0.08] bg-[#090D0B] text-white/65 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
                        }`}
                      >
                        <span
                          className={`grid size-7 shrink-0 place-items-center rounded-lg border ${
                            active
                              ? "border-white/[0.12] bg-[#090D0B]"
                              : "border-white/[0.08] bg-white/[0.02]"
                          } ${platform.color}`}
                        >
                          <PlatformIcon platform={platform.value} />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-xs font-semibold">{platform.label}</span>
                        {active ? (
                          <span className="grid size-4 shrink-0 place-items-center rounded-full bg-[#39E56F] text-[#050807]">
                            <Check className="size-2.5" strokeWidth={3} />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
              </div>
            </MarvelRivalsConfiguratorBlock>

            <MarvelRivalsConfiguratorBlock ariaLabel="Boost method">
              <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                Boost method
              </p>
              <p className="mt-1 text-sm font-semibold text-white">Choose how you want the service completed.</p>
              <div role="radiogroup" aria-label="Boost method" onKeyDown={handleMarvelRivalsRadioGroupKeyDown} className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  {
                    value: "solo" as const,
                    title: "Solo",
                    meta: "Base",
                    description: "Booster plays on your account.",
                    icon: <Target className="size-4" />,
                  },
                  {
                    value: "duo" as const,
                    title: "Duo",
                    meta: "+75%",
                    description: "You play alongside your booster.",
                    icon: <Users className="size-4" />,
                  },
                ].map((method) => {
                  const active = selection.boostMethod === method.value;
                  return (
                    <button
                      key={method.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      tabIndex={active ? 0 : -1}
                      onClick={() =>
                        setSelection((current) => ({
                          ...current,
                          boostMethod: method.value,
                          extras:
                            method.value === "duo"
                              ? { ...current.extras, playOffline: false }
                              : current.extras,
                        }))
                      }
                      className={`flex min-h-[4.4rem] items-center gap-3 rounded-xl border p-3 text-left outline-none transition-[border-color,background-color] duration-200 focus-visible:ring-2 focus-visible:ring-[#A38CFF]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A08] ${
                        active
                          ? "border-[#39E56F]/28 bg-[#39E56F]/[0.035]"
                          : "border-white/[0.08] bg-[#090D0B] hover:border-white/[0.14] hover:bg-[#0E1411]"
                      }`}
                    >
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-lg border ${
                          active
                            ? "border-[#A38CFF]/20 bg-[#7A63F2]/[0.06] text-[#CEC5FF]"
                            : "border-white/[0.08] bg-white/[0.025] text-white/50"
                        }`}
                      >
                        {method.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-xs font-semibold text-[#F4F7F5]">{method.title}</span>
                          <span className={`shrink-0 text-[10px] font-bold ${method.value === "duo" ? "text-[#CEC5FF]/75" : "text-white/40"}`}>
                            {method.meta}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-4 text-[#A0AAA4]">
                          {method.description}
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={`grid size-4 shrink-0 place-items-center rounded-full border ${
                          active
                            ? "border-[#39E56F]/40 bg-[#39E56F] text-[#050807]"
                            : "border-white/[0.12] bg-white/[0.02] text-transparent"
                        }`}
                      >
                        <Check className="size-2.5" strokeWidth={3} />
                      </span>
                    </button>
                  );
                })}
              </div>
              <AccountBoostTrust
                selected={selection.boostMethod === "solo"}
                accent="violet"
                showDescription
                methodLabel="Solo"
              />
            </MarvelRivalsConfiguratorBlock>

            <MarvelRivalsConfiguratorBlock ariaLabel="Extras">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A0AAA4]">
                    Extras
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">Optional upgrades.</p>
                </div>
                <span className="text-[10px] text-white/35">
                  {selectedExtras.length ? `${selectedExtras.length} selected` : "Nothing preselected"}
                </span>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {extraDefinitions.map((extra) => (
                  <ExtraCard
                    key={extra.key}
                    checked={selection.extras[extra.key]}
                    disabled={extra.key === "playOffline" && selection.boostMethod === "duo"}
                    onChange={() => toggleExtra(extra.key)}
                    icon={extra.icon}
                    title={extra.title}
                    price={extra.price}
                    description={
                      extra.key === "playOffline" && selection.boostMethod === "duo"
                        ? "Available with Solo only."
                        : extra.description
                    }
                  />
                ))}
              </div>
            </MarvelRivalsConfiguratorBlock>
        </section>

        <MarvelRivalsOrderSummary
          gameLabel={`Marvel Rivals ${service.name}`}
          progression={<GamesSummary games={selection.games} />}
          metadata={<SummaryRows rows={summaryRows} />}
          checkoutError={checkout.orderError}
          quote={quote}
          quoteLoading={quoteLoading}
          checkoutAction={
            <MarvelRivalsCheckoutButton
              onClick={checkout.createOrder}
              disabled={!canCheckout}
              loading={checkout.isCreatingOrder}
              ariaDescribedBy={belowMinimum ? minimumNoticeId : undefined}
            />
          }
        >
          <MinimumOrderNotice id={minimumNoticeId} shortfallCents={belowMinimum ? minimumShortfallCents : 0} />
          <MarvelRivalsOrderGuidance
            idPrefix={`marvel-${service.slug}`}
            boostMethod={selection.boostMethod}
          />
          {quoteError ? (
            <div className="mt-4 rounded-xl border border-rose-300/15 bg-rose-400/[0.06] p-3 text-xs leading-5 text-rose-200">
              {quoteError}
            </div>
          ) : null}
        </MarvelRivalsOrderSummary>
      </GameConfiguratorColumns>

      <GameMobileOrderBar
        label="USD"
        value={totalPrice}
        action={
          <MarvelRivalsCheckoutButton
            mobile
            onClick={checkout.createOrder}
            disabled={!canCheckout}
            loading={checkout.isCreatingOrder}
            ariaDescribedBy={belowMinimum ? minimumNoticeId : undefined}
          />
        }
      />
    </>
  );
}
