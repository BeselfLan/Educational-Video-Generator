import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { fadeOut, progress, springIn } from "../core/animation";
import type { Rect } from "../core/geometry";
import { Icon, type IconName } from "../core/Icon";
import { colors, radii } from "../core/theme";

export interface AppWindowProps {
  rect: Rect;
  title: React.ReactNode;
  icon?: IconName;
  /** Title-bar style: Windows (min/max/close on the right) or macOS (traffic lights). */
  variant?: "windows" | "mac";
  accent?: string;
  at?: number;
  exitAt?: number;
  /** Content background. */
  background?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/** An application window frame. Children fill the client area (position: relative). */
export const AppWindow: React.FC<AppWindowProps> = ({
  rect,
  title,
  icon,
  variant = "windows",
  accent = colors.blue,
  at = 0,
  exitAt,
  background = colors.bgAlt,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(frame, fps, at, { damping: 16 });
  const barH = 44;
  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        display: "flex",
        flexDirection: "column",
        borderRadius: variant === "mac" ? radii.md : radii.sm,
        border: `1px solid ${colors.border}`,
        overflow: "hidden",
        background,
        boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
        opacity: progress(frame, at, 8) * fadeOut(frame, exitAt),
        transform: `scale(${0.92 + 0.08 * p})`,
        ...style,
      }}
    >
      <div
        style={{
          height: barH,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 14px",
          background: colors.panelHi,
          borderBottom: `1px solid ${colors.border}`,
          fontSize: 18,
          color: colors.textDim,
        }}
      >
        {variant === "mac" ? (
          [colors.red, colors.yellow, colors.green].map((c) => <span key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />)
        ) : icon ? (
          <Icon name={icon} size={20} color={accent} />
        ) : (
          <span style={{ width: 14, height: 14, borderRadius: 3, background: accent }} />
        )}
        <span style={{ flex: 1, textAlign: variant === "mac" ? "center" : "left", fontWeight: 600 }}>{title}</span>
        {variant === "windows" ? (
          <span style={{ display: "flex", gap: 26, paddingRight: 8, fontSize: 18, color: colors.textDim }}>
            <span>─</span>
            <span>☐</span>
            <span>✕</span>
          </span>
        ) : (
          <span style={{ width: 60 }} />
        )}
      </div>
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>{children}</div>
    </div>
  );
};
