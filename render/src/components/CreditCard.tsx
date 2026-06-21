import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { BRAND } from "../brand";

// The hero visual: a sleek Finplaza credit card that springs in, floats, tilts and
// has a shine sweep. `danger` makes it pulse red (for the "interest trap" beat).
export const CreditCard: React.FC<{ top?: number; danger?: boolean }> = ({ top = 470, danger = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const enter = spring({ frame, fps, config: { damping: 14, mass: 0.85 } });
  const bob = Math.sin(t * 1.25) * 16;
  const tilt = Math.sin(t * 0.8) * 4;
  const rotIn = interpolate(enter, [0, 1], [-20, 0]);
  const scale = interpolate(enter, [0, 1], [0.55, 1]);
  const shine = ((t * 0.45) % 1.6) * 100 - 30;
  const shake = danger ? Math.sin(t * 30) * 4 : 0;
  const ring = danger ? `0 0 0 3px ${BRAND.colors.danger}, 0 0 60px ${BRAND.colors.danger}88` : `0 0 0 1px ${BRAND.colors.accent}55`;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top,
        transform: `translateX(-50%) translateY(${bob}px) rotate(${rotIn + tilt}deg) scale(${scale})`,
        opacity: enter,
      }}
    >
      <div
        style={{
          width: 680,
          height: 430,
          borderRadius: 40,
          position: "relative",
          overflow: "hidden",
          transform: `translateX(${shake}px)`,
          background: `linear-gradient(135deg, #173a52, ${BRAND.colors.bgAlt} 55%, #0c2a22)`,
          boxShadow: `0 34px 90px rgba(0,0,0,0.55), ${ring}`,
        }}
      >
        <div style={{ position: "absolute", width: 320, height: 320, right: -70, top: -90, background: `radial-gradient(circle, ${BRAND.colors.accent}55, transparent 65%)`, filter: "blur(22px)" }} />
        {/* chip */}
        <div style={{ position: "absolute", left: 56, top: 118, width: 92, height: 68, borderRadius: 12, background: `linear-gradient(135deg, ${BRAND.colors.warn}, #b07d10)`, boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.15)" }} />
        {/* contactless */}
        <div style={{ position: "absolute", left: 172, top: 120, color: BRAND.colors.text, fontSize: 50, opacity: 0.65, fontFamily: BRAND.fonts.body }}>))</div>
        {/* number */}
        <div style={{ position: "absolute", left: 56, top: 252, color: BRAND.colors.text, fontFamily: BRAND.fonts.display, fontSize: 50, letterSpacing: 7 }}>5421 •••• •••• 9087</div>
        {/* name + brand */}
        <div style={{ position: "absolute", left: 56, bottom: 44, color: BRAND.colors.textMuted, fontFamily: BRAND.fonts.body, fontSize: 28, fontWeight: 700, letterSpacing: 2 }}>FINPLAZA MEMBER</div>
        <div style={{ position: "absolute", right: 50, bottom: 34, color: BRAND.colors.accent, fontFamily: BRAND.fonts.display, fontSize: 46 }}>Finplaza</div>
        {/* shine */}
        <div style={{ position: "absolute", top: -40, bottom: -40, width: 160, left: `${shine}%`, background: "linear-gradient(105deg, transparent, rgba(255,255,255,0.2), transparent)", transform: "skewX(-18deg)" }} />
      </div>
    </div>
  );
};
