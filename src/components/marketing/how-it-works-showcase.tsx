import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CreditCard,
  Gamepad2,
  MessageSquare,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Container } from "@/components/layout/container";

const steps = [
  {
    number: "01",
    eyebrow: "Choose your game",
    title: "Start with the game and service that match your goal.",
    description:
      "Open a dedicated storefront, compare the available services, and move straight into the configuration that fits what you want to achieve.",
  },
  {
    number: "02",
    eyebrow: "Customize your order",
    title: "Configure the details before you ever reach checkout.",
    description:
      "Set the ranks, mode, server, and available extras for the service. Pricing updates around the configuration so the order stays clear before payment.",
  },
  {
    number: "03",
    eyebrow: "Checkout & track",
    title: "Pay securely, then manage everything from your dashboard.",
    description:
      "After checkout, follow the order status, see the assigned booster, keep communication inside the order, and track progress through completion.",
  },
] as const;

function GameSelectionVisual() {
  return (
    <div className="relative mx-auto h-[300px] w-full max-w-[560px] sm:h-[340px]">
      <div className="absolute inset-x-[7%] top-[16%] h-[64%] rounded-[44px] border border-[#39E56F]/15 bg-[#39E56F]/[0.035]" />
      <div className="absolute inset-x-[12%] top-[22%] h-[52%] rounded-[36px] border border-white/[0.06] bg-[#0B100D]" />

      <div className="absolute left-[10%] top-[14%] w-[58%] -rotate-[6deg] overflow-hidden rounded-[22px] border border-white/[0.10] bg-[#0B100D] shadow-[0_28px_70px_rgba(0,0,0,.42)] motion-safe:transition-transform motion-safe:duration-300 lg:group-hover:translate-y-[-4px] lg:group-hover:rotate-[-4deg]">
        <div className="relative aspect-[16/8.7] overflow-hidden">
          <Image
            src="/game-cards/rocket-league.webp"
            alt=""
            fill
            sizes="(min-width: 1024px) 330px, 62vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050807]/90 via-[#050807]/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="font-gaming-label text-[8px] uppercase tracking-[0.12em] text-blue-200/70">
              Rocket League
            </p>
            <p className="mt-1 text-sm font-semibold text-white">Rank Boost</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[6%] right-[6%] w-[54%] rotate-[6deg] overflow-hidden rounded-[22px] border border-rose-300/15 bg-[#0B100D] shadow-[0_28px_70px_rgba(0,0,0,.46)] motion-safe:transition-transform motion-safe:duration-300 lg:group-hover:translate-y-[-5px] lg:group-hover:rotate-[4deg]">
        <div className="relative aspect-[16/8.7] overflow-hidden">
          <Image
            src="/game-cards/valorant.webp"
            alt=""
            fill
            sizes="(min-width: 1024px) 300px, 58vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050807]/90 via-[#050807]/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="font-gaming-label text-[8px] uppercase tracking-[0.12em] text-rose-200/70">
              Valorant
            </p>
            <p className="mt-1 text-sm font-semibold text-white">Competitive Wins</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfiguratorVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[560px] rounded-[26px] border border-white/[0.08] bg-[#080C0A] p-4 shadow-[0_26px_70px_rgba(0,0,0,.36)] sm:p-5">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div>
          <p className="font-gaming-label text-[8px] uppercase tracking-[0.12em] text-[#667069]">
            Rank Boost
          </p>
          <p className="mt-1 text-sm font-semibold text-[#F4F7F5]">Configure your order</p>
        </div>
        <span className="rounded-full border border-[#39E56F]/18 bg-[#39E56F]/[0.05] px-2.5 py-1 text-[8px] font-semibold text-[#82F5A4]">
          Live pricing
        </span>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="rounded-2xl border border-white/[0.07] bg-[#0E1411] p-3">
          <p className="font-gaming-label text-[7px] uppercase tracking-[0.12em] text-[#667069]">Current</p>
          <div className="mt-2 flex items-center gap-2.5">
            <Image src="/ranks/rocket-league/diamond.svg" alt="" width={34} height={34} className="object-contain" />
            <span className="text-[11px] font-semibold text-[#F4F7F5]">Diamond</span>
          </div>
        </div>

        <ArrowRight className="size-4 text-white/20" />

        <div className="rounded-2xl border border-white/[0.07] bg-[#0E1411] p-3">
          <p className="font-gaming-label text-[7px] uppercase tracking-[0.12em] text-[#667069]">Target</p>
          <div className="mt-2 flex items-center gap-2.5">
            <Image src="/ranks/rocket-league/champion.svg" alt="" width={34} height={34} className="object-contain" />
            <span className="text-[11px] font-semibold text-[#F4F7F5]">Champion</span>
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.07] bg-[#0B100D] p-3.5">
          <div className="flex items-center gap-2">
            <Gamepad2 className="size-3.5 text-[#667069]" />
            <span className="text-[9px] font-semibold text-[#F4F7F5]">Mode</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <span className="rounded-lg border border-[#39E56F]/20 bg-[#39E56F]/[0.055] px-2.5 py-2 text-center text-[9px] font-semibold text-[#82F5A4]">Solo</span>
            <span className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 py-2 text-center text-[9px] text-[#A0AAA4]">Duo</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#0B100D] p-3.5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-3.5 text-[#667069]" />
            <span className="text-[9px] font-semibold text-[#F4F7F5]">Extras</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-white/[0.07] px-2 py-1 text-[8px] text-[#A0AAA4]">Express</span>
            <span className="rounded-full border border-white/[0.07] px-2 py-1 text-[8px] text-[#A0AAA4]">Streaming</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[560px] rounded-[26px] border border-white/[0.08] bg-[#080C0A] p-4 shadow-[0_26px_70px_rgba(0,0,0,.36)] sm:p-5">
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <p className="font-gaming-label text-[8px] uppercase tracking-[0.12em] text-[#667069]">Order workspace</p>
          <p className="mt-1 text-sm font-semibold text-[#F4F7F5]">Everything stays in one place</p>
        </div>
        <ShieldCheck className="size-5 text-[#82F5A4]/80" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-2xl border border-white/[0.07] bg-[#0B100D] p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl border border-[#39E56F]/15 bg-[#39E56F]/[0.045] text-[#82F5A4]">
              <Check className="size-4" />
            </span>
            <div>
              <p className="text-[10px] font-semibold text-[#F4F7F5]">Order tracking</p>
              <p className="mt-0.5 text-[8px] text-[#667069]">Follow each stage from your dashboard</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {["Order placed", "Booster assigned", "Service in progress"].map((label, index) => (
              <div key={label} className="flex items-center gap-3">
                <span className={`size-2 rounded-full ${index < 2 ? "bg-[#39E56F]/70" : "border border-white/[0.16] bg-white/[0.025]"}`} />
                <span className="text-[9px] text-[#A0AAA4]">{label}</span>
                <span className="ml-auto h-px w-10 bg-white/[0.06]" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-white/[0.07] bg-[#0B100D] p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-3.5 text-cyan-200/70" />
              <p className="text-[9px] font-semibold text-[#F4F7F5]">Live order chat</p>
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-7 w-[82%] rounded-xl bg-white/[0.035]" />
              <div className="ml-auto h-7 w-[70%] rounded-xl border border-[#39E56F]/10 bg-[#39E56F]/[0.035]" />
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#0B100D] p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="size-3.5 text-[#667069]" />
              <p className="text-[9px] font-semibold text-[#F4F7F5]">Secure checkout</p>
            </div>
            <p className="mt-2 text-[8px] leading-4 text-[#667069]">Payment and order access remain connected to your account.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const visuals = [GameSelectionVisual, ConfiguratorVisual, DashboardVisual] as const;

export function HowItWorksShowcase() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-y border-white/[0.06] bg-[#050807] py-20 sm:py-24 lg:py-28"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-gaming-label text-[11px] uppercase tracking-[0.14em] text-[#82F5A4]/75">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-[#F4F7F5] sm:text-4xl lg:text-5xl">
            From game selection to completion.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#A0AAA4] sm:text-base">
            Choose a service, customize the order, complete secure checkout, and manage the rest from your BoostingPedia dashboard.
          </p>
        </div>

        <div className="mt-14 divide-y divide-white/[0.055] border-y border-white/[0.055] sm:mt-16">
          {steps.map((step, index) => {
            const Visual = visuals[index];

            return (
              <article
                key={step.number}
                className="group grid gap-10 py-12 sm:py-14 lg:grid-cols-[.82fr_1.18fr] lg:items-center lg:gap-16 lg:py-20"
              >
                <div className="max-w-xl">
                  <div className="flex items-center gap-3">
                    <span className="font-gaming-value text-sm font-bold text-[#82F5A4]">{step.number}</span>
                    <span className="h-px w-8 bg-[#39E56F]/20" />
                    <span className="font-gaming-label text-[9px] uppercase tracking-[0.14em] text-[#667069]">
                      {step.eyebrow}
                    </span>
                  </div>

                  <h3 className="mt-5 text-2xl font-semibold leading-tight tracking-[-0.035em] text-[#F4F7F5] sm:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-4 max-w-[52ch] text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                    {step.description}
                  </p>

                  {index === 0 ? (
                    <Link
                      href="#games"
                      className="mt-6 inline-flex items-center text-sm font-semibold text-[#82F5A4] transition-colors hover:text-[#B3FBC8]"
                    >
                      Browse available games
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  ) : null}
                </div>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-[-12%] rounded-[48px] bg-[radial-gradient(circle_at_50%_50%,rgba(57,229,111,.035),transparent_66%)] opacity-80" />
                  <div className="relative">
                    <Visual />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
