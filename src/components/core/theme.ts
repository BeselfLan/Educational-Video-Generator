// Shared visual language for every subject (CS, math, stats, ...).
// Components take colors as props but default to these tokens, so a video
// can be re-themed by editing this one file.
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const inter = loadInter("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] });
const mono = loadMono("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });

export const fonts = {
  sans: inter.fontFamily,
  mono: mono.fontFamily,
} as const;

export const colors = {
  // surfaces, darkest to lightest
  bg: "#0b0f17",
  bgAlt: "#111827",
  panel: "#151c2b",
  panelHi: "#1d2638",
  border: "#2a3550",
  // text
  text: "#e6eaf2",
  textDim: "#9aa4b8",
  textFaint: "#5f6b82",
  // accents (one meaning each; keep them consistent across a video)
  claude: "#d97757", // Claude / the AI
  blue: "#4f8cff", // primary / info
  cyan: "#38c6d9", // network / data in flight
  green: "#3fb67a", // success / allowed
  yellow: "#e8b931", // attention / pending
  red: "#e5484d", // danger / stop
  purple: "#9b7bff", // secondary / math emphasis
  pink: "#ec6cb9",
} as const;

export type ColorName = keyof typeof colors;

/** Categorical palette for series, actors, bars, ... in a fixed order. */
export const palette = [colors.blue, colors.claude, colors.green, colors.purple, colors.yellow, colors.cyan, colors.pink, colors.red];

export const radii = { sm: 6, md: 12, lg: 18 } as const;

export const fontSizes = {
  caption: 30,
  body: 28,
  small: 22,
  tiny: 18,
  h3: 40,
  h2: 56,
  h1: 96,
} as const;
