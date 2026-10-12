import React from "react";
import { AbsoluteFill } from "remotion";
import { colors, fonts } from "./theme";

export interface SceneProps {
  children: React.ReactNode;
  /** Background color. Default theme bg. */
  background?: string;
  /** Faint dot grid behind the content (nice for diagrams and plots). */
  grid?: boolean;
  /** Soft radial glow in a corner, using this color. */
  glow?: string;
  style?: React.CSSProperties;
}

/** Full-frame backdrop every scene starts with. Sets the default font and text color. */
export const Scene: React.FC<SceneProps> = ({ children, background = colors.bg, grid = false, glow, style }) => (
  <AbsoluteFill style={{ backgroundColor: background, fontFamily: fonts.sans, color: colors.text, ...style }}>
    {glow ? (
      <AbsoluteFill style={{ background: `radial-gradient(circle at 85% 10%, ${glow}22 0%, transparent 45%)` }} />
    ) : null}
    {grid ? (
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${colors.border} 1.2px, transparent 1.2px)`,
          backgroundSize: "40px 40px",
          opacity: 0.55,
        }}
      />
    ) : null}
    {children}
  </AbsoluteFill>
);
