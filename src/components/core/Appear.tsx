import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { fadeOut, progress, springIn } from "./animation";

export type AppearFrom = "bottom" | "top" | "left" | "right" | "scale" | "none";

export interface AppearProps {
  children: React.ReactNode;
  /** Frame where the entrance starts. */
  at?: number;
  /** Frame where the exit (fade out) starts. Omit to stay visible. */
  exitAt?: number;
  from?: AppearFrom;
  /** Slide distance in px for directional entrances. */
  distance?: number;
  /** "spring" pops with slight overshoot; "ease" is a calm ease-out over `duration`. */
  motion?: "spring" | "ease";
  duration?: number;
  style?: React.CSSProperties;
  /** Render as an absolutely positioned box (x, y, w, h in container pixels). */
  absolute?: { x: number; y: number; w?: number; h?: number };
}

/** Generic entrance/exit wrapper. Wrap anything that should fade/slide/pop in at a frame. */
export const Appear: React.FC<AppearProps> = ({
  children,
  at = 0,
  exitAt,
  from = "bottom",
  distance = 40,
  motion = "spring",
  duration = 18,
  style,
  absolute,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = motion === "spring" ? springIn(frame, fps, at) : progress(frame, at, duration);
  const opacity = Math.min(1, progress(frame, at, Math.max(6, duration / 2))) * fadeOut(frame, exitAt);
  const d = (1 - p) * distance;
  const transform = {
    bottom: `translateY(${d}px)`,
    top: `translateY(${-d}px)`,
    left: `translateX(${-d}px)`,
    right: `translateX(${d}px)`,
    scale: `scale(${0.6 + 0.4 * p})`,
    none: undefined,
  }[from];
  const pos: React.CSSProperties = absolute
    ? { position: "absolute", left: absolute.x, top: absolute.y, width: absolute.w, height: absolute.h }
    : {};
  return <div style={{ ...pos, opacity, transform, ...style }}>{children}</div>;
};
