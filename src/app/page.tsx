import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Gamepad2,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { launchGames } from "@/features/catalog/data/launch-games";
import { boosterPlaceholders } from "@/features/marketing/booster-placeholders";
import {
  faqs,
  howItWorks,
  testimonials,
  trustFeatures,
} from "@/features/marketing/content";

const gameVisual = {
  emerald: "from-emerald-500/[0.18] via-emerald-500/[0.045] to-transparent border-emerald-300/15",
  rose: "from-rose-500/[0.20] via-rose-500/[0.045] to-transparent border-rose-300/15",
  violet: "from-violet-500/[0.20] via-violet-500/[0.045] to-transparent border-violet-300/15",
  cyan: "from-cyan-500/[0.18] via-cyan-500/[0.045] to-transparent border-cyan-300/15",
  amber: "from-amber-500/[0.18] via-amber-500/[0.045] to-transparent border-amber-300/15",
  blue: "from-blue-500/[0.22] via-blue-500/[0.05] to-transparent border-blue-300/15",
} as const;

const homeGameCardAssets = {
  "rocket-league": "/game-cards/rocket-league.webp",
  "league-of-legends": "/game-cards/league-of-legends.webp",
  valorant: "/game-cards/valorant.webp",
  "marvel-rivals": "/game-cards/marvel-rivals.webp",
  "overwatch-2": "/game-cards/overwatch.webp",
  "battlefield-6": "/game-cards/battlefield-6.webp",
  "rainbow-six-siege": "/game-cards/rainbow-six-siege.webp",
} as const;

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "center" | "left";
}) {
  const classes = align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl";
  return (
    <div className={classes}>
      <p className="font-gaming-label text-sm text-green-300">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)] sm:text-base">
        {description}
      </p>
    </div>
  );
}

function BoosterAvatar({ initials }: { initials: string }) {
  return (
    <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/[0.09] bg-[radial-gradient(circle_at_30%_20%,rgba(74,222,128,.18),transparent_40%),#111512] text-lg font-black tracking-[-0.04em] text-white">
      <span className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent" />
      <span className="relative">{initials}</span>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-[#FFFFFF14] bg-[#050807]">
        <div className="hero-grid absolute inset-0 -z-20 opacity-30" />
        <div className="absolute right-[6%] top-[-12rem] -z-10 h-[31rem] w-[42rem] rounded-full bg-[#39E56F]/[0.07] blur-[115px]" />
        <Container className="grid min-h-[470px] items-center gap-10 py-14 lg:grid-cols-[1.04fr_.96fr] lg:py-16">
          <div className="max-w-3xl">
            <Badge className="mb-5 border-[#39E56F]/20 bg-[#39E56F]/[0.06] text-[#82F5A4]">
              <span className="mr-2 size-1.5 rounded-full bg-[#3DD9EB]" />
              BoostingPedia gaming marketplace
            </Badge>

            <h1 className="text-balance text-5xl font-bold leading-[0.96] tracking-[-0.065em] text-[#F4F7F5] sm:text-6xl lg:text-[4.5rem]">
              Professional boosting built around your game.
            </h1>

            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-[#A0AAA4] sm:text-lg">
              Choose your title, open its dedicated storefront, and configure the service around your competitive goal.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="min-w-44 bg-[#39E56F] text-[#050807] hover:bg-[#20C95A] hover:text-[#050807]">
                <Link href="#games">
                  Choose your game
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="#boosters">Meet our boosters</Link>
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--muted-foreground)] sm:text-sm">
              {["Server-calculated pricing", "Game-specific storefronts", "Order tracking"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded-full bg-green-400/10 text-green-300">
                    <Check className="size-3" />
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative hidden min-h-[340px] lg:block">
            <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-[#FFFFFF14] bg-[#090D0B]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_66%_32%,rgba(57,229,111,.12),transparent_24%),linear-gradient(145deg,rgba(255,255,255,.025),transparent_50%)]" />
              <div className="absolute -right-8 top-6 size-64 rotate-12 rounded-[2.5rem] border border-white/[0.06] bg-white/[0.02]" />
              <div className="absolute right-16 top-16 grid size-44 place-items-center rounded-full border border-[#39E56F]/10 bg-[#39E56F]/[0.03]">
                <Gamepad2 className="size-16 text-[#82F5A4]/45" />
              </div>

              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-[#FFFFFF14] bg-[#0E1411]/90 p-4 backdrop-blur">
                <p className="font-gaming-label text-[10px] uppercase tracking-[0.15em] text-[#82F5A4]/70">
                  Launch lineup
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {launchGames.slice(0, 5).map((game) => (
                    <span key={game.slug} className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[10px] font-medium text-white/55">
                      {game.displayName}
                    </span>
                  ))}
                  <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[10px] font-medium text-white/55">
                    +{launchGames.length - 5} more
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="boosters" className="scroll-mt-24 py-8 sm:py-10">
        <Container>
          <div className="relative overflow-hidden rounded-[1.8rem] border border-green-300/[0.12] bg-[#0a0d0b]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(74,222,128,.10),transparent_28%),linear-gradient(120deg,rgba(74,222,128,.055),transparent_46%)]" />
            <div className="relative grid gap-7 p-6 sm:p-7 lg:grid-cols-[.68fr_1.32fr] lg:items-center lg:p-8">
              <div>
                <p className="font-gaming-label text-sm text-green-300">Meet Our Boosters</p>
                <h2 className="mt-2 max-w-md text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">
                  The players behind the services.
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--muted-foreground)]">
                  Preview the team format here. These profiles are placeholders and can later be replaced with real photos, nicknames, specialties, ranks, and verified performance data.
                </p>
                <Button asChild variant="secondary" className="mt-5">
                  <Link href="/boosters">
                    Meet the team
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>

              <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1">
                {boosterPlaceholders.map((booster) => (
                  <div
                    key={booster.id}
                    className="min-w-[15.5rem] snap-start rounded-2xl border border-white/[0.075] bg-black/25 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <BoosterAvatar initials={booster.initials} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-gaming-value truncate text-sm text-white">{booster.nickname}</h3>
                          <span className="rounded-full border border-green-400/15 bg-green-400/[0.06] px-2 py-0.5 text-[9px] font-bold text-green-300">
                            PLACEHOLDER
                          </span>
                        </div>
                        <p className="mt-1 truncate text-[11px] text-white/40">{booster.primaryGame}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
                        <p className="font-gaming-label text-[9px] uppercase tracking-[0.12em] text-white/25">Specialty</p>
                        <p className="mt-1 truncate text-[11px] font-semibold text-white/70">{booster.specialty}</p>
                      </div>
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
                        <p className="font-gaming-label text-[9px] uppercase tracking-[0.12em] text-white/25">Rank</p>
                        <p className="mt-1 truncate text-[11px] font-semibold text-white/70">{booster.rankLabel}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="games" className="scroll-mt-24 pb-16 pt-8 sm:pb-20 lg:pb-24">
        <Container>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="font-gaming-label text-sm text-green-300">Choose your game</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl lg:text-5xl">
                Jump straight into a game storefront.
              </h2>
            </div>
            <Link
              href="/games"
              className="inline-flex items-center text-sm font-semibold text-white/60 transition-colors hover:text-white"
            >
              View all games
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {launchGames.map((game) => {
              const imageSrc =
                homeGameCardAssets[game.slug as keyof typeof homeGameCardAssets];

              const cardVisual = (
                <>
                  <Image
                    src={imageSrc}
                    alt=""
                    fill
                    priority={game.slug === "rocket-league"}
                    sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover object-center"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#050807]/65 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#050807]/28 via-transparent to-transparent" />

                  {game.slug === "marvel-rivals" ? (
                    <>
                      <div className="absolute left-5 top-5 z-10">
                        <p className="font-gaming-value text-sm uppercase tracking-[0.13em] text-[#F4F7F5]">
                          Marvel Rivals
                        </p>
                      </div>
                      <div className="pointer-events-none absolute left-5 top-1/2 z-[1] -translate-y-1/2 select-none font-gaming-value text-[clamp(2.35rem,4.6vw,4.7rem)] uppercase tracking-[-0.055em] text-[#F4F7F5]/[0.06]">
                        Marvel Rivals
                      </div>
                    </>
                  ) : null}

                  {game.slug === "rainbow-six-siege" ? (
                    <div className="pointer-events-none absolute left-5 top-1/2 z-[1] -translate-y-1/2 select-none font-gaming-value text-[clamp(2rem,4.2vw,4.3rem)] tracking-[-0.055em] text-[#F4F7F5]/[0.055]">
                      Rainbow Six Siege
                    </div>
                  ) : null}

                  <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between p-5">
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-full border backdrop-blur-sm transition-[border-color,background-color,color] duration-200 ${
                        game.ready
                          ? "border-[#FFFFFF14] bg-[#090D0B]/85 text-[#A0AAA4] group-hover:border-[#39E56F]/35 group-hover:bg-[#39E56F]/[0.10] group-hover:text-[#82F5A4]"
                          : "border-[#FFFFFF14] bg-[#090D0B]/75 text-[#667069]"
                      }`}
                    >
                      <ArrowRight className="size-4" />
                    </span>

                    <span
                      className={`font-gaming-label rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.1em] backdrop-blur-sm ${
                        game.ready
                          ? "border-[#39E56F]/20 bg-[#090D0B]/80 text-[#82F5A4]"
                          : "border-[#FFFFFF14] bg-[#090D0B]/80 text-[#A0AAA4]"
                      }`}
                    >
                      {game.ready ? "Available" : "In development"}
                    </span>
                  </div>
                </>
              );

              return game.ready ? (
                <Link
                  key={game.slug}
                  href={`/games/${game.slug}`}
                  className="group relative min-h-[16rem] overflow-hidden rounded-[1.4rem] border border-[#FFFFFF14] bg-[#0E1411] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-[0_24px_55px_-38px_rgba(0,0,0,.95)]"
                >
                  {cardVisual}
                </Link>
              ) : (
                <div
                  key={game.slug}
                  aria-label={`${game.displayName} is in development`}
                  className="relative min-h-[16rem] cursor-default overflow-hidden rounded-[1.4rem] border border-[#FFFFFF14] bg-[#0E1411] opacity-80"
                >
                  {cardVisual}
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section id="how-it-works" className="scroll-mt-24 border-y border-white/[0.06] bg-white/[0.012] py-20 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[.78fr_1.22fr] lg:items-start">
            <SectionHeading
              eyebrow="How it works"
              title="A simple path from game to order."
              description="The visual hierarchy starts with the game, then moves into the service and its configuration."
              align="left"
            />
            <div className="grid gap-3">
              {howItWorks.map((item) => (
                <Card key={item.step} className="grid gap-5 p-6 sm:grid-cols-[auto_1fr] sm:items-start">
                  <span className="text-3xl font-bold tracking-[-0.05em] text-green-400/70">{item.step}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{item.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Marketplace foundation"
            title="Designed to stay consistent as the catalog grows."
            description="The structure is ready for custom art, game-specific service catalogs, and future content without rebuilding the visual system."
          />
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {trustFeatures.slice(0, 6).map(({ icon: Icon, title, description }) => (
              <div key={title}>
                <span className="grid size-10 place-items-center rounded-xl border border-green-300/15 bg-green-400/[0.06] text-green-300">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/[0.06] bg-black/10 py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Customer experience"
            title="Built to feel clear at every step."
            description="Illustrative launch content can be replaced later without affecting the structure."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="p-6 sm:p-7">
                <div className="flex gap-1 text-amber-300" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="size-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-6 text-[15px] leading-7 text-white/90">
                  “{testimonial.quote}”
                </blockquote>
                <div className="mt-7 border-t border-white/[0.06] pt-5">
                  <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">{testimonial.detail}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section id="faq" className="scroll-mt-24 py-20 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
          <SectionHeading
            eyebrow="FAQ"
            title="Straight answers before checkout."
            description="This section remains ready for final policy and launch copy."
            align="left"
          />
          <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {faqs.map((item) => (
              <details key={item.question} className="group py-5 open:pb-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left font-semibold text-white marker:hidden">
                  {item.question}
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-white/[0.08] text-[var(--muted-foreground)] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-3xl pr-10 text-sm leading-7 text-[var(--muted-foreground)]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-20 sm:pb-24">
        <Container>
          <div className="relative overflow-hidden rounded-[2rem] border border-green-300/15 bg-gradient-to-br from-green-500/[0.12] via-[#0b0f0c] to-transparent p-8 sm:p-10 lg:p-12">
            <div className="absolute right-[-5rem] top-[-7rem] size-72 rounded-full bg-green-500/[0.12] blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-3xl">
                <Badge className="border-white/10 bg-white/[0.05] text-white/75">
                  <Sparkles className="mr-2 size-3.5" />
                  BoostingPedia
                </Badge>
                <h2 className="mt-5 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">
                  Start with the game. The rest becomes simpler.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)] sm:text-base">
                  Explore the launch lineup and enter a dedicated game storefront before choosing a service.
                </p>
              </div>
              <Button asChild size="lg">
                <Link href="/games">
                  Browse games
                  <ChevronRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
