import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { RocketLeagueFaqAccordion } from "@/components/marketing/rocket-league-faq-accordion";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { findCatalogGameBySlug, listCatalogGames } from "@/features/catalog/data/catalog-repository";
import { gameThemes } from "@/features/catalog/data/game-theme";
import { RocketLeagueRankConfigurator } from "@/features/configurator/components/rocket-league-rank-configurator";
import { RocketLeagueWinsConfigurator } from "@/features/configurator/components/rocket-league-wins-configurator";
import { RocketLeaguePlacementsConfigurator } from "@/features/configurator/components/rocket-league-placements-configurator";
import { RocketLeagueTournamentConfigurator } from "@/features/configurator/components/rocket-league-tournament-configurator";
import { RocketLeagueRewardsConfigurator } from "@/features/configurator/components/rocket-league-rewards-configurator";
import { ServiceConfigurator } from "@/features/configurator/components/service-configurator";
import { getServiceConfiguratorSchema } from "@/features/configurator/data/configurator-repository";

interface ServicePageProps {
  params: Promise<{ game: string; service: string }>;
}

const rocketLeagueServiceNavigation = [
  { slug: "rank-boost", label: "Rank Boost", mobileLabel: "Rank Boost" },
  { slug: "wins", label: "Competitive Wins", mobileLabel: "Wins" },
  { slug: "tournament-boost", label: "Tournament Boost", mobileLabel: "Tournament" },
  { slug: "rewards-boost", label: "Rewards Boost", mobileLabel: "Rewards" },
  { slug: "placements-boost", label: "Placements Boost", mobileLabel: "Placements" },
] as const;

const valorantServiceNavigation = [
  { slug: "rank-boost", label: "Rank Boost", mobileLabel: "Rank Boost" },
  { slug: "wins", label: "Competitive Wins", mobileLabel: "Wins" },
  { slug: "placement-matches", label: "Placements Boost", mobileLabel: "Placements" },
] as const;

function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

const rocketLeagueRankFaqs = [
  {
    question: "What is Rocket League rank boosting?",
    paragraphs: [
      "Rocket League rank boosting is a service that helps you progress from your current competitive rank toward a selected target rank. You configure the service based on your rank, playlist, platform and preferred boost method.",
    ],
  },
  {
    question: "How is the price of my Rocket League rank boost calculated?",
    paragraphs: [
      "Pricing depends on the configuration you select. Your current rank, target rank, playlist, boost method and optional upgrades can affect the final amount.",
      "The final payable price is validated by the server before payment.",
    ],
  },
  {
    question: "Which Rocket League playlists can I choose?",
    paragraphs: [
      "The available playlists are shown directly in the configurator. Select the playlist you want before continuing with your order.",
      "Any applicable price modifier is displayed as part of the configuration.",
    ],
  },
  {
    question: "What is the difference between Account Boost and Play With Booster?",
    paragraphs: [
      "Account Boost means the booster completes the service directly on your account.",
      "Play With Booster means you play alongside the booster instead of providing account access.",
      "Both options can be selected from the configurator when available for the service.",
    ],
  },
  {
    question: "When do I provide my account information?",
    paragraphs: [
      "Account details are not requested while you are configuring the service.",
      "For Account Boost orders, the required fulfillment information is collected after checkout.",
    ],
  },
  {
    question: "Can I track my Rocket League boosting order?",
    paragraphs: [
      "Yes. After the order is created, you can follow its status and relevant order updates through your BoostingPedia dashboard.",
    ],
  },
] as const;

const rocketLeagueWinsFaqs = [
  {
    question: "What is Rocket League win boosting?",
    paragraphs: [
      "Rocket League win boosting is a service for players who want a selected number of competitive wins rather than progression toward a specific target rank. You choose the number of wins and configure the service around your current rank, playlist, platform and boost method.",
    ],
  },
  {
    question: "How many Rocket League wins can I select?",
    paragraphs: [
      "The available win range is displayed directly in the configurator. You can adjust the number of wins before checkout and review how your package changes.",
    ],
  },
  {
    question: "Do larger win packages receive a discount?",
    paragraphs: [
      "Eligible larger packages can receive volume discounts. The applicable discount is displayed automatically in the configurator based on the number of wins you select.",
    ],
  },
  {
    question: "Which Rocket League playlists are available?",
    paragraphs: [
      "Available playlists are shown directly in the configurator and include supported competitive and extra modes. Any applicable price modifier is displayed before checkout.",
    ],
  },
  {
    question: "Can I choose between Account Boost and Play With Booster?",
    paragraphs: [
      "Yes. When both methods are available, you can select either Account Boost or Play With Booster directly in the configurator.",
      "Account Boost allows the booster to complete the service on your account, while Play With Booster lets you participate alongside the booster.",
    ],
  },
  {
    question: "When are my account details requested?",
    paragraphs: [
      "Account details are not required while configuring your order.",
      "For Account Boost orders, the required account information is requested after checkout.",
    ],
  },
  {
    question: "Can I track my competitive win order?",
    paragraphs: [
      "Yes. Once your order has been created, you can follow its status and relevant updates through your BoostingPedia dashboard.",
    ],
  },
] as const;

const rocketLeagueTournamentFaqs = [
  {
    question: "What is Rocket League tournament boosting?",
    paragraphs: [
      "Rocket League tournament boosting is a service configured around your current rank family, tournament playlist, platform and preferred boost method. You select the options you need before continuing to checkout.",
    ],
  },
  {
    question: "How is Rocket League Tournament Boost pricing calculated?",
    paragraphs: [
      "Pricing is based on the configuration you select, including your current rank family, playlist, boost method and any optional upgrades.",
      "The final payable amount is calculated and validated on the server.",
    ],
  },
  {
    question: "Do I need to choose Tier I, Tier II or Tier III?",
    paragraphs: [
      "No separate Tier I, Tier II or Tier III selection is required in the current configurator.",
      "Choose your current rank family and the available tournament configuration options directly on the page.",
    ],
  },
  {
    question: "Which tournament playlists can I choose?",
    paragraphs: [
      "The available playlists are shown directly in the configurator. Supported competitive and extra modes can have different price modifiers, which are displayed before checkout.",
    ],
  },
  {
    question: "Can I choose between Account Boost and Play With Booster?",
    paragraphs: [
      "Yes. When both methods are available, you can select either Account Boost or Play With Booster.",
      "Account Boost allows the booster to complete the service directly on your account, while Play With Booster lets you participate alongside the booster.",
    ],
  },
  {
    question: "When do I provide my account details?",
    paragraphs: [
      "Account details are not required while you configure the service.",
      "For Account Boost orders, the required account information is requested after checkout.",
    ],
  },
  {
    question: "Can I track my tournament boost order?",
    paragraphs: [
      "Yes. After your order is created, you can follow its status and relevant updates through your BoostingPedia dashboard.",
    ],
  },
] as const;

const rocketLeagueRewardsFaqs = [
  {
    question: "What is Rocket League season rewards boosting?",
    paragraphs: [
      "Rocket League season rewards boosting is a service designed to help you configure progress toward your seasonal reward wins. You select your current rank, number of reward wins, playlist, platform and preferred boost method before checkout.",
    ],
  },
  {
    question: "How many reward wins can I select?",
    paragraphs: [
      "The available reward win range is shown directly in the configurator.",
      "You can adjust the number of wins before checkout and review how your package and applicable discount change.",
    ],
  },
  {
    question: "How are season rewards package discounts applied?",
    paragraphs: [
      "Eligible reward win packages receive the package discount shown in the configurator.",
      "The available discount updates automatically when you change the number of reward wins.",
    ],
  },
  {
    question: "Does my current rank affect the order?",
    paragraphs: [
      "Yes. Your current Rocket League rank and tier are included in the season rewards configuration and are used as part of the pricing calculation.",
    ],
  },
  {
    question: "Which playlists can I choose?",
    paragraphs: [
      "Available playlists are shown directly in the configurator and include supported competitive and extra modes.",
      "Any applicable playlist price modifier is displayed before checkout.",
    ],
  },
  {
    question: "Can I choose between Account Boost and Play With Booster?",
    paragraphs: [
      "Yes. When both methods are available, you can choose either Account Boost or Play With Booster directly in the configurator.",
      "Account Boost allows the booster to complete the selected service on your account, while Play With Booster lets you participate alongside the booster.",
    ],
  },
  {
    question: "When do I provide my account information?",
    paragraphs: [
      "Account details are not required while you configure the service.",
      "For Account Boost orders, the required account information is requested after checkout.",
    ],
  },
  {
    question: "Can I track my season rewards order?",
    paragraphs: [
      "Yes. After your order is created, you can follow its status and relevant updates through your BoostingPedia dashboard.",
    ],
  },
] as const;

const rocketLeaguePlacementsFaqs = [
  {
    question: "What is Rocket League placement boosting?",
    paragraphs: [
      "Rocket League placement boosting is a service for completing a selected number of placement matches. You configure the order around your previous rank, number of placement matches, playlist, platform and preferred boost method.",
    ],
  },
  {
    question: "How many placement matches can I select?",
    paragraphs: [
      "The available placement match range is shown directly in the configurator.",
      "You can adjust the number of matches before checkout and review how your package and applicable discount change.",
    ],
  },
  {
    question: "What should I select if I do not have a previous rank?",
    paragraphs: [
      "Select Unrated if you do not have a previous competitive rank to use for the placement boost configuration.",
    ],
  },
  {
    question: "How are placement package discounts applied?",
    paragraphs: [
      "Eligible placement match packages receive the package discount displayed in the configurator.",
      "The available discount updates automatically when you change the number of placement matches.",
    ],
  },
  {
    question: "Which Rocket League playlists can I choose?",
    paragraphs: [
      "Available playlists are shown directly in the configurator and include supported competitive and extra modes.",
      "Any applicable playlist price modifier is displayed before checkout.",
    ],
  },
  {
    question: "Can I choose between Account Boost and Play With Booster?",
    paragraphs: [
      "Yes. When both methods are available, you can select either Account Boost or Play With Booster directly in the configurator.",
      "Account Boost allows the booster to complete the placement matches on your account, while Play With Booster lets you participate alongside the booster.",
    ],
  },
  {
    question: "When do I provide my account information?",
    paragraphs: [
      "Account details are not required while you configure the service.",
      "For Account Boost orders, the required account information is requested after checkout.",
    ],
  },
  {
    question: "Can I track my placement boost order?",
    paragraphs: [
      "Yes. After your order is created, you can follow its status and relevant updates through your BoostingPedia dashboard.",
    ],
  },
] as const;

export async function generateStaticParams() {
  const games = await listCatalogGames();
  return games.flatMap((game) =>
    game.services.map((service) => ({ game: game.slug, service: service.slug })),
  );
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { game: gameSlug, service: serviceSlug } = await params;
  const game = await findCatalogGameBySlug(gameSlug);
  const service = game?.services.find((item) => item.slug === serviceSlug);

  if (!game || !service) return { title: "Service not found" };

  const isRocketLeagueRank = game.slug === "rocket-league" && service.slug === "rank-boost";
  const isRocketLeagueWins = game.slug === "rocket-league" && service.slug === "wins";
  const isRocketLeaguePlacements = game.slug === "rocket-league" && service.slug === "placements-boost";
  const isRocketLeagueTournament = game.slug === "rocket-league" && service.slug === "tournament-boost";
  const isRocketLeagueRewards = game.slug === "rocket-league" && service.slug === "rewards-boost";
  const isValorantRank = game.slug === "valorant" && service.slug === "rank-boost";
  const isValorantWins = game.slug === "valorant" && service.slug === "wins";
  const isValorantPlacements = game.slug === "valorant" && service.slug === "placement-matches";

  return {
    title: isRocketLeagueRank
      ? "Rocket League Rank Boosting Service"
      : isRocketLeagueWins
        ? "Rocket League Win Boosting"
        : isRocketLeaguePlacements
          ? "Rocket League Placement Boosting"
          : isRocketLeagueTournament
            ? "Rocket League Tournament Boosting"
            : isRocketLeagueRewards
              ? "Rocket League Season Rewards Boost"
              : isValorantRank
                ? "Valorant Rank Boost"
                : isValorantWins
                  ? "Valorant Competitive Wins"
                  : isValorantPlacements
                    ? "Valorant Placements Boost"
                    : `${service.name} for ${game.name}`,
    description: isRocketLeagueRank
      ? "Configure Rocket League rank boosting by current rank, target rank, playlist, platform and boost method with transparent server-calculated pricing."
      : isRocketLeagueWins
        ? "Configure Rocket League win boosting by current rank, number of wins, playlist, platform and boost method with server-calculated volume discounts."
        : isRocketLeaguePlacements
          ? "Configure Rocket League placement boosting by previous season rank, number of placement matches, playlist, platform and boost method with server-calculated package discounts."
          : isRocketLeagueTournament
            ? "Configure Rocket League tournament boosting by rank family, playlist, platform and boost method with transparent server-calculated pricing."
            : isRocketLeagueRewards
              ? "Configure Rocket League season rewards boosting by current rank, reward wins, playlist, platform and boost method with server-calculated package discounts."
              : isValorantRank
                ? "Configure Valorant Rank Boost by current rank, target rank, RR gain, RR amount, server and boost type with transparent server-calculated pricing."
                : isValorantWins
                  ? "Configure Valorant Competitive Wins by current rank, win quantity, RR gain, server and boost type."
                  : isValorantPlacements
                    ? "Configure Valorant Placements Boost by current rank, placement quantity, server and boost type."
                    : `Configure ${service.name} for ${game.name}, preview server-calculated pricing, and create a secure order.`,
    alternates: { canonical: `/games/${game.slug}/${service.slug}` },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { game: gameSlug, service: serviceSlug } = await params;
  const game = await findCatalogGameBySlug(gameSlug);
  if (!game) notFound();

  const service = game.services.find((item) => item.slug === serviceSlug);
  if (!service) notFound();

  const isRocketLeagueRank = game.slug === "rocket-league" && service.slug === "rank-boost";
  const isRocketLeagueWins = game.slug === "rocket-league" && service.slug === "wins";
  const isRocketLeaguePlacements = game.slug === "rocket-league" && service.slug === "placements-boost";
  const isRocketLeagueTournament = game.slug === "rocket-league" && service.slug === "tournament-boost";
  const isRocketLeagueRewards = game.slug === "rocket-league" && service.slug === "rewards-boost";
  const isCustomRocketLeagueService =
    isRocketLeagueRank ||
    isRocketLeagueWins ||
    isRocketLeaguePlacements ||
    isRocketLeagueTournament ||
    isRocketLeagueRewards;
  const rocketLeagueBreadcrumbLabel =
    game.slug === "rocket-league"
      ? rocketLeagueServiceNavigation.find((item) => item.slug === service.slug)?.label
      : undefined;
  const breadcrumbJsonLd = rocketLeagueBreadcrumbLabel
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
          {
            "@type": "ListItem",
            position: 4,
            name: rocketLeagueBreadcrumbLabel,
            item: `${siteConfig.url}/games/rocket-league/${service.slug}`,
          },
        ],
      }
    : null;

  const isValorantRank = game.slug === "valorant" && service.slug === "rank-boost";
  const isValorantWins = game.slug === "valorant" && service.slug === "wins";
  const isValorantPlacements = game.slug === "valorant" && service.slug === "placement-matches";
  const isCustomValorantService = isValorantRank || isValorantWins || isValorantPlacements;

  const schema = isCustomRocketLeagueService
    ? null
    : await getServiceConfiguratorSchema({ serviceId: service.id, category: service.category });

  const theme = gameThemes[game.accent];

  const heroBadge = isRocketLeagueRank
    ? "Rocket League Rank Boost"
    : isRocketLeagueWins
      ? "Rocket League Competitive Wins"
      : isRocketLeaguePlacements
        ? "Rocket League Placements Boost"
        : isRocketLeagueTournament
          ? "Rocket League Tournament Boost"
          : isRocketLeagueRewards
            ? "Rocket League Rewards Boost"
            : isValorantRank
              ? "Valorant Rank Boost"
              : isValorantWins
                ? "Valorant Competitive Wins"
                : isValorantPlacements
                  ? "Valorant Placements Boost"
                  : `${game.name} service`;

  const heroTitle = isRocketLeagueRank
    ? "Reach your target rank without the unnecessary grind."
    : isRocketLeagueWins
      ? "Stack competitive wins with pricing that rewards larger packages."
      : isRocketLeaguePlacements
        ? "Complete your placement matches with transparent package pricing."
        : isRocketLeagueTournament
          ? "Push through tournament progression with clear rank-based pricing."
          : isRocketLeagueRewards
            ? "Build your seasonal rewards progress with flexible win packages."
            : isValorantRank
              ? "Reach your target Valorant rank without the unnecessary grind."
              : isValorantWins
                ? "Stack the competitive wins you need with transparent rank-based pricing."
                : isValorantPlacements
                  ? "Complete your placement matches with a clean, configurable order."
                  : `Configure ${service.name} for ${game.name}.`;

  const heroDescription = isRocketLeagueRank
    ? "Choose your current rank, target rank, playlist and preferred boost method. Add only the upgrades you want and see transparent pricing before creating your order."
    : isRocketLeagueWins
      ? "Choose your current rank, number of wins, playlist and preferred boost method. Larger win packages automatically unlock real volume discounts."
      : isRocketLeaguePlacements
        ? "Choose your previous season rank, placement matches, playlist and preferred boost method. Larger placement packages automatically unlock real discounts."
        : isRocketLeagueTournament
          ? "Choose your current rank family, playlist and preferred boost method. Tournament pricing is calculated directly from the selected rank family."
          : isRocketLeagueRewards
            ? "Choose your current rank, number of reward wins, playlist and preferred boost method. Larger reward packages automatically unlock real discounts."
            : isValorantRank
              ? "Choose your current rank, target rank, RR gain, RR amount, server and Solo or Duo. Add only the extras you want and see server-calculated pricing before checkout."
              : isValorantWins
                ? "Choose your current rank, number of wins, RR gain, server and Solo or Duo. Your total is calculated from the real rank-based win pricing."
                : isValorantPlacements
                  ? "Choose your current rank, number of placement matches, server and Solo or Duo. Configure up to five placements per order."
                  : `${service.description} Adjust the options below and receive a server-calculated price preview before creating your order.`;

  const heroPills = isRocketLeagueWins
    ? ["1–20 Competitive Wins", "Volume discounts up to 18%", "Account Boost or Play With Booster"]
    : isRocketLeaguePlacements
      ? ["1–10 Placement Matches", "Package discounts up to 21%", "1v1, 2v2, 3v3 & Extra Modes"]
      : isRocketLeagueTournament
        ? ["Rank family pricing", "No Tier I / II / III", "1v1, 2v2, 3v3 & Extra Modes"]
        : isRocketLeagueRewards
          ? ["1–10 Reward Wins", "Package discounts up to 21%", "Account Boost or Play With Booster"]
          : isRocketLeagueRank
            ? ["Account Boost or Play With Booster", "1v1, 2v2, 3v3 & Extra Modes", "Live order tracking"]
            : isValorantRank
              ? ["Iron → Immortal", "Solo or Duo", "RR-based pricing modifiers"]
              : isValorantWins
                ? ["1–5 Competitive Wins", "Solo or Duo", "Rank-based win pricing"]
                : isValorantPlacements
                  ? ["1–5 Placement Matches", "Unrated supported", "Solo or Duo"]
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

      <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
        <div className="hero-grid absolute inset-0 -z-20 opacity-25" />
        <div className={`absolute left-1/2 top-[-20rem] -z-10 h-[34rem] w-[60rem] -translate-x-1/2 rounded-full ${theme.softGlow} blur-[120px]`} />
        <Container className="py-5 sm:py-16 lg:py-18">
          <div className="sm:hidden">
            <Link
              href={`/games/${game.slug}`}
              className="inline-flex min-h-11 items-center text-xs font-semibold text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft className="mr-2 size-3.5" />
              Back to {game.name}
            </Link>
            {!isRocketLeagueRank && !isRocketLeagueWins && !isRocketLeaguePlacements && !isRocketLeagueTournament && !isRocketLeagueRewards ? (
              <h1 className="mt-2 text-balance text-3xl font-bold leading-[1.02] tracking-[-0.05em] text-white">
                {service.name}
              </h1>
            ) : null}
          </div>

          <div className="hidden sm:block">
            <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Link href="/" className="transition-colors hover:text-white">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/games" className="transition-colors hover:text-white">Games</Link>
              <span aria-hidden="true">/</span>
              <Link href={`/games/${game.slug}`} className="transition-colors hover:text-white">{game.name}</Link>
              <span aria-hidden="true">/</span>
              <span className="text-white">{service.name}</span>
            </div>
          </div>

          <div
            className={`${isRocketLeagueRank || isRocketLeagueWins || isRocketLeaguePlacements || isRocketLeagueTournament || isRocketLeagueRewards ? "mt-2 grid sm:mt-8" : "mt-8 hidden sm:grid"} gap-8 lg:grid-cols-[1fr_auto] lg:items-end`}
          >
            <div className="max-w-3xl">
              <Badge className={`${isRocketLeagueRank || isRocketLeagueWins || isRocketLeaguePlacements || isRocketLeagueTournament || isRocketLeagueRewards ? "hidden sm:inline-flex" : ""} ${theme.border} ${theme.surface} ${theme.text}`}>
                <Sparkles className="mr-2 size-3.5" />
                {heroBadge}
              </Badge>

              {isRocketLeagueRank ? (
                <>
                  <h1 className="text-balance text-3xl font-bold leading-[1.02] tracking-[-0.05em] text-white sm:mt-5">
                    Rocket League Rank Boosting
                  </h1>
                  <p className="mt-3 hidden text-balance text-4xl font-bold leading-[1.03] tracking-[-0.055em] text-white sm:block sm:text-5xl">
                    {heroTitle}
                  </p>
                </>
              ) : isRocketLeagueWins ? (
                <>
                  <h1 className="text-balance text-3xl font-bold leading-[1.02] tracking-[-0.05em] text-white sm:mt-5">
                    Rocket League Win Boosting
                  </h1>
                  <p className="mt-5 hidden text-balance text-4xl font-bold leading-[1.03] tracking-[-0.055em] text-white sm:block sm:text-5xl">
                    {heroTitle}
                  </p>
                </>
              ) : isRocketLeaguePlacements ? (
                <>
                  <h1 className="text-balance text-3xl font-bold leading-[1.02] tracking-[-0.05em] text-white sm:mt-5">
                    Rocket League Placement Boosting
                  </h1>
                  <p className="mt-5 hidden text-balance text-4xl font-bold leading-[1.03] tracking-[-0.055em] text-white sm:block sm:text-5xl">
                    {heroTitle}
                  </p>
                </>
              ) : isRocketLeagueTournament ? (
                <>
                  <h1 className="text-balance text-3xl font-bold leading-[1.02] tracking-[-0.05em] text-white sm:mt-5">
                    Rocket League Tournament Boosting
                  </h1>
                  <p className="mt-5 hidden text-balance text-4xl font-bold leading-[1.03] tracking-[-0.055em] text-white sm:block sm:text-5xl">
                    {heroTitle}
                  </p>
                </>
              ) : isRocketLeagueRewards ? (
                <>
                  <h1 className="text-balance text-3xl font-bold leading-[1.02] tracking-[-0.05em] text-white sm:mt-5">
                    Rocket League Season Rewards Boosting
                  </h1>
                  <p className="mt-5 hidden text-balance text-4xl font-bold leading-[1.03] tracking-[-0.055em] text-white sm:block sm:text-5xl">
                    {heroTitle}
                  </p>
                </>
              ) : (
                <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.03] tracking-[-0.055em] text-white sm:text-5xl">
                  {heroTitle}
                </h1>
              )}

              <p className={`${isRocketLeagueRank || isRocketLeagueWins || isRocketLeaguePlacements || isRocketLeagueTournament || isRocketLeagueRewards ? "hidden sm:block" : ""} mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg`}>
                {heroDescription}
              </p>

              {heroPills ? (
                <div className={`${isRocketLeagueRank || isRocketLeagueWins || isRocketLeaguePlacements || isRocketLeagueTournament || isRocketLeagueRewards ? "hidden sm:flex" : "flex"} mt-6 flex-wrap gap-2`}>
                  {heroPills.map((item) => (
                    <span key={item} className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/65">
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <Link
              href={`/games/${game.slug}`}
              className={`${isRocketLeagueRank || isRocketLeagueWins || isRocketLeaguePlacements || isRocketLeagueTournament || isRocketLeagueRewards ? "hidden sm:inline-flex" : "inline-flex"} items-center text-sm font-semibold text-white/65 transition-colors hover:text-white`}
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to {game.name}
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-6 sm:py-12 lg:py-16">
        <Container>
          {isCustomRocketLeagueService ? (
            <>
              <nav aria-label="Rocket League services" className="mb-3 sm:mb-4 xl:hidden">
                <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex min-w-max gap-2">
                    {rocketLeagueServiceNavigation.map((item) => {
                      const active = service.slug === item.slug;

                      return (
                        <Link
                          key={item.slug}
                          href={`/games/rocket-league/${item.slug}`}
                          aria-current={active ? "page" : undefined}
                          className={`inline-flex h-11 items-center justify-center whitespace-nowrap sm:h-10 rounded-xl border px-3.5 text-xs font-semibold transition-[border-color,background-color,color] duration-200 ease-out motion-reduce:transition-none ${
                            active
                              ? "border-blue-300/[0.20] bg-[#131B17] text-[#F4F7F5]"
                              : "border-white/[0.08] bg-[#090D0B] text-white/55 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
                          }`}
                        >
                          {active ? (
                            <span className="mr-2 size-1.5 rounded-full bg-[#39E56F]" aria-hidden="true" />
                          ) : null}
                          {item.mobileLabel}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </nav>

              <div className="xl:grid xl:grid-cols-[13.5rem_minmax(0,1fr)] xl:gap-4 2xl:grid-cols-[14.5rem_minmax(0,1fr)] 2xl:gap-5">
                <aside className="hidden xl:block">
                  <nav
                    aria-label="Rocket League services"
                    className="sticky top-24 overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#080B09] p-2.5"
                  >
                    <div className="px-2.5 pb-3 pt-2">
                      <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200/60">
                        Rocket League
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#F4F7F5]">Services</p>
                    </div>

                    <div className="space-y-1.5">
                      {rocketLeagueServiceNavigation.map((item) => {
                        const active = service.slug === item.slug;

                        return (
                          <Link
                            key={item.slug}
                            href={`/games/rocket-league/${item.slug}`}
                            aria-current={active ? "page" : undefined}
                            className={`group flex min-h-11 items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-[border-color,background-color,color] duration-200 ease-out motion-reduce:transition-none ${
                              active
                                ? "border-blue-300/[0.20] bg-[#131B17] text-[#F4F7F5]"
                                : "border-transparent bg-transparent text-white/52 hover:border-white/[0.08] hover:bg-[#0E1411] hover:text-white"
                            }`}
                          >
                            <span className="min-w-0 flex-1 truncate text-xs font-semibold">{item.label}</span>
                            {active ? (
                              <span className="size-1.5 shrink-0 rounded-full bg-[#39E56F]" aria-hidden="true" />
                            ) : null}
                          </Link>
                        );
                      })}
                    </div>

                    <div className="mx-2.5 my-3 h-px bg-white/[0.06]" />
                    <Link
                      href="/games/rocket-league"
                      className="flex items-center px-3 pb-2 text-[10px] font-medium text-white/35 transition-colors duration-200 hover:text-white/65 motion-reduce:transition-none"
                    >
                      <ArrowLeft className="mr-2 size-3" />
                      Rocket League overview
                    </Link>
                  </nav>
                </aside>

                <div className="min-w-0">
                  {isRocketLeagueRank ? (
                    <RocketLeagueRankConfigurator gameSlug={game.slug} service={service} />
                  ) : isRocketLeagueWins ? (
                    <RocketLeagueWinsConfigurator gameSlug={game.slug} service={service} />
                  ) : isRocketLeaguePlacements ? (
                    <RocketLeaguePlacementsConfigurator gameSlug={game.slug} service={service} />
                  ) : isRocketLeagueTournament ? (
                    <RocketLeagueTournamentConfigurator gameSlug={game.slug} service={service} />
                  ) : isRocketLeagueRewards ? (
                    <RocketLeagueRewardsConfigurator gameSlug={game.slug} service={service} />
                  ) : null}
                </div>
              </div>
            </>
          ) : isCustomValorantService && schema ? (
            <>
              <nav aria-label="Valorant services" className="mb-3 sm:mb-4 xl:hidden">
                <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex min-w-max gap-2">
                    {valorantServiceNavigation.map((item) => {
                      const active = service.slug === item.slug;

                      return (
                        <Link
                          key={item.slug}
                          href={`/games/valorant/${item.slug}`}
                          aria-current={active ? "page" : undefined}
                          className={`inline-flex h-11 items-center justify-center whitespace-nowrap sm:h-10 rounded-xl border px-3.5 text-xs font-semibold transition-[border-color,background-color,color] duration-200 ease-out motion-reduce:transition-none ${
                            active
                              ? "border-rose-300/[0.20] bg-[#131B17] text-[#F4F7F5]"
                              : "border-white/[0.08] bg-[#090D0B] text-white/55 hover:border-white/[0.14] hover:bg-[#0E1411] hover:text-white"
                          }`}
                        >
                          {active ? (
                            <span className="mr-2 size-1.5 rounded-full bg-[#39E56F]" aria-hidden="true" />
                          ) : null}
                          {item.mobileLabel}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </nav>

              <div className="xl:grid xl:grid-cols-[13.5rem_minmax(0,1fr)] xl:gap-4 2xl:grid-cols-[14.5rem_minmax(0,1fr)] 2xl:gap-5">
                <aside className="hidden xl:block">
                  <nav
                    aria-label="Valorant services"
                    className="sticky top-24 overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#080B09] p-2.5"
                  >
                    <div className="px-2.5 pb-3 pt-2">
                      <p className="font-gaming-label text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-200/60">
                        Valorant
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#F4F7F5]">Services</p>
                    </div>

                    <div className="space-y-1.5">
                      {valorantServiceNavigation.map((item) => {
                        const active = service.slug === item.slug;

                        return (
                          <Link
                            key={item.slug}
                            href={`/games/valorant/${item.slug}`}
                            aria-current={active ? "page" : undefined}
                            className={`group flex min-h-11 items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-[border-color,background-color,color] duration-200 ease-out motion-reduce:transition-none ${
                              active
                                ? "border-rose-300/[0.20] bg-[#131B17] text-[#F4F7F5]"
                                : "border-transparent bg-transparent text-white/52 hover:border-white/[0.08] hover:bg-[#0E1411] hover:text-white"
                            }`}
                          >
                            <span className="min-w-0 flex-1 truncate text-xs font-semibold">{item.label}</span>
                            {active ? (
                              <span className="size-1.5 shrink-0 rounded-full bg-[#39E56F]" aria-hidden="true" />
                            ) : null}
                          </Link>
                        );
                      })}
                    </div>

                    <div className="mx-2.5 my-3 h-px bg-white/[0.06]" />
                    <Link
                      href="/games/valorant"
                      className="flex items-center px-3 pb-2 text-[10px] font-medium text-white/35 transition-colors duration-200 hover:text-white/65 motion-reduce:transition-none"
                    >
                      <ArrowLeft className="mr-2 size-3" />
                      Valorant overview
                    </Link>
                  </nav>
                </aside>

                <div className="min-w-0">
                  <ServiceConfigurator gameSlug={game.slug} service={service} schema={schema} />
                </div>
              </div>
            </>
          ) : schema ? (
            <ServiceConfigurator gameSlug={game.slug} service={service} schema={schema} />
          ) : null}
        </Container>
      </section>

      <section className="border-y border-white/[0.06] bg-white/[0.012] py-14 sm:py-16">
        <Container>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Server-validated pricing", text: "Your browser never controls the final payable amount." },
              { icon: LockKeyhole, title: "Secure order flow", text: "Sensitive fulfillment details are collected after authentication and purchase." },
              { icon: CheckCircle2, title: "Track every update", text: "Follow your order status and customer notifications directly from your dashboard." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/[0.08] bg-black/15 p-5 sm:p-6">
                <span className={`grid size-10 place-items-center rounded-xl border ${theme.icon}`}>
                  <item.icon className="size-4" />
                </span>
                {isRocketLeagueRank || isRocketLeagueWins || isRocketLeaguePlacements || isRocketLeagueTournament || isRocketLeagueRewards ? (
                  <p className="mt-5 text-sm font-semibold text-white">{item.title}</p>
                ) : (
                  <h2 className="mt-5 text-sm font-semibold text-white">{item.title}</h2>
                )}
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{item.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {isRocketLeagueRank ? (
        <section className="border-b border-white/[0.06] bg-[#050807] pb-16 pt-14 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-24">
          <Container>
            <div className="mx-auto max-w-6xl">
              <div className="max-w-[52rem]">
                <p className="font-gaming-label text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-300/70 sm:text-xs">
                  Rocket League · {service.name}
                </p>
                <h2 className="mt-3 text-balance text-[1.75rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2.125rem]">
                  How Rocket League Rank Boosting Works
                </h2>
                <div className="mt-5 max-w-[44rem] space-y-4 text-[15px] leading-7 text-[#A0AAA4] sm:text-base">
                  <p>
                    Rocket League rank boosting lets you configure competitive rank progression around your current rank and the rank you want to reach.
                  </p>
                  <p>
                    Start by selecting your current and target rank in the configurator. Then choose the playlist, platform and boost method that matches how you want the service completed.
                  </p>
                  <p>
                    Your order configuration determines the final price. Optional upgrades are shown separately, so you can review what is included before creating your order.
                  </p>
                </div>
              </div>

              <div className="mt-16 sm:mt-20">
                <div className="max-w-3xl">
                  <h2 className="text-balance text-[1.75rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2.125rem]">
                    Choose Your Rank and Playlist
                  </h2>
                  <div className="mt-5 max-w-[44rem] space-y-4 text-[15px] leading-7 text-[#A0AAA4] sm:text-base">
                    <p>
                      Your Rocket League boost is configured around the progression you actually need rather than a fixed package.
                    </p>
                    <p>
                      Select your current rank and target rank, then choose from the competitive playlists available in the configurator. Supported options and any applicable price modifiers are displayed before checkout.
                    </p>
                    <p>
                      This makes it easier to understand exactly what you are ordering and how each configuration choice affects the service.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-16 sm:mt-20">
                <h2 className="text-balance text-[1.75rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2.125rem]">
                  Account Boost vs Play With Booster
                </h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Account Boost</h3>
                    <div className="mt-3 space-y-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      <p>With Account Boost, the booster completes the selected service directly on your account.</p>
                      <p>
                        Account access is requested only after checkout. Your login details are not required while you are configuring your order or before payment.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Play With Booster</h3>
                    <div className="mt-3 space-y-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      <p>Play With Booster allows you to play alongside the booster instead of providing account access.</p>
                      <p>
                        Select this method directly in the configurator to see how it affects your order and final price.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-16 sm:mt-20">
                <h2 className="text-balance text-[1.75rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2.125rem]">
                  How Your Rocket League Boost Order Is Protected
                </h2>
                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Server-Validated Pricing</h3>
                    <p className="mt-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      The final payable amount is calculated and validated on the server. Your browser does not control the final order price.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">No Hidden Upgrade Selections</h3>
                    <div className="mt-3 space-y-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      <p>Optional upgrades are displayed separately and are not automatically selected for you.</p>
                      <p>You can review your configuration before continuing to checkout.</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Order Tracking</h3>
                    <p className="mt-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      After your order is created, you can follow its status and order updates from your BoostingPedia dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-16 sm:mt-20 lg:mt-24">
                <div className="mx-auto max-w-[60rem]">
                  <div className="mb-6 sm:mb-7">
                    <p className="font-gaming-label text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-300/70 sm:text-xs">
                      Frequently Asked Questions
                    </p>
                    <h2 className="mt-3 text-balance text-[1.65rem] font-bold leading-[1.15] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2rem]">
                      Rocket League Rank Boost FAQ
                    </h2>
                  </div>
                  <RocketLeagueFaqAccordion items={rocketLeagueRankFaqs} />
                </div>
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {isRocketLeagueWins ? (
        <section className="border-b border-white/[0.06] bg-[#050807] pb-16 pt-14 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-24">
          <Container>
            <div className="mx-auto max-w-6xl">
              <div className="max-w-[52rem]">
                <p className="font-gaming-label text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-300/70 sm:text-xs">
                  Rocket League · {service.name}
                </p>
                <h2 className="mt-3 text-balance text-[1.75rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2.125rem]">
                  How Rocket League Win Boosting Works
                </h2>
                <div className="mt-5 max-w-[44rem] space-y-4 text-[15px] leading-7 text-[#A0AAA4] sm:text-base">
                  <p>
                    Rocket League win boosting lets you choose a specific number of competitive wins without setting a target rank.
                  </p>
                  <p>
                    Select your current rank, choose how many wins you want, and configure the playlist, platform and boost method that fit your order.
                  </p>
                  <p>
                    Your configuration is used to calculate the final price before checkout, including any applicable playlist modifiers, boost method adjustments and volume discounts.
                  </p>
                </div>
              </div>

              <div className="mt-16 sm:mt-20">
                <div className="max-w-3xl">
                  <h2 className="text-balance text-[1.75rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2.125rem]">
                    Choose Your Competitive Win Package
                  </h2>
                  <div className="mt-5 max-w-[44rem] space-y-4 text-[15px] leading-7 text-[#A0AAA4] sm:text-base">
                    <p>Build your order around the number of competitive wins you need.</p>
                    <p>
                      The configurator lets you adjust the number of wins directly and shows the volume discount available for your selected package. Larger packages can unlock additional discounts automatically as you increase the number of wins.
                    </p>
                    <p>
                      Your current rank is also included in the configuration so the service can be priced according to the selected competitive level.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-16 sm:mt-20">
                <div className="max-w-3xl">
                  <h2 className="text-balance text-[1.75rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2.125rem]">
                    Choose Your Playlist, Platform and Boost Method
                  </h2>
                  <div className="mt-5 max-w-[44rem] space-y-4 text-[15px] leading-7 text-[#A0AAA4] sm:text-base">
                    <p>Configure the service for the Rocket League playlist and platform you use.</p>
                    <p>
                      Available competitive and extra-mode playlists are shown directly in the configurator, along with any applicable price modifiers.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Account Boost</h3>
                    <div className="mt-3 space-y-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      <p>With Account Boost, the booster completes the selected competitive wins directly on your account.</p>
                      <p>
                        Account access is requested only after checkout and is not required while you are configuring the order.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Play With Booster</h3>
                    <div className="mt-3 space-y-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      <p>Play With Booster lets you play alongside the booster while completing the selected wins.</p>
                      <p>
                        Choose this option directly in the configurator to see how it affects your final order price.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-16 sm:mt-20">
                <h2 className="text-balance text-[1.75rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2.125rem]">
                  Transparent Pricing and Volume Discounts
                </h2>
                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Server-Calculated Pricing</h3>
                    <p className="mt-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      Your final payable amount is calculated and validated on the server based on your selected configuration.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Volume Discounts</h3>
                    <p className="mt-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      Eligible win packages receive the volume discount displayed in the configurator. As you change the number of wins, the available discount is updated with the package.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Order Tracking</h3>
                    <p className="mt-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      After your order is created, you can follow its status and relevant updates from your BoostingPedia dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-16 sm:mt-20 lg:mt-24">
                <div className="mx-auto max-w-[60rem]">
                  <div className="mb-6 sm:mb-7">
                    <p className="font-gaming-label text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-300/70 sm:text-xs">
                      Frequently Asked Questions
                    </p>
                    <h2 className="mt-3 text-balance text-[1.65rem] font-bold leading-[1.15] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2rem]">
                      Rocket League Win Boost FAQ
                    </h2>
                  </div>
                  <RocketLeagueFaqAccordion items={rocketLeagueWinsFaqs} />
                </div>
              </div>
            </div>
          </Container>
        </section>
      ) : null}
      {isRocketLeagueTournament ? (
        <section className="border-b border-white/[0.06] bg-[#050807] pb-16 pt-14 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-24">
          <Container>
            <div className="mx-auto max-w-6xl">
              <div className="max-w-[52rem]">
                <p className="font-gaming-label text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-300/70 sm:text-xs">
                  Rocket League · {service.name}
                </p>
                <h2 className="mt-3 text-balance text-[1.75rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2.125rem]">
                  How Rocket League Tournament Boosting Works
                </h2>
                <div className="mt-5 max-w-[44rem] space-y-4 text-[15px] leading-7 text-[#A0AAA4] sm:text-base">
                  <p>
                    Rocket League tournament boosting is configured around your current rank family, tournament playlist, platform and preferred boost method.
                  </p>
                  <p>
                    Start by selecting your current rank family in the configurator. Then choose the playlist and platform you use and decide whether you prefer Account Boost or Play With Booster.
                  </p>
                  <p>
                    Your selected configuration is used to calculate the final price before checkout.
                  </p>
                </div>
              </div>

              <div className="mt-16 sm:mt-20">
                <div className="max-w-3xl">
                  <h2 className="text-balance text-[1.75rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2.125rem]">
                    Choose Your Tournament Rank Family
                  </h2>
                  <div className="mt-5 max-w-[44rem] space-y-4 text-[15px] leading-7 text-[#A0AAA4] sm:text-base">
                    <p>Tournament Boost pricing is based on the Rocket League rank family you select.</p>
                    <p>
                      Choose your current competitive rank family directly in the configurator, from Bronze through Supersonic Legend.
                    </p>
                    <p>
                      The service uses the selected rank family for pricing rather than requiring separate Tier I, Tier II or Tier III selections.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-16 sm:mt-20">
                <div className="max-w-3xl">
                  <h2 className="text-balance text-[1.75rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2.125rem]">
                    Choose Your Tournament Playlist and Platform
                  </h2>
                  <div className="mt-5 max-w-[44rem] space-y-4 text-[15px] leading-7 text-[#A0AAA4] sm:text-base">
                    <p>Select the tournament playlist that matches how you want the service configured.</p>
                    <p>
                      Supported competitive and extra-mode playlists are shown directly in the configurator. Any applicable playlist price modifier is displayed before checkout.
                    </p>
                    <p>You can also select your platform as part of the same order configuration.</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Account Boost</h3>
                    <div className="mt-3 space-y-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      <p>With Account Boost, the booster completes the selected tournament service directly on your account.</p>
                      <p>
                        Account access is not required while configuring your order and is requested only after checkout.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Play With Booster</h3>
                    <div className="mt-3 space-y-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      <p>Play With Booster lets you participate alongside the booster instead of providing account access.</p>
                      <p>
                        Select this method directly in the configurator to see how it affects your final order price.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-16 sm:mt-20">
                <h2 className="text-balance text-[1.75rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2.125rem]">
                  Transparent Tournament Pricing and Order Tracking
                </h2>
                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Server-Calculated Pricing</h3>
                    <p className="mt-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      Your final payable amount is calculated and validated on the server based on the tournament configuration you select.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Configuration Shown Upfront</h3>
                    <p className="mt-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      Your selected rank family, playlist, platform, boost method and optional upgrades are shown before you continue to checkout.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Order Tracking</h3>
                    <p className="mt-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      After your order is created, you can follow its status and relevant updates through your BoostingPedia dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-16 sm:mt-20 lg:mt-24">
                <div className="mx-auto max-w-[60rem]">
                  <div className="mb-6 sm:mb-7">
                    <p className="font-gaming-label text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-300/70 sm:text-xs">
                      Frequently Asked Questions
                    </p>
                    <h2 className="mt-3 text-balance text-[1.65rem] font-bold leading-[1.15] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2rem]">
                      Rocket League Tournament Boost FAQ
                    </h2>
                  </div>
                  <RocketLeagueFaqAccordion items={rocketLeagueTournamentFaqs} />
                </div>
              </div>
            </div>
          </Container>
        </section>
      ) : null}
      {isRocketLeagueRewards ? (
        <section className="border-b border-white/[0.06] bg-[#050807] pb-16 pt-14 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-24">
          <Container>
            <div className="mx-auto max-w-6xl">
              <div className="max-w-[52rem]">
                <p className="font-gaming-label text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-300/70 sm:text-xs">
                  Rocket League · {service.name}
                </p>
                <h2 className="mt-3 text-balance text-[1.75rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2.125rem]">
                  How Rocket League Season Rewards Boosting Works
                </h2>
                <div className="mt-5 max-w-[44rem] space-y-4 text-[15px] leading-7 text-[#A0AAA4] sm:text-base">
                  <p>
                    Rocket League season rewards boosting lets you configure progress toward your seasonal reward wins based on your current competitive rank.
                  </p>
                  <p>
                    Select your current rank and tier, choose how many reward wins you want, and configure the playlist, platform and boost method that fit your order.
                  </p>
                  <p>
                    Your selected configuration is used to calculate the final price before checkout, including any applicable package discounts, playlist modifiers and optional upgrades.
                  </p>
                </div>
              </div>

              <div className="mt-16 sm:mt-20">
                <div className="max-w-3xl">
                  <h2 className="text-balance text-[1.75rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2.125rem]">
                    Choose Your Current Rank and Reward Wins
                  </h2>
                  <div className="mt-5 max-w-[44rem] space-y-4 text-[15px] leading-7 text-[#A0AAA4] sm:text-base">
                    <p>Your current Rocket League rank is part of the season rewards configuration.</p>
                    <p>
                      Select your rank and tier directly in the configurator, then choose the number of reward wins you want to add to your order.
                    </p>
                    <p>
                      The available reward win range is displayed on the page so you can adjust the package before continuing to checkout.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-16 sm:mt-20">
                <div className="max-w-3xl">
                  <h2 className="text-balance text-[1.75rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2.125rem]">
                    Season Rewards Package Discounts
                  </h2>
                  <div className="mt-5 max-w-[44rem] space-y-4 text-[15px] leading-7 text-[#A0AAA4] sm:text-base">
                    <p>Larger reward win packages can unlock automatic discounts.</p>
                    <p>
                      The applicable package discount is displayed directly in the configurator and updates as you change the number of reward wins.
                    </p>
                    <p>
                      This lets you review both your selected reward progress and the applicable discount before creating your order.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-16 sm:mt-20">
                <div className="max-w-3xl">
                  <h2 className="text-balance text-[1.75rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2.125rem]">
                    Choose Your Playlist, Platform and Boost Method
                  </h2>
                  <div className="mt-5 max-w-[44rem] space-y-4 text-[15px] leading-7 text-[#A0AAA4] sm:text-base">
                    <p>Select the Rocket League playlist and platform you want to use for your season rewards order.</p>
                    <p>
                      Supported competitive and extra-mode playlists are shown directly in the configurator, together with any applicable price modifiers.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Account Boost</h3>
                    <div className="mt-3 space-y-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      <p>With Account Boost, the booster completes the selected reward wins directly on your account.</p>
                      <p>
                        Account information is not required while configuring your order and is requested only after checkout.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Play With Booster</h3>
                    <div className="mt-3 space-y-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      <p>Play With Booster lets you participate alongside the booster while completing the selected reward wins.</p>
                      <p>
                        Choose this method directly in the configurator to see how it affects your final order price.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-16 sm:mt-20">
                <h2 className="text-balance text-[1.75rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2.125rem]">
                  Transparent Pricing and Order Tracking
                </h2>
                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Server-Calculated Pricing</h3>
                    <p className="mt-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      Your final payable amount is calculated and validated on the server based on the configuration you select.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Optional Upgrades</h3>
                    <div className="mt-3 space-y-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      <p>Optional upgrades are displayed separately and are not automatically selected.</p>
                      <p>
                        You can review any selected upgrades together with your rank, reward wins, playlist, platform and boost method before checkout.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Order Tracking</h3>
                    <p className="mt-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      After your order is created, you can follow its status and relevant updates through your BoostingPedia dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-16 sm:mt-20 lg:mt-24">
                <div className="mx-auto max-w-[60rem]">
                  <div className="mb-6 sm:mb-7">
                    <p className="font-gaming-label text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-300/70 sm:text-xs">
                      Frequently Asked Questions
                    </p>
                    <h2 className="mt-3 text-balance text-[1.65rem] font-bold leading-[1.15] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2rem]">
                      Rocket League Season Rewards Boost FAQ
                    </h2>
                  </div>
                  <RocketLeagueFaqAccordion items={rocketLeagueRewardsFaqs} />
                </div>
              </div>
            </div>
          </Container>
        </section>
      ) : null}
      {isRocketLeaguePlacements ? (
        <section className="border-b border-white/[0.06] bg-[#050807] pb-16 pt-14 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-24">
          <Container>
            <div className="mx-auto max-w-6xl">
              <div className="max-w-[52rem]">
                <p className="font-gaming-label text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-300/70 sm:text-xs">
                  Rocket League · {service.name}
                </p>
                <h2 className="mt-3 text-balance text-[1.75rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2.125rem]">
                  How Rocket League Placement Boosting Works
                </h2>
                <div className="mt-5 max-w-[44rem] space-y-4 text-[15px] leading-7 text-[#A0AAA4] sm:text-base">
                  <p>
                    Rocket League placement boosting lets you configure the placement matches you want completed based on your previous competitive rank.
                  </p>
                  <p>
                    Select your previous season rank, choose the number of placement matches you need, and configure the playlist, platform and preferred boost method.
                  </p>
                  <p>
                    Your selected configuration is used to calculate the final price before checkout, including any applicable package discounts, playlist modifiers and optional upgrades.
                  </p>
                </div>
              </div>

              <div className="mt-16 sm:mt-20">
                <div className="max-w-3xl">
                  <h2 className="text-balance text-[1.75rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2.125rem]">
                    Choose Your Previous Rank and Placement Matches
                  </h2>
                  <div className="mt-5 max-w-[44rem] space-y-4 text-[15px] leading-7 text-[#A0AAA4] sm:text-base">
                    <p>Your previous Rocket League rank provides context for your placement boost configuration.</p>
                    <p>If you do not have a previous rank, you can select Unrated directly in the configurator.</p>
                    <p>
                      Choose the number of placement matches you want from the available range before continuing with your order.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-16 sm:mt-20">
                <div className="max-w-3xl">
                  <h2 className="text-balance text-[1.75rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2.125rem]">
                    Placement Match Package Discounts
                  </h2>
                  <div className="mt-5 max-w-[44rem] space-y-4 text-[15px] leading-7 text-[#A0AAA4] sm:text-base">
                    <p>Eligible placement match packages can unlock automatic discounts.</p>
                    <p>
                      The applicable package discount is displayed directly in the configurator and updates as you change the number of placement matches.
                    </p>
                    <p>This lets you review the selected package and its discount before checkout.</p>
                  </div>
                </div>
              </div>

              <div className="mt-16 sm:mt-20">
                <div className="max-w-3xl">
                  <h2 className="text-balance text-[1.75rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2.125rem]">
                    Choose Your Playlist, Platform and Boost Method
                  </h2>
                  <div className="mt-5 max-w-[44rem] space-y-4 text-[15px] leading-7 text-[#A0AAA4] sm:text-base">
                    <p>Select the Rocket League playlist and platform you want to use for your placement boost.</p>
                    <p>
                      Supported competitive and extra-mode playlists are shown directly in the configurator, together with any applicable price modifiers.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Account Boost</h3>
                    <div className="mt-3 space-y-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      <p>With Account Boost, the booster completes the selected placement matches directly on your account.</p>
                      <p>
                        Account information is not required while configuring your order and is requested only after checkout.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Play With Booster</h3>
                    <div className="mt-3 space-y-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      <p>Play With Booster lets you participate alongside the booster while completing the selected placement matches.</p>
                      <p>
                        Choose this method directly in the configurator to see how it affects your final order price.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-16 sm:mt-20">
                <h2 className="text-balance text-[1.75rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2.125rem]">
                  Transparent Placement Boost Pricing and Order Tracking
                </h2>
                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Server-Calculated Pricing</h3>
                    <p className="mt-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      Your final payable amount is calculated and validated on the server based on the configuration you select.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Optional Upgrades</h3>
                    <div className="mt-3 space-y-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      <p>Optional upgrades are displayed separately and are not automatically selected.</p>
                      <p>
                        You can review any selected upgrades together with your previous rank, placement matches, playlist, platform and boost method before checkout.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B100E] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#F4F7F5] sm:text-xl">Order Tracking</h3>
                    <p className="mt-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      After your order is created, you can follow its status and relevant updates through your BoostingPedia dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-16 sm:mt-20 lg:mt-24">
                <div className="mx-auto max-w-[60rem]">
                  <div className="mb-6 sm:mb-7">
                    <p className="font-gaming-label text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-300/70 sm:text-xs">
                      Frequently Asked Questions
                    </p>
                    <h2 className="mt-3 text-balance text-[1.65rem] font-bold leading-[1.15] tracking-[-0.035em] text-[#F4F7F5] sm:text-[2rem]">
                      Rocket League Placement Boost FAQ
                    </h2>
                  </div>
                  <RocketLeagueFaqAccordion items={rocketLeaguePlacementsFaqs} />
                </div>
              </div>
            </div>
          </Container>
        </section>
      ) : null}
      <SiteFooter />
    </main>
  );
}
