import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { progress, springIn, windowIntensity } from "./animation";
import type { Rect } from "./geometry";
import { colors, radii } from "./theme";

export interface PanelProps {
  children?: React.ReactNode;
  /** Header text shown in a small uppercase strip. */
  title?: React.ReactNode;
  /** Optional element on the right of the header (badge, status dot...). */
  headerRight?: React.ReactNode;
  accent?: string;
  /** Absolute placement in container pixels. Omit to flow in layout. */
  rect?: Rect;
  at?: number;
  /** Glow the border during these [start, end) frame windows. */
  highlight?: Array<[number, number]>;
  padding?: number;
  style?: React.CSSProperties;
}

/** Titled card. The basic container for panes, side notes and grouped content. */
export const Panel: React.FC<PanelProps> = ({ children, title, headerRight, accent = colors.blue, rect, at, highlight, padding = 20, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = at === undefined ? 1 : springIn(frame, fps, at, { damping: 18 });
  const glow = windowIntensity(frame, highlight);
  const pos: React.CSSProperties = rect ? { position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h } : {};
  return (
    <div
      style={{
        ...pos,
        display: "flex",
        flexDirection: "column",
        background: colors.panel,
        border: `2px solid ${glow > 0 ? accent : colors.border}`,
        borderRadius: radii.md,
        boxShadow: glow > 0 ? `0 0 ${40 * glow}px ${accent}66` : "0 10px 30px rgba(0,0,0,0.35)",
        overflow: "hidden",
        opacity: at === undefined ? 1 : progress(frame, at, 10),
        transform: `translateY(${(1 - p) * 30}px)`,
        ...style,
      }}
    >
      {title ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 18px",
            background: colors.panelHi,
            borderBottom: `2px solid ${colors.border}`,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: colors.textDim,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: 5, background: accent }} />
            {title}
          </span>
          {headerRight}
        </div>
      ) : null}
      <div style={{ flex: 1, padding, position: "relative", minHeight: 0 }}>{children}</div>
    </div>
  );
};
