import React from "react";
import { Composition } from "remotion";
import { Shorts } from "./compositions/Shorts";
import { LongForm } from "./compositions/LongForm";
import { shortsProps, longFormProps } from "./lib/types";

// Duration is derived from the audio length the server passes in (calculateMetadata),
// so the video always matches the VO without manual frame math.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Shorts"
        component={Shorts}
        schema={shortsProps}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={40 * 30}
        defaultProps={{
          title: "The card mistake costing you ₹12,000 a year",
          script:
            "Most people pay their credit card bill in full and think they're winning. " +
            "But the real money is in picking the right card for where you actually spend.",
          audioUrl: "https://example.com/placeholder.mp3",
          audioDurationInSeconds: 40,
          onscreen: [{ t: 6, type: "number", text: "₹12,000", durationInSeconds: 1.6 }],
          brollUrls: [],
          showCryptoDisclaimer: false,
          fps: 30,
        }}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.max(1, Math.round(props.audioDurationInSeconds * (props.fps ?? 30))),
          fps: props.fps ?? 30,
        })}
      />

      <Composition
        id="LongForm"
        component={LongForm}
        schema={longFormProps}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={420 * 30}
        defaultProps={{
          title: "How RBI's new rule changes your savings account",
          audioUrl: "https://example.com/placeholder-long.mp3",
          audioDurationInSeconds: 420,
          sections: [
            { title: "What changed", startInSeconds: 8 },
            { title: "Why it matters", startInSeconds: 120 },
            { title: "What to do", startInSeconds: 300 },
          ],
          onscreen: [],
          charts: [],
          brollUrls: [],
          showCryptoDisclaimer: false,
          fps: 30,
        }}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.max(1, Math.round(props.audioDurationInSeconds * (props.fps ?? 30))),
          fps: props.fps ?? 30,
        })}
      />
    </>
  );
};
