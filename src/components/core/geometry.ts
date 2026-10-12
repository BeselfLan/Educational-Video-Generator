// Positions for diagram-style layouts. Diagram components (nodes, connectors,
// packets, annotations) are absolutely positioned in the pixel space of their
// container, usually the full 1920x1080 frame, so they can be wired together
// with `anchor()` instead of measuring the DOM.

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Side = "top" | "bottom" | "left" | "right" | "center";

/** A point on a rectangle's edge. `t` slides along the edge (0 = start, 0.5 = middle, 1 = end). */
export function anchor(r: Rect, side: Side, t = 0.5): Point {
  switch (side) {
    case "top":
      return { x: r.x + r.w * t, y: r.y };
    case "bottom":
      return { x: r.x + r.w * t, y: r.y + r.h };
    case "left":
      return { x: r.x, y: r.y + r.h * t };
    case "right":
      return { x: r.x + r.w, y: r.y + r.h * t };
    case "center":
      return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  }
}

/** Offset a point. */
export const offset = (p: Point, dx: number, dy: number): Point => ({ x: p.x + dx, y: p.y + dy });

/** Shrink (positive) or grow (negative) a rect on all sides. */
export const inset = (r: Rect, d: number): Rect => ({ x: r.x + d, y: r.y + d, w: r.w - 2 * d, h: r.h - 2 * d });

/** Split a rect into an n-column / m-row grid of cells with a gap. Returns cells row by row. */
export function grid(r: Rect, cols: number, rows: number, gap = 0): Rect[] {
  const w = (r.w - gap * (cols - 1)) / cols;
  const h = (r.h - gap * (rows - 1)) / rows;
  const cells: Rect[] = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) cells.push({ x: r.x + i * (w + gap), y: r.y + j * (h + gap), w, h });
  return cells;
}

/** Evenly spaced rects stacked vertically inside `r`. */
export const column = (r: Rect, n: number, gap = 0) => grid(r, 1, n, gap);

/** Evenly spaced rects side by side inside `r`. */
export const row = (r: Rect, n: number, gap = 0) => grid(r, n, 1, gap);

export type PathShape = "straight" | "curve" | "elbow-h" | "elbow-v";

/**
 * SVG path data between two points.
 *  - straight: a line
 *  - curve: a horizontal S-curve (good for left-to-right flows)
 *  - elbow-h: horizontal, vertical, horizontal (right-angled)
 *  - elbow-v: vertical, horizontal, vertical
 */
export function pathBetween(a: Point, b: Point, shape: PathShape = "straight", bend = 0.5): string {
  switch (shape) {
    case "straight":
      return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
    case "curve": {
      const dx = (b.x - a.x) * bend;
      return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
    }
    case "elbow-h": {
      const mx = a.x + (b.x - a.x) * bend;
      return `M ${a.x} ${a.y} L ${mx} ${a.y} L ${mx} ${b.y} L ${b.x} ${b.y}`;
    }
    case "elbow-v": {
      const my = a.y + (b.y - a.y) * bend;
      return `M ${a.x} ${a.y} L ${a.x} ${my} L ${b.x} ${my} L ${b.x} ${b.y}`;
    }
  }
}
