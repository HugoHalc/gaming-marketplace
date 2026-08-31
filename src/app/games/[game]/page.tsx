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
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    title: "Clear pricing before checkout",
    description:
      "Your configuration updates the service price before you place the order, helping you understand exactly what you are paying for.",
  },
  {
    title: "Track your progress",
    description:
      "Once your order is placed, follow its status and key order details directly from your BoostingPedia account.",
  },
] as const;

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function categoryLabel(category: ServiceSummary["category"]) {
  if (category === "rank") return "Rank progression";
  if (category === "wins") return "Competitive";
  if (category === "placements") return "Placements";
  return "Coaching";
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
  return {
    title: displayName,
    description: `Explore the ${displayName} storefront and available BoostingPedia services.`,
    alternates: { canonical: `/games/${game.slug}` },
  };
}

function ServiceShowcaseCard({
  service,
  gameSlug,
  index,
}: {
  service: ServiceSummary;
  gameSlug: string;
  index: number;
}) {
  return (
    <Link
      href={`/games/${gameSlug}/${service.slug}`}
      className="group relative flex min-h-[22rem] w-[18rem] shrink-0 snap-start flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#090b0a] p-5 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-green-400/20 hover:shadow-[0_28px_70px_-42px_rgba(0,0,0,.95)] sm:w-[20rem] sm:p-6"
    >
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-green-400/[0.06] to-transparent" />
      <div className="relative flex items-start justify-between gap-4">
        <Badge className="border-white/[0.08] bg-black/20 text-white/55">
          {categoryLabel(service.category)}
        </Badge>
        <span className="font-gaming-value rounded-lg border border-white/[0.08] bg-black/20 px-2 py-1 text-[10px] text-white/35">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="relative mt-8">
        <h3 className="font-gaming-value max-w-[13rem] text-2xl leading-[1.05] tracking-[-0.045em] text-white">
          {service.name}
        </h3>
        <p className="mt-4 line-clamp-4 text-sm leading-6 text-[var(--muted-foreground)]">
          {service.description}
        </p>
      </div>

      <div className="relative mt-auto pt-8">
        <div className="mb-5 h-px bg-gradient-to-r from-white/[0.10] to-transparent" />
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-gaming-label text-[10px] uppercase tracking-[0.13em] text-white/30">Starting from</p>
            <p className="font-gaming-value mt-1 text-lg text-white">{formatPrice(service.startingPrice)}</p>
          </div>
          <span className="grid size-10 place-items-center rounded-full border border-white/[0.09] bg-white/[0.035] text-white/70 transition-colors group-hover:border-green-400/25 group-hover:bg-green-400/[0.08] group-hover:text-green-300">
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyServiceCard({ index }: { index: number }) {
  return (
    <div className="relative flex min-h-[22rem] w-[18rem] shrink-0 snap-start flex-col overflow-hidden rounded-[1.35rem] border border-dashed border-white/[0.08] bg-white/[0.012] p-5 sm:w-[20rem] sm:p-6">
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

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/[0.06] bg-[#050807]">
        <div className="hero-grid absolute inset-y-0 left-0 -z-20 w-[62%] opacity-15" />

        {isRocketLeague ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-full overflow-hidden sm:w-[72%] lg:w-[62%]"
          >
            <Image
              src="/game-heroes/rocket-league-storefront.jpeg"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 62vw, (min-width: 640px) 72vw, 100vw"
              className="object-cover object-[72%_50%] opacity-45 sm:object-[70%_50%] sm:opacity-70 lg:object-[68%_50%] lg:opacity-100"
            />

            <div className="absolute inset-0 bg-black/[0.06]" />
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
              {content.eyebrow}
            </Badge>
            <h1 className="mt-5 text-balance text-5xl font-bold leading-[0.96] tracking-[-0.065em] text-white sm:text-6xl lg:text-7xl">
              {displayName}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
              {isRocketLeague
                ? "Choose the service that matches your competitive goal and configure your boost around your rank, playlist, and preferred progression."
                : content.heroDescription}
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/65">
                {isRocketLeague ? "Competitive boosting" : content.categoryLabel}
              </span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/65">
                {content.fulfillmentLabel}
              </span>
              <span className="rounded-full border border-green-400/15 bg-green-400/[0.055] px-3 py-1.5 text-xs font-medium text-green-300">
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
              {isRocketLeague
                ? "Browse the available services and choose the option that best matches your competitive goal."
                : "Browse horizontally on smaller screens. Each service opens its own dedicated configurator."}
            </p>
          </div>

          <div className="-mx-4 mt-9 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
            {game.services.length > 0
              ? game.services.map((service, index) => (
                  <ServiceShowcaseCard
                    key={service.id}
                    service={service}
                    gameSlug={game.slug}
                    index={index}
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
                {isRocketLeague ? "Built for Rocket League" : "Game storefront"}
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">
                {isRocketLeague
                  ? "Everything you need to configure your boost with confidence."
                  : "More visual up front. Same service flow underneath."}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                {isRocketLeague
                  ? "Choose your service, configure the details that matter, and see exactly what you are ordering before checkout."
                  : "The overview page now works as a stronger visual entry point while preserving the underlying service configuration routes."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {(isRocketLeague ? rocketLeagueStorefrontHighlights : content.highlights).map((item, index) => {
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
                        : ""
                    }`}
                  >
                    <span
                      className={
                        isRocketLeague
                          ? "grid size-10 place-items-center rounded-xl border border-blue-300/[0.16] bg-blue-400/[0.04] text-blue-200/80"
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
                Explore the rest of the launch lineup.
              </h2>
            </div>
            <Link
              href="/games"
              className="inline-flex items-center text-sm font-semibold text-white/70 transition-colors hover:text-white"
            >
              View all launch games
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
