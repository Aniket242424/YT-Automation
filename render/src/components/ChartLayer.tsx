import React from "react";
import {
  Img,
  Sequence,
  useVideoConfig,
  spring,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { z } from "zod";
import { chartImage } from "../lib/types";

// The long-form differentiator: charts. We pre-render Chart.js -> PNG on the server
// (chartjs-node-canvas) and drop the PNGs in here as timed image sequences, so the
// browser render stays light. Each chart fades + lifts in.
export const ChartLayer: React.FC<{ charts: z.infer<typeof chartImage>[] }> = ({
  charts,
}) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {charts.map((c, i) => (
        <Sequence
          key={i}
          from={Math.round(c.t * fps)}
          durationInFrames={Math.round(c.durationInSeconds * fps)}
        >
          <ChartFrame src={c.src} />
        </Sequence>
      ))}
    </>
  );
};

const ChartFrame: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });
  const y = interpolate(enter, [0, 1], [30, 0]);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: enter,
        transform: `translateY(${y}px)`,
      }}
    >
      <Img src={src} style={{ width: "78%", borderRadius: 18 }} />
    </div>
  );
};
