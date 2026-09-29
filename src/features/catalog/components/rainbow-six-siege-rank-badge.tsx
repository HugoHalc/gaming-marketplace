import Image from "next/image";
import { getRainbowSixSiegeRankBadge } from "@/features/catalog/data/rainbow-six-siege-foundation";

export function RainbowSixSiegeRankBadge({
  rank,
  size = 40,
}: {
  rank: string;
  size?: 24 | 40 | 48 | 56;
}) {
  const src = getRainbowSixSiegeRankBadge(rank);
  if (!src) return null;

  return (
    <Image
      src={src}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className="shrink-0 object-contain"
    />
  );
}
