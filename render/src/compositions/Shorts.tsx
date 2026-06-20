import React from "react";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  useVideoConfig,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { z } from "zod";
import { BRAND } from "../brand";
import { shortsProps } from "../lib/types";
import { Captions } from "../components/Captions";
import { BigNumber } from "../components/BigNumber";
import { LowerThird } from "../components/LowerThird";
import { DisclaimerBar } from "../components/Disclaimer";

// Shorts 1080x1920: b-roll layer -> captions -> number call-outs -> brand strip.
export const Shorts: React.FC<z.infer<typeof shortsProps>> = ({
  title,
  script,
  audioUrl,
  audioDurationInSeconds,
  onscreen,
  brollUrls,
  showCryptoDisclaimer,
}) => {
  const { fps, durationInFrames } = useVideoConfig();
  const numbers = onscreen.filter((o) => o.type === "number");

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.colors.bg }}>
      {/* b-roll layer (Pexels free clips); falls back to the brand gradient */}
      {brollUrls.length > 0 ? (
        <Broll urls={brollUrls} totalFrames={durationInFrames} />
      ) : (
        <Gradient />
      )}

      {/* darken so captions stay legible over busy footage */}
      <AbsoluteFill style={{ background: "rgba(8,12,22,0.35)" }} />

      <Audio src={audioUrl} />

      {/* title card for the first 1.2s as a hook framer */}
      <Sequence durationInFrames={Math.round(1.2 * fps)}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 80 }}>
          <span
            style={{
              fontFamily: BRAND.fonts.display,
              fontWeight: 900,
              fontSize: 92,
              color: BRAND.colors.text,
              textAlign: "center",
              lineHeight: 1.05,
            }}
          >
            {title}
          </span>
        </AbsoluteFill>
      </Sequence>

      <Captions script={script} audioDurationInSeconds={audioDurationInSeconds} />

      {numbers.map((n, i) => (
        <Sequence
          key={i}
          from={Math.round(n.t * fps)}
          durationInFrames={Math.round((n.durationInSeconds ?? 1.6) * fps)}
        >
          <BigNumber value={n.text} />
        </Sequence>
      ))}

      <LowerThird text={BRAND.name} sub={BRAND.handle} />

      {showCryptoDisclaimer ? <DisclaimerBar crypto /> : <DisclaimerBar />}
    </AbsoluteFill>
  );
};

const Broll: React.FC<{ urls: string[]; totalFrames: number }> = ({ urls, totalFrames }) => {
  const per = Math.ceil(totalFrames / urls.length);
  return (
    <>
      {urls.map((u, i) => (
        <Sequence key={i} from={i * per} durationInFrames={per}>
          <OffthreadVideo src={u} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </Sequence>
      ))}
    </>
  );
};

const Gradient: React.FC = () => {
  const frame = useCurrentFrame();
  const shift = interpolate(frame, [0, 300], [0, 30]);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 80% at 50% ${20 + shift}%, ${BRAND.colors.bgAlt}, ${BRAND.colors.bg})`,
      }}
    />
  );
};
