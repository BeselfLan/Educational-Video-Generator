import React from "react";
import { evolvePath, getLength, getPointAtLength, getTangentAtLength } from "@remotion/paths";
import { useCurrentFrame } from "remotion";
import { fadeOut, progress, windowIntensity } from "../core/animation";
import { pathBetween, type PathShape, type Point } from "../core/geometry";
import { colors, fonts } from "../core/theme";

export interface ConnectorProps {
  /** Either from/to (+ shape) or a raw SVG path `d`. */
  from?: Point;
  to?: Point;
  d?: string;
  shape?: PathShape;
  /** Where the bend/elbow sits, 0..1. */
  bend?: number;
  at?: number;
  /** Frames it takes to draw. */
  duration?: number;
  exitAt?: number;
  color?: string;
  width?: number;
  dashed?: boolean;
  /** Marching dashes once drawn: data is flowing (direction from -> to). */
  flow?: boolean;
  arrow?: "end" | "start" | "both" | "none";
  label?: React.ReactNode;
  /** Position of the label along the path, 0..1. */
  labelPos?: number;
  /** Pixel offset of the label from its point on the path. */
  labelOffset?: Point;
  mono?: boolean;
  /** Thicker + glowing during these windows. */
  active?: Array<[number, number]>;
}

/** Point / tangent on a path, never null (the paths library returns null for degenerate paths). */
export const pointOn = (d: string, length: number): Point => getPointAtLength(d, length) ?? { x: 0, y: 0 };
export const tangentOn = (d: string, length: number): Point => getTangentAtLength(d, length) ?? { x: 1, y: 0 };

/** Resolve the SVG path for a connector-like component (shared with Packet). */
export const resolvePath = (p: { d?: string; from?: Point; to?: Point; shape?: PathShape; bend?: number }) => {
  if (p.d) return p.d;
  if (!p.from || !p.to) throw new Error("Connector/Packet needs either `d` or both `from` and `to`");
  return pathBetween(p.from, p.to, p.shape, p.bend);
};

const Arrowhead: React.FC<{ at: Point; dir: Point; color: string; size: number }> = ({ at, dir, color, size }) => {
  const angle = (Math.atan2(dir.y, dir.x) * 180) / Math.PI;
  return <path d={`M 0 0 L ${-size} ${-size * 0.55} L ${-size} ${size * 0.55} Z`} fill={color} transform={`translate(${at.x} ${at.y}) rotate(${angle})`} />;
};

/**
 * An arrow or line between two points that draws itself in. Lives in a full-size SVG overlay,
 * so place it in the same container (usually the whole frame) as the nodes it connects.
 */
export const Connector: React.FC<ConnectorProps> = (props) => {
  const {
    at = 0,
    duration = 20,
    exitAt,
    color = colors.textDim,
    width = 3,
    dashed = false,
    flow = false,
    arrow = "end",
    label,
    labelPos = 0.5,
    labelOffset = { x: 0, y: -22 },
    mono = false,
    active,
  } = props;
  const frame = useCurrentFrame();
  const maskId = `reveal${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const d = resolvePath(props);
  const len = getLength(d);
  const p = progress(frame, at, duration);
  const on = windowIntensity(frame, active);
  const out = fadeOut(frame, exitAt);
  if (p <= 0) return null;

  const evolved = evolvePath(p, d);
  const tip = pointOn(d, Math.max(0.01, len * p));
  const tipDir = tangentOn(d, Math.max(0.01, len * p - 0.01));
  const start = pointOn(d, 0);
  const startDir = tangentOn(d, 0.01);
  const labelPt = pointOn(d, len * labelPos);
  const w = width * (1 + 0.6 * on);
  const head = 10 + w * 2;
  // Dashed lines: reveal with a mask-like dash trick (evolvePath dash would fight with the pattern).
  const drawn = dashed || flow ? { strokeDasharray: flow ? "14 10" : "10 8", strokeDashoffset: flow ? -frame * 1.2 : 0 } : evolved;

  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none", opacity: out }}>
      <defs>
        {dashed || flow ? (
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <path d={d} fill="none" stroke="white" strokeWidth={w + 30} strokeDasharray={evolved.strokeDasharray} strokeDashoffset={evolved.strokeDashoffset} />
          </mask>
        ) : null}
      </defs>
      {on > 0 ? <path d={d} fill="none" stroke={color} strokeOpacity={0.25 * on} strokeWidth={w + 12} strokeLinecap="round" /> : null}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={w}
        strokeLinecap="round"
        strokeLinejoin="round"
        mask={dashed || flow ? `url(#${maskId})` : undefined}
        {...drawn}
      />
      {(arrow === "end" || arrow === "both") && p > 0.05 ? <Arrowhead at={tip} dir={tipDir} color={color} size={head} /> : null}
      {(arrow === "start" || arrow === "both") && p > 0.05 ? <Arrowhead at={start} dir={{ x: -startDir.x, y: -startDir.y }} color={color} size={head} /> : null}
      {label ? (
        <foreignObject x={labelPt.x + labelOffset.x - 400} y={labelPt.y + labelOffset.y - 30} width={800} height={60} style={{ overflow: "visible" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 60 }}>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 8,
                background: colors.bg,
                color,
                fontFamily: mono ? fonts.mono : fonts.sans,
                fontSize: 19,
                fontWeight: 600,
                whiteSpace: "nowrap",
                opacity: progress(frame, at + duration * 0.6, 10),
              }}
            >
              {label}
            </span>
          </div>
        </foreignObject>
      ) : null}
    </svg>
  );
};
