export const officialSiteUrl = "https://boostingpedia.com";
const indexingEnabled = process.env.SITE_INDEXING_ENABLED === "true";

export const siteConfig = {
  name: "BoostingPedia",
  url: officialSiteUrl,
  allowIndexing: indexingEnabled,
  description:
    "Premium gaming services with transparent pricing, secure checkout, and clear order tracking.",
  navigation: [
    { label: "Games", href: "/games" },
    { label: "Popular services", href: "/#popular-services" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "FAQ", href: "/#faq" },
  ],
} as const;
