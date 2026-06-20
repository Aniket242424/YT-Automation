import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { BRAND } from "../brand";

// Big call-out number/stat that springs in. Driven by onscreen items of type "number".
export const BigNumber: React.FC<{ value: string; caption?: string }> = ({
  value,
  caption,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 12, mass: 0.6 } });
  const y = interpolate(enter, [0, 1], [40, 0]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: `translateY(${y}px)`,
        opacity: enter,
      }}
    >
      <span
        style={{
          fontFamily: BRAND.fonts.display,
          fontWeight: 900,
          fontSize: 220,
          color: BRAND.colors.warn,
          letterSpacing: -4,
          textShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        {value}
      </span>
      {caption ? (
        <span
          style={{
            fontFamily: BRAND.fonts.body,
            fontWeight: 600,
            fontSize: 56,
            color: BRAND.colors.text,
            marginTop: 6,
          }}
        >
          {caption}
        </span>
      ) : null}
    </div>
  );
};
