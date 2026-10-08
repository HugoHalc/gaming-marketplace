import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Button } from "@/components/ui/button";
import { createPublicMetadata } from "@/lib/seo";

const description =
  "Contact BoostingPedia for help with services, accounts, or existing orders.";

export const metadata: Metadata = createPublicMetadata({
  title: "Contact",
  description,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050807]">
      <SiteHeader />
      <section className="relative isolate border-b border-white/[0.06] py-16 sm:py-20 lg:py-24">
        <div className="hero-grid absolute inset-0 -z-20 opacity-20" />
        <div className="absolute left-1/2 top-[-18rem] -z-10 h-[32rem] w-[58rem] -translate-x-1/2 rounded-full bg-green-500/[0.08] blur-[110px]" />
        <Container className="max-w-3xl">
          <p className="font-gaming-label text-xs uppercase tracking-[0.14em] text-[#82F5A4]">
            Support
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">
            Contact BoostingPedia
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#A0AAA4]">
            Use Contact Support inside BoostingPedia for help with an account, service, or existing order.
            You can also reach us at{" "}
            <a
              className="font-medium text-[#82F5A4] underline decoration-[#39E56F]/35 underline-offset-4 hover:text-white"
              href="mailto:boostingpedia@gmail.com"
            >
              boostingpedia@gmail.com
            </a>
            .
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/games">Explore games</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </Container>
      </section>
      <SiteFooter />
    </main>
  );
}
