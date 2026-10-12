# stats components

`src/components/stats/`: **none yet.** Export new components from `src/components/stats/index.ts`, and document each one here in the same format as [cs.md](cs.md): purpose, props table, a minimal example and gotchas. Add a `StatsGallery` composition in `src/compositions/gallery/` the first time you add one, and add the subject to `SUBJECTS` in `gallery/subjects.ts` so the `DemoReel` plays its demos.

## Planned components, and how to build them

Reuse the math `Axes` coordinate mapping once it exists, rather than building a second one. Data must be deterministic: use `random("seed-i")` from `remotion`, never `Math.random()`.

| Component | Notes |
|---|---|
| `Histogram` | Bars grow with a staggered `springIn`. Animating bin counts as samples arrive shows the law of large numbers well. |
| `DistributionCurve` | Normal, binomial and so on: `FunctionPlot` with shaded areas (an SVG path closed to the x-axis) for probabilities and p-values. |
| `ScatterPlot` | Points pop in with a stagger. An optional regression line draws in with `evolvePath`, and residuals appear as vertical segments. |
| `SamplingAnimation` | Balls drawn from a population into a sample, feeding a `Histogram` of sample means (central limit theorem). |
| `BoxPlot` | Quartile, whisker and outlier marks, built up in that order. |
| `StatTile` | A big number with a label, counting up (`Math.round(progress × value)`). |

Read the `dataviz` skill before choosing chart colors or forms. Keep series colors from `palette`, in order.
