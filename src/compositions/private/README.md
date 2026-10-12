# Private compositions

Everything in this folder except this README is gitignored. Put videos about personal or client
projects here, so they can be rendered locally but never get committed.

Each video gets its own folder with an `index.tsx` that default-exports a component rendering its
`<Composition>`s. `src/Root.tsx` finds these automatically and lists them under **Private** in the Studio:

```tsx
// src/compositions/private/my-project/index.tsx
import React from "react";
import { Composition } from "remotion";
import { VIDEO } from "../../video";
import { MyExplainer, MY_DURATION } from "./MyExplainer";

const Compositions: React.FC = () => (
  <Composition id="MyProject" component={MyExplainer} durationInFrames={MY_DURATION} {...VIDEO} />
);
export default Compositions;
```

Components imported from here are four levels deep: `../../../../components/core` from a `scenes/`
subfolder. Private assets go in `public/private/`, which is gitignored too, and are loaded with
`staticFile("private/...")`. Rendered videos go in `out/`, which is also ignored.
