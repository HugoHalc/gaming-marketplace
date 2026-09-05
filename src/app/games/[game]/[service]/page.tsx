import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
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
                    : `${service.name} for ${game.name}`,
    description: isRocketLeagueRank
      ? "Configure your Rocket League Rank Boost by rank, playlist, platform and boost method with transparent server-calculated pricing."
      : isRocketLeagueWins
        ? "Configure Rocket League Competitive Wins by current rank, number of wins, playlist, platform and boost method with server-calculated volume discounts."
        : isRocketLeaguePlacements
          ? "Configure Rocket League Placements Boost by previous season rank, placement matches, playlist, platform and boost method with server-calculated package discounts."
          : isRocketLeagueTournament
            ? "Configure Rocket League Tournament Boost by rank family, playlist, platform and boost method with server-calculated pricing."
            : isRocketLeagueRewards
              ? "Configure Rocket League Rewards Boost by current rank, number of reward wins, playlist, platform and boost method with server-calculated package discounts."
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
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
        <div className="hero-grid absolute inset-0 -z-20 opacity-25" />
        <div className={`absolute left-1/2 top-[-20rem] -z-10 h-[34rem] w-[60rem] -translate-x-1/2 rounded-full ${theme.softGlow} blur-[120px]`} />
        <Container className="py-12 sm:py-16 lg:py-18">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/games" className="transition-colors hover:text-white">Games</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/games/${game.slug}`} className="transition-colors hover:text-white">{game.name}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-white">{service.name}</span>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <Badge className={`${theme.border} ${theme.surface} ${theme.text}`}>
                <Sparkles className="mr-2 size-3.5" />
                {heroBadge}
              </Badge>

              <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.03] tracking-[-0.055em] text-white sm:text-5xl">
                {heroTitle}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
                {heroDescription}
              </p>

              {heroPills ? (
                <div className="mt-6 flex flex-wrap gap-2">
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
              className="inline-flex items-center text-sm font-semibold text-white/65 transition-colors hover:text-white"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to {game.name}
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-12 lg:py-16">
        <Container>
          {isCustomRocketLeagueService ? (
            <>
              <nav aria-label="Rocket League services" className="mb-4 xl:hidden">
                <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex min-w-max gap-2">
                    {rocketLeagueServiceNavigation.map((item) => {
                      const active = service.slug === item.slug;

                      return (
                        <Link
                          key={item.slug}
                          href={`/games/rocket-league/${item.slug}`}
                          aria-current={active ? "page" : undefined}
                          className={`inline-flex h-10 items-center justify-center whitespace-nowrap rounded-xl border px-3.5 text-xs font-semibold transition-[border-color,background-color,color] duration-200 ease-out motion-reduce:transition-none ${
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
              <nav aria-label="Valorant services" className="mb-4 xl:hidden">
                <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex min-w-max gap-2">
                    {valorantServiceNavigation.map((item) => {
                      const active = service.slug === item.slug;

                      return (
                        <Link
                          key={item.slug}
                          href={`/games/valorant/${item.slug}`}
                          aria-current={active ? "page" : undefined}
                          className={`inline-flex h-10 items-center justify-center whitespace-nowrap rounded-xl border px-3.5 text-xs font-semibold transition-[border-color,background-color,color] duration-200 ease-out motion-reduce:transition-none ${
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
                <h2 className="mt-5 text-sm font-semibold text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{item.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
