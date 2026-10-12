# core components and helpers

`src/components/core/`. These are subject-independent, and every other subject builds on them.

## Theme (`theme.ts`)

| Export | What |
|---|---|
| `colors` | `bg bgAlt panel panelHi border` (surfaces), `text textDim textFaint`, accents `claude blue cyan green yellow red purple pink` |
| `palette` | Categorical order for series and actors: blue, claude, green, purple, yellow, cyan, pink, red |
| `fonts` | `fonts.sans` (Inter), `fonts.mono` (JetBrains Mono) |
| `fontSizes` | `caption 30, body 28, small 22, tiny 18, h3 40, h2 56, h1 96` |
| `radii` | `sm 6, md 12, lg 18` |

Hex colors take an alpha suffix: `${colors.blue}26` gives a soft tint.

## Timing helpers (`animation.ts`)

| Helper | Returns |
|---|---|
| `progress(frame, at, duration, easing?)` | 0→1, clamped, ease-out cubic by default. Safe with `at = Infinity` (stays 0). |
| `lerpFrames(frame, [a, b], [from, to], easing?)` | Clamped interpolate |
| `springIn(frame, fps, at?, config?)` | Spring 0→1 with a slight overshoot, starting at `at` |
| `fadeOut(frame, exitAt?, duration=12)` | 1 → 0 after `exitAt` (1 if undefined) |
| `within(frame, windows)` | Is the frame inside any `[start, end)` window? |
| `windowIntensity(frame, windows, ramp=8)` | 0..1 with soft edges, for highlights |
| `typedChars(frame, at, cps, fps, total)` | Character count for typing effects |
| `typingDuration(text, cps, fps)` | Frames needed to type `text`. Schedule the next event with it. |
| `stagger(at, i, gap)` | `at + i × gap` |
| `pulse(frame, period=45)` | Smooth 0..1..0 wave, for "alive" glows |
| `blink(frame, period=30)` | Cursor on/off |
| `sec(seconds, fps)` | Seconds → frames |

## Geometry (`geometry.ts`)

`Point {x, y}` and `Rect {x, y, w, h}`, in container pixels.

| Helper | Use |
|---|---|
| `anchor(rect, side, t=0.5)` | A point on an edge: `"top" \| "bottom" \| "left" \| "right" \| "center"`; `t` slides along the edge |
| `offset(p, dx, dy)` | Shift a point |
| `inset(rect, d)` | Shrink a rect (negative `d` grows it) |
| `grid(rect, cols, rows, gap)` | Cells, row by row. `row(rect, n, gap)` and `column(rect, n, gap)` are the 1-D cases. |
| `pathBetween(a, b, shape, bend=0.5)` | SVG `d` string. Shapes: `straight`, `curve` (horizontal S), `elbow-h`, `elbow-v` |

```tsx
const nodes = column({ x: 490, y: 300, w: 320, h: 550 }, 6, 14); // 6 stacked boxes
<Connector from={anchor(nodes[5], "right")} to={anchor(other, "left")} shape="curve" />
```

## Scene

Full-frame backdrop: it sets the background, the default font and the text color.

| Prop | Default | |
|---|---|---|
| `grid` | false | Faint dot grid |
| `glow` | none | Color of a soft radial glow in the top-right corner |
| `background` | `colors.bg` | |

## Title

A heading with a staggered entrance: kicker → title → accent bar → subtitle.

| Prop | Default | |
|---|---|---|
| `title` | required | |
| `subtitle`, `kicker` | none | `kicker` is the small uppercase label above the title |
| `variant` | `"header"` | `"header"` sits top-left (y 56 to about 190). `"hero"` is centered and huge, for title cards. |
| `at`, `exitAt`, `accent` | 0, none, `colors.claude` | |

A hero title fills the frame (inset 0). To move it, wrap it in a positioned div, e.g. `top: -120, bottom: 120` to raise it.

## Captions

Narration lower-third. One cue shows at a time, and cues cross-fade.

```tsx
<Captions cues={[{ text: "First point", at: 20 }, { text: "Second", at: 200 }, { text: "Last", at: 380, until: 450 }]} />
```

A cue lasts until the next cue's `at`, or until its own `until`. Props: `bottom` (48), `maxWidth` (1500), `accent`. Keep cues under about 15 words, and give each at least 2 s.

## Appear

Generic entrance and exit wrapper.

| Prop | Default | |
|---|---|---|
| `at`, `exitAt` | 0, none | |
| `from` | `"bottom"` | `"top" "left" "right" "scale" "none"` |
| `distance` | 40 | Slide distance, px |
| `motion` | `"spring"` | `"ease"` uses `duration` (18) |
| `absolute` | none | `{x, y, w?, h?}` places it absolutely |

## Typewriter

```tsx
<Typewriter text="streamed text…" at={15} charsPerSecond={75} cursor={false} />
```

`cursor`: `"bar"` (the default), `"block"` or `false`. `keepCursor` keeps it blinking after typing ends. Newlines are kept. Speed guide: about 40 cps for a human typing, 70–120 for model output.

## Badge

A pill label. `variant`: `"soft"` (the default), `"solid"` or `"outline"`. Other props: `color`, `mono`, `size` (font px, 22), and `at` (pops in; omit it to show immediately). Children can include an `<Icon>`.

## Panel

A titled card, the basic container. Props:
- `title`, `headerRight` (a node on the right of the header) and `accent` (header dot, highlight color);
- `rect` for absolute placement, `at`;
- `highlight` (windows that glow the border), `padding` (20; use 0 for edge-to-edge content).

The content area is `position: relative`, so absolutely positioned children (a `Terminal` or `CodeBlock` with a `rect`) are placed inside it.

## BulletList

```tsx
<BulletList at={30} gap={14} marker="check" items={[
  { text: "Point", detail: "smaller second line" },
  { text: "Emphasized later", focus: [[120, 180]] },   // the others dim during the window
]} style={{ position: "absolute", left: 80, top: 260, width: 900 }} />
```

`marker`: `"dot"`, `"number"` or `"check"`. Each item can override `at` and `color`.

## Annotation

A callout: a curved leader line from a label box to a target point, with a ripple on the target. It renders nothing before `at`.

```tsx
<Annotation target={{ x: 700, y: 410 }} label={{ x: 1040, y: 640 }} text="explains this" at={70} exitAt={150} color={colors.yellow} />
```

`labelAlign` (`"left"` by default) says which edge of the label box sits at `label`. Other props: `maxWidth` (460) and `fontSize`. To point at a code line in a `CodeBlock` at `rect` with `fontSize` f: y = `rect.y + 62 + (line − 0.5) × round(f × 1.55)`, where 62 is the title bar plus padding. Subtract the scrolled lines.

## Icon

A 24×24 stroke icon set (no emoji font in headless Chrome). Names:

`monitor server terminal code lock shield stop camera mouse keyboard sparkle brain plug file user check x bolt eye database clock chart sigma function`

Props: `size` (32), `color` (currentColor) and `strokeWidth` (2). To add one, add a key to `ICONS` in `Icon.tsx` with SVG children drawn on a 24×24 grid.
