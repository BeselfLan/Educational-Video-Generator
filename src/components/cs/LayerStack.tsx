import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { progress, springIn, stagger, windowIntensity } from "../core/animation";
import type { Rect } from "../core/geometry";
import { Icon, type IconName } from "../core/Icon";
import { colors, fonts, palette, radii } from "../core/theme";

export interface Layer {
  title: React.ReactNode;
  detail?: React.ReactNode;
  /** Right-aligned tag, e.g. "no network" or "L4". */
  tag?: React.ReactNode;
  tagColor?: string;
  icon?: IconName;
  color?: string;
  /** Override the staggered entrance frame. */
  at?: number;
  /** Highlight windows for this layer. */
  focus?: Array<[number, number]>;
}

export interface LayerStackProps {
  layers: Layer[];
  rect: Rect;
  at?: number;
  /** Frames between layer entrances. */
  gap?: number;
  /**
   * A signal passing through the stack: starting at `cascade.at`, each layer lights up in
   * order (top to bottom), `cascade.step` frames apart, and stays lit. Use it for things
   * like an interrupt propagating, or a packet going down the network stack.
   */
  cascade?: { at: number; step?: number; color?: string };
  monoTitles?: boolean;
}

/**
 * Stacked horizontal bands: protocol stacks, defense-in-depth layers, pipeline stages,
 * memory hierarchies. Rows share the height of `rect` evenly.
 */
export const LayerStack: React.FC<LayerStackProps> = ({ layers, rect, at = 0, gap = 8, cascade, monoTitles = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rowGap = 12;
  const rowH = (rect.h - rowGap * (layers.length - 1)) / layers.length;
  const titleSize = Math.min(28, rowH * 0.32);
  return (
    <div style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h }}>
      {layers.map((l, i) => {
        const c = l.color ?? palette[i % palette.length];
        const start = l.at ?? stagger(at, i, gap);
        const p = springIn(frame, fps, start);
        const lit = cascade ? progress(frame, cascade.at + i * (cascade.step ?? 10), 8) : 0;
        const flash = cascade ? 1 - progress(frame, cascade.at + i * (cascade.step ?? 10) + 8, 20) : 0;
        const focus = Math.max(windowIntensity(frame, l.focus), lit);
        const litColor = cascade?.color ?? c;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: i * (rowH + rowGap),
              width: rect.w,
              height: rowH,
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "0 22px",
              boxSizing: "border-box",
              borderRadius: radii.md,
              background: lit > 0 ? `${litColor}${Math.round(0x18 + 0x30 * flash * lit).toString(16).padStart(2, "0")}` : colors.panel,
              border: `2px solid ${focus > 0 ? (lit > 0 ? litColor : c) : colors.border}`,
              boxShadow: `inset 6px 0 0 ${lit > 0 ? litColor : c}${focus > 0 ? "" : "aa"}, 0 0 ${30 * flash * lit}px ${litColor}88`,
              opacity: progress(frame, start, 8),
              transform: `translateX(${(1 - p) * 60}px) scale(${1 + 0.02 * focus})`,
            }}
          >
            {l.icon ? <Icon name={l.icon} size={titleSize * 1.3} color={lit > 0 ? litColor : c} /> : null}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: titleSize, fontWeight: 700, fontFamily: monoTitles ? fonts.mono : fonts.sans, lineHeight: 1.15 }}>{l.title}</div>
              {l.detail ? <div style={{ fontSize: titleSize * 0.68, color: colors.textDim, marginTop: 3, lineHeight: 1.25 }}>{l.detail}</div> : null}
            </div>
            {l.tag ? (
              <span
                style={{
                  padding: "4px 14px",
                  borderRadius: 999,
                  border: `2px solid ${l.tagColor ?? colors.textDim}`,
                  color: l.tagColor ?? colors.textDim,
                  fontSize: titleSize * 0.62,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {l.tag}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
