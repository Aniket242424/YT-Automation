import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { BRAND } from "../brand";
import { chunkCaptions } from "../lib/timing";

// Word-by-word animated captions synced (evenly) to the audio duration.
export const Captions: React.FC<{
  script: string;
  audioDurationInSeconds: number;
  wordsPerChunk?: number;
  bottomOffset?: number;
}> = ({ script, audioDurationInSeconds, wordsPerChunk = 3, bottomOffset = 360 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const chunks = chunkCaptions(script, audioDurationInSeconds, wordsPerChunk);
  const active = chunks.find((c) => t >= c.startInSeconds && t < c.endInSeconds);
  if (!active) return null;

  const localStartFrame = active.startInSeconds * fps;
  const pop = spring({
    frame: frame - localStartFrame,
    fps,
    config: { damping: 14, stiffness: 180, mass: 0.5 },
  });
  const scale = interpolate(pop, [0, 1], [0.86, 1]);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: bottomOffset,
        display: "flex",
        justifyContent: "center",
        padding: "0 70px",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          background: "rgba(8,12,22,0.78)",
          borderRadius: 22,
          padding: "18px 30px",
          maxWidth: "92%",
        }}
      >
        <span
          style={{
            fontFamily: BRAND.fonts.display,
            fontWeight: 800,
            fontSize: 72,
            lineHeight: 1.12,
            color: BRAND.colors.text,
            textAlign: "center",
            display: "block",
            textShadow: "0 4px 18px rgba(0,0,0,0.55)",
          }}
        >
          {active.text}
        </span>
      </div>
    </div>
  );
};
