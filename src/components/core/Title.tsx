import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { fadeOut, progress, springIn } from "./animation";
import { colors, fontSizes } from "./theme";

export interface TitleProps {
  title: string;
  subtitle?: string;
  /** Small uppercase label above the title, e.g. "Part 2". */
  kicker?: string;
  at?: number;
  exitAt?: number;
  /** "hero" is centered and huge (title cards); "header" sits top-left (scene headings). */
  variant?: "hero" | "header";
  accent?: string;
}

/** Scene heading or title card with staggered kicker / title / subtitle entrance. */
export const Title: React.FC<TitleProps> = ({ title, subtitle, kicker, at = 0, exitAt, variant = "header", accent = colors.claude }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hero = variant === "hero";
  const out = fadeOut(frame, exitAt);
  const part = (delay: number) => {
    const p = springIn(frame, fps, at + delay);
    return { opacity: progress(frame, at + delay, 10) * out, transform: `translateY(${(1 - p) * 24}px)` };
  };
  const bar = progress(frame, at + 4, 20);

  return (
    <div
      style={{
        position: "absolute",
        ...(hero
          ? { inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }
          : { left: 80, top: 56, right: 80 }),
      }}
    >
      {kicker ? (
        <div style={{ ...part(0), color: accent, fontSize: hero ? 30 : 22, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", marginBottom: 12 }}>
          {kicker}
        </div>
      ) : null}
      <div style={{ ...part(3), fontSize: hero ? fontSizes.h1 : fontSizes.h2, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1 }}>{title}</div>
      <div
        style={{
          height: 5,
          width: (hero ? 220 : 120) * bar,
          background: accent,
          borderRadius: 3,
          margin: hero ? "24px auto" : "16px 0 0",
          opacity: out,
        }}
      />
      {subtitle ? (
        <div style={{ ...part(8), fontSize: hero ? 38 : fontSizes.body, color: colors.textDim, marginTop: hero ? 0 : 14, maxWidth: hero ? 1400 : undefined }}>
          {subtitle}
        </div>
      ) : null}
    </div>
  );
};
