import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/container";

// The approved Rocket League service-page proportions.
export const serviceWorkspaceClassName = "pb-6 pt-3 sm:pb-10 sm:pt-4 lg:pb-12 lg:pt-5";
export const serviceNavigationGridClassName = "xl:grid xl:grid-cols-[13.5rem_minmax(0,1fr)] xl:gap-4 2xl:grid-cols-[14.5rem_minmax(0,1fr)] 2xl:gap-5";
export const serviceHeadingClassName = "max-w-[17rem] text-balance text-[1.75rem] font-bold leading-[1.02] tracking-[-0.045em] text-white sm:max-w-[36rem] sm:text-[2.5rem] lg:max-w-[42rem] lg:text-[2.75rem]";

export function ServiceBreadcrumbs({ gameName, gameSlug, serviceName }: { gameName: string; gameSlug: string; serviceName: string }) {
  const items = [{ label: "Home", href: "/" }, { label: "Games", href: "/games" }, { label: gameName, href: `/games/${gameSlug}` }, { label: serviceName }];
  return (
    <nav aria-label="Breadcrumb" className="min-w-0 text-xs leading-5 text-white/55 sm:text-sm">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => (
          <li key={item.label} className="flex min-w-0 max-w-full items-start gap-2">
            {index > 0 ? <span aria-hidden="true" className="shrink-0 text-white/35">/</span> : null}
            {item.href ? <Link href={item.href} className="min-w-0 break-words rounded-sm outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white/50 motion-reduce:transition-none">{item.label}</Link> : <span aria-current="page" className="min-w-0 break-words text-white/85">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ServicePageHeader({ gameName, gameSlug, serviceName, title, description, hasArtwork = false, background, children }: { gameName: string; gameSlug: string; serviceName: string; title: string; description: string; hasArtwork?: boolean; background?: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/[0.06] bg-[#050807]">
      {background}
      <Container className={hasArtwork ? "min-h-[232px] py-3 sm:min-h-[286px] sm:py-6 lg:min-h-[300px] lg:py-7" : "py-3 sm:py-6 lg:py-7"}>
        <ServiceBreadcrumbs gameName={gameName} gameSlug={gameSlug} serviceName={serviceName} />
        <div className="mt-3 max-w-[42rem] sm:mt-5 lg:mt-6">
          <h1 className={serviceHeadingClassName}>{title}</h1>
          <p className="mt-3 max-w-[36rem] text-balance text-sm leading-6 text-white/70 sm:text-lg sm:font-medium sm:leading-7 lg:text-xl">{description}</p>
          {children}
        </div>
      </Container>
    </section>
  );
}
