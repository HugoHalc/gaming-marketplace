import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { GameRankValue, resolveGameRank } from "@/components/orders/game-order-presentation";
import { getRainbowSixSiegeRankBadge } from "@/features/catalog/data/rainbow-six-siege-foundation";
import { getDota2RankBadge } from "@/features/catalog/data/dota-2-foundation";
import { getDota2MmrBracketName } from "@/features/configurator/data/dota-2-mmr-options";

const fields: Record<string, string> = {
  platform: "Platform", region: "Region", server: "Server", boostMethod: "Boost method", gameMode: "Mode", queue: "Queue", role: "Role", playlist: "Playlist",
  wins: "Wins", matches: "Matches", games: "Games", placements: "Placements", rewards: "Rewards", tournamentTier: "Tournament tier", tournaments: "Tournaments", quantity: "Quantity",
  currentMmr: "Current MMR", targetMmr: "Desired MMR", currentMMR: "Current MMR", targetMMR: "Desired MMR", currentLp: "Current LP", lpGain: "LP gain", rpGain: "RP gain", eternityPoints: "Eternity points",
  hero: "Hero", champion: "Champion", currentProficiency: "Current proficiency", targetProficiency: "Desired proficiency", currentLevel: "Current level", targetLevel: "Desired level", clashTier: "Clash tier", boosters: "Boosters", behaviorScore: "Behavior score", currentMastery: "Current mastery", targetMastery: "Desired mastery", playPreference: "Play preference", rolePreferences: "Role preferences", heroPreference: "Hero preference", rewardRank: "Reward rank", tournamentRank: "Tournament rank", placementMatches: "Placement matches", netWins: "Net wins", drives: "Competitive drives",
};
const extras: Record<string, string> = {
  expressDelivery: "Express Delivery", streaming: "Streaming", playOffline: "Play Offline", specificHeroes: "Specific Heroes", championsPreferences: "Champion Preferences", soloQueueOnly: "Solo Queue Only", rankInsurance: "Rank Insurance", demotionShield: "Demotion Shield", liveStream: "Live Stream", extraWin: "Extra Win",
};
function label(value: unknown): string {
  if (Array.isArray(value)) return value.map(label).join(", ");
  if (value === "pc") return "PC";
  if (value === "duo") return "Play With Booster";
  if (value === "account") return "Account Boost";
  return String(value).replace(/[-_]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function Rank({ gameName, value, division, title, size }: { gameName: string; value: unknown; division?: unknown; title: string; size: "md" | "lg" }) {
  if (resolveGameRank(gameName, value, division)) return <GameRankValue gameName={gameName} value={value} division={division} label={title} size={size} flat />;
  const text = label(value);
  let asset: string | null = null;
  if (gameName === "Rainbow Six Siege") asset = getRainbowSixSiegeRankBadge(String(value));
  if (gameName === "Dota 2") asset = getDota2RankBadge(String(value)) ?? null;
  if (gameName === "League of Legends") {
    const tier = text.split(" ")[0].toLowerCase();
    if (["iron", "bronze", "silver", "gold", "platinum", "emerald", "diamond", "master"].includes(tier)) asset = `/ranks/league-of-legends/${tier}.png`;
  }
  const dimension = size === "lg" ? 46 : 34;
  return <div className="flex min-w-0 items-center gap-2">
    {asset ? <Image src={asset} alt="" width={dimension} height={dimension} className="shrink-0 object-contain" /> : null}
    <div className="min-w-0"><p className="text-[10px] text-[#A4AEA8]">{title}</p><p className="break-words text-xs font-semibold leading-tight text-white">{text}</p></div>
  </div>;
}
export function OrderWorkspaceConfiguration({ gameName, configuration, priceBreakdown = [], rankSize = "lg" }: {
  gameName: string; configuration: Record<string, unknown>; priceBreakdown?: { label: string; amount: number }[]; rankSize?: "md" | "lg";
}) {
  const current = configuration.currentRank ?? configuration.previousRank ?? (typeof configuration.currentMmr === "number" ? getDota2MmrBracketName(configuration.currentMmr) : undefined);
  const desired = configuration.targetRank ?? configuration.desiredRank ?? (typeof configuration.targetMmr === "number" ? getDota2MmrBracketName(configuration.targetMmr) : undefined);
  const rows = Object.entries(fields).filter(([key]) => configuration[key] !== undefined && configuration[key] !== null && configuration[key] !== "" && (typeof configuration[key] !== "number" || Number.isFinite(configuration[key])));
  const selectedExtras = [...new Set([...Object.entries(extras).filter(([key]) => configuration[key] === true).map(([, title]) => title), ...priceBreakdown.filter((line) => line.amount > 0 && /(play with booster|live stream|express|rank insurance|streaming|extra win)/i.test(line.label)).map((line) => line.label)])];
  return <div className="mt-3 min-w-0 space-y-3">
    {current || desired ? <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
      {current ? <Rank gameName={gameName} value={current} division={configuration.currentDivision ?? configuration.previousDivision} title={configuration.currentRank === undefined && configuration.previousRank !== undefined ? "Previous Rank" : "Current Rank"} size={rankSize} /> : <span />}
      {current && desired ? <ArrowRight aria-hidden="true" className="size-3 text-[#A4AEA8]" /> : <span />}
      {desired ? <Rank gameName={gameName} value={desired} division={configuration.targetDivision} title="Desired Rank" size={rankSize} /> : null}
    </div> : null}
    {rows.length ? <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">{rows.map(([key, title]) => <div key={key} className="min-w-0"><dt>{title}</dt><dd className="mt-0.5 break-words font-semibold text-white">{label(configuration[key])}</dd></div>)}</dl> : null}
    {selectedExtras.length ? <div className="flex flex-wrap gap-1.5" aria-label="Selected extras">{selectedExtras.map((title) => <span key={title} className="rounded-md border border-white/[0.08] px-2 py-1 text-[11px] text-[#82F5A4]">{title}</span>)}</div> : null}
  </div>;
}
