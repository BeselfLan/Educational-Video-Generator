import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { progress, springIn, stagger, windowIntensity } from "./animation";
import { colors, fontSizes } from "./theme";

export interface Bullet {
  text: React.ReactNode;
  /** Secondary line under the bullet. */
  detail?: React.ReactNode;
  /** Override the staggered start frame for this item. */
  at?: number;
  color?: string;
  /** Emphasize the item during these [start, end) windows (others dim). */
  focus?: Array<[number, number]>;
}

export interface BulletListProps {
  items: Bullet[];
  at?: number;
  /** Frames between consecutive items. */
  gap?: number;
  fontSize?: number;
  /** "dot", "number", or "check" markers. */
  marker?: "dot" | "number" | "check";
  accent?: string;
  style?: React.CSSProperties;
}

/** Staggered list of points. Items with `focus` windows pull attention; the rest dim meanwhile. */
export const BulletList: React.FC<BulletListProps> = ({ items, at = 0, gap = 12, fontSize = fontSizes.body, marker = "dot", accent = colors.claude, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anyFocus = Math.max(0, ...items.map((it) => windowIntensity(frame, it.focus)));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: fontSize * 0.7, ...style }}>
      {items.map((item, i) => {
        const start = item.at ?? stagger(at, i, gap);
        const p = springIn(frame, fps, start);
        const focus = windowIntensity(frame, item.focus);
        const dim = 1 - 0.6 * anyFocus * (1 - focus);
        const c = item.color ?? accent;
        const mark =
          marker === "number" ? (
            <span style={{ color: c, fontWeight: 800, minWidth: fontSize * 1.2 }}>{i + 1}.</span>
          ) : marker === "check" ? (
            <span style={{ color: c, fontWeight: 800, minWidth: fontSize }}>✓</span>
          ) : (
            <span style={{ width: fontSize * 0.36, height: fontSize * 0.36, borderRadius: "50%", background: c, marginTop: fontSize * 0.42, flexShrink: 0 }} />
          );
        return (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 16,
              alignItems: "flex-start",
              opacity: progress(frame, start, 8) * dim,
              transform: `translateX(${(1 - p) * -30}px) scale(${1 + 0.03 * focus})`,
              transformOrigin: "left center",
              fontSize,
              lineHeight: 1.3,
            }}
          >
            {mark}
            <div>
              <div style={{ fontWeight: 600 }}>{item.text}</div>
              {item.detail ? <div style={{ fontSize: fontSize * 0.75, color: colors.textDim, marginTop: 4 }}>{item.detail}</div> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};
