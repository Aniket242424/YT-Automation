import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { BRAND } from "../brand";

// Punchy stat reveal: overshoots in with a glow. `danger` = red (loss/interest),
// otherwise gold. Sits in the mid band (between the card and the captions).
export const BigNumber: React.FC<{ value: string; caption?: string; danger?: boolean }> = ({
  value,
  caption,
  danger,
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 7, stiffness: 130, mass: 0.6 } });
  const scale = interpolate(enter, [0, 1], [0.3, 1]);
  const wobble = Math.sin((frame / fps) * 18) * (danger ? 3 : 0);
  const color = danger ? BRAND.colors.danger : BRAND.colors.warn;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: height * 0.5 }}>
      <div
        style={{
          transform: `scale(${scale}) translateX(${wobble}px)`,
          opacity: enter,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: BRAND.fonts.display,
            fontSize: 210,
            color,
            letterSpacing: -4,
            textShadow: `0 0 55px ${color}cc, 0 12px 40px rgba(0,0,0,0.5)`,
          }}
        >
          {value}
        </span>
        {caption ? (
          <span style={{ fontFamily: BRAND.fonts.body, fontWeight: 800, fontSize: 50, color: BRAND.colors.text, marginTop: -8 }}>
            {caption}
          </span>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
