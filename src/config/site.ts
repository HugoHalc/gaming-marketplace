const fallbackSiteUrl = "https://gaming-marketplace-gold.vercel.app";
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const siteConfig = {
  name: "BoostingPedia",
  url: (configuredSiteUrl || fallbackSiteUrl).replace(/\/+$/, ""),
  allowIndexing: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
  description:
    "Premium gaming services with transparent pricing, secure checkout, and clear order tracking.",
  navigation: [
    { label: "Games", href: "/games" },
    { label: "Popular services", href: "/#popular-services" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "FAQ", href: "/#faq" },
  ],
} as const;
