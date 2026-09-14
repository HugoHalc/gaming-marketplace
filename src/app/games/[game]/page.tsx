import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  Gamepad2,
  Layers3,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import {
  findCatalogGameBySlug,
  listCatalogGames,
} from "@/features/catalog/data/catalog-repository";
import { gameDetailContent } from "@/features/catalog/data/game-detail-content";
import {
  getLaunchGameDisplayName,
  getLaunchGameShell,
  launchGames,
} from "@/features/catalog/data/launch-games";
import { gameThemes } from "@/features/catalog/data/game-theme";
import { StartingPriceDisplay } from "@/features/catalog/components/service-card";
import type { CatalogGame, ServiceSummary } from "@/features/catalog/types/catalog";

interface GamePageProps {
  params: Promise<{ game: string }>;
}

const rocketLeagueStorefrontHighlights = [
  {
    title: "Built around your rank",
    description:
      "Configure eligible services using your current competitive position, target, playlist, and the options relevant to your goal.",
  },
  {
    title: "Server-validated pricing",
    description:
      "Your configuration updates the current quote, which is validated server-side before the order is created.",
  },
  {
    title: "Dashboard order tracking",
    description:
      "Once your order is placed, follow its status and key order details directly from your BoostingPedia account.",
  },
] as const;

const valorantStorefrontHighlights = [
  {
    title: "Flexible configuration",
    description: "Configure your service around your competitive goal.",
  },
  {
    title: "Order workspace",
    description: "Order details and applicable fulfillment communication stay connected to your order workspace.",
  },
  {
    title: "Track order progress",
    description: "Follow your order status and service progress directly from your dashboard.",
  },
] as const;

function categoryLabel(category: ServiceSummary["category"]) {
  if (category === "rank") return "Rank progression";
  if (category === "wins") return "Competitive";
  if (category === "placements") return "Placements";
  return "Coaching";
}

function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export async function generateStaticParams() {
  const catalogGames = await listCatalogGames();
  const slugs = new Set([
    ...catalogGames.map((game) => game.slug),
    ...launchGames.map((game) => game.slug),
  ]);
  return Array.from(slugs).map((game) => ({ game }));
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { game: slug } = await params;
  const game = (await findCatalogGameBySlug(slug)) ?? getLaunchGameShell(slug);

  if (!game) return { title: "Game not found" };

  const displayName = getLaunchGameDisplayName(game.slug, game.name);
  const isRocketLeague = game.slug === "rocket-league";

  return {
    title: isRocketLeague
      ? { absolute: "Rocket League Boosting Services | BoostingPedia" }
      : displayName,
    description: isRocketLeague
      ? "Configure Rocket League rank boosts, competitive wins, placements, tournament boosts and season rewards with transparent pricing and order tracking."
      : `Explore the ${displayName} storefront and available BoostingPedia services.`,
    alternates: { canonical: `/games/${game.slug}` },
  };
}


const rocketLeagueOverviewMeta = {
  "rank-boost": { badge: "RANK PROGRESSION", icon: ShieldCheck },
  wins: { badge: "COMPETITIVE WINS", icon: Trophy },
  "placements-boost": { badge: "PLACEMENTS", icon: Layers3 },
  "tournament-boost": { badge: "TOURNAMENT", icon: Trophy },
  "rewards-boost": { badge: "SEASON REWARDS", icon: Sparkles },
} as const;

const valorantOverviewMeta = {
  "rank-boost": { badge: "RANK PROGRESSION", icon: ShieldCheck },
  wins: { badge: "COMPETITIVE WINS", icon: Trophy },
  "placement-matches": { badge: "PLACEMENTS", icon: Layers3 },
} as const;

function overviewMeta(
  service: ServiceSummary,
  isRocketLeague: boolean,
  isValorant: boolean,
) {
  if (isRocketLeague) {
    return rocketLeagueOverviewMeta[
      service.slug as keyof typeof rocketLeagueOverviewMeta
    ] ?? { badge: categoryLabel(service.category), icon: Gamepad2 };
  }

  if (isValorant) {
    return valorantOverviewMeta[
      service.slug as keyof typeof valorantOverviewMeta
    ] ?? { badge: categoryLabel(service.category), icon: Gamepad2 };
  }

  return null;
}

function RocketLeagueServiceMicrovisual({ service }: { service: ServiceSummary }) {
  const base =
    "relative mt-5 flex h-[5.15rem] items-center overflow-hidden rounded-xl border border-white/[0.055] bg-black/15 px-3.5 text-white/70 transition-[border-color,background-color,color] duration-200 group-hover:border-blue-300/[0.10] group-hover:bg-blue-300/[0.018] group-hover:text-white/90";

  if (service.slug === "rank-boost") {
    const ranks = [
      { src: "/ranks/rocket-league/diamond.svg", alt: "Diamond" },
      { src: "/ranks/rocket-league/champion.svg", alt: "Champion" },
      { src: "/ranks/rocket-league/grand-champion.svg", alt: "Grand Champion" },
    ];

    return (
      <div className={`${base} justify-between gap-2`} aria-label="Rank progression preview">
        {ranks.map((rank, index) => (
          <div key={rank.src} className="contents">
            <span className="group/rank-preview flex min-w-0 flex-col items-center gap-1.5">
              <span className="relative grid size-10 place-items-center rounded-xl border border-white/[0.075] bg-black/20 transition-[border-color,background-color] group-hover:border-blue-300/[0.14] group-hover:bg-blue-300/[0.025]">
                <Image
                  src={rank.src}
                  alt=""
                  fill
                  sizes="40px"
                  className="object-contain p-0.5 drop-shadow-[0_6px_10px_rgba(0,0,0,.5)] transition-transform duration-200 group-hover/rank-preview:scale-[1.045]"
                />
              </span>
              <span className="max-w-16 truncate text-[8px] font-semibold text-white/40">
                {rank.alt}
              </span>
            </span>
            {index < ranks.length - 1 ? (
              <ArrowRight className="size-3.5 shrink-0 text-blue-200/25" />
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  if (service.slug === "wins") {
    return (
      <div className={`${base} gap-3.5`} aria-label="Competitive wins preview">
        <span className="relative grid size-11 shrink-0 place-items-center rounded-xl border border-blue-300/[0.10] bg-blue-300/[0.025]">
          <Image
            src="/ranks/rocket-league/champion.svg"
            alt=""
            fill
            sizes="44px"
            className="object-contain p-0.5 drop-shadow-[0_6px_10px_rgba(0,0,0,.5)] transition-transform duration-200 group-hover:scale-[1.04]"
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-gaming-label text-[8px] uppercase tracking-[0.14em] text-white/30">
            Win targets
          </p>
          <div className="mt-2 flex gap-1.5">
            {Array.from({ length: 3 }).map((_, index) => (
              <span
                key={index}
                className="flex h-6 flex-1 items-center justify-center rounded-lg border border-blue-300/[0.11] bg-blue-300/[0.025] font-gaming-label text-[8px] font-semibold tracking-[0.1em] text-blue-100/55"
              >
                WIN
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (service.slug === "tournament-boost") {
    return (
      <div className={`${base} gap-4`} aria-label="Tournament bracket preview">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-blue-300/[0.10] bg-blue-300/[0.025] text-blue-100/60">
          <Trophy className="size-4" strokeWidth={1.7} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-gaming-label text-[8px] uppercase tracking-[0.14em] text-white/30">
            Bracket path
          </p>
          <div className="relative mt-2 h-8 max-w-40">
            <span className="absolute left-0 top-0.5 size-2 rounded-full border border-white/20 bg-[#090B0A]" />
            <span className="absolute left-0 bottom-0.5 size-2 rounded-full border border-white/20 bg-[#090B0A]" />
            <span className="absolute left-2 top-[5px] h-px w-7 bg-white/12" />
            <span className="absolute left-2 bottom-[5px] h-px w-7 bg-white/12" />
            <span className="absolute left-9 top-[5px] h-[22px] w-px bg-white/12" />
            <span className="absolute left-9 top-1/2 h-px w-10 bg-blue-300/25" />
            <span className="absolute left-[4.65rem] top-1/2 size-2.5 -translate-y-1/2 rounded-full border border-blue-300/35 bg-blue-300/[0.08]" />
          </div>
        </div>
      </div>
    );
  }

  if (service.slug === "rewards-boost") {
    return (
      <div className={`${base} gap-3.5`} aria-label="Season rewards preview">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-blue-300/[0.10] bg-blue-300/[0.025] text-blue-100/60">
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-gaming-label text-[8px] uppercase tracking-[0.14em] text-white/30">
            Season rewards
          </p>
          <div className="mt-2 grid grid-cols-5 gap-1.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className="h-6 rounded-lg border border-blue-300/[0.10] bg-blue-300/[0.018]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (service.slug === "placements-boost") {
    return (
      <div className={`${base} gap-3`} aria-label="Placements preview">
        <span className="flex h-9 shrink-0 items-center rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 font-gaming-label text-[8px] font-semibold uppercase tracking-[0.1em] text-white/45">
          Unranked
        </span>
        <ArrowRight className="size-3.5 shrink-0 text-blue-200/25" />
        <div className="min-w-0 flex-1">
          <p className="font-gaming-label text-[8px] uppercase tracking-[0.14em] text-white/30">
            Placement matches
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className="size-3 rounded-full border border-blue-200/[0.20] bg-blue-200/[0.018]"
              />
            ))}
            <span className="ml-1 text-[8px] font-medium text-white/30">1–10</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function ValorantServiceMicrovisual({ service }: { service: ServiceSummary }) {
  const base =
    "relative mt-5 flex h-[5.15rem] items-center overflow-hidden rounded-xl border border-white/[0.055] bg-black/15 px-3.5 text-white/70 transition-[border-color,background-color,color] duration-200 group-hover:border-rose-300/[0.10] group-hover:bg-rose-300/[0.018] group-hover:text-white/90";

  if (service.slug === "rank-boost") {
    const ranks = [
      { src: "/ranks/valorant/gold.png", alt: "Gold" },
      { src: "/ranks/valorant/diamond.png", alt: "Diamond" },
      { src: "/ranks/valorant/ascendant.png", alt: "Ascendant" },
    ];

    return (
      <div className={`${base} justify-between gap-2`} aria-label="Valorant rank progression preview">
        {ranks.map((rank, index) => (
          <div key={rank.src} className="contents">
            <span className="group/rank-preview flex min-w-0 flex-col items-center gap-1.5">
              <span className="grid size-10 place-items-center rounded-xl border border-white/[0.075] bg-black/20 transition-[border-color,background-color] group-hover:border-rose-300/[0.14] group-hover:bg-rose-300/[0.025]">
                <Image
                  src={rank.src}
                  alt=""
                  width={40}
                  height={40}
                  className="size-9 object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,.5)] transition-transform duration-200 group-hover/rank-preview:scale-[1.045]"
                />
              </span>
              <span className="max-w-14 truncate text-[8px] font-semibold text-white/40">
                {rank.alt}
              </span>
            </span>
            {index < ranks.length - 1 ? (
              <ArrowRight className="size-3.5 shrink-0 text-rose-200/25" />
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  if (service.slug === "wins") {
    return (
      <div className={`${base} gap-3.5`} aria-label="Valorant competitive wins preview">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-rose-300/[0.10] bg-rose-300/[0.025]">
          <Image
            src="/ranks/valorant/gold.png"
            alt=""
            width={44}
            height={44}
            className="size-10 object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,.5)] transition-transform duration-200 group-hover:scale-[1.04]"
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-gaming-label text-[8px] uppercase tracking-[0.14em] text-white/30">
            Win targets
          </p>
          <div className="mt-2 flex gap-1.5">
            {Array.from({ length: 3 }).map((_, index) => (
              <span
                key={index}
                className="flex h-6 flex-1 items-center justify-center rounded-lg border border-rose-300/[0.11] bg-rose-300/[0.025] font-gaming-label text-[8px] font-semibold tracking-[0.1em] text-rose-100/55"
              >
                WIN
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (service.slug === "placement-matches") {
    return (
      <div className={`${base} gap-3`} aria-label="Valorant placements preview">
        <span className="flex h-9 shrink-0 items-center rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 font-gaming-label text-[8px] font-semibold uppercase tracking-[0.1em] text-white/45">
          Unrated
        </span>
        <ArrowRight className="size-3.5 shrink-0 text-rose-200/25" />
        <div className="min-w-0 flex-1">
          <p className="font-gaming-label text-[8px] uppercase tracking-[0.14em] text-white/30">
            Placement matches
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className="size-3 rounded-full border border-rose-200/[0.20] bg-rose-200/[0.018]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function ServiceShowcaseCard({
  service,
  gameSlug,
  index,
  isRocketLeague,
  isValorant,
}: {
  service: ServiceSummary;
  gameSlug: string;
  index: number;
  isRocketLeague: boolean;
  isValorant: boolean;
}) {
  const meta = overviewMeta(service, isRocketLeague, isValorant);
  const ServiceIcon = meta?.icon;
  const ctaClass = isRocketLeague
    ? "group-hover:border-blue-300/25 group-hover:bg-blue-300/[0.07] group-hover:text-blue-200"
    : isValorant
      ? "group-hover:border-rose-300/25 group-hover:bg-rose-300/[0.07] group-hover:text-rose-200"
      : "group-hover:border-green-400/25 group-hover:bg-green-400/[0.08] group-hover:text-green-300";

  return (
    <Link
      href={`/games/${gameSlug}/${service.slug}`}
      className={`group relative flex min-h-[22rem] w-[82vw] max-w-[20rem] shrink-0 snap-start flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#090b0a] p-5 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_-42px_rgba(0,0,0,.95)] sm:p-6 md:h-full md:w-auto md:max-w-none md:shrink md:snap-none ${
        isRocketLeague
          ? "hover:border-blue-300/[0.18]"
          : isValorant
            ? "hover:border-rose-300/[0.18]"
            : "hover:border-green-400/20"
      }`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${
          isRocketLeague
            ? "from-blue-400/[0.05]"
            : isValorant
              ? "from-rose-400/[0.05]"
              : "from-green-400/[0.06]"
        } to-transparent`}
      />
      <div className="relative flex items-start justify-between gap-4">
        <Badge className="border-white/[0.08] bg-black/20 text-white/55">
          {meta?.badge ?? categoryLabel(service.category)}
        </Badge>
        {ServiceIcon ? (
          <span
            className={`grid size-8 place-items-center rounded-lg border bg-black/20 transition-colors ${
              isRocketLeague
                ? "border-blue-300/[0.12] text-blue-200/60 group-hover:border-blue-300/[0.18] group-hover:text-blue-100/85"
                : "border-rose-300/[0.12] text-rose-200/60 group-hover:border-rose-300/[0.18] group-hover:text-rose-100/85"
            }`}
          >
            <ServiceIcon className="size-3.5" strokeWidth={1.7} />
          </span>
        ) : (
          <span className="font-gaming-value rounded-lg border border-white/[0.08] bg-black/20 px-2 py-1 text-[10px] text-white/35">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
      </div>

      {isRocketLeague ? (
        <RocketLeagueServiceMicrovisual service={service} />
      ) : isValorant ? (
        <ValorantServiceMicrovisual service={service} />
      ) : null}

      <div className={`relative ${isRocketLeague || isValorant ? "mt-3" : "mt-8"}`}>
        <h3 className="font-gaming-value max-w-[13rem] text-2xl leading-[1.05] tracking-[-0.045em] text-white">
          {service.name}
        </h3>
        <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
          {service.description}
        </p>
      </div>

      <div className={`relative mt-auto ${isRocketLeague || isValorant ? "pt-5" : "pt-8"}`}>
        <div className="mb-5 h-px bg-gradient-to-r from-white/[0.10] to-transparent" />
        <div className="flex items-end justify-between gap-4">
          <StartingPriceDisplay
            value={service.startingPrice}
            context={service.startingPriceContext}
          />
          <span className={`grid size-10 place-items-center rounded-full border border-white/[0.09] bg-white/[0.035] text-white/70 transition-[border-color,background-color,color] ${ctaClass}`}>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyServiceCard({ index }: { index: number }) {
  return (
    <div className="relative flex min-h-[22rem] w-[82vw] max-w-[20rem] shrink-0 snap-start flex-col overflow-hidden rounded-[1.35rem] border border-dashed border-white/[0.08] bg-white/[0.012] p-5 sm:p-6 md:h-full md:w-auto md:max-w-none md:shrink md:snap-none">
      <div className="flex items-start justify-between">
        <span className="rounded-full border border-white/[0.08] bg-black/15 px-2.5 py-1 text-[10px] font-semibold text-white/30">
          Service slot
        </span>
        <span className="text-[10px] font-black text-white/20">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="my-auto">
        <div className="h-4 w-28 rounded bg-white/[0.04]" />
        <div className="mt-3 h-4 w-40 rounded bg-white/[0.025]" />
        <div className="mt-8 h-2 w-full rounded bg-white/[0.025]" />
        <div className="mt-2 h-2 w-4/5 rounded bg-white/[0.02]" />
      </div>
      <p className="text-xs leading-5 text-white/25">
        Ready for game-specific service content.
      </p>
    </div>
  );
}

export default async function GamePage({ params }: GamePageProps) {
  const { game: slug } = await params;
  const catalogGame = await findCatalogGameBySlug(slug);
  const game: CatalogGame | undefined = catalogGame ?? getLaunchGameShell(slug);

  if (!game) notFound();

  const content = gameDetailContent[game.slug];
  if (!content) notFound();

  const theme = gameThemes[content.accent];
  const displayName = getLaunchGameDisplayName(game.slug, game.name);
  const shell = !catalogGame;
  const isRocketLeague = game.slug === "rocket-league";
  const isValorant = game.slug === "valorant";
  const breadcrumbJsonLd = isRocketLeague
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${siteConfig.url}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Games",
            item: `${siteConfig.url}/games`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Rocket League",
            item: `${siteConfig.url}/games/rocket-league`,
          },
        ],
      }
    : null;

  return (
    <main className="min-h-screen overflow-hidden">
      {breadcrumbJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
        />
      ) : null}
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/[0.06] bg-[#050807]">
        <div className="hero-grid absolute inset-y-0 left-0 -z-20 w-[62%] opacity-15" />

        {isRocketLeague || isValorant ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-full overflow-hidden sm:w-[72%] lg:w-[62%]"
          >
            <Image
              src={isValorant ? "/game-heroes/valorant-storefront.jpeg" : "/game-heroes/rocket-league-storefront.jpeg"}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 62vw, (min-width: 640px) 72vw, 100vw"
              quality={100}
              className={
                isValorant
                  ? "object-cover object-[76%_50%] opacity-55 sm:object-[74%_50%] sm:opacity-75 lg:object-[72%_50%] lg:opacity-100"
                  : "object-cover object-[72%_50%] opacity-45 sm:object-[70%_50%] sm:opacity-70 lg:object-[68%_50%] lg:opacity-100"
              }
            />

            <div className={isValorant ? "absolute inset-0 bg-rose-950/[0.02]" : "absolute inset-0 bg-black/[0.06]"} />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#050807_0%,rgba(5,8,7,.98)_18%,rgba(5,8,7,.86)_35%,rgba(5,8,7,.48)_52%,rgba(5,8,7,.08)_72%,transparent_100%)]" />
          </div>
        ) : (
          <>
            <div className={`absolute right-[-8rem] top-[-10rem] -z-10 h-[34rem] w-[48rem] rounded-full ${theme.softGlow} blur-[125px]`} />
            <div className="absolute right-0 top-0 hidden h-full w-[48%] overflow-hidden lg:block">
              <div className={`absolute inset-0 bg-gradient-to-br ${theme.glow}`} />
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[var(--background)] to-transparent" />
              <div className="absolute bottom-10 right-10 select-none text-right text-[clamp(4rem,8vw,8.5rem)] font-black leading-[0.82] tracking-[-0.08em] text-white/[0.035]">
                {displayName}
              </div>
            </div>
          </>
        )}

        <Container className="relative py-12 sm:py-16 lg:min-h-[32rem] lg:py-20">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/games" className="transition-colors hover:text-white">Games</Link>
            <span>/</span>
            <span className="text-white">{displayName}</span>
          </div>

          <div className="mt-12 max-w-3xl">
            <Badge className={`${theme.border} ${theme.surface} ${theme.text}`}>
              <Sparkles className="mr-2 size-3.5" />
              {isValorant ? "VALORANT boosting services" : content.eyebrow}
            </Badge>
            <h1 className="mt-5 text-balance text-5xl font-bold leading-[0.96] tracking-[-0.065em] text-white sm:text-6xl lg:text-7xl">
              {isRocketLeague ? "Rocket League Boosting Services" : displayName}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
              {isRocketLeague
                ? "Choose the service that matches your competitive goal and configure your boost around your rank, playlist, and preferred progression."
                : isValorant
                  ? "Choose your service, configure your rank or match goal, and follow order status from your dashboard."
                  : content.heroDescription}
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/65">
                {isRocketLeague ? "Competitive boosting" : content.categoryLabel}
              </span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/65">
                {isValorant ? "PC competitive services" : content.fulfillmentLabel}
              </span>
              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  isValorant
                    ? "border-rose-300/[0.14] bg-rose-400/[0.035] text-rose-200/70"
                    : "border-green-400/15 bg-green-400/[0.055] text-green-300"
                }`}
              >
                {shell ? "Structure ready" : `${game.services.length} services`}
              </span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="#services">
                  View services
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/games">
                  <ArrowLeft className="mr-2 size-4" />
                  All games
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section id="services" className="scroll-mt-20 py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className={`text-sm font-semibold ${theme.text}`}>Boosting services</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">
                {content.serviceIntro}
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--muted-foreground)] lg:text-right">
              {isRocketLeague || isValorant
                ? "Browse the available services and choose the option that best matches your competitive goal."
                : "Browse horizontally on smaller screens. Each service opens its own dedicated configurator."}
            </p>
          </div>

          <div className="-mx-4 mt-9 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-2 md:items-stretch md:overflow-visible md:px-0 md:pb-0 md:snap-none xl:grid-cols-3">
            {game.services.length > 0
              ? game.services.map((service, index) => (
                  <ServiceShowcaseCard
                    key={service.id}
                    service={service}
                    gameSlug={game.slug}
                    index={index}
                    isRocketLeague={isRocketLeague}
                    isValorant={isValorant}
                  />
                ))
              : Array.from({ length: 4 }).map((_, index) => (
                  <EmptyServiceCard key={index} index={index} />
                ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/[0.06] bg-white/[0.012] py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <div className="max-w-xl">
              <p className={`text-sm font-semibold ${theme.text}`}>
                {isRocketLeague ? "Built for Rocket League" : isValorant ? "Built for VALORANT" : "Game storefront"}
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">
                {isRocketLeague
                  ? "Everything you need to configure your boost with confidence."
                  : isValorant
                    ? "Configure your VALORANT service with the same clear BoostingPedia order flow."
                    : "More visual up front. Same service flow underneath."}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                {isRocketLeague
                  ? "Choose your service, configure the details that matter, and see exactly what you are ordering before checkout."
                  : isValorant
                    ? "Choose Rank Boost, Competitive Wins, or Placements Boost, configure the real options for that service, and track the resulting order from your dashboard."
                    : "The overview page now works as a stronger visual entry point while preserving the underlying service configuration routes."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {(isRocketLeague
                ? rocketLeagueStorefrontHighlights
                : isValorant
                  ? valorantStorefrontHighlights
                  : content.highlights
              ).map((item, index) => {
                const defaultIcons = [Layers3, ShieldCheck, Gamepad2] as const;
                const rocketLeagueIcons = [Layers3, ReceiptText, Activity] as const;
                const Icon = isRocketLeague
                  ? rocketLeagueIcons[index] ?? Layers3
                  : defaultIcons[index] ?? Layers3;

                return (
                  <div
                    key={item.title}
                    className={`rounded-2xl border border-white/[0.08] bg-black/15 p-5 transition-[border-color,background-color] duration-200 ease-out motion-reduce:transition-none sm:p-6 ${
                      isRocketLeague
                        ? "hover:border-blue-300/[0.16] hover:bg-[#0E1411]"
                        : isValorant
                          ? "hover:border-rose-300/[0.16] hover:bg-[#0E1411]"
                          : ""
                    }`}
                  >
                    <span
                      className={
                        isRocketLeague
                          ? "grid size-10 place-items-center rounded-xl border border-blue-300/[0.16] bg-blue-400/[0.04] text-blue-200/80"
                          : isValorant
                            ? "grid size-10 place-items-center rounded-xl border border-rose-300/[0.16] bg-rose-400/[0.04] text-rose-200/80"
                            : `grid size-10 place-items-center rounded-xl border ${theme.icon}`
                      }
                    >
                      <Icon className="size-4" strokeWidth={1.8} />
                    </span>
                    <h3 className="mt-5 text-sm font-semibold text-[#F4F7F5]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#A0AAA4]">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="flex flex-col gap-6 rounded-[1.8rem] border border-white/[0.08] bg-[#090b0a] p-7 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-green-300">Need a different route?</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-white sm:text-3xl">
                Explore more game storefronts.
              </h2>
            </div>
            <Link
              href="/games"
              className="inline-flex items-center text-sm font-semibold text-white/70 transition-colors hover:text-white"
            >
              View all games
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
