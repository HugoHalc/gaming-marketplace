import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

const defaultSocialImage = "/brand/boostingpedia-home-hero.webp";

export function absoluteUrl(path = "/") {
  const pathname = path.split(/[?#]/, 1)[0] || "/";
  if (pathname === "/") return siteConfig.url;
  const normalizedPath = `/${pathname.replace(/^\/+|\/+$/g, "")}`;
  return new URL(normalizedPath, `${siteConfig.url}/`).toString();
}

function titleWithBrand(title: string) {
  if (title === siteConfig.name || title.endsWith(`| ${siteConfig.name}`)) return title;
  return `${title} | ${siteConfig.name}`;
}

export function createPublicMetadata({
  title,
  description,
  path,
  image = defaultSocialImage,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const canonical = absoluteUrl(path);
  const socialImage = absoluteUrl(image);
  const completeTitle = titleWithBrand(title);

  return {
    title: { absolute: completeTitle },
    description,
    alternates: { canonical },
    robots: {
      index: siteConfig.allowIndexing,
      follow: siteConfig.allowIndexing,
    },
    openGraph: {
      title: completeTitle,
      description,
      url: canonical,
      siteName: siteConfig.name,
      type: "website",
      images: [{ url: socialImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: completeTitle,
      description,
      images: [socialImage],
    },
  };
}

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export type StructuredDataListItem = {
  name: string;
  path: string;
};

export const organizationId = `${siteConfig.url}/#organization`;
export const websiteId = `${siteConfig.url}/#website`;

function entityId(path: string, fragment: string) {
  return `${absoluteUrl(path)}#${fragment}`;
}

function graph(...entities: readonly unknown[]) {
  return {
    "@context": "https://schema.org",
    "@graph": entities,
  } as const;
}

export function createOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl("/brand/boostingpedia-mark.png"),
  } as const;
}

export function createWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    url: siteConfig.url,
    name: siteConfig.name,
    publisher: { "@id": organizationId },
  } as const;
}

export function createBreadcrumbJsonLd(items: readonly BreadcrumbItem[]) {
  const path = items.at(-1)?.path ?? "/";
  return {
    "@type": "BreadcrumbList",
    "@id": entityId(path, "breadcrumb"),
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  } as const;
}

export function createItemListJsonLd({
  path,
  items,
}: {
  path: string;
  items: readonly StructuredDataListItem[];
}) {
  return {
    "@type": "ItemList",
    "@id": entityId(path, "item-list"),
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  } as const;
}

export function createGamesDirectoryJsonLd({
  title,
  description,
  games,
}: {
  title: string;
  description: string;
  games: readonly StructuredDataListItem[];
}) {
  const path = "/games";
  const breadcrumb = createBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Games", path },
  ]);
  const itemList = createItemListJsonLd({ path, items: games });
  return graph(breadcrumb, {
    "@type": "CollectionPage",
    "@id": entityId(path, "collection-page"),
    url: absoluteUrl(path),
    name: title,
    description,
    isPartOf: { "@id": websiteId },
    breadcrumb: { "@id": breadcrumb["@id"] },
    mainEntity: { "@id": itemList["@id"] },
  }, itemList);
}

export function createGameOverviewJsonLd({
  gameName,
  gameSlug,
  title,
  description,
  services,
}: {
  gameName: string;
  gameSlug: string;
  title: string;
  description: string;
  services: readonly StructuredDataListItem[];
}) {
  const path = `/games/${gameSlug}`;
  const breadcrumb = gameBreadcrumbs(gameName, gameSlug);
  const itemList = createItemListJsonLd({ path, items: services });
  return graph(breadcrumb, {
    "@type": "CollectionPage",
    "@id": entityId(path, "collection-page"),
    url: absoluteUrl(path),
    name: title,
    description,
    isPartOf: { "@id": websiteId },
    breadcrumb: { "@id": breadcrumb["@id"] },
    mainEntity: { "@id": itemList["@id"] },
  }, itemList);
}

export function createServicePageJsonLd({
  gameName,
  gameSlug,
  serviceName,
  serviceSlug,
  description,
}: {
  gameName: string;
  gameSlug: string;
  serviceName: string;
  serviceSlug: string;
  description: string;
}) {
  const path = `/games/${gameSlug}/${serviceSlug}`;
  const url = absoluteUrl(path);
  const breadcrumb = serviceBreadcrumbs(gameName, gameSlug, serviceName, serviceSlug);
  const serviceId = entityId(path, "service");
  return graph(breadcrumb, {
    "@type": "WebPage",
    "@id": entityId(path, "webpage"),
    url,
    name: serviceName,
    description,
    isPartOf: { "@id": websiteId },
    breadcrumb: { "@id": breadcrumb["@id"] },
    mainEntity: { "@id": serviceId },
  }, {
    "@type": "Service",
    "@id": serviceId,
    name: serviceName,
    description,
    url,
    serviceType: `${gameName} ${serviceName}`,
    provider: { "@id": organizationId },
  });
}

export function createContactPageJsonLd({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const path = "/contact";
  const breadcrumb = createBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Contact", path },
  ]);
  return graph(breadcrumb, {
    "@type": "ContactPage",
    "@id": entityId(path, "contact-page"),
    url: absoluteUrl(path),
    name: title,
    description,
    isPartOf: { "@id": websiteId },
    breadcrumb: { "@id": breadcrumb["@id"] },
  });
}

export function gameBreadcrumbs(gameName: string, gameSlug: string) {
  return createBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Games", path: "/games" },
    { name: gameName, path: `/games/${gameSlug}` },
  ]);
}

export function serviceBreadcrumbs(
  gameName: string,
  gameSlug: string,
  serviceName: string,
  serviceSlug: string,
) {
  return createBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Games", path: "/games" },
    { name: gameName, path: `/games/${gameSlug}` },
    { name: serviceName, path: `/games/${gameSlug}/${serviceSlug}` },
  ]);
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

