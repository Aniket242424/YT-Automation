import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  OffthreadVideo,
  useVideoConfig,
  spring,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { z } from "zod";
import { BRAND } from "../brand";
import { longFormProps } from "../lib/types";
import { LowerThird } from "../components/LowerThird";
import { BigNumber } from "../components/BigNumber";
import { ChartLayer } from "../components/ChartLayer";
import { DisclaimerBar } from "../components/Disclaimer";

// Long-form 1920x1080: intro sting -> section cards -> chart layer -> b-roll -> outro CTA.
export const LongForm: React.FC<z.infer<typeof longFormProps>> = ({
  title,
  audioUrl,
  onscreen,
  sections,
  charts,
  brollUrls,
  showCryptoDisclaimer,
}) => {
  const { fps, durationInFrames } = useVideoConfig();
  const introFrames = Math.round(2.5 * fps);
  const outroFrames = Math.round(3 * fps);
  const numbers = onscreen.filter((o) => o.type === "number");

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.colors.bg }}>
      {brollUrls.length > 0 ? (
        <Broll urls={brollUrls} totalFrames={durationInFrames} />
      ) : null}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(11,18,32,0.65), rgba(11,18,32,0.92))`,
        }}
      />

      <Audio src={audioUrl} />

      {/* intro sting */}
      <Sequence durationInFrames={introFrames}>
        <Intro title={title} />
      </Sequence>

      {/* section title cards */}
      {sections.map((s, i) => {
        const from = Math.round(s.startInSeconds * fps);
        const next = sections[i + 1];
        const until = next ? Math.round(next.startInSeconds * fps) : durationInFrames - outroFrames;
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(fps, until - from)}>
            <LowerThird text={s.title} sub={`${i + 1} / ${sections.length}`} />
          </Sequence>
        );
      })}

      {/* charts — the ₹0 differentiator */}
      <ChartLayer charts={charts} />

      {/* number call-outs */}
      {numbers.map((n, i) => (
        <Sequence
          key={i}
          from={Math.round(n.t * fps)}
          durationInFrames={Math.round((n.durationInSeconds ?? 2) * fps)}
        >
          <BigNumber value={n.text} />
        </Sequence>
      ))}

      {/* outro CTA */}
      <Sequence from={durationInFrames - outroFrames} durationInFrames={outroFrames}>
        <Outro />
      </Sequence>

      {showCryptoDisclaimer ? <DisclaimerBar crypto /> : <DisclaimerBar />}
    </AbsoluteFill>
  );
};

const Intro: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });
  const y = interpolate(enter, [0, 1], [40, 0]);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 120 }}>
      <div style={{ transform: `translateY(${y}px)`, opacity: enter, textAlign: "center" }}>
        <div style={{ fontFamily: BRAND.fonts.body, fontSize: 36, color: BRAND.colors.accent, letterSpacing: 6 }}>
          {BRAND.name.toUpperCase()}
        </div>
        <div style={{ fontFamily: BRAND.fonts.display, fontWeight: 900, fontSize: 90, color: BRAND.colors.text, marginTop: 18, lineHeight: 1.05 }}>
          {title}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: enter }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: BRAND.fonts.display, fontWeight: 900, fontSize: 80, color: BRAND.colors.text }}>
          Subscribe
        </div>
        <div style={{ fontFamily: BRAND.fonts.body, fontSize: 40, color: BRAND.colors.textMuted, marginTop: 12 }}>
          for the weekly card breakdown
        </div>
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
          <OffthreadVideo src={u} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </Sequence>
      ))}
    </>
  );
};
