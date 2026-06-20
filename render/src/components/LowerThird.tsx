import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { BRAND } from "../brand";

// Brand lower-third name strip (section labels on long-form, brand tag on shorts).
export const LowerThird: React.FC<{ text: string; sub?: string; y?: number }> = ({
  text,
  sub,
  y = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16 } });
  const x = interpolate(enter, [0, 1], [-60, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        bottom: 80 + y,
        transform: `translateX(${x}px)`,
        opacity: enter,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 10,
          height: 64,
          borderRadius: 6,
          background: BRAND.colors.accent,
        }}
      />
      <div>
        <div
          style={{
            fontFamily: BRAND.fonts.display,
            fontWeight: 800,
            fontSize: 46,
            color: BRAND.colors.text,
          }}
        >
          {text}
        </div>
        {sub ? (
          <div
            style={{
              fontFamily: BRAND.fonts.body,
              fontSize: 30,
              color: BRAND.colors.textMuted,
            }}
          >
            {sub}
          </div>
        ) : null}
      </div>
    </div>
  );
};
