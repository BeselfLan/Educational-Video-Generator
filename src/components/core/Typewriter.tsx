import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { blink, typedChars } from "./animation";
import { colors } from "./theme";

export interface TypewriterProps {
  text: string;
  at?: number;
  /** Typing speed. ~40 feels like fast human typing, 120+ like streamed model output. */
  charsPerSecond?: number;
  /** Show a cursor: "block" (terminal), "bar" (editor) or none. */
  cursor?: "block" | "bar" | false;
  /** Keep the cursor after typing finishes (blinking). */
  keepCursor?: boolean;
  cursorColor?: string;
  style?: React.CSSProperties;
}

/** Reveals text character by character. Preserves newlines (white-space: pre-wrap). */
export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  at = 0,
  charsPerSecond = 40,
  cursor = "bar",
  keepCursor = false,
  cursorColor = colors.text,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = typedChars(frame, at, charsPerSecond, fps, text.length);
  const typing = frame >= at && n < text.length;
  const showCursor = cursor && frame >= at && (typing || (keepCursor && blink(frame)));
  return (
    <span style={{ whiteSpace: "pre-wrap", ...style }}>
      {text.slice(0, n)}
      {showCursor ? (
        <span
          style={{
            display: "inline-block",
            width: cursor === "block" ? "0.6em" : "0.08em",
            height: "1.1em",
            marginLeft: cursor === "bar" ? 2 : 0,
            verticalAlign: "text-bottom",
            backgroundColor: cursorColor,
          }}
        />
      ) : null}
    </span>
  );
};
