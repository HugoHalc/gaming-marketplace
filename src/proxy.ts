import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export const retiredPaths = new Set([
  "/rocket-league/coaching",
  "/rematch",
  "/rematch/rank-boost",
  "/rematch/wins-boost",
  "/arc-raiders",
  "/arc-raiders/blueprints",
  "/arc-raiders/boss-kills",
  "/arc-raiders/coins-farm",
  "/arc-raiders/leveling",
  "/arc-raiders/trials",
  "/arc-raiders/workshop",
  "/blog",
  "/boost-responsibly-how-to-choose-safe-and-legit-rematch-services",
  "/boost-smarter-not-harder-choosing-the-right-rocket-league-boosting-service",
  "/from-bronze-to-supersonic-a-behind-the-scenes-look-at-rocket-league-boosters",
  "/inside-the-boost-life-as-a-professional-rematch-rank-climber",
  "/level-up-fast-how-rematch-boosting-services-are-changing-the-game",
  "/unlocking-the-leaderboards-the-rise-of-rocket-league-boosting-services",
  "/locations.kml",
]);

export async function proxy(request: NextRequest) {
  if (retiredPaths.has(request.nextUrl.pathname)) {
    return new NextResponse(
      "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"robots\" content=\"noindex, nofollow\"><title>Content retired | BoostingPedia</title></head><body><main><h1>Content retired</h1><p>This page is no longer available.</p></main></body></html>",
      {
        status: 410,
        headers: {
          "Cache-Control": "public, max-age=3600",
          "Content-Type": "text/html; charset=utf-8",
          "X-Robots-Tag": "noindex, nofollow",
        },
      },
    );
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
