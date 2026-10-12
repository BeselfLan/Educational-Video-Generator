---
name: remotion-animations
description: Make coding, computer-science, math and statistics explainer videos with Remotion in this repo, using its component library (code blocks, terminals, architecture diagrams, packets, sequence diagrams, layer stacks, captions, annotations...). Use whenever asked to create, edit, render or preview an animation or video here, to add or change a component in src/components, or to learn which component fits a visual (e.g. "animate how X works", "show this algorithm", "explain this system").
---

# Remotion animations

Remotion 4.0.535 + React 19 + TypeScript. Videos are 1920×1080 at 30 fps. Every frame is a pure function of the frame number.

## Layout

```
src/
  index.ts                    registerRoot
  Root.tsx                    every public <Composition>, grouped in <Folder>s; also loads private ones
  components/
    core/                     subject-independent: theme, timing helpers, geometry, text/layout primitives
    cs/                       code, terminals, diagrams, message flows
    math/                     (empty: add math components here)
    stats/                    (empty: add statistics components here)
  compositions/
    video.ts                  VIDEO: the shared 1920×1080 / 30 fps format
    <video>/                  one folder per public video: <Video>.tsx + scenes/*.tsx + data/snippets
    gallery/                  one preview composition per subject (CsGallery, ...), subjects.ts
                              (registry of every subject's demos) and DemoReel (plays them all)
    private/<video>/          personal or client videos: gitignored, see "Private videos" below
.claude/skills/remotion-animations/reference/
  core.md  cs.md  math.md  stats.md     props + examples for every component
```

Import by subject: `import { Scene, Title, colors } from "../../components/core"`, `import { CodeBlock } from "../../components/cs"`.

## Component index

Full props and examples are in the reference file for each subject. Read the relevant one before using a component.

| Subject | Components | Reference |
|---|---|---|
| core | `Scene`, `Title`, `Captions`, `Appear`, `Typewriter`, `Badge`, `Panel`, `BulletList`, `Annotation`, `Icon`; theme `colors` `fonts` `palette`; helpers `progress` `springIn` `fadeOut` `windowIntensity` `typedChars` `stagger` `pulse` `blink` `sec`; geometry `anchor` `grid` `row` `column` `inset` `pathBetween` | [reference/core.md](reference/core.md) |
| cs | `CodeBlock`, `Terminal`, `DiagramNode`, `Boundary`, `Connector`, `Packet`, `SequenceDiagram`, `AppWindow`, `LayerStack` | [reference/cs.md](reference/cs.md) |
| math | none yet | [reference/math.md](reference/math.md) |
| stats | none yet | [reference/stats.md](reference/stats.md) |

## Conventions every component follows

- **`at`** is the frame where the element starts to appear, relative to the enclosing `<Sequence>` (each scene starts at frame 0). **`exitAt`** starts a fade-out.
- **Highlight windows** (`active`, `highlight`, `focus`, `dim`) are `Array<[start, end)>` frame ranges with soft edges.
- **`rect: {x, y, w, h}`** places a component absolutely, in the pixel space of its container (usually the whole 1920×1080 frame). Diagram parts are wired together with `anchor(rect, "right")` instead of DOM measurement.
- **z-order is render order.** Draw `Boundary` first, then connectors, then nodes, then packets and annotations.
- **Colors have one meaning each** (see `colors` in `core/theme.ts`): `claude` = the AI, `blue` = primary, `cyan` = network or data in flight, `green` = success or allowed, `yellow` = attention or pending, `red` = danger or stop, `purple` = secondary or math emphasis.
- **Fonts:** Inter (`fonts.sans`) and JetBrains Mono (`fonts.mono`), loaded in `theme.ts` from Google Fonts at render time (needs network). Code views turn ligatures off.
- **No emoji.** The headless browser has no emoji font. Use `<Icon name=...>` or plain glyphs like ✓ → ✕.

## Remotion rules (things that silently break renders)

- Animate only with `useCurrentFrame()` and `interpolate`/`spring`. **Never** CSS transitions or animations, `setTimeout`, `Date.now()` or `Math.random()` (use `random(seed)` from remotion).
- `interpolate` throws on non-finite input ranges. `progress()` guards against `Infinity`; use it for open-ended windows.
- Always clamp (`progress`/`lerpFrames` already do).
- `useCurrentFrame()` inside a `<Sequence from={n}>` is relative to `n`. Use `<Sequence layout="none">` to swap content in place without an AbsoluteFill.
- `TransitionSeries` transitions overlap scenes: total = Σ durations − Σ transition lengths.
- SVG ids must be unique per instance. Use `React.useId()` and strip the colons.
- Static assets go in `public/` and are loaded with `staticFile("name.png")`.

## Making a video

1. **Plan** the scenes: what each one shows, its duration in frames, and caption cues. Read the source material first.
2. **One file per scene** in `compositions/<video>/scenes/`. Each exports its component and a `<NAME>_DURATION`, and keeps a timeline (`const T = {...}`) at the top when many things are timed together. Long code and payload strings go in a `snippets.ts`.
3. **Compose** the scenes in `<Video>.tsx` with `TransitionSeries` (fade, 15 frames), and export the total duration.
4. **Register** it: in `Root.tsx` under the subject's `<Folder>` for a public video, or with an `index.tsx` for a private one (next section).
5. **Check** it (see the next section), then render it.

Scene skeleton:

```tsx
export const FOO_DURATION = 420;
export const Foo: React.FC = () => (
  <Scene grid>
    <Title title="Heading" subtitle="One line of context" />
    {/* content, placed with rect / anchor() between y≈220 and y≈940 */}
    <Captions cues={[{ text: "Narration…", at: 20 }, { text: "Next point", at: 200 }]} />
  </Scene>
);
```

Safe area: the header title takes y 56–190; captions sit at the bottom (y ≈ 960–1040). Keep content between them, with an 60–80 px side margin.

## Private videos

Videos about the user's own projects, clients or anything personal are **private**: they go in `src/compositions/private/<video>/`, and their assets go in `public/private/`. Both are gitignored, as is `out/`, and they must never be committed. Don't name or describe them in committed files either: no examples, comments, docs or commit messages drawn from them. When unsure, make it private.

A private video's folder has an `index.tsx` that default-exports a component rendering its `<Composition>`s, using `VIDEO` from `compositions/video.ts`. `Root.tsx` picks these up with `require.context` and lists them under **Private** in the Studio, so `Root.tsx` itself never imports one. Scenes inside `private/<video>/scenes/` import components from `../../../../components/...`. A template is in `src/compositions/private/README.md`.

## Checking your work

Always look at rendered frames before you call something done. Layout bugs (overlaps, clipping, z-order) only show up in pixels.

```bash
npm run typecheck                                          # tsc --noEmit
npx remotion bundle src/index.ts --out-dir $SCRATCH/bundle # bundle once…
npx remotion still $SCRATCH/bundle <CompId> $SCRATCH/f120.png --frame=120 --scale=0.5 --log=error   # …then many stills (run several in parallel with &)
ffmpeg -loglevel error -i a.png -i b.png -filter_complex "[0][1]hstack" pair.png  # contact sheet; vstack=inputs=N for rows
npx remotion render src/index.ts <CompId> out/<name>.mp4 --log=error             # full render (≈ a few minutes for 2 min of video)
npm run dev                                                 # Remotion Studio (interactive preview)
```

Pick still frames at the moments that matter: just after each element enters, mid-packet, during highlights, and at the end of each scene. For a `TransitionSeries` video, scene k starts at `Σ_{i<k} (duration_i − 15)`.

## Adding a component

1. Decide the subject (`core` if it is useful to every subject). Create `components/<subject>/<Name>.tsx`. Add a new subject folder (e.g. `physics/`) with its own `index.ts` and reference file if none fits.
2. Follow the conventions above: `at`/`exitAt`, windows for highlights, a `rect` for absolute placement, theme colors as defaults with a color prop to override, everything frame-pure. Build on `core` helpers (`progress`, `springIn`, `anchor`...) instead of re-deriving them.
3. Export it, with its props type, from the subject's `index.ts`.
4. Add a demo to that subject's gallery (`compositions/gallery/`), e.g. a `{name, Component}` entry in `CS_DEMOS`. For a new subject, create `<Subject>Gallery.tsx` exporting `<SUBJECT>_DEMOS`, register the composition in `Root.tsx`, and add the subject to `SUBJECTS` in `gallery/subjects.ts`; the `DemoReel` then gives it a section card automatically.
5. Document it in `reference/<subject>.md`: purpose, props table, a minimal example, and gotchas. Add it to the index table above.
6. Typecheck, render gallery stills, and look at them.

## Lessons already learned

- **Terminal lines never wrap.** Keep them shorter than the width (about `w / (fontSize × 0.6)` characters).
- **CodeBlock fits about `(h − 62) / (fontSize × 1.55)` lines** with a title bar. For longer code, add `scroll` keyframes, and shift annotation y positions by the scrolled lines.
- A `Packet` drawn before a node passes *behind* it, and its label gets hidden. Draw packets after nodes unless that is what you want.
- A `Connector` label sits above the line by default. Put it below (`labelOffset={{x:0, y:44}}`) when packets with labels travel the same line.
- The Prism languages bundled with prism-react-renderer include tsx, typescript, javascript, rust, python, json, go, cpp, c, sql, yaml, markdown, graphql, swift and kotlin. bash is **not** included: use `Terminal` for shell, or `language="plain"`.
