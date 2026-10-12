import React from "react";
import { Highlight, themes, type Language, type PrismTheme } from "prism-react-renderer";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { blink, progress, springIn, typedChars, windowIntensity } from "../core/animation";
import type { Rect } from "../core/geometry";
import { colors, fonts, radii } from "../core/theme";

/** 1-based line numbers; a tuple is an inclusive range. */
export type LineSpec = Array<number | [number, number]>;

export interface CodeHighlight {
  lines: LineSpec;
  at: number;
  /** Frame the highlight ends. Default: stays. */
  until?: number;
  color?: string;
  /** Dim every other line while this highlight is active. Default true. */
  dimOthers?: boolean;
}

export interface CodeReveal {
  /** "lines": lines slide in one by one; "type": characters are typed. */
  mode: "lines" | "type";
  at?: number;
  /** lines mode: frames between lines (default 3). type mode: characters per second (default 60). */
  speed?: number;
}

export interface CodeScroll {
  at: number;
  /** 1-based line that should be at the top of the viewport. */
  line: number;
}

export interface CodeBlockProps {
  code: string;
  /** Any Prism language bundled with prism-react-renderer: tsx, typescript, rust, python, json, cpp, go, sql, yaml... */
  language: Language | string;
  /** File name in the title bar. Omit for no title bar. */
  title?: string;
  rect?: Rect;
  fontSize?: number;
  lineNumbers?: boolean;
  /** First line number to display (when showing an excerpt). */
  startLine?: number;
  reveal?: CodeReveal;
  highlights?: CodeHighlight[];
  /** Camera moves for code longer than the viewport. Keyframes are eased between. */
  scroll?: CodeScroll[];
  at?: number;
  theme?: PrismTheme;
  style?: React.CSSProperties;
}

const inSpec = (spec: LineSpec, n: number) => spec.some((s) => (typeof s === "number" ? s === n : n >= s[0] && n <= s[1]));

/**
 * Syntax-highlighted code with line reveal or typing, timed line highlights (with dimming),
 * and scrolling. Line numbers in `highlights` and `scroll` are 1-based positions in `code`,
 * independent of `startLine`.
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  title,
  rect,
  fontSize = 24,
  lineNumbers = true,
  startLine = 1,
  reveal,
  highlights = [],
  scroll = [],
  at,
  theme = themes.vsDark,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lineH = Math.round(fontSize * 1.55);
  const text = code.replace(/\n$/, "");
  const lines = text.split("\n");

  // Typing: the number of characters (newlines included) visible so far.
  const revealAt = reveal?.at ?? 0;
  const typed = reveal?.mode === "type" ? typedChars(frame, revealAt, reveal.speed ?? 60, fps, text.length) : Infinity;
  const lineStart: number[] = [];
  lines.reduce((acc, l, i) => ((lineStart[i] = acc), acc + l.length + 1), 0);

  // Highlights: per-line intensity, and how much to dim lines outside every active highlight.
  const active = highlights.map((h) => windowIntensity(frame, [[h.at, h.until ?? Infinity]]));
  const dimLevel = Math.max(0, ...highlights.map((h, i) => ((h.dimOthers ?? true) ? active[i] : 0)));

  // Scroll: piecewise ease between keyframes.
  let scrollLine = 0;
  for (const k of scroll) {
    scrollLine = interpolate(frame, [k.at, k.at + 20], [scrollLine, k.line - 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    });
    if (frame < k.at) break;
  }

  const enter = at === undefined ? 1 : springIn(frame, fps, at, { damping: 18 });
  const pos: React.CSSProperties = rect ? { position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h } : {};
  const gutter = lineNumbers ? String(startLine + lines.length - 1).length * fontSize * 0.62 + 24 : 0;

  return (
    <div
      style={{
        ...pos,
        display: "flex",
        flexDirection: "column",
        background: "#0f141f",
        border: `2px solid ${colors.border}`,
        borderRadius: radii.md,
        overflow: "hidden",
        boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
        opacity: at === undefined ? 1 : progress(frame, at, 10),
        transform: `translateY(${(1 - enter) * 30}px)`,
        ...style,
      }}
    >
      {title ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", background: colors.panelHi, borderBottom: `2px solid ${colors.border}` }}>
          {[colors.red, colors.yellow, colors.green].map((c) => (
            <span key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c, opacity: 0.85 }} />
          ))}
          <span style={{ marginLeft: 12, fontFamily: fonts.mono, fontSize: 19, color: colors.textDim }}>{title}</span>
        </div>
      ) : null}
      <div style={{ flex: 1, overflow: "hidden", position: "relative", padding: "16px 0" }}>
        <Highlight code={text} language={language as Language} theme={theme}>
          {({ tokens, getTokenProps }) => (
            <div style={{ transform: `translateY(${-scrollLine * lineH}px)`, fontFamily: fonts.mono, fontSize, lineHeight: `${lineH}px` }}>
              {tokens.map((lineTokens, i) => {
                const n = i + 1;
                const lineVisibleChars = typed - lineStart[i];
                if (reveal?.mode === "type" && lineVisibleChars < 0) return <div key={i} style={{ height: lineH }} />;

                const lineIn = reveal?.mode === "lines" ? progress(frame, revealAt + i * (reveal.speed ?? 3), 10) : 1;
                let hl = 0;
                let hlColor: string = colors.yellow;
                highlights.forEach((h, j) => {
                  if (inSpec(h.lines, n) && active[j] > hl) {
                    hl = active[j];
                    hlColor = h.color ?? colors.yellow;
                  }
                });
                const opacity = lineIn * (1 - 0.65 * dimLevel * (1 - hl));

                // Typing: cut tokens off at the visible character count.
                let budget = reveal?.mode === "type" ? lineVisibleChars : Infinity;
                const isCursorLine = reveal?.mode === "type" && budget >= 0 && budget <= lines[i].length && typed < text.length;
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      height: lineH,
                      opacity,
                      transform: `translateX(${(1 - lineIn) * 24}px)`,
                      background: hl > 0 ? `${hlColor}${Math.round(hl * 0x2a).toString(16).padStart(2, "0")}` : undefined,
                      boxShadow: hl > 0 ? `inset 5px 0 0 ${hlColor}` : undefined,
                    }}
                  >
                    {lineNumbers ? (
                      <span style={{ width: gutter, paddingRight: 16, textAlign: "right", color: colors.textFaint, flexShrink: 0 }}>{startLine + i}</span>
                    ) : (
                      <span style={{ width: 20 }} />
                    )}
                    <span style={{ whiteSpace: "pre" }}>
                      {lineTokens.map((token, k) => {
                        if (budget <= 0) return null;
                        const props = getTokenProps({ token });
                        const content = token.content.slice(0, budget);
                        budget -= token.content.length;
                        return <span key={k} {...props} children={content} />;
                      })}
                      {isCursorLine && blink(frame, 20) ? (
                        <span style={{ display: "inline-block", width: 3, height: fontSize * 1.1, background: colors.text, verticalAlign: "middle" }} />
                      ) : null}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Highlight>
      </div>
    </div>
  );
};
