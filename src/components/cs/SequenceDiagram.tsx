import React from "react";
import { evolvePath } from "@remotion/paths";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { progress, springIn } from "../core/animation";
import type { Rect } from "../core/geometry";
import { Icon, type IconName } from "../core/Icon";
import { colors, fonts, palette, radii } from "../core/theme";

export interface SeqActor {
  id: string;
  label: React.ReactNode;
  sub?: React.ReactNode;
  icon?: IconName;
  color?: string;
}

export interface SeqMessage {
  from: string;
  /** Target actor. For "note", the note spans from..to. */
  to: string;
  label: React.ReactNode;
  /** Frame the arrow starts drawing. Messages must be listed in time order. */
  at: number;
  /** call: solid arrow. reply: dashed arrow. self: loop back to the same actor. note: a box over the lifelines. */
  kind?: "call" | "reply" | "self" | "note";
  /** Small monospace line under the arrow, e.g. a payload: {"id": 7, "op": "read"}. */
  detail?: React.ReactNode;
  color?: string;
}

export interface SequenceDiagramProps {
  actors: SeqActor[];
  messages: SeqMessage[];
  rect?: Rect;
  at?: number;
  rowHeight?: number;
  /** Fade older messages so the newest stands out. Default true. */
  dimPast?: boolean;
  labelSize?: number;
}

const HEADER_H = 96;

/**
 * UML-style sequence diagram: actors across the top, messages as arrows appearing over time.
 * When more messages arrive than fit, the message area scrolls up smoothly while the actor
 * headers stay put. The actors involved in the newest message glow.
 */
export const SequenceDiagram: React.FC<SequenceDiagramProps> = ({
  actors,
  messages,
  rect = { x: 80, y: 190, w: 1760, h: 760 },
  at = 0,
  rowHeight = 84,
  dimPast = true,
  labelSize = 21,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colW = rect.w / actors.length;
  const cx = (id: string) => {
    const i = actors.findIndex((a) => a.id === id);
    if (i < 0) throw new Error(`SequenceDiagram: unknown actor "${id}"`);
    return colW * (i + 0.5);
  };
  const color = (a: SeqActor, i: number) => a.color ?? palette[i % palette.length];

  const areaTop = HEADER_H + 18;
  const areaH = rect.h - areaTop;
  const capacity = Math.max(1, Math.floor(areaH / rowHeight));
  const scroll = messages.reduce((s, m, i) => (i >= capacity ? s + progress(frame, m.at - 6, 14) * rowHeight : s), 0);
  const shown = messages.filter((m) => frame >= m.at);
  const latest = shown.length - 1;
  const involved = latest >= 0 ? new Set([messages[latest].from, messages[latest].to]) : new Set<string>();

  return (
    <div style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h }}>
      {/* Actor headers */}
      {actors.map((a, i) => {
        const c = color(a, i);
        const p = springIn(frame, fps, at + i * 5);
        const hot = involved.has(a.id);
        const boxW = Math.min(300, colW - 28);
        return (
          <div
            key={a.id}
            style={{
              position: "absolute",
              left: cx(a.id) - boxW / 2,
              top: 0,
              width: boxW,
              height: HEADER_H,
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "0 16px",
              boxSizing: "border-box",
              borderRadius: radii.md,
              background: colors.panel,
              border: `2px solid ${hot ? c : `${c}77`}`,
              boxShadow: hot ? `0 0 30px ${c}66` : undefined,
              opacity: progress(frame, at + i * 5, 8),
              transform: `translateY(${(1 - p) * -20}px)`,
            }}
          >
            {a.icon ? <Icon name={a.icon} size={34} color={c} /> : null}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.1 }}>{a.label}</div>
              {a.sub ? <div style={{ fontSize: 16, color: colors.textDim, marginTop: 3 }}>{a.sub}</div> : null}
            </div>
          </div>
        );
      })}

      {/* Lifelines (static) */}
      <svg style={{ position: "absolute", left: 0, top: HEADER_H, overflow: "visible" }} width={rect.w} height={rect.h - HEADER_H}>
        {actors.map((a, i) => (
          <line
            key={a.id}
            x1={cx(a.id)}
            x2={cx(a.id)}
            y1={0}
            y2={(rect.h - HEADER_H) * progress(frame, at + 10 + i * 5, 20)}
            stroke={color(a, i)}
            strokeOpacity={0.35}
            strokeWidth={2}
            strokeDasharray="6 8"
          />
        ))}
      </svg>

      {/* Messages (scrolling) */}
      <div style={{ position: "absolute", left: 0, top: areaTop, width: rect.w, height: areaH, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${-scroll}px)` }}>
          {messages.map((m, i) => {
            if (frame < m.at) return null;
            const y = rowHeight * (i + 0.55);
            const fromI = actors.findIndex((a) => a.id === m.from);
            const c = m.color ?? color(actors[fromI], fromI);
            const draw = progress(frame, m.at, 14);
            const fade = dimPast && i < latest ? 0.5 : 1;
            const x1 = cx(m.from);
            const x2 = cx(m.to);

            if (m.kind === "note") {
              const left = Math.min(x1, x2) - colW * 0.4;
              const right = Math.max(x1, x2) + colW * 0.4;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left,
                    width: right - left,
                    top: y - rowHeight * 0.38,
                    height: rowHeight * 0.76,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    borderRadius: radii.sm,
                    background: `${c}22`,
                    border: `2px dashed ${c}`,
                    fontSize: labelSize,
                    fontWeight: 600,
                    opacity: draw * fade,
                  }}
                >
                  {m.label}
                  {m.detail ? <span style={{ fontFamily: fonts.mono, fontSize: labelSize * 0.82, color: colors.textDim }}>{m.detail}</span> : null}
                </div>
              );
            }

            const self = m.kind === "self" || m.from === m.to;
            const loopW = 70;
            const d = self
              ? `M ${x1} ${y - 14} L ${x1 + loopW} ${y - 14} L ${x1 + loopW} ${y + 14} L ${x1 + 6} ${y + 14}`
              : `M ${x1} ${y} L ${x2} ${y}`;
            const ev = evolvePath(draw, d);
            const dir = self ? -1 : Math.sign(x2 - x1);
            const tipX = self ? x1 + 6 : x1 + (x2 - x1) * draw;
            const tipY = self ? y + 14 : y;
            const midX = self ? x1 + loopW + 16 : (x1 + x2) / 2;
            return (
              <div key={i} style={{ position: "absolute", inset: 0, opacity: fade }}>
                <svg style={{ position: "absolute", inset: 0, overflow: "visible" }} width={rect.w} height={rowHeight * messages.length}>
                  <path
                    d={d}
                    fill="none"
                    stroke={c}
                    strokeWidth={3}
                    strokeLinejoin="round"
                    strokeDasharray={m.kind === "reply" ? undefined : ev.strokeDasharray}
                    strokeDashoffset={m.kind === "reply" ? undefined : ev.strokeDashoffset}
                    style={m.kind === "reply" ? { strokeDasharray: "9 7", clipPath: dir > 0 ? `inset(0 ${(1 - draw) * 100}% 0 0)` : `inset(0 0 0 ${(1 - draw) * 100}%)` } : undefined}
                  />
                  {draw > 0.9 || !self ? (
                    <path d={`M 0 0 L -15 -8 L -15 8 Z`} fill={c} transform={`translate(${tipX} ${tipY}) scale(${dir}, 1)`} opacity={self ? progress(frame, m.at + 12, 4) : 1} />
                  ) : null}
                </svg>
                <div
                  style={{
                    position: "absolute",
                    left: midX,
                    top: self ? y : y - 8,
                    transform: self ? "translate(0, -50%)" : "translate(-50%, -100%)",
                    textAlign: self ? "left" : "center",
                    whiteSpace: "nowrap",
                    fontSize: labelSize,
                    fontWeight: 600,
                    color: colors.text,
                    opacity: progress(frame, m.at + 6, 8),
                  }}
                >
                  {m.label}
                  {self && m.detail ? <div style={{ fontFamily: fonts.mono, fontSize: labelSize * 0.78, color: c, fontWeight: 500 }}>{m.detail}</div> : null}
                </div>
                {!self && m.detail ? (
                  <div
                    style={{
                      position: "absolute",
                      left: midX,
                      top: y + 8,
                      transform: "translateX(-50%)",
                      whiteSpace: "nowrap",
                      fontFamily: fonts.mono,
                      fontSize: labelSize * 0.78,
                      color: c,
                      opacity: progress(frame, m.at + 8, 8),
                    }}
                  >
                    {m.detail}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
