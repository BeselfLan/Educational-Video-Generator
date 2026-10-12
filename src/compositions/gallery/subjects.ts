// Registry of every subject's gallery demos. The DemoReel plays them all in order, so a new
// subject gallery (math, stats, ...) only needs an entry here to appear in the reel.
import type React from "react";
import { colors, type IconName } from "../../components/core";
import { CS_DEMOS } from "./CsGallery";

export interface GalleryDemo {
  /** Short name, shown on the subject's section card and the demo's progress chip. */
  name: string;
  Component: React.FC;
  /** Frames; defaults to DEMO_DURATION. */
  duration?: number;
}

export interface SubjectGallery {
  /** Short label for chips and badges, e.g. "CS". */
  subject: string;
  title: string;
  blurb: string;
  accent: string;
  icon: IconName;
  demos: GalleryDemo[];
}

export const DEMO_DURATION = 150;

export const SUBJECTS: SubjectGallery[] = [
  {
    subject: "CS",
    title: "Computer science",
    blurb: "Code, terminals, architecture diagrams and message flows.",
    accent: colors.blue,
    icon: "code",
    demos: CS_DEMOS,
  },
];
