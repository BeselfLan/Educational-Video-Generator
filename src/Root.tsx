// Every renderable video. Add a <Composition> per video; group them in <Folder>s by subject.
import React from "react";
import { Composition, Folder } from "remotion";
import { CsGallery, GALLERY_DURATION } from "./compositions/gallery/CsGallery";

const VIDEO = { width: 1920, height: 1080, fps: 30 } as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Gallery">
      <Composition id="CsGallery" component={CsGallery} durationInFrames={GALLERY_DURATION} {...VIDEO} />
    </Folder>
  </>
);
