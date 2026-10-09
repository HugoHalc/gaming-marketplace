import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "gaming-marketplace-gold.vercel.app",
          },
        ],
        destination: "https://boostingpedia.com/:path*",
        permanent: true,
      },
      {
        source: "/rocket-league",
        destination: "/games/rocket-league",
        permanent: true,
      },
      {
        source: "/rocket-league/rocket-league",
        destination: "/games/rocket-league/rank-boost",
        permanent: true,
      },
      {
        source: "/rocket-league/placements",
        destination: "/games/rocket-league/placements-boost",
        permanent: true,
      },
      {
        source: "/rocket-league/rewards",
        destination: "/games/rocket-league/rewards-boost",
        permanent: true,
      },
      {
        source: "/rocket-league/tournaments",
        destination: "/games/rocket-league/tournament-boost",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/favicon.ico",
        destination: "/brand/boostingpedia-mark.png",
      },
    ];
  },
};

export default nextConfig;
