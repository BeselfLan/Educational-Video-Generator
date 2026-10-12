import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { blink, progress, springIn, typedChars, typingDuration } from "../core/animation";
import type { Rect } from "../core/geometry";
import { colors, fonts, radii } from "../core/theme";

export type TermLineKind = "cmd" | "out" | "err" | "ok" | "info" | "dim";

export interface TermLine {
  text: string;
  /** Frame the line starts (typing for cmd, appearing for output). */
  at: number;
  /** "cmd" lines get the prompt and are typed; everything else appears at once. Default "out". */
  kind?: TermLineKind;
  /** Override the terminal's prompt for this command line. */
  prompt?: string;
  /** Typing speed for cmd lines, characters per second. Default 35. */
  cps?: number;
}

export interface TerminalProps {
  lines: TermLine[];
  rect?: Rect;
  title?: string;
  /** Prompt shown before cmd lines, e.g. "$ " or "C:\\> ". */
  prompt?: string;
  fontSize?: number;
  at?: number;
  accent?: string;
  /** Hide the title bar (e.g. when the terminal lives inside a Panel). */
  bare?: boolean;
  style?: React.CSSProperties;
}

const KIND_COLOR: Record<TermLineKind, string> = {
  cmd: colors.text,
  out: "#c9d1e0",
  err: colors.red,
  ok: colors.green,
  info: colors.cyan,
  dim: colors.textFaint,
};

/**
 * A shell session. Commands are typed after the prompt; output lines pop in. Multi-line `text`
 * is split into rows. Lines do not wrap: keep them shorter than the width. When the content
 * outgrows the height it scrolls smoothly, keeping the newest line at the bottom.
 */
export const Terminal: React.FC<TerminalProps> = ({
  lines,
  rect,
  title = "terminal",
  prompt = "$ ",
  fontSize = 22,
  at,
  accent = colors.green,
  bare = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lineH = Math.round(fontSize * 1.5);

  // Expand multi-line output into rows.
  const rows = lines.flatMap((l) =>
    l.kind === "cmd" ? [{ ...l, kind: "cmd" as const }] : l.text.split("\n").map((t) => ({ ...l, text: t, kind: l.kind ?? "out" })),
  );
  const shown = rows.filter((r) => frame >= r.at);
  const lastCmd = [...shown].reverse().find((r) => r.kind === "cmd");

  const headerH = bare ? 0 : 46;
  const capacity = rect ? Math.max(1, Math.floor((rect.h - headerH - 32) / lineH)) : Infinity;
  // Smooth scroll: each row that appears beyond capacity pushes the content up by one row.
  const smoothCount = rows.reduce((s, r) => s + progress(frame, r.at, 6), 0);
  const scrollRows = Math.max(0, smoothCount - capacity);

  const enter = at === undefined ? 1 : springIn(frame, fps, at, { damping: 18 });
  const pos: React.CSSProperties = rect ? { position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h } : {};

  return (
    <div
      style={{
        ...pos,
        display: "flex",
        flexDirection: "column",
        background: "#080b11",
        border: bare ? undefined : `2px solid ${colors.border}`,
        borderRadius: bare ? 0 : radii.md,
        overflow: "hidden",
        boxShadow: bare ? undefined : "0 18px 50px rgba(0,0,0,0.45)",
        opacity: at === undefined ? 1 : progress(frame, at, 10),
        transform: `translateY(${(1 - enter) * 30}px)`,
        ...style,
      }}
    >
      {bare ? null : (
        <div style={{ display: "flex", alignItems: "center", gap: 10, height: headerH, padding: "0 18px", background: colors.panelHi, borderBottom: `2px solid ${colors.border}` }}>
          <span style={{ width: 12, height: 12, borderRadius: 6, background: accent }} />
          <span style={{ fontFamily: fonts.mono, fontSize: 18, color: colors.textDim }}>{title}</span>
        </div>
      )}
      {/* Padding sits outside the clipping box so scrolled-out rows never peek into it. */}
      <div style={{ flex: 1, padding: "14px 20px", minHeight: 0, display: "flex" }}>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ transform: `translateY(${-scrollRows * lineH}px)`, fontFamily: fonts.mono, fontSize, lineHeight: `${lineH}px`, fontVariantLigatures: "none" }}>
            {shown.map((r, i) => {
              if (r.kind === "cmd") {
                const n = typedChars(frame, r.at, r.cps ?? 35, fps, r.text.length);
                const isLast = r === lastCmd;
                const typing = n < r.text.length;
                // The cursor sits on the latest command while it types and until output arrives.
                const outputAfter = shown.some((o) => o.at > r.at && o.kind !== "cmd");
                const cursor = isLast && (typing || (!outputAfter && blink(frame)));
                return (
                  <div key={i} style={{ whiteSpace: "pre", height: lineH }}>
                    <span style={{ color: accent, fontWeight: 700 }}>{r.prompt ?? prompt}</span>
                    <span style={{ color: KIND_COLOR.cmd }}>{r.text.slice(0, n)}</span>
                    {cursor ? <span style={{ display: "inline-block", width: fontSize * 0.6, height: fontSize * 1.1, verticalAlign: "middle", background: colors.text }} /> : null}
                  </div>
                );
              }
              return (
                <div key={i} style={{ whiteSpace: "pre", height: lineH, color: KIND_COLOR[r.kind], opacity: progress(frame, r.at, 5) }}>
                  {r.text || " "}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/** Frame at which a command typed at `at` finishes: schedule its output from here. */
export const commandEnd = (line: Pick<TermLine, "text" | "at" | "cps">, fps: number) => line.at + typingDuration(line.text, line.cps ?? 35, fps);
