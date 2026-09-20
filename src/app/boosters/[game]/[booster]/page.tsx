import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Languages,
  MapPin,
  ShieldCheck,
  Trophy,
  Zap,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import {
  getPublicBooster,
  publicBoosters,
} from "@/features/boosters/data/boosters";

type BoosterProfilePageProps = {
  params: Promise<{
    game: string;
    booster: string;
  }>;
};

export function generateStaticParams() {
  return publicBoosters.map((booster) => ({
    game: booster.gameSlug,
    booster: booster.slug,
  }));
}

export async function generateMetadata({
  params,
}: BoosterProfilePageProps): Promise<Metadata> {
  const { game, booster: boosterSlug } = await params;
  const booster = getPublicBooster(game, boosterSlug);

  if (!booster) {
    return {
      title: "Booster not found",
    };
  }

  return {
    title: {
      absolute: `${booster.nickname} — ${booster.gameName} Booster | BoostingPedia`,
    },
    description: `${booster.nickname} is a verified BoostingPedia ${booster.gameName} booster. View rank, region, languages, experience, services, specialty, and public profile information.`,
  };
}

export default async function BoosterProfilePage({
  params,
}: BoosterProfilePageProps) {
  const { game, booster: boosterSlug } = await params;
  const booster = getPublicBooster(game, boosterSlug);

  if (!booster) {
    notFound();
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050807] text-[#F4F7F5]">
      <SiteHeader />

      <section className="border-b border-white/[0.06]">
        <Container className="py-7 sm:py-9 lg:py-10">
          <Link
            href="/boosters"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#A0AAA4] transition-colors hover:text-[#F4F7F5]"
          >
            <ArrowLeft className="size-4" />
            Back to booster directory
          </Link>
        </Container>
      </section>

      <section className="py-8 sm:py-10 lg:py-12">
        <Container>
          <article className="mx-auto max-w-5xl overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0B110E]">
            <div className="relative h-[180px] overflow-hidden border-b border-white/[0.06] bg-[#080D0A] sm:h-[220px] lg:h-[245px]">
              <Image
                src={booster.gameCard}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 960px, 100vw"
                className="object-cover object-center opacity-75"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,7,.78),rgba(5,8,7,.22)_58%,rgba(5,8,7,.45)),linear-gradient(0deg,rgba(5,8,7,.82),transparent_68%)]" />

              <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#050807]/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-[#A0AAA4] backdrop-blur-sm sm:left-6 sm:top-6">
                {booster.gameName}
              </div>
            </div>

            <div className="relative px-5 pb-6 sm:px-7 sm:pb-8 lg:px-8">
              <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex min-w-0 items-end gap-4 sm:gap-5">
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-full border-4 border-[#0B110E] bg-[#080D0A] sm:size-28">
                    <Image
                      src={booster.image}
                      alt={`${booster.nickname} booster`}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 pb-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <h1 className="min-w-0 text-3xl font-bold tracking-[-0.045em] text-[#F4F7F5] sm:text-4xl">
                        {booster.nickname}
                      </h1>
                      <CheckCircle2
                        className="size-5 shrink-0 text-[#82F5A4]"
                        aria-label="Verified Booster"
                      />
                    </div>
                    <p className="mt-1.5 text-sm font-medium text-[#A0AAA4]">
                      Verified Booster
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 self-start rounded-xl border border-[#39E56F]/15 bg-[#39E56F]/[0.035] px-3 py-2 text-sm font-semibold text-[#F4F7F5] sm:self-auto">
                  <Trophy className="size-4 text-[#82F5A4]/80" />
                  {booster.rank}
                </div>
              </div>

              <div className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,.65fr)]">
                <div className="rounded-[18px] border border-white/[0.07] bg-[#090D0B] p-5 sm:p-6">
                  <p className="font-gaming-label text-[10px] uppercase tracking-[0.13em] text-[#667069]">
                    About
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#A0AAA4]">
                    {booster.bio}
                  </p>

                  <div className="mt-6 border-t border-white/[0.06] pt-5">
                    <div className="flex items-center gap-2 text-[#667069]">
                      <Zap className="size-4" />
                      <p className="font-gaming-label text-[10px] uppercase tracking-[0.12em]">
                        Specialty
                      </p>
                    </div>
                    <p className="mt-2 text-[15px] font-semibold leading-6 text-[#F4F7F5]">
                      {booster.specialty}
                    </p>
                  </div>
                </div>

                <div className="rounded-[18px] border border-white/[0.07] bg-[#090D0B] p-5 sm:p-6">
                  <p className="font-gaming-label text-[10px] uppercase tracking-[0.13em] text-[#667069]">
                    Profile
                  </p>

                  <dl className="mt-4 space-y-4">
                    <div>
                      <dt className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] text-[#667069]">
                        <MapPin className="size-3.5" />
                        Region
                      </dt>
                      <dd className="mt-1.5 text-sm font-semibold text-[#F4F7F5]">
                        {booster.region}
                      </dd>
                    </div>

                    <div>
                      <dt className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] text-[#667069]">
                        <Languages className="size-3.5" />
                        Languages
                      </dt>
                      <dd className="mt-1.5 text-sm font-semibold text-[#F4F7F5]">
                        {booster.languages.join(" / ")}
                      </dd>
                    </div>

                    <div>
                      <dt className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] text-[#667069]">
                        <Clock3 className="size-3.5" />
                        Experience
                      </dt>
                      <dd className="mt-1.5 text-sm font-semibold text-[#F4F7F5]">
                        {booster.experience}
                      </dd>
                    </div>

                    <div>
                      <dt className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] text-[#667069]">
                        <ShieldCheck className="size-3.5" />
                        Services
                      </dt>
                      <dd className="mt-1.5 text-sm font-semibold text-[#F4F7F5]">
                        {booster.services}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </article>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
