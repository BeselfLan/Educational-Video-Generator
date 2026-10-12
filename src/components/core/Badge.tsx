import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { progress, springIn } from "./animation";
import { colors, fonts } from "./theme";

export interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  /** "soft" tinted background, "solid" filled, "outline" border only. */
  variant?: "soft" | "solid" | "outline";
  mono?: boolean;
  size?: number;
  at?: number;
  style?: React.CSSProperties;
}

/** Pill label: tool names, statuses ("No network needed"), tags. */
export const Badge: React.FC<BadgeProps> = ({ children, color = colors.blue, variant = "soft", mono = false, size = 22, at, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = at === undefined ? 1 : springIn(frame, fps, at);
  const bg = variant === "solid" ? color : variant === "soft" ? `${color}26` : "transparent";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: `${size * 0.25}px ${size * 0.6}px`,
        borderRadius: 999,
        border: `2px solid ${variant === "solid" ? color : `${color}aa`}`,
        background: bg,
        color: variant === "solid" ? colors.bg : color,
        fontFamily: mono ? fonts.mono : undefined,
        fontSize: size,
        fontWeight: 600,
        whiteSpace: "nowrap",
        opacity: at === undefined ? 1 : progress(frame, at, 8),
        transform: `scale(${0.7 + 0.3 * p})`,
        ...style,
      }}
    >
      {children}
    </span>
  );
};
