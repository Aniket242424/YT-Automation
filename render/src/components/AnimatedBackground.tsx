import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { BRAND } from "../brand";

// Never-static background: deep navy with money-green + gold blobs that drift and
// pulse, a slow Ken-Burns zoom, and a vignette so captions stay readable.
export const AnimatedBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const b1x = 32 + Math.sin(t * 0.55) * 20;
  const b1y = 24 + Math.cos(t * 0.42) * 16;
  const b2x = 70 + Math.cos(t * 0.48) * 18;
  const b2y = 74 + Math.sin(t * 0.6) * 16;
  const pulse = 1 + Math.sin(t * 1.4) * 0.06;
  const zoom = 1.05 + interpolate(frame % 600, [0, 600], [0, 0.07]);

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.colors.bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(${48 * pulse}% ${40 * pulse}% at ${b1x}% ${b1y}%, ${BRAND.colors.accent}66, transparent 68%)`, filter: "blur(70px)" }} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(44% 34% at ${b2x}% ${b2y}%, ${BRAND.colors.warn}3a, transparent 68%)`, filter: "blur(80px)" }} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(42% 30% at 50% 108%, ${BRAND.colors.accentSoft}30, transparent 70%)`, filter: "blur(70px)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(125% 85% at 50% 42%, transparent 38%, rgba(8,12,22,0.62))" }} />
    </AbsoluteFill>
  );
};
