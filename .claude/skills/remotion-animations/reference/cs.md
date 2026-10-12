# cs components

`src/components/cs/`: code, terminals, system diagrams and message flows. To preview them all, open the `CsGallery` composition (`src/compositions/gallery/CsGallery.tsx`), or the `DemoReel`, which plays every subject's demos in turn.

Which component to use:

| To show… | Use |
|---|---|
| Source code, a diff walkthrough, "this line does X" | `CodeBlock` (+ `Annotation`) |
| Shell commands and their output | `Terminal` |
| An architecture, with components grouped by machine or process | `Boundary` + `DiagramNode` + `Connector` |
| Data moving between components | `Packet` on the same path as a `Connector` |
| Who calls whom, in order (request/response, RPC, protocols) | `SequenceDiagram` |
| A UI mock (an app, a dashboard, a desktop) | `AppWindow` + core `Panel` |
| Stacks and layers (OSI, defense in depth, pipelines, memory hierarchy) | `LayerStack` |

---

## CodeBlock

Syntax-highlighted code (prism-react-renderer, VS Dark theme, ligatures off).

| Prop | Default | |
|---|---|---|
| `code`, `language` | required | Languages: tsx, typescript, javascript, rust, python, json, go, cpp, c, sql, yaml, markdown, graphql, swift, kotlin, plain. **No bash.** |
| `title` | none | File name in a title bar with traffic lights |
| `rect` | none | Absolute placement; content clips to it |
| `fontSize` | 24 | Line height = round(fontSize × 1.55) |
| `lineNumbers`, `startLine` | true, 1 | `startLine` only changes the numbers shown |
| `reveal` | none | `{mode: "lines", at, speed}` (frames between lines, default 3), or `{mode: "type", at, speed}` (chars/s, default 60, with a cursor) |
| `highlights` | [] | `[{lines: [3, [5, 8]], at, until?, color?, dimOthers?}]`: tints the lines and dims the rest while active. Line numbers are 1-based positions in `code`. |
| `scroll` | [] | `[{at, line}]`: eases `line` to the top over 20 frames |
| `at`, `style`, `theme` | | `style` overrides the outer box, e.g. `{border: "none", background: "transparent"}` inside a Panel |

```tsx
<CodeBlock code={SRC} language="python" title="search.py" rect={{ x: 80, y: 230, w: 900, h: 600 }}
  reveal={{ mode: "lines", at: 5 }}
  highlights={[{ lines: [4], at: 60, until: 100, color: colors.blue }, { lines: [[7, 10]], at: 100 }]}
  scroll={[{ at: 200, line: 9 }]} />
```

Capacity: about `(h − 62) / round(fontSize × 1.55)` lines with a title bar. Keep lines under about `(w − 60) / (fontSize × 0.6)` characters; they don't wrap.

## Terminal

A shell session. `cmd` lines are typed after the prompt; the other kinds appear at once. Multi-line `text` is split into rows. It auto-scrolls smoothly once the rows outgrow `rect`.

| Prop | Default | |
|---|---|---|
| `lines` | required | `[{text, at, kind?, prompt?, cps?}]`. `kind`: `cmd` / `out` (default) / `err` (red) / `ok` (green) / `info` (cyan) / `dim` |
| `rect` | none | Needed for auto-scroll |
| `prompt` | `"$ "` | e.g. `"C:\\> "` or `"PS> "` |
| `title`, `accent` | `"terminal"`, green | |
| `fontSize` | 22 | |
| `bare` | false | No frame or title bar (for use inside a `Panel`) |

`commandEnd(line, fps)` returns the frame where a typed command finishes, for scheduling its output:

```tsx
const cmd = { kind: "cmd" as const, text: "npm test", at: 10 };
<Terminal rect={...} lines={[cmd, { text: "PASS search.test.ts", kind: "ok", at: commandEnd(cmd, fps) + 10 }]} />
```

Lines never wrap: keep them under about `(w − 40) / (fontSize × 0.6)` characters.

## DiagramNode

A box in a diagram: a component, service, file or process.

| Prop | Default | |
|---|---|---|
| `rect`, `title` | required | |
| `subtitle`, `icon` | none | `icon` is an `IconName` from core |
| `accent` | blue | |
| `mono` | false | Monospace title, for file names and identifiers |
| `at`, `exitAt` | 0 | Springs in |
| `active` | none | Windows: accent glow + pulse ("working now") |
| `dim` | none | Windows: fade into the background |
| `variant` | `"solid"` | `"ghost"` draws the outline only |
| `titleSize` | auto from `rect.h` | |

## Boundary

A grouping region (a machine, process, trust zone or subsystem): a dashed rounded rect that traces itself in, with a tab label on its top edge. Render it **before** the nodes inside it. Props:
- `rect`, `label`, `sublabel` and `icon`;
- `accent`, `at` and `exitAt`;
- `dashed` (true) and `active` windows.

Nesting works: leave about 30 px of inner margin so the inner tab label clears the outer content.

## Connector

An arrow that draws itself in, between `from`/`to` (with `shape`) or along a raw `d`.

| Prop | Default | |
|---|---|---|
| `from`, `to`, `shape`, `bend` | | `shape`: `straight` (the default), `curve`, `elbow-h`, `elbow-v` |
| `d` | | Raw SVG path, instead of `from`/`to` |
| `at`, `duration`, `exitAt` | 0, 20 | |
| `color`, `width` | textDim, 3 | |
| `arrow` | `"end"` | `"start"`, `"both"` or `"none"`. The end arrowhead rides the drawing tip. |
| `dashed` | false | Static dashes |
| `flow` | false | Marching dashes: something is streaming |
| `label`, `labelPos`, `labelOffset` | , 0.5, `{x: 0, y: −22}` | `labelOffset` is in px from the point at `labelPos` along the path |
| `active` | none | Windows: thicker, with a glow |

Also exported: `resolvePath(props)` (gives the `d` string), and `pointOn(d, len)` / `tangentOn(d, len)`, which never return null.

## Packet

A message in flight: a glowing dot with a trail and an optional label, visible only while it moves. Give it the **same** `from`/`to`/`shape`/`d` as its Connector.

```tsx
const wire = { from: anchor(a, "right"), to: anchor(b, "left"), shape: "curve" as const };
<Connector {...wire} at={30} color={colors.cyan} flow />
<Packet {...wire} at={60} duration={30} label="GET /users" />
<Packet {...wire} at={95} reverse color={colors.green} label="result" />
```

Props: `at` (required), `duration` (30), `reverse`, `color` (cyan), `label`, `mono` (true), `size` (12) and `trail` (true). Render packets after the nodes, unless they should pass behind them.

## SequenceDiagram

A UML-style sequence diagram. Actors sit across the top, and messages are arrows that appear over time. When more messages arrive than fit, the message area scrolls up smoothly while the actor headers stay put. The actors in the newest message glow, and older messages dim (`dimPast`).

```tsx
<SequenceDiagram rect={{ x: 50, y: 210, w: 1290, h: 720 }} rowHeight={70} labelSize={19}
  actors={[{ id: "c", label: "Client", sub: "browser", icon: "user", color: colors.green }, { id: "s", label: "Server", icon: "server" }]}
  messages={[
    { from: "c", to: "s", label: "GET /users", detail: "Accept: json", at: 15 },
    { from: "s", to: "s", label: "auth", detail: "jwt.verify()", kind: "self", at: 40 },
    { from: "s", to: "c", label: "200 OK", kind: "reply", at: 65 },
    { from: "c", to: "s", label: "a note spanning both", kind: "note", at: 90 },
  ]} />
```

Message kinds: `call` (solid, the default), `reply` (dashed), `self` (a loop, with the label to the right) and `note` (a box over the lifelines from `from` to `to`). `detail` is a small monospace line under the arrow. **Messages must be in time order.** The header is 96 px. Rows that fit = `floor((h − 114) / rowHeight)`.

## AppWindow

An application window frame (`variant`: `"windows"` with min/max/close, or `"mac"` with traffic lights). Props:
- `rect`, `title` and `icon`;
- `accent`, `at`, `exitAt` and `background` (the client area color).

The client area is `position: relative` below a 44 px title bar. Lay panes out with `grid({x: 14, y: 14, w: W − 28, h: H − 44 − 28}, 2, 2, 14)` and core `Panel rect=...`.

## LayerStack

Stacked bands with an optional icon, a detail line and a right-aligned tag. The rows share `rect.h` evenly.

```tsx
<LayerStack rect={{ x: 70, y: 230, w: 1040, h: 700 }} at={20} gap={14}
  cascade={{ at: 240, step: 22, color: colors.red }}   // lights the layers top to bottom
  layers={[{ title: "Application", detail: "HTTP, DNS", tag: "L7", icon: "code" }, …]} />
```

Each layer can set `color`, `at` and `focus` windows. Use `cascade` for a signal passing through the layers (an interrupt propagating, a packet descending the network stack). `monoTitles` gives monospace titles.
