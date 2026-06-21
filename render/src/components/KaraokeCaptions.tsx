import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import { BRAND } from "../brand";

// Word-perfect karaoke captions: Whisper gives the exact ms of every word, we page
// them TikTok-style and highlight the word that's being spoken RIGHT NOW.
export const KaraokeCaptions: React.FC<{
  captions: Caption[];
  bottomOffset?: number;
}> = ({ captions, bottomOffset = 430 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;

  const { pages } = createTikTokStyleCaptions({
    captions,
    combineTokensWithinMilliseconds: 1200, // ~3-5 words per on-screen line
  });

  const page = pages.find((p) => ms >= p.startMs && ms < p.startMs + p.durationMs);
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
        {page.tokens.map((t, i) => {
          const active = ms >= t.fromMs && ms < t.toMs;
          const enter = spring({
            frame: frame - (t.fromMs / 1000) * fps,
            fps,
            config: { damping: 13, stiffness: 200, mass: 0.4 },
          });
          const pop = active ? 1.16 : 1;
          const y = interpolate(enter, [0, 1], [22, 0]);
          return (
            <span
              key={i}
              style={{
                fontFamily: BRAND.fonts.display,
                fontSize: 82,
                lineHeight: 1.08,
                color: active ? BRAND.colors.bg : BRAND.colors.text,
                background: active ? BRAND.colors.accent : "transparent",
                padding: active ? "0 14px" : "0 2px",
                borderRadius: 14,
                transform: `translateY(${y}px) scale(${pop})`,
                textShadow: active ? "none" : "0 4px 16px rgba(0,0,0,0.6)",
                boxShadow: active ? `0 8px 28px ${BRAND.colors.accent}66` : "none",
              }}
            >
              {t.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
