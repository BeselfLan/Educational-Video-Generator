# math components

`src/components/math/`: **none yet.** Export new components from `src/components/math/index.ts`, and document each one here in the same format as [cs.md](cs.md): purpose, props table, a minimal example and gotchas. Add a `MathGallery` composition in `src/compositions/gallery/` the first time you add one, and add the subject to `SUBJECTS` in `gallery/subjects.ts` so the `DemoReel` plays its demos.

## Planned components, and how to build them

Build on `core`: `progress`/`springIn` for timing, `colors.purple` for math emphasis, and `palette` for multiple series.

| Component | Notes |
|---|---|
| `Axes` / `CoordinatePlane` | Owns the mapping from math coordinates to pixels: `{xRange, yRange, rect}` → `toPx({x, y})`. Export the mapping (e.g. a `useAxes()` hook or a `makeScale()` helper) so plots, points and vectors share it, and so stats plots can reuse it. Ticks and grid lines draw in with `progress`. |
| `FunctionPlot` | Sample `f` over `xRange` into an SVG path, then draw it with `evolvePath` from `@remotion/paths`. Support `morphTo` with `interpolatePath`. |
| `Equation` | Needs `katex` (not installed): `npm i katex`, render with `katex.renderToString` into `dangerouslySetInnerHTML`, and import `katex/dist/katex.min.css`. For step-by-step derivations, reveal terms by wrapping them in `\htmlClass{t1}{…}` (needs `trust: true`) and fading by class. |
| `Vector` / `Point` / `Label` | Placed in axis coordinates through the shared mapping. |
| `Matrix` | A grid of cells with `highlight` windows per row, column or cell. Good for matrix multiplication walk-throughs. |
| `NumberLine` | A 1-D version of `Axes`. |

The `latin` subset of Inter has no math glyphs beyond the basics. Use KaTeX (its own fonts) for real notation. Latin Modern Math is installed on this machine, but it is not loaded in the browser unless you add an `@font-face`.
