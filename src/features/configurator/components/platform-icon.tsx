type PlatformIconProps = {
  platform: string;
};

type CanonicalPlatform = "windows" | "playstation" | "xbox" | "nintendo-switch";

const platformIconSource: Record<CanonicalPlatform, string> = {
  windows: "/platform-icons/windows.png",
  playstation: "/platform-icons/playstation.png",
  xbox: "/platform-icons/xbox.png",
  "nintendo-switch": "/platform-icons/nintendo-switch.webp",
};

const platformIconColor: Record<CanonicalPlatform, string> = {
  windows: "text-sky-300",
  playstation: "text-blue-300",
  xbox: "text-green-300",
  "nintendo-switch": "text-red-300",
};

function normalizePlatform(platform: string): CanonicalPlatform | null {
  const value = platform.toLowerCase();

  if (value === "pc" || value === "windows") return "windows";
  if (value === "playstation" || value === "psn") return "playstation";
  if (value === "xbox") return "xbox";
  if (value === "switch" || value === "nintendo-switch") return "nintendo-switch";

  return null;
}

export function PlatformIcon({ platform }: PlatformIconProps) {
  const normalized = normalizePlatform(platform);
  if (!normalized) return null;

  const source = platformIconSource[normalized];
  const color = platformIconColor[normalized];

  return (
    <span
      aria-hidden="true"
      className={`block size-4 shrink-0 bg-current ${color}`}
      style={{
        WebkitMaskImage: `url(${source})`,
        maskImage: `url(${source})`,
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}
