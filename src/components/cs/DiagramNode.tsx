import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { fadeOut, progress, pulse, springIn, windowIntensity } from "../core/animation";
import type { Rect } from "../core/geometry";
import { Icon, type IconName } from "../core/Icon";
import { colors, fonts, radii } from "../core/theme";

export interface DiagramNodeProps {
  rect: Rect;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: IconName;
  accent?: string;
  /** Monospace title, for file names and identifiers like `tools.ts`. */
  mono?: boolean;
  at?: number;
  exitAt?: number;
  /** Glow + pulse during these [start, end) windows ("this part is working now"). */
  active?: Array<[number, number]>;
  /** Fade to background importance during these windows. */
  dim?: Array<[number, number]>;
  /** "solid" filled card, "ghost" outline only. */
  variant?: "solid" | "ghost";
  titleSize?: number;
  children?: React.ReactNode;
}

/** A box in an architecture or flow diagram: a component, service, file or process. */
export const DiagramNode: React.FC<DiagramNodeProps> = ({
  rect,
  title,
  subtitle,
  icon,
  accent = colors.blue,
  mono = false,
  at = 0,
  exitAt,
  active,
  dim,
  variant = "solid",
  titleSize,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(frame, fps, at);
  const on = windowIntensity(frame, active);
  const dimmed = windowIntensity(frame, dim);
  const glow = on * (0.6 + 0.4 * pulse(frame, 40));
  const size = titleSize ?? Math.min(30, Math.max(18, rect.h * 0.24));
  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 20px",
        boxSizing: "border-box",
        borderRadius: radii.md,
        background: variant === "solid" ? colors.panel : "transparent",
        border: `2px solid ${on > 0 ? accent : `${accent}88`}`,
        boxShadow: `0 0 ${50 * glow}px ${accent}${on > 0 ? "aa" : "00"}, inset 0 0 0 1px ${accent}${Math.round(on * 120).toString(16).padStart(2, "0")}`,
        opacity: progress(frame, at, 8) * fadeOut(frame, exitAt) * (1 - 0.6 * dimmed),
        transform: `scale(${(0.85 + 0.15 * p) * (1 + 0.03 * on)})`,
      }}
    >
      {icon ? (
        <div
          style={{
            width: size * 1.8,
            height: size * 1.8,
            borderRadius: radii.sm,
            background: `${accent}22`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name={icon} size={size * 1.1} color={accent} />
        </div>
      ) : null}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontFamily: mono ? fonts.mono : fonts.sans, fontSize: size, fontWeight: 700, lineHeight: 1.15, color: colors.text }}>{title}</div>
        {subtitle ? <div style={{ fontSize: size * 0.68, color: colors.textDim, marginTop: 4, lineHeight: 1.25 }}>{subtitle}</div> : null}
        {children}
      </div>
    </div>
  );
};
