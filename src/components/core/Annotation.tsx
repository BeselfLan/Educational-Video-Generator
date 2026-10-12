import React from "react";
import { evolvePath } from "@remotion/paths";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { fadeOut, progress, springIn } from "./animation";
import type { Point } from "./geometry";
import { colors, fontSizes } from "./theme";

export interface AnnotationProps {
  /** The point being pointed at (container pixels). */
  target: Point;
  /** Where the label box's anchor sits (container pixels). */
  label: Point;
  text: React.ReactNode;
  at?: number;
  exitAt?: number;
  color?: string;
  /** Which corner/edge of the label box sits at `label`. */
  labelAlign?: "left" | "right" | "center";
  maxWidth?: number;
  fontSize?: number;
}

/**
 * A callout: a curved leader line from a label to a target point, with a dot on the target.
 * Draws itself in, then the label pops. Works over any diagram, plot or code block that is
 * absolutely positioned in the same container.
 */
export const Annotation: React.FC<AnnotationProps> = ({
  target,
  label,
  text,
  at = 0,
  exitAt,
  color = colors.yellow,
  labelAlign = "left",
  maxWidth = 460,
  fontSize = fontSizes.small,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const draw = progress(frame, at, 16);
  const out = fadeOut(frame, exitAt);
  const pop = springIn(frame, fps, at + 10);
  const midX = (label.x + target.x) / 2;
  const d = `M ${label.x} ${label.y} C ${midX} ${label.y}, ${midX} ${target.y}, ${target.x} ${target.y}`;
  const { strokeDasharray, strokeDashoffset } = evolvePath(draw, d);
  const translateX = labelAlign === "left" ? "0%" : labelAlign === "right" ? "-100%" : "-50%";
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: out }}>
      <svg style={{ position: "absolute", inset: 0, overflow: "visible" }} width="100%" height="100%">
        <path d={d} fill="none" stroke={color} strokeWidth={3} strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
        <circle cx={target.x} cy={target.y} r={8 * Math.min(1, draw * 2)} fill={color} />
        <circle cx={target.x} cy={target.y} r={8 + 14 * draw} fill="none" stroke={color} strokeOpacity={1 - draw} strokeWidth={2} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: label.x,
          top: label.y,
          transform: `translate(${translateX}, -50%) scale(${pop})`,
          transformOrigin: labelAlign === "right" ? "right center" : labelAlign === "left" ? "left center" : "center",
          maxWidth,
          width: "max-content",
          padding: "10px 16px",
          borderRadius: 10,
          background: colors.panelHi,
          border: `2px solid ${color}`,
          color: colors.text,
          fontSize,
          lineHeight: 1.3,
          fontWeight: 500,
        }}
      >
        {text}
      </div>
    </div>
  );
};
