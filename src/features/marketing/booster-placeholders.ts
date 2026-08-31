export type BoosterPlaceholder = {
  id: string;
  nickname: string;
  primaryGame: string;
  specialty: string;
  rankLabel: string;
  initials: string;
};

export const boosterPlaceholders: BoosterPlaceholder[] = [
  {
    id: "booster-placeholder-1",
    nickname: "Apex",
    primaryGame: "Rocket League",
    specialty: "Rank & Tournament",
    rankLabel: "SSL",
    initials: "AP",
  },
  {
    id: "booster-placeholder-2",
    nickname: "Nyx",
    primaryGame: "League of Legends",
    specialty: "Solo Queue",
    rankLabel: "Challenger",
    initials: "NY",
  },
  {
    id: "booster-placeholder-3",
    nickname: "Vex",
    primaryGame: "Valorant",
    specialty: "Competitive Rank",
    rankLabel: "Radiant",
    initials: "VX",
  },
  {
    id: "booster-placeholder-4",
    nickname: "Nova",
    primaryGame: "Marvel Rivals",
    specialty: "Competitive",
    rankLabel: "Top Tier",
    initials: "NV",
  },
];
