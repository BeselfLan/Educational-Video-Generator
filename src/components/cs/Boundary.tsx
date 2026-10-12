import React from "react";
import { useCurrentFrame } from "remotion";
import { fadeOut, progress, windowIntensity } from "../core/animation";
import type { Rect } from "../core/geometry";
import { Icon, type IconName } from "../core/Icon";
import { colors, radii } from "../core/theme";

export interface BoundaryProps {
  rect: Rect;
  /** Tab label on the top edge, e.g. "CLIENT" or "Database server". */
  label: React.ReactNode;
  sublabel?: React.ReactNode;
  icon?: IconName;
  accent?: string;
  at?: number;
  exitAt?: number;
  dashed?: boolean;
  active?: Array<[number, number]>;
}

/**
 * A grouping region: a machine, process, trust zone or subsystem. Drawn behind the nodes it
 * contains; render it before them. The border traces itself in from the top-left corner.
 */
export const Boundary: React.FC<BoundaryProps> = ({ rect, label, sublabel, icon, accent = colors.textDim, at = 0, exitAt, dashed = true, active }) => {
  const frame = useCurrentFrame();
  const draw = progress(frame, at, 24);
  const on = windowIntensity(frame, active);
  const perimeter = 2 * (rect.w + rect.h);
  const out = fadeOut(frame, exitAt);
  return (
    <div style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h, opacity: out }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radii.lg,
          background: `${accent}${Math.round(10 + on * 16).toString(16).padStart(2, "0")}`,
          opacity: draw,
        }}
      />
      <svg width={rect.w} height={rect.h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <rect
          x={1}
          y={1}
          width={rect.w - 2}
          height={rect.h - 2}
          rx={radii.lg}
          fill="none"
          stroke={accent}
          strokeOpacity={0.55 + 0.45 * on}
          strokeWidth={2.5}
          strokeDasharray={dashed ? "12 8" : undefined}
          pathLength={perimeter}
          style={dashed ? { clipPath: `inset(0 ${100 - draw * 100}% 0 0)` } : { strokeDasharray: perimeter, strokeDashoffset: perimeter * (1 - draw) }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 24,
          top: 0,
          transform: "translateY(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "6px 16px",
          borderRadius: 999,
          background: colors.bg,
          border: `2px solid ${accent}`,
          color: accent,
          fontSize: 20,
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: "uppercase",
          opacity: progress(frame, at + 6, 10),
          whiteSpace: "nowrap",
        }}
      >
        {icon ? <Icon name={icon} size={22} color={accent} /> : null}
        {label}
        {sublabel ? <span style={{ color: colors.textDim, fontWeight: 500, letterSpacing: 0, textTransform: "none" }}>{sublabel}</span> : null}
      </div>
    </div>
  );
};
