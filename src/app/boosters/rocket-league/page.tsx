import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
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
import { rocketLeagueBoosters } from "@/features/boosters/data/rocket-league-boosters";

export const metadata: Metadata = {
  title: "Rocket League Boosters",
  description: "Meet the Rocket League boosters behind BoostingPedia services.",
};

const boosterPortraitPosition: Record<string, string> = {
  brunspart: "center 18%",
  fastbooster: "58% 18%",
};

export default function RocketLeagueBoostersPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050807]">
      <SiteHeader />

      <section className="border-b border-white/[0.06] py-12 sm:py-14 lg:py-16">
        <Container>
          <Link
            href="/boosters"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#A0AAA4] transition-colors hover:text-[#F4F7F5]"
          >
            <ArrowLeft className="size-4" />
            Back to booster directory
          </Link>

          <div className="mt-8 max-w-3xl">
            <p className="font-gaming-label text-[11px] uppercase tracking-[0.16em] text-[#A0AAA4]">
              Rocket League Boosters
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-[-0.05em] text-[#F4F7F5] sm:text-5xl">
              Meet our Rocket League specialists.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#A0AAA4]">
              High-level players focused on fast, professional service and a
              premium customer experience.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-14 lg:py-16">
        <Container>
          <div className="grid gap-5 xl:grid-cols-2">
            {rocketLeagueBoosters.map((booster) => (
              <article
                key={booster.slug}
                className="overflow-hidden rounded-[1.5rem] border border-[#FFFFFF14] bg-[#0E1411]"
              >
                <div className="grid md:grid-cols-[220px_1fr]">
                  <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden bg-[#090D0B] p-6 md:min-h-full">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(57,229,111,0.08),_transparent_62%)]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050807]/18" />

                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-[#39E56F]/20 bg-[#050807]/80 px-3 py-1.5 text-xs font-semibold text-[#F4F7F5] backdrop-blur-sm">
                      <CheckCircle2 className="size-3.5 text-[#82F5A4]" />
                      Verified Booster
                    </div>

                    <div className="relative size-[156px] overflow-hidden rounded-full border border-white/[0.08] bg-[#050807] shadow-[0_0_0_1px_rgba(255,255,255,0.04)] sm:size-[168px]">
                      <Image
                        src={booster.image}
                        alt={`${booster.nickname} Rocket League booster`}
                        fill
                        sizes="168px"
                        className="object-cover"
                        style={{
                          objectPosition:
                            boosterPortraitPosition[booster.slug] ??
                            "center 18%",
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col p-5 sm:p-6">
                    <div>
                      <h2 className="text-2xl font-bold tracking-[-0.035em] text-[#F4F7F5]">
                        {booster.nickname}
                      </h2>
                      <div className="mt-2 flex items-center gap-2 text-sm text-[#A0AAA4]">
                        <Trophy className="size-4" />
                        {booster.rank}
                      </div>
                    </div>

                    <p className="mt-5 text-sm leading-6 text-[#A0AAA4]">
                      {booster.bio}
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-[#FFFFFF14] bg-[#090D0B] p-3.5">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-[#667069]">
                          <Zap className="size-3.5" />
                          Specialty
                        </div>
                        <p className="mt-2 text-sm font-semibold leading-5 text-[#F4F7F5]">
                          {booster.specialty}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#FFFFFF14] bg-[#090D0B] p-3.5">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-[#667069]">
                          <ShieldCheck className="size-3.5" />
                          Services
                        </div>
                        <p className="mt-2 text-sm font-semibold text-[#F4F7F5]">
                          {booster.services}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-x-4 gap-y-3 text-sm text-[#A0AAA4] sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-[#667069]" />
                        {booster.region}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock3 className="size-4 text-[#667069]" />
                        {booster.experience}
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <Languages className="size-4 text-[#667069]" />
                        {booster.languages.join(" / ")}
                      </div>
                    </div>

                    <Link
                      href={`/boosters/rocket-league/${booster.slug}`}
                      className="mt-6 inline-flex h-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-[12px] font-semibold text-[#F4F7F5] transition-colors hover:border-[#39E56F]/18 hover:bg-[#39E56F]/[0.045] hover:text-[#82F5A4]"
                    >
                      View booster details
                      <ArrowRight className="ml-2 size-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
