import { overviewServiceGridClassName, overviewServiceCardLayoutClassName, overviewServicePreviewLayoutClassName } from "@/features/catalog/components/overview-service-card-layout";
import { OverviewServiceCardAction } from "@/features/catalog/components/overview-service-card-action";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Gamepad2 } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import {
  dota2AssetFoundation,
  dota2GameFoundation,
  dota2ServiceFoundations,
  getDota2RankBadge,
  type Dota2ServiceCategory,
} from "@/features/catalog/data/dota-2-foundation";

export const metadata: Metadata = {
  title: "Dota 2 Boosting Services",
  description:
    "Choose a focused Dota 2 service for MMR progression, net wins, calibration matches, or Dota Plus hero progression.",
  alternates: { canonical: "/games/dota-2" },
  robots: { index: false, follow: false },
};

const serviceMeta: Record<Dota2ServiceCategory, { label: string }> = {
  "mmr-progression": { label: "MMR progression" },
  "net-wins": { label: "Ranked wins" },
  calibration: { label: "Calibration" },
  "hero-progression": { label: "Hero progression" },
};

function Dota2ServicePreview({ slug }: { slug: string }) {
  const previewClassName = `${overviewServicePreviewLayoutClassName} border border-white/[0.06] bg-black/20`;
  if (slug === "mmr-boost") {
    const fromBadge = getDota2RankBadge("Guardian");
    const toBadge = getDota2RankBadge("Divine");
    return (
      <div className={previewClassName} aria-label="Illustrative MMR progression preview">
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex min-w-0 flex-col items-center gap-0.5 text-center">
            {fromBadge ? <Image src={fromBadge} alt="" width={52} height={52} className="size-9 shrink-0 object-contain" /> : null}
            <div><p className="text-[9px] uppercase tracking-[0.12em] text-white/30">Illustrative start</p><p className="mt-1 text-xs font-semibold text-white/70">Guardian</p></div>
          </div>
          <ArrowRight className="size-4 shrink-0 text-red-200/45" aria-hidden="true" />
          <div className="flex min-w-0 flex-col-reverse items-center gap-0.5 text-center">
            <div><p className="text-[9px] uppercase tracking-[0.12em] text-white/30">Illustrative target</p><p className="mt-1 text-xs font-semibold text-white/70">Divine</p></div>
            {toBadge ? <Image src={toBadge} alt="" width={52} height={52} className="size-9 shrink-0 object-contain" /> : null}
          </div>
        </div>
      </div>
    );
  }

  if (slug === "net-wins") {
    const badge = getDota2RankBadge("Archon");
    return (
      <div className={`${previewClassName} gap-3`} aria-label="Illustrative Net Wins progress preview">
        {badge ? <Image src={badge} alt="" width={58} height={58} className="size-10 shrink-0 object-contain" /> : null}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3"><p className="text-[9px] uppercase tracking-[0.12em] text-white/30">Competitive context</p><span className="font-gaming-label text-[9px] text-red-200/55">NET WINS</span></div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full w-[68%] rounded-full bg-gradient-to-r from-red-400/30 to-red-200/65" /></div>
          <p className="mt-2 text-[10px] text-white/35">Wins minus losses · visual service preview</p>
        </div>
      </div>
    );
  }

  if (slug === "calibration-matches") {
    const badge = getDota2RankBadge("Ancient");
    return (
      <div className={`${previewClassName} gap-3`} aria-label="Illustrative calibration preview">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] uppercase tracking-[0.12em] text-white/30">Calibration context</p>
          <div className="mt-2 flex items-center gap-1.5" aria-hidden="true">
            <span className="h-1.5 flex-1 rounded-full bg-red-200/55" /><span className="h-1.5 flex-1 rounded-full bg-red-200/38" /><span className="h-1.5 flex-1 rounded-full bg-white/[0.10]" /><span className="h-1.5 flex-1 rounded-full bg-white/[0.08]" />
          </div>
          <p className="mt-2 text-[10px] text-white/35">Placement context without a guaranteed outcome</p>
        </div>
        {badge ? <Image src={badge} alt="" width={58} height={58} className="size-10 shrink-0 object-contain" /> : null}
      </div>
    );
  }

  return (
    <div className={previewClassName} aria-label="Illustrative Dota Plus Hero Level progression preview">
      <div className="min-w-0 w-full">
      <div className="flex items-center justify-between gap-3">
        <span className="font-gaming-label text-[9px] uppercase tracking-[0.12em] text-white/35">Current level</span>
        <ArrowRight className="size-4 text-red-200/40" aria-hidden="true" />
        <span className="font-gaming-label text-[9px] uppercase tracking-[0.12em] text-white/55">Target level</span>
      </div>
      <div className="mt-3 flex items-center gap-2" aria-hidden="true"><span className="size-2 rounded-full border border-red-200/35 bg-[#090D0B]" /><span className="h-px flex-1 bg-gradient-to-r from-red-300/20 via-red-200/55 to-red-300/20" /><span className="size-3 rounded-full border border-red-200/55 bg-red-300/10" /></div>
      <p className="mt-2 text-[10px] text-white/35">One hero · Dota Plus level progression</p>
      </div>
    </div>
  );
}


export default function Dota2FoundationPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/[0.06] bg-[#050807]">
        <div className="hero-grid absolute inset-y-0 left-0 -z-20 w-[62%] opacity-10" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-full overflow-hidden sm:w-[84%] md:w-[76%] lg:w-[68%] xl:w-[64%]"
        >
          <Image
            src={dota2AssetFoundation.landingHero}
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 64vw, (min-width: 1024px) 68vw, (min-width: 768px) 76vw, (min-width: 640px) 84vw, 100vw"
            className="object-cover object-[78%_50%] opacity-38 sm:object-[76%_50%] sm:opacity-56 md:object-[74%_50%] md:opacity-72 lg:object-[72%_50%] lg:opacity-90 xl:opacity-100"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#050807_0%,rgba(5,8,7,.99)_18%,rgba(5,8,7,.90)_36%,rgba(5,8,7,.56)_56%,rgba(5,8,7,.14)_78%,transparent_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050807] via-[#050807]/35 to-transparent" />
        </div>
        <div className="absolute bottom-[-14rem] left-[-8rem] -z-10 size-[32rem] rounded-full bg-red-500/[0.035] blur-[120px]" />

        <Container className="relative py-12 sm:py-16 lg:min-h-[31rem] lg:py-20">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/games" className="transition-colors hover:text-white">
              Games
            </Link>
            <span>/</span>
            <span className="text-white">Dota 2</span>
          </div>

          <div className="mt-12 max-w-3xl">
            <Badge className="border-red-300/15 bg-red-400/[0.055] text-red-200">
              <Gamepad2 className="mr-2 size-3.5" />
              Dota 2 Boosting Services
            </Badge>

            <h1 className="mt-5 text-balance text-5xl font-bold leading-[0.96] tracking-[-0.065em] text-white sm:text-6xl lg:text-7xl">
              {dota2GameFoundation.title}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
              {dota2GameFoundation.shortDescription}
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/65">
                MOBA
              </span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/65">
                Four available services
              </span>
              <span className="rounded-full border border-red-300/15 bg-red-400/[0.05] px-3 py-1.5 text-xs font-medium text-red-100/80">
                Server-validated service pricing
              </span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#services"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#39E56F] px-5 text-sm font-semibold text-[#050807] transition-colors hover:bg-[#20C95A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39E56F]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050807]"
              >
                View Dota 2 services
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link
                href="/games"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.035] px-5 text-sm font-semibold text-white/70 transition-colors hover:border-white/[0.15] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050807]"
              >
                <ArrowLeft className="mr-2 size-4" />
                All games
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section
        id="services"
        className="scroll-mt-20 py-14 sm:py-16 lg:py-20"
      >
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-red-200">
              Dota 2 services
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">
              Choose the Dota 2 service that fits your goal.
            </h2>
            <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
              Configure MMR Boost, Net Wins, Calibration Matches or Dota Plus Hero Level with server-validated pricing and order checks.
            </p>
          </div>

          <p className="mt-7 text-[11px] font-medium tracking-[0.01em] text-white/45 md:hidden">Swipe to explore 4 services</p>
          <div className={`${overviewServiceGridClassName} mt-3 md:mt-9`}>
            {dota2ServiceFoundations.map((service) => {
              const meta = serviceMeta[service.category];
              return (
                <Link
                  key={service.id}
                  href={service.route}
                  className={`group ${overviewServiceCardLayoutClassName} border border-white/[0.08] bg-[#090B0A] outline-none transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-red-300/[0.16] hover:bg-[#0E1411] focus-visible:ring-2 focus-visible:ring-red-300/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050807] motion-reduce:transform-none motion-reduce:transition-none`}
                >
                  <div>
                    <p className="font-gaming-label text-[10px] uppercase tracking-[0.13em] text-red-200/55">{meta.label}</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white sm:text-2xl">{service.name}</h3>
                    <p className="mt-3 max-w-[48rem] text-sm leading-6 text-[var(--muted-foreground)]">{service.description}</p>
                  </div>

                  <Dota2ServicePreview slug={service.slug} />

                  <OverviewServiceCardAction label={service.slug === "hero-level-boost" ? "Configure Hero Level" : `Configure ${service.name}`} />
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/[0.06] bg-white/[0.012] py-14 sm:py-16">
        <Container>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Server-validated pricing",
                text: "All four Dota 2 services calculate pricing on the server and recalculate before order creation.",
              },
              {
                title: "Four focused services",
                text: "Choose MMR progression, net wins, calibration matches or Dota Plus Hero Level progression.",
              },
              {
                title: "Clear order requirements",
                text: "Each service validates its required configuration before Checkout becomes available.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-white/[0.08] bg-black/15 p-5 sm:p-6"
              >
                <h3 className="text-sm font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
