export const officialSiteUrl = "https://boostingpedia.com";
const isOfficialProduction = process.env.VERCEL_ENV === "production";
const indexingRequested =
  process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

export const siteConfig = {
  name: "BoostingPedia",
  url: officialSiteUrl,
  allowIndexing: isOfficialProduction && indexingRequested,
  description:
    "Premium gaming services with transparent pricing, secure checkout, and clear order tracking.",
  navigation: [
    { label: "Games", href: "/games" },
    { label: "Popular services", href: "/#popular-services" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "FAQ", href: "/#faq" },
  ],
} as const;
