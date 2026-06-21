import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { type Caption } from "@remotion/captions";
import { BRAND } from "../brand";

const MAX_WORDS = 4; // words shown on screen at once
const MAX_PAGE_MS = 1600; // ...or break the page after this long

// Word-perfect karaoke captions: shows a small window of words and highlights the
// one being spoken RIGHT NOW (timings come from Whisper, text is the exact script).
export const KaraokeCaptions: React.FC<{
  captions: Caption[];
  bottomOffset?: number;
}> = ({ captions, bottomOffset = 440 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;

  // page into small groups (manual — don't lump everything onto one page)
  const pages: Caption[][] = [];
  let cur: Caption[] = [];
  for (const c of captions) {
    if (cur.length && (cur.length >= MAX_WORDS || c.endMs - cur[0].startMs > MAX_PAGE_MS)) {
      pages.push(cur);
      cur = [];
    }
    cur.push(c);
  }
  if (cur.length) pages.push(cur);

  // active page = the last page that has started (stays up until the next one begins)
  let page: Caption[] | null = null;
  for (const p of pages) {
    if (p[0].startMs <= ms) page = p;
    else break;
  }
  if (!page) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: bottomOffset,
        display: "flex",
        justifyContent: "center",
        padding: "0 56px",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 16px" }}>
        {page.map((t, i) => {
          const active = ms >= t.startMs && ms < t.endMs;
          const enter = spring({
            frame: frame - (t.startMs / 1000) * fps,
            fps,
            config: { damping: 13, stiffness: 200, mass: 0.4 },
          });
          const y = interpolate(enter, [0, 1], [22, 0]);
          return (
            <span
              key={i}
              style={{
                fontFamily: BRAND.fonts.display,
                fontSize: 88,
                lineHeight: 1.04,
                color: active ? BRAND.colors.bg : BRAND.colors.text,
                background: active ? BRAND.colors.accent : "transparent",
                padding: active ? "0 16px" : "0 2px",
                borderRadius: 14,
                transform: `translateY(${y}px) scale(${active ? 1.14 : 1})`,
                textShadow: active ? "none" : "0 4px 16px rgba(0,0,0,0.6)",
                boxShadow: active ? `0 8px 26px ${BRAND.colors.accent}66` : "none",
              }}
            >
              {t.text.trim()}
            </span>
          );
        })}
      </div>
    </div>
  );
};
