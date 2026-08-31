import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export function LegalPage({
  eyebrow,
  title,
  description,
  lastUpdated,
  sections,
}: LegalPageProps) {
  return (
    <main className="min-h-screen bg-[#050807]">
      <SiteHeader />

      <section className="border-b border-[#FFFFFF14] py-12 sm:py-16">
        <Container className="max-w-[1180px]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#A0AAA4] transition-colors hover:text-[#F4F7F5]"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>

          <div className="mt-8 max-w-3xl">
            <p className="font-gaming-label text-[10px] uppercase tracking-[0.15em] text-[#A0AAA4]">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-[-0.055em] text-[#F4F7F5] sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#A0AAA4]">
              {description}
            </p>
            <p className="mt-5 text-xs font-medium uppercase tracking-[0.08em] text-[#667069]">
              Last updated: {lastUpdated}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16 lg:py-20">
        <Container className="max-w-[1180px]">
          <div className="grid gap-10 lg:grid-cols-[230px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-28 rounded-[1.25rem] border border-[#FFFFFF14] bg-[#0E1411] p-5">
                <p className="font-gaming-label text-[10px] uppercase tracking-[0.14em] text-[#667069]">
                  Legal
                </p>
                <nav className="mt-4 space-y-2 text-sm">
                  <Link href="/terms" className="block text-[#A0AAA4] transition-colors hover:text-[#F4F7F5]">
                    Terms & Conditions
                  </Link>
                  <Link href="/privacy" className="block text-[#A0AAA4] transition-colors hover:text-[#F4F7F5]">
                    Privacy Policy
                  </Link>
                  <Link href="/cookies" className="block text-[#A0AAA4] transition-colors hover:text-[#F4F7F5]">
                    Cookie Policy
                  </Link>
                  <Link href="/refunds" className="block text-[#A0AAA4] transition-colors hover:text-[#F4F7F5]">
                    Refund Policy
                  </Link>
                </nav>
              </div>
            </aside>

            <article className="min-w-0">
              <div className="rounded-[1.5rem] border border-[#FFFFFF14] bg-[#0E1411] p-6 sm:p-8 lg:p-10">
                <div className="space-y-10">
                  {sections.map((section, index) => (
                    <section key={section.title} className={index ? "border-t border-[#FFFFFF14] pt-10" : ""}>
                      <h2 className="text-xl font-bold tracking-[-0.03em] text-[#F4F7F5] sm:text-2xl">
                        {section.title}
                      </h2>

                      {section.paragraphs?.map((paragraph) => (
                        <p key={paragraph} className="mt-4 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                          {paragraph}
                        </p>
                      ))}

                      {section.bullets ? (
                        <ul className="mt-4 space-y-3 text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                          {section.bullets.map((bullet) => (
                            <li key={bullet} className="flex gap-3">
                              <span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-[#667069]" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </section>
                  ))}
                </div>

                <div className="mt-10 border-t border-[#FFFFFF14] pt-6 text-sm leading-7 text-[#667069]">
                  Questions about this policy can be sent to{" "}
                  <a
                    href="mailto:boostingpedia@gmail.com"
                    className="font-medium text-[#F4F7F5] transition-colors hover:text-[#82F5A4]"
                  >
                    boostingpedia@gmail.com
                  </a>
                  .
                </div>
              </div>
            </article>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
