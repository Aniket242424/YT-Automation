import React from "react";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  staticFile,
  useVideoConfig,
  useCurrentFrame,
  interpolate,
  spring,
} from "remotion";
import { z } from "zod";
import { BRAND } from "../brand";
import { shortsProps } from "../lib/types";
import { Captions } from "../components/Captions";
import { KaraokeCaptions } from "../components/KaraokeCaptions";
import { BigNumber } from "../components/BigNumber";
import { DisclaimerBar } from "../components/Disclaimer";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { CreditCard } from "../components/CreditCard";

// local public/ files come as bare names; S3/https come as URLs
const src = (u: string) => (/^https?:|^data:/.test(u) ? u : staticFile(u));

export const Shorts: React.FC<z.infer<typeof shortsProps>> = ({
  script,
  audioUrl,
  audioDurationInSeconds,
  onscreen,
  captions,
  brollUrls,
  showCryptoDisclaimer,
}) => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame / fps;
  const numbers = onscreen.filter((o) => o.type === "number");
  const danger = t >= 12.5 && t <= 19.5; // the "interest / debt trap" beat

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.colors.bg }}>
      {brollUrls.length > 0 ? <Broll urls={brollUrls} totalFrames={durationInFrames} /> : <AnimatedBackground />}

      <Audio src={src(audioUrl)} />

      {/* hero visual: real b-roll if we have it, else the branded credit card */}
      {brollUrls.length === 0 ? <CreditCard top={360} danger={danger} /> : null}

      {/* hook stamp, first ~2.2s */}
      <Sequence durationInFrames={Math.round(2.2 * fps)}>
        <HookStamp />
      </Sequence>

      {/* punchy number slams */}
      {numbers.map((n, i) => (
        <Sequence
          key={i}
          from={Math.round(n.t * fps)}
          durationInFrames={Math.round((n.durationInSeconds ?? 1.8) * fps)}
        >
          <BigNumber value={n.text} danger={n.t >= 12 && n.t <= 19} />
        </Sequence>
      ))}

      {/* synced captions */}
      {captions && captions.length > 0 ? (
        <KaraokeCaptions captions={captions} />
      ) : (
        <Captions script={script} audioDurationInSeconds={audioDurationInSeconds} />
      )}

      {showCryptoDisclaimer ? <DisclaimerBar crypto /> : <DisclaimerBar />}
    </AbsoluteFill>
  );
};

const HookStamp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 10, mass: 0.6 } });
  const rot = interpolate(enter, [0, 1], [-9, -4]);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 840 }}>
      <div
        style={{
          transform: `scale(${enter}) rotate(${rot}deg)`,
          background: BRAND.colors.danger,
          padding: "8px 30px",
          borderRadius: 16,
          boxShadow: `0 14px 44px ${BRAND.colors.danger}99`,
        }}
      >
        <span style={{ fontFamily: BRAND.fonts.display, fontSize: 92, color: "#fff", letterSpacing: 1 }}>
          TRAP!
        </span>
      </div>
    </AbsoluteFill>
  );
};

const Broll: React.FC<{ urls: string[]; totalFrames: number }> = ({ urls, totalFrames }) => {
  const per = Math.ceil(totalFrames / urls.length);
  return (
    <>
      {urls.map((u, i) => (
        <Sequence key={i} from={i * per} durationInFrames={per}>
          <OffthreadVideo src={src(u)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </Sequence>
      ))}
      {/* darken footage so captions stay readable */}
      <AbsoluteFill style={{ background: "rgba(8,12,22,0.5)" }} />
    </>
  );
};
