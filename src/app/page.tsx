import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Gamepad2,
  Star,
} from "lucide-react";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { mockGames } from "@/features/catalog/data/mock-catalog";
import {
  faqs,
  howItWorks,
  popularServices,
  testimonials,
  trustFeatures,
} from "@/features/marketing/content";

const gameStyles = {
  emerald: "from-emerald-400/18 via-emerald-400/[0.04] to-transparent text-emerald-300 border-emerald-300/15",
  rose: "from-rose-400/18 via-rose-400/[0.04] to-transparent text-rose-300 border-rose-300/15",
  violet: "from-violet-400/18 via-violet-400/[0.04] to-transparent text-violet-300 border-violet-300/15",
  cyan: "from-cyan-400/18 via-cyan-400/[0.04] to-transparent text-cyan-300 border-cyan-300/15",
  amber: "from-amber-400/18 via-amber-400/[0.04] to-transparent text-amber-300 border-amber-300/15",
  blue: "from-blue-400/18 via-blue-400/[0.04] to-transparent text-blue-300 border-blue-300/15",
} as const;

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/[0.05]">
        <div className="hero-grid absolute inset-0 -z-20 opacity-40" />
        <div className="absolute left-1/2 top-[-16rem] -z-10 h-[36rem] w-[58rem] -translate-x-1/2 rounded-full bg-violet-600/16 blur-[110px]" />
        <div className="absolute right-[-10rem] top-24 -z-10 size-[30rem] rounded-full bg-cyan-400/[0.06] blur-[100px]" />
        <Container className="grid min-h-[680px] items-center gap-14 py-20 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div className="max-w-3xl">
            <Badge className="mb-6 border-violet-300/20 bg-violet-400/[0.08] text-violet-200">
              <span className="mr-2 size-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />
              Premium gaming services marketplace
            </Badge>
            <h1 className="text-balance text-5xl font-bold leading-[0.98] tracking-[-0.06em] text-white sm:text-6xl lg:text-[4.75rem]">
              Reach your next gaming milestone with confidence.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-[var(--muted-foreground)] sm:text-xl">
              Configure competitive gaming services with transparent pricing, secure checkout, and order tracking built around clarity from start to finish.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="min-w-44">
                <Link href="/games">Explore games <ArrowRight className="ml-2 size-4" /></Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/#how-it-works">How it works</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[var(--muted-foreground)]">
              {["Transparent pricing", "Secure checkout architecture", "Mobile-first order tracking"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded-full bg-emerald-400/10 text-emerald-300"><Check className="size-3" /></span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:mx-0 lg:justify-self-end">
            <div className="absolute inset-8 -z-10 rounded-[2rem] bg-violet-500/15 blur-3xl" />
            <Card className="overflow-hidden border-white/[0.1] bg-[#0d0e19]/92 p-2 shadow-[0_35px_110px_-35px_rgba(0,0,0,.9)]">
              <div className="rounded-[1.15rem] border border-white/[0.06] bg-gradient-to-b from-white/[0.055] to-transparent p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">Live configuration preview</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">League of Legends Rank Boost</h2>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-violet-300/15 bg-violet-400/[0.08] text-violet-200"><Gamepad2 className="size-5" /></span>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    ["Current rank", "Gold II"],
                    ["Target rank", "Emerald IV"],
                    ["Region", "North America"],
                    ["Queue", "Solo / Duo"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/[0.07] bg-black/15 p-4">
                      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                      <p className="mt-1.5 text-sm font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-violet-300/15 bg-violet-400/[0.055] p-4">
                  <div className="flex items-end justify-between gap-5">
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)]">Estimated total</p>
                      <p className="mt-1 text-3xl font-bold tracking-[-0.04em] text-white">$48.90</p>
                    </div>
                    <Badge className="border-emerald-300/15 bg-emerald-400/[0.07] text-emerald-300">Server validated</Badge>
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-violet-500 to-violet-300" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      <section className="border-b border-white/[0.05] bg-white/[0.012] py-6">
        <Container className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["24/7", "Marketplace access"],
            [String(mockGames.length), "Launch games"],
            ["100%", "Server-validated pricing"],
            ["USD", "Simple launch currency"],
          ].map(([value, label]) => (
            <div key={label} className="flex items-baseline gap-3 border-white/[0.06] lg:border-r lg:last:border-r-0">
              <span className="text-xl font-bold tracking-tight text-white">{value}</span>
              <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
            </div>
          ))}
        </Container>
      </section>

      <section id="games" className="scroll-mt-24 py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow="Choose your game" title="Services built around the games you play." description="Start with a game, then choose the service and configuration that match your goal." />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {mockGames.map((game) => (
              <Card key={game.id} className="group relative overflow-hidden p-0 transition-transform duration-300 hover:-translate-y-1">
                <div className={`absolute inset-0 bg-gradient-to-br ${gameStyles[game.accent]} opacity-75`} />
                <div className="relative flex min-h-72 flex-col p-6 sm:p-7">
                  <div className="flex items-center justify-between">
                    <span className={`grid size-11 place-items-center rounded-xl border bg-black/15 ${gameStyles[game.accent].split(" ").slice(3).join(" ")}`}><Gamepad2 className="size-5" /></span>
                    <Badge className="border-emerald-300/15 bg-emerald-400/[0.07] text-emerald-300">Available</Badge>
                  </div>
                  <div className="mt-auto pt-12">
                    <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">{game.name}</h3>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted-foreground)]">{game.shortDescription}</p>
                    <Link href={`/games/${game.slug}`} className="mt-5 inline-flex items-center text-sm font-semibold text-white transition-colors hover:text-violet-200">
                      Explore services <ChevronRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section id="popular-services" className="scroll-mt-24 border-y border-white/[0.06] bg-white/[0.014] py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow="Popular services" title="A clearer way to buy competitive gaming services." description="Every service is designed to surface the choices that affect price before checkout." />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {popularServices.map((service) => (
              <Card key={`${service.game}-${service.name}`} className="group p-6 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <Badge>{service.game}</Badge>
                  <span className="text-xs font-semibold text-violet-300">{service.tag}</span>
                </div>
                <h3 className="mt-8 text-xl font-semibold text-white">{service.name}</h3>
                <p className="mt-2 min-h-18 text-sm leading-6 text-[var(--muted-foreground)]">{service.description}</p>
                <div className="mt-7 flex items-center justify-between border-t border-white/[0.06] pt-5">
                  <span className="text-sm font-semibold text-white">{service.price}</span>
                  <span className="inline-flex items-center text-sm font-semibold text-violet-300">Configure <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1" /></span>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section id="how-it-works" className="scroll-mt-24 py-20 sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[.78fr_1.22fr] lg:items-start">
            <SectionHeading eyebrow="How it works" title="Three simple steps from goal to order." description="The storefront is designed to make complex service configuration feel straightforward." align="left" />
            <div className="grid gap-3">
              {howItWorks.map((item) => (
                <Card key={item.step} className="grid gap-5 p-6 sm:grid-cols-[auto_1fr] sm:items-start">
                  <span className="text-3xl font-bold tracking-[-0.05em] text-violet-400/75">{item.step}</span>
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

      <section className="border-y border-white/[0.06] bg-black/10 py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow="Why VantaBoost" title="Built around trust, speed, and clarity." description="The marketplace foundation prioritizes the things that matter most when money and account progress are involved." />
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {trustFeatures.map(({ icon: Icon, title, description }) => (
              <div key={title}>
                <span className="grid size-10 place-items-center rounded-xl border border-violet-300/15 bg-violet-400/[0.07] text-violet-300"><Icon className="size-5" /></span>
                <h3 className="mt-5 font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow="Customer experience" title="Designed to feel dependable at every step." description="Illustrative launch content for the customer experience we are building toward." />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="p-6 sm:p-7">
                <div className="flex gap-1 text-amber-300" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, index) => <Star key={index} className="size-4 fill-current" />)}
                </div>
                <blockquote className="mt-6 text-[15px] leading-7 text-white/90">“{testimonial.quote}”</blockquote>
                <div className="mt-7 border-t border-white/[0.06] pt-5">
                  <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">{testimonial.detail}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section id="faq" className="scroll-mt-24 border-y border-white/[0.06] bg-white/[0.012] py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
          <SectionHeading eyebrow="FAQ" title="Straight answers before checkout." description="The final production FAQ will expand alongside policies, supported games, payments, and service operations." align="left" />
          <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {faqs.map((item) => (
              <details key={item.question} className="group py-5 open:pb-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left font-semibold text-white marker:hidden">
                  {item.question}
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-white/[0.08] text-[var(--muted-foreground)] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 max-w-3xl pr-10 text-sm leading-7 text-[var(--muted-foreground)]">{item.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <div className="relative overflow-hidden rounded-[2rem] border border-violet-300/15 bg-gradient-to-br from-violet-500/[0.16] via-[#11121f] to-cyan-400/[0.05] p-8 sm:p-12 lg:p-14">
            <div className="absolute right-[-5rem] top-[-8rem] size-80 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="relative max-w-3xl">
              <Badge className="mb-5 border-white/10 bg-white/[0.06] text-white/80">Your next milestone starts here</Badge>
              <h2 className="text-balance text-3xl font-bold tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">Find the right service without the marketplace friction.</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">Browse the launch catalog, compare service types, and see how VantaBoost is being built around a faster and more transparent buying experience.</p>
              <Button asChild size="lg" className="mt-8"><Link href="/games">Explore games <ArrowRight className="ml-2 size-4" /></Link></Button>
            </div>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <p className="text-sm font-semibold text-violet-300">{eyebrow}</p>
      <h2 className="mt-3 text-balance text-3xl font-bold tracking-[-0.045em] text-white sm:text-4xl">{title}</h2>
      <p className="mt-4 text-pretty text-base leading-7 text-[var(--muted-foreground)]">{description}</p>
    </div>
  );
}
