import type { GameAccent } from "../types/catalog";

export interface GameTheme {
  glow: string;
  softGlow: string;
  icon: string;
  line: string;
  text: string;
  border: string;
  surface: string;
}

export const gameThemes: Record<GameAccent, GameTheme> = {
  emerald: {
    glow: "from-emerald-400/18 via-emerald-400/[0.04] to-transparent",
    softGlow: "bg-emerald-500/15",
    icon: "border-emerald-300/15 bg-emerald-400/[0.08] text-emerald-200",
    line: "from-emerald-400/80",
    text: "text-emerald-300",
    border: "border-emerald-300/20",
    surface: "bg-emerald-400/[0.07]",
  },
  rose: {
    glow: "from-rose-400/18 via-rose-400/[0.04] to-transparent",
    softGlow: "bg-rose-500/15",
    icon: "border-rose-300/15 bg-rose-400/[0.08] text-rose-200",
    line: "from-rose-400/80",
    text: "text-rose-300",
    border: "border-rose-300/20",
    surface: "bg-rose-400/[0.07]",
  },
  violet: {
    glow: "from-violet-400/18 via-violet-400/[0.04] to-transparent",
    softGlow: "bg-violet-500/15",
    icon: "border-violet-300/15 bg-violet-400/[0.08] text-violet-200",
    line: "from-violet-400/80",
    text: "text-violet-300",
    border: "border-violet-300/20",
    surface: "bg-violet-400/[0.07]",
  },
  cyan: {
    glow: "from-cyan-400/18 via-cyan-400/[0.04] to-transparent",
    softGlow: "bg-cyan-500/15",
    icon: "border-cyan-300/15 bg-cyan-400/[0.08] text-cyan-200",
    line: "from-cyan-400/80",
    text: "text-cyan-300",
    border: "border-cyan-300/20",
    surface: "bg-cyan-400/[0.07]",
  },
  amber: {
    glow: "from-amber-400/18 via-amber-400/[0.04] to-transparent",
    softGlow: "bg-amber-500/15",
    icon: "border-amber-300/15 bg-amber-400/[0.08] text-amber-200",
    line: "from-amber-400/80",
    text: "text-amber-300",
    border: "border-amber-300/20",
    surface: "bg-amber-400/[0.07]",
  },
  blue: {
    glow: "from-blue-400/18 via-blue-400/[0.04] to-transparent",
    softGlow: "bg-blue-500/15",
    icon: "border-blue-300/15 bg-blue-400/[0.08] text-blue-200",
    line: "from-blue-400/80",
    text: "text-blue-300",
    border: "border-blue-300/20",
    surface: "bg-blue-400/[0.07]",
  },
};
