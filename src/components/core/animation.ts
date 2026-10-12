// Frame-math helpers. Everything in Remotion must be a pure function of the
// frame number: no CSS transitions, no setTimeout, no Math.random().
//
// Convention used by every component in this library: a prop named `at` is the
// frame (relative to the enclosing <Sequence>) where the element starts to appear.
import { Easing, interpolate, spring, type SpringConfig } from "remotion";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0 -> 1 between `at` and `at + duration`, clamped, eased (default ease-out cubic). */
export function progress(frame: number, at: number, duration: number, easing: (t: number) => number = Easing.out(Easing.cubic)): number {
  // An open-ended window (at = Infinity) never starts; interpolate() rejects non-finite ranges.
  if (!Number.isFinite(at)) return at < 0 ? 1 : 0;
  if (duration <= 0) return frame >= at ? 1 : 0;
  return interpolate(frame, [at, at + duration], [0, 1], { ...CLAMP, easing });
}

/** Clamped interpolate: map `frame` from [a, b] to [from, to]. */
export function lerpFrames(frame: number, [a, b]: [number, number], [from, to]: [number, number], easing?: (t: number) => number): number {
  return interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });
}

/** A natural pop-in: 0 -> 1 (with slight overshoot by default) starting at `at`. */
export function springIn(frame: number, fps: number, at = 0, config: Partial<SpringConfig> = { damping: 14, mass: 0.6 }): number {
  return spring({ frame: frame - at, fps, config });
}

/** Visible -> hidden fade for elements that leave: 1 before `at`, 0 after `at + duration`. */
export function fadeOut(frame: number, at: number | undefined, duration = 12): number {
  if (at === undefined) return 1;
  return 1 - progress(frame, at, duration, Easing.in(Easing.cubic));
}

/** Is `frame` inside any [start, end) window? Used for highlight schedules. */
export function within(frame: number, windows: Array<[number, number]> | undefined): boolean {
  return !!windows?.some(([s, e]) => frame >= s && frame < e);
}

/** 0..1 intensity of a highlight window with soft edges (fades in and out over `ramp` frames). */
export function windowIntensity(frame: number, windows: Array<[number, number]> | undefined, ramp = 8): number {
  if (!windows) return 0;
  let v = 0;
  for (const [s, e] of windows) {
    const up = progress(frame, s, ramp, Easing.linear);
    const down = 1 - progress(frame, e - ramp, ramp, Easing.linear);
    v = Math.max(v, Math.min(up, down));
  }
  return v;
}

/** Number of characters to show for a typewriter effect. */
export function typedChars(frame: number, at: number, charsPerSecond: number, fps: number, total: number): number {
  if (frame < at) return 0;
  return Math.min(total, Math.floor(((frame - at) / fps) * charsPerSecond));
}

/** Frames needed to type `text` at `charsPerSecond`. Handy for scheduling what comes next. */
export function typingDuration(text: string, charsPerSecond: number, fps: number): number {
  return Math.ceil((text.length / charsPerSecond) * fps);
}

/** Start frame of the i-th item in a staggered list. */
export const stagger = (at: number, index: number, gap: number) => at + index * gap;

/** Blinking cursor on/off (period in frames). */
export const blink = (frame: number, period = 30) => Math.floor(frame / (period / 2)) % 2 === 0;

/** Smooth 0..1..0 oscillation for "alive" glows. */
export const pulse = (frame: number, period = 45) => 0.5 - 0.5 * Math.cos((2 * Math.PI * frame) / period);

/** Seconds -> frames. */
export const sec = (seconds: number, fps: number) => Math.round(seconds * fps);
