// Every renderable video. Add a <Composition> per video; group them in <Folder>s by subject.
import React from "react";
import { Composition, Folder } from "remotion";
import { CsGallery, GALLERY_DURATION } from "./compositions/gallery/CsGallery";
import { DEMO_REEL_DURATION, DemoReel } from "./compositions/gallery/DemoReel";
import { VIDEO } from "./compositions/video";

// Personal and client videos live in src/compositions/private/<name>/index.tsx, which is gitignored.
// Each default-exports a component rendering its <Composition>s; they show up here when present.
const privateContext = require.context("./compositions/private", true, /^\.\/[^/]+\/index\.tsx$/);
const PRIVATE = privateContext.keys().map((key) => privateContext<{ default: React.FC }>(key).default);

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Gallery">
      <Composition id="DemoReel" component={DemoReel} durationInFrames={DEMO_REEL_DURATION} {...VIDEO} />
      <Composition id="CsGallery" component={CsGallery} durationInFrames={GALLERY_DURATION} {...VIDEO} />
    </Folder>
    {PRIVATE.length > 0 ? (
      <Folder name="Private">
        {PRIVATE.map((Compositions, i) => (
          <Compositions key={i} />
        ))}
      </Folder>
    ) : null}
  </>
);
