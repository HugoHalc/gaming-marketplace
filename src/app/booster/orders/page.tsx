import { BoosterOrdersHub } from "@/components/dashboard/booster-orders-hub";
import { getBoosterOrderBoard } from "@/features/booster/server/order-board";
import { boardGames } from "@/features/booster/presentation/order-board";

export const metadata = { title: "Booster Orders | BoostingPedia" };
export const dynamic = "force-dynamic";

export default async function BoosterOrdersPage({ searchParams }: {
  searchParams: Promise<{ view?: string; game?: string; layout?: string; q?: string }>;
}) {
  const [board, query] = await Promise.all([getBoosterOrderBoard(), searchParams]);
  return <BoosterOrdersHub key={board.viewerId} {...board}
    initialBucket={query.view === "active" ? "active" : query.view === "completed" ? "completed" : "available"}
    initialGame={boardGames.some((game) => game.slug === query.game) ? query.game : "all"}
    initialSearch={query.q?.trim() ?? ""} initialLayout={query.layout === "list" ? "list" : "grid"} />;
}
