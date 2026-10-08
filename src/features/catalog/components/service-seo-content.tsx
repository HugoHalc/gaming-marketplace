import Link from "next/link";
import { Container } from "@/components/layout/container";
import type { ServiceSeoContent as ServiceSeoContentModel } from "@/features/catalog/data/service-seo-content";

const accentStyles = {
  "league-of-legends": {
    eyebrow: "text-[#E7C867]/70",
    marker: "border-[#C89B3C]/25 bg-[#C89B3C]/[0.07] text-[#E7C867]",
    link: "text-[#E7C867]/80 hover:text-[#F2D77F] focus-visible:ring-[#C89B3C]/35",
  },
  valorant: {
    eyebrow: "text-rose-200/65",
    marker: "border-rose-300/20 bg-rose-300/[0.055] text-rose-200",
    link: "text-rose-200/80 hover:text-rose-100 focus-visible:ring-rose-300/35",
  },
  "marvel-rivals": {
    eyebrow: "text-[#CEC5FF]/70",
    marker: "border-[#A38CFF]/20 bg-[#7A63F2]/[0.06] text-[#CEC5FF]",
    link: "text-[#CEC5FF]/80 hover:text-[#E4DEFF] focus-visible:ring-[#A38CFF]/35",
  },
} as const;

export function ServiceSeoContent({ content }: { content: ServiceSeoContentModel }) {
  const accent = accentStyles[content.gameSlug];

  return (
    <section
      aria-labelledby={`service-guide-${content.gameSlug}-${content.serviceSlug}`}
      className="border-y border-white/[0.06] bg-[#050807] py-12 sm:py-14 lg:py-16"
      data-service-seo-content={`${content.gameSlug}/${content.serviceSlug}`}
    >
      <Container>
        <div className="mx-auto max-w-6xl">
          <div className="grid min-w-0 gap-9 lg:grid-cols-[minmax(0,1.08fr)_minmax(18rem,.92fr)] lg:gap-12">
            <div className="min-w-0">
              <p className={`font-gaming-label text-[10px] font-semibold uppercase tracking-[0.14em] sm:text-[11px] ${accent.eyebrow}`}>
                {content.eyebrow}
              </p>
              <h2
                id={`service-guide-${content.gameSlug}-${content.serviceSlug}`}
                className="mt-3 text-balance text-[1.65rem] font-bold leading-[1.14] tracking-[-0.035em] text-[#F4F7F5] sm:text-[1.9rem]"
              >
                {content.title}
              </h2>
              <div className="mt-5 space-y-3 text-sm leading-6 text-[#A0AAA4] sm:text-[15px] sm:leading-7">
                {content.introduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                <p>{content.configuration}</p>
              </div>
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#F4F7F5]">Your order in three steps</h2>
              <ol className="mt-4 space-y-3">
                {content.steps.map((step, index) => (
                  <li key={step.title} className="flex min-w-0 gap-3 border-t border-white/[0.07] pt-3 first:border-t-0 first:pt-0">
                    <span className={`grid size-7 shrink-0 place-items-center rounded-lg border text-[11px] font-bold ${accent.marker}`} aria-hidden="true">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white/90">{step.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-[#A0AAA4] sm:text-[13px]">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mt-10 grid min-w-0 gap-8 border-t border-white/[0.07] pt-9 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-12">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold tracking-[-0.025em] text-[#F4F7F5]">Frequently asked questions</h2>
              <div className="mt-4 divide-y divide-white/[0.07] border-y border-white/[0.07]">
                {content.faqs.map((faq) => (
                  <details key={faq.question} className="group min-w-0 py-1">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-3 text-left text-sm font-semibold text-white/85 outline-none transition-colors hover:text-white focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-300/35">
                      <span className="min-w-0 break-words">{faq.question}</span>
                      <span className="shrink-0 text-lg font-normal text-white/35 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                    </summary>
                    <p className="max-w-3xl pb-4 pr-8 text-sm leading-6 text-[#A0AAA4]">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>

            <nav aria-label="Related pages" className="min-w-0 lg:border-l lg:border-white/[0.07] lg:pl-8">
              <h2 className="text-sm font-semibold text-white/90">Explore related services</h2>
              <p className="mt-2 text-xs leading-5 text-white/45">Compare the closest options or return to the game overview.</p>
              <ul className="mt-4 space-y-3">
                {content.links.map((link) => (
                  <li key={link.href} className="min-w-0">
                    <Link href={link.href} className={`inline rounded-sm text-sm font-semibold leading-6 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 ${accent.link}`}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </Container>
    </section>
  );
}
