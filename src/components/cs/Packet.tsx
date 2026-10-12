import React from "react";
import { getLength } from "@remotion/paths";
import { Easing, useCurrentFrame } from "remotion";
import { progress } from "../core/animation";
import type { PathShape, Point } from "../core/geometry";
import { colors, fonts } from "../core/theme";
import { pointOn, resolvePath } from "./Connector";

export interface PacketProps {
  /** Same path inputs as Connector: reuse the connector's from/to/shape so they line up. */
  from?: Point;
  to?: Point;
  d?: string;
  shape?: PathShape;
  bend?: number;
  /** Frame the packet leaves. */
  at: number;
  /** Travel time in frames. */
  duration?: number;
  /** Travel the path backwards (to -> from), e.g. a reply on the same wire. */
  reverse?: boolean;
  color?: string;
  /** Text riding with the packet, e.g. `GET /users` or "200 OK". */
  label?: React.ReactNode;
  mono?: boolean;
  size?: number;
  /** Fading trail behind the packet. */
  trail?: boolean;
}

/**
 * A message in flight: a glowing dot (plus optional label) that travels along a path, visible
 * only while moving. Pair it with a Connector drawn along the same path.
 */
export const Packet: React.FC<PacketProps> = (props) => {
  const { at, duration = 30, reverse = false, color = colors.cyan, label, mono = true, size = 12, trail = true } = props;
  const frame = useCurrentFrame();
  if (frame < at || frame > at + duration + 6) return null;
  const d = resolvePath(props);
  const len = getLength(d);
  const t = progress(frame, at, duration, Easing.inOut(Easing.cubic));
  const opacity = progress(frame, at, 4) * (1 - progress(frame, at + duration, 6));
  const pt = (u: number): Point => pointOn(d, len * (reverse ? 1 - u : u));
  const head = pt(t);
  const tail = trail ? [0.06, 0.12, 0.18].map((k) => pt(Math.max(0, t - k))) : [];

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
        {tail.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={size * (0.8 - i * 0.2)} fill={color} opacity={0.45 - i * 0.13} />
        ))}
        <circle cx={head.x} cy={head.y} r={size * 2.2} fill={color} opacity={0.25} />
        <circle cx={head.x} cy={head.y} r={size} fill={color} />
      </svg>
      {label ? (
        <div
          style={{
            position: "absolute",
            left: head.x,
            top: head.y - size - 12,
            transform: "translate(-50%, -100%)",
            padding: "5px 12px",
            borderRadius: 8,
            background: colors.panelHi,
            border: `2px solid ${color}`,
            color,
            fontFamily: mono ? fonts.mono : fonts.sans,
            fontSize: 19,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};
