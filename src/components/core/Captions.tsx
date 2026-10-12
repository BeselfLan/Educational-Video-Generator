import React from "react";
import { useCurrentFrame } from "remotion";
import { progress } from "./animation";
import { colors, fontSizes } from "./theme";

export interface Cue {
  text: React.ReactNode;
  /** Frame the cue appears. It stays until the next cue's `at`, or until `until`. */
  at: number;
  until?: number;
}

export interface CaptionsProps {
  cues: Cue[];
  /** Distance from the bottom edge. */
  bottom?: number;
  maxWidth?: number;
  accent?: string;
}

/**
 * Narration lower-third. One cue is shown at a time and cross-fades to the next.
 * Use it to explain what the viewer is looking at; keep cues under ~15 words.
 */
export const Captions: React.FC<CaptionsProps> = ({ cues, bottom = 48, maxWidth = 1500, accent = colors.claude }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {cues.map((cue, i) => {
        const end = cue.until ?? cues[i + 1]?.at ?? Infinity;
        if (frame < cue.at || frame >= end + 8) return null;
        const opacity = progress(frame, cue.at, 8) * (1 - progress(frame, end, 8));
        const y = (1 - progress(frame, cue.at, 12)) * 16;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              bottom,
              transform: `translate(-50%, ${y}px)`,
              opacity,
              maxWidth,
              width: "max-content",
              padding: "14px 28px",
              borderRadius: 14,
              background: "rgba(10, 14, 22, 0.88)",
              borderLeft: `5px solid ${accent}`,
              fontSize: fontSizes.caption,
              lineHeight: 1.35,
              color: colors.text,
              textAlign: "center",
            }}
          >
            {cue.text}
          </div>
        );
      })}
    </>
  );
};
