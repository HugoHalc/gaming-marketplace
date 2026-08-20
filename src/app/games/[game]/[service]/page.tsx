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
import { ServiceConfigurator } from "@/features/configurator/components/service-configurator";
import { getServiceConfiguratorSchema } from "@/features/configurator/data/configurator-repository";

interface ServicePageProps {
  params: Promise<{ game: string; service: string }>;
}

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

  return {
    title: `${service.name} for ${game.name}`,
    description: `Configure ${service.name} for ${game.name}, preview server-calculated pricing, and review your selections before checkout.`,
    alternates: { canonical: `/games/${game.slug}/${service.slug}` },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { game: gameSlug, service: serviceSlug } = await params;
  const game = await findCatalogGameBySlug(gameSlug);
  if (!game) notFound();

  const service = game.services.find((item) => item.slug === serviceSlug);
  if (!service) notFound();

  const schema = await getServiceConfiguratorSchema({ serviceId: service.id, category: service.category });
  const theme = gameThemes[game.accent];

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
                {game.name} service
              </Badge>
              <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.03] tracking-[-0.055em] text-white sm:text-5xl">
                Configure {service.name} for {game.name}.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
                {service.description} Adjust the options below and receive a server-calculated price preview before checkout.
              </p>
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
          <ServiceConfigurator gameSlug={game.slug} service={service} schema={schema} />
        </Container>
      </section>

      <section className="border-y border-white/[0.06] bg-white/[0.012] py-14 sm:py-16">
        <Container>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Server-validated pricing", text: "Your browser never controls the final payable amount." },
              { icon: LockKeyhole, title: "Secure order flow", text: "Sensitive fulfillment details are collected after authentication and purchase." },
              { icon: CheckCircle2, title: "Review before payment", text: "Configuration and pricing are recalculated again before the order is created." },
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
