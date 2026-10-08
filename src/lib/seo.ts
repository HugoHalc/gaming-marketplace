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

export function createBreadcrumbJsonLd(items: readonly BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  } as const;
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

