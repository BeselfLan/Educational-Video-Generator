// Showcase of the whole component library: a title card, then every subject's gallery demos
// (each subject introduced by a section card), then a short "build your own" outro. Driven by
// SUBJECTS in ./subjects, so new subject galleries join the reel automatically.
import React from "react";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { useCurrentFrame } from "remotion";
import {
  Appear,
  Badge,
  BulletList,
  colors,
  fonts,
  Icon,
  progress,
  radii,
  Scene,
  Title,
} from "../../components/core";
import { CodeBlock, Terminal } from "../../components/cs";
import { DEMO_DURATION, SUBJECTS, type GalleryDemo, type SubjectGallery } from "./subjects";

const TRANSITION = 15;
const INTRO = 120;
const SECTION = 90;
const OUTRO = 240;

const demoCount = SUBJECTS.reduce((n, s) => n + s.demos.length, 0);

const ReelIntro: React.FC = () => (
  <Scene grid glow={colors.claude}>
    <div style={{ position: "absolute", left: 0, right: 0, top: -90, bottom: 90 }}>
      <Title variant="hero" kicker="Remotion component library" title="Demo reel" subtitle="Animated building blocks for coding, math and statistics explainers." />
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 700, display: "flex", justifyContent: "center", gap: 20 }}>
      {SUBJECTS.map((s, i) => (
        <Badge key={s.subject} at={40 + i * 6} color={s.accent} size={26}>
          <Icon name={s.icon} size={26} />
          {s.subject} · {s.demos.length} demos
        </Badge>
      ))}
    </div>
  </Scene>
);

const SectionCard: React.FC<{ gallery: SubjectGallery; part: number }> = ({ gallery, part }) => (
  <Scene grid glow={gallery.accent}>
    <Appear at={0} from="left" absolute={{ x: 160, y: 300, w: 820 }}>
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: radii.lg,
          background: `${gallery.accent}26`,
          border: `2px solid ${gallery.accent}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 36,
        }}
      >
        <Icon name={gallery.icon} size={64} color={gallery.accent} />
      </div>
      <div style={{ color: gallery.accent, fontSize: 28, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>
        Part {part} of {SUBJECTS.length}
      </div>
      <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -1, lineHeight: 1.1, marginTop: 8 }}>{gallery.title}</div>
      <div style={{ fontSize: 34, color: colors.textDim, marginTop: 20 }}>{gallery.blurb}</div>
    </Appear>
    <BulletList
      at={15}
      gap={18}
      fontSize={40}
      marker="number"
      accent={gallery.accent}
      items={gallery.demos.map((d) => ({ text: d.name }))}
      style={{ position: "absolute", left: 1120, top: 400, width: 680 }}
    />
  </Scene>
);

/** A gallery demo with a chip in the top-right corner: subject, name, and dots for its place in the section. */
const DemoFrame: React.FC<{ gallery: SubjectGallery; demo: GalleryDemo; index: number }> = ({ gallery, demo, index }) => {
  const frame = useCurrentFrame();
  const { accent, demos } = gallery;
  return (
    <>
      <demo.Component />
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 66,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "10px 18px",
          borderRadius: 999,
          background: colors.panel,
          border: `1px solid ${colors.border}`,
          opacity: progress(frame, 4, 12),
          fontFamily: fonts.sans,
        }}
      >
        <span style={{ color: accent, fontWeight: 700, fontSize: 20, letterSpacing: 2 }}>{gallery.subject}</span>
        <span style={{ color: colors.textDim, fontSize: 20 }}>{demo.name}</span>
        <div style={{ display: "flex", gap: 6 }}>
          {demos.map((_, i) => (
            <div key={i} style={{ width: i === index ? 22 : 8, height: 8, borderRadius: 4, background: i <= index ? accent : colors.border }} />
          ))}
        </div>
      </div>
    </>
  );
};

const SCENE_CODE = `export const Hello: React.FC = () => (
  <Scene grid>
    <Title title="Client → Server" />
    <DiagramNode rect={a} title="browser" at={10} />
    <DiagramNode rect={b} title="api.ts" at={20} />
    <Connector from={anchor(a, "right")}
      to={anchor(b, "left")} at={30} flow />
    <Packet from={anchor(a, "right")}
      to={anchor(b, "left")} at={50} label="GET /" />
  </Scene>
);`;

const ReelOutro: React.FC = () => (
  <Scene grid glow={colors.claude}>
    <Title title="Build your own" subtitle="Every scene is a timeline: each component takes the frame it enters at." />
    <CodeBlock
      code={SCENE_CODE}
      language="tsx"
      title="Hello.tsx"
      fontSize={24}
      rect={{ x: 80, y: 240, w: 880, h: 520 }}
      reveal={{ mode: "lines", at: 10, speed: 4 }}
      highlights={[
        { lines: [[4, 5]], at: 70, until: 110, color: colors.blue },
        { lines: [[6, 7]], at: 110, until: 150, color: colors.cyan },
        { lines: [[8, 9]], at: 150, color: colors.green },
      ]}
    />
    <Terminal
      rect={{ x: 1020, y: 240, w: 820, h: 230 }}
      fontSize={20}
      lines={[
        { kind: "cmd", text: "npm run dev", at: 30 },
        { text: "Studio running on http://localhost:3000", kind: "info", at: 58 },
        { kind: "cmd", text: "npx remotion render src/index.ts DemoReel", at: 80 },
        { text: "Rendered out/DemoReel.mp4", kind: "ok", at: 140 },
      ]}
    />
    <BulletList
      at={60}
      gap={16}
      marker="check"
      items={[
        { text: "Frame-pure", detail: "the same frame always renders the same pixels" },
        { text: "Composable", detail: `${demoCount} demos, one shared library` },
        { text: "Organized by subject", detail: "core · cs · math · stats" },
      ]}
      style={{ position: "absolute", left: 1020, top: 520, width: 820 }}
    />
  </Scene>
);

type Segment = { key: string; duration: number; node: React.ReactNode };

const SEGMENTS: Segment[] = [
  { key: "intro", duration: INTRO, node: <ReelIntro /> },
  ...SUBJECTS.flatMap((gallery, s): Segment[] => [
    { key: `${gallery.subject}-section`, duration: SECTION, node: <SectionCard gallery={gallery} part={s + 1} /> },
    ...gallery.demos.map((demo, i) => ({
      key: `${gallery.subject}-${i}`,
      duration: demo.duration ?? DEMO_DURATION,
      node: <DemoFrame gallery={gallery} demo={demo} index={i} />,
    })),
  ]),
  { key: "outro", duration: OUTRO, node: <ReelOutro /> },
];

// Transitions overlap neighbouring segments, so each one shortens the total.
export const DEMO_REEL_DURATION = SEGMENTS.reduce((n, s) => n + s.duration, 0) - TRANSITION * (SEGMENTS.length - 1);

export const DemoReel: React.FC = () => (
  <TransitionSeries>
    {SEGMENTS.map(({ key, duration, node }, i) => (
      <React.Fragment key={key}>
        {i > 0 ? <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: TRANSITION })} /> : null}
        <TransitionSeries.Sequence durationInFrames={duration}>{node}</TransitionSeries.Sequence>
      </React.Fragment>
    ))}
  </TransitionSeries>
);
