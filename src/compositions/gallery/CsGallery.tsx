// Preview of every CS component, one short segment each. Open it in the Studio
// (`npm run dev`) or render stills to check a component after changing it.
import React from "react";
import { Series } from "remotion";
import { anchor, Annotation, Badge, BulletList, Captions, colors, Scene, Title, type Rect } from "../../components/core";
import {
  AppWindow,
  Boundary,
  CodeBlock,
  Connector,
  DiagramNode,
  LayerStack,
  Packet,
  SequenceDiagram,
  Terminal,
} from "../../components/cs";

export const GALLERY_SEGMENT = 150;

const CODE = `def binary_search(xs, target):
    lo, hi = 0, len(xs) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if xs[mid] == target:
            return mid
        if xs[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`;

const CodeDemo = () => (
  <Scene grid>
    <Title title="CodeBlock" subtitle="line reveal, timed highlights with dimming" />
    <CodeBlock
      code={CODE}
      language="python"
      title="search.py"
      rect={{ x: 80, y: 230, w: 900, h: 600 }}
      reveal={{ mode: "lines", at: 5 }}
      highlights={[
        { lines: [4], at: 60, until: 100, color: colors.blue },
        { lines: [[7, 10]], at: 100 },
      ]}
    />
    <CodeBlock code={`fn main() {\n    println!("typed!");\n}`} language="rust" title="main.rs" rect={{ x: 1040, y: 230, w: 800, h: 260 }} reveal={{ mode: "type", at: 10, speed: 30 }} />
    <Annotation target={{ x: 700, y: 410 }} label={{ x: 1040, y: 640 }} text="Annotation: leader line + label" at={70} />
  </Scene>
);

const TerminalDemo = () => (
  <Scene grid>
    <Title title="Terminal + Captions + Badge" />
    <Terminal
      rect={{ x: 80, y: 220, w: 1000, h: 380 }}
      title="bash"
      lines={[
        { kind: "cmd", text: "npm test", at: 5 },
        { text: "PASS search.test.ts\nPASS sort.test.ts", at: 40, kind: "ok" },
        { text: "Tests: 18 passed", at: 55, kind: "info" },
        { kind: "cmd", text: "ls -la", at: 70 },
        { text: "a\nb\nc\nd\ne\nf", at: 95 },
      ]}
    />
    <div style={{ position: "absolute", left: 1140, top: 240, display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
      <Badge at={10}>soft badge</Badge>
      <Badge at={20} variant="solid" color={colors.green}>
        solid
      </Badge>
      <Badge at={30} variant="outline" color={colors.red} mono>
        outline mono
      </Badge>
    </div>
    <BulletList at={30} style={{ position: "absolute", left: 1140, top: 450, width: 700 }} items={[{ text: "BulletList item one" }, { text: "Second item", detail: "with detail", focus: [[90, 140]] }]} />
    <Captions cues={[{ text: "Captions: one narration cue at a time", at: 10 }, { text: "…cross-fading to the next", at: 80 }]} />
  </Scene>
);

const DiagramDemo = () => {
  const a: Rect = { x: 220, y: 380, w: 360, h: 110 };
  const b: Rect = { x: 1300, y: 380, w: 360, h: 110 };
  const c: Rect = { x: 760, y: 680, w: 360, h: 110 };
  return (
    <Scene grid>
      <Title title="Boundary · DiagramNode · Connector · Packet" />
      <Boundary rect={{ x: 140, y: 300, w: 520, h: 270 }} label="Client" icon="monitor" accent={colors.blue} at={0} />
      <DiagramNode rect={a} title="browser" subtitle="sends requests" icon="monitor" accent={colors.blue} at={10} active={[[60, 100]]} />
      <DiagramNode rect={b} title="api.ts" mono subtitle="handles them" icon="server" accent={colors.claude} at={18} active={[[90, 130]]} />
      <DiagramNode rect={c} title="Database" icon="database" accent={colors.green} at={26} variant="ghost" />
      <Connector from={anchor(a, "right")} to={anchor(b, "left")} at={30} label="HTTPS" color={colors.cyan} flow />
      <Connector from={anchor(b, "bottom")} to={anchor(c, "top")} shape="elbow-v" at={40} color={colors.green} dashed label="SQL" labelPos={0.75} />
      <Packet from={anchor(a, "right")} to={anchor(b, "left")} at={60} label="GET /" />
      <Packet from={anchor(a, "right")} to={anchor(b, "left")} at={100} reverse color={colors.green} label="200 OK" />
    </Scene>
  );
};

const SequenceDemo = () => (
  <Scene grid>
    <Title title="SequenceDiagram" subtitle="scrolls when messages overflow" />
    <SequenceDiagram
      rect={{ x: 80, y: 220, w: 1760, h: 520 }}
      actors={[
        { id: "c", label: "Client", icon: "user" },
        { id: "s", label: "Server", icon: "server", sub: "api.ts" },
        { id: "d", label: "DB", icon: "database" },
      ]}
      messages={[
        { from: "c", to: "s", label: "GET /users", at: 15, detail: "Accept: json" },
        { from: "s", to: "s", label: "auth check", at: 35, kind: "self", detail: "jwt.verify()" },
        { from: "s", to: "d", label: "SELECT *", at: 55 },
        { from: "d", to: "s", label: "rows", at: 75, kind: "reply" },
        { from: "c", to: "d", label: "note spanning actors", at: 95, kind: "note" },
        { from: "s", to: "c", label: "200 OK", at: 115, kind: "reply" },
      ]}
    />
  </Scene>
);

const WindowDemo = () => (
  <Scene grid>
    <Title title="AppWindow · LayerStack" />
    <AppWindow rect={{ x: 80, y: 220, w: 800, h: 520 }} title="Notepad" icon="file" at={5}>
      <div style={{ padding: 24, fontSize: 26 }}>Window client area</div>
    </AppWindow>
    <LayerStack
      rect={{ x: 960, y: 220, w: 880, h: 560 }}
      at={10}
      cascade={{ at: 80, step: 10, color: colors.red }}
      layers={[
        { title: "Application", detail: "HTTP, SSH", tag: "L7", icon: "code" },
        { title: "Transport", detail: "TCP, UDP", tag: "L4" },
        { title: "Network", detail: "IP", tag: "L3" },
        { title: "Link", detail: "Ethernet, Wi-Fi", tag: "L2", focus: [[40, 70]] },
      ]}
    />
  </Scene>
);

const DEMOS = [CodeDemo, TerminalDemo, DiagramDemo, SequenceDemo, WindowDemo];
export const GALLERY_DURATION = DEMOS.length * GALLERY_SEGMENT;

export const CsGallery: React.FC = () => (
  <Series>
    {DEMOS.map((Demo, i) => (
      <Series.Sequence key={i} durationInFrames={GALLERY_SEGMENT}>
        <Demo />
      </Series.Sequence>
    ))}
  </Series>
);
