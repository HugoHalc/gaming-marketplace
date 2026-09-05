import type { Metadata } from "next";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { BoostersDirectory } from "@/components/boosters/boosters-directory";

export const metadata: Metadata = {
  title: "Verified Boosters",
  description:
    "Browse verified BoostingPedia boosters and filter by game, region, language, and profile.",
};

export default function BoostersPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050807]">
      <SiteHeader />
      <BoostersDirectory />
      <SiteFooter />
    </main>
  );
}
