import React from "react";
import { AbsoluteFill } from "remotion";
import { BRAND, DISCLAIMERS } from "../brand";

// Compliance furniture. The ASCI crypto bar MUST be on screen >=5s + voiced when
// the script touches crypto (see prompts/compliance-block.md). The fact-check gate
// in Workflow B sets showCryptoDisclaimer; this just renders it.
export const DisclaimerBar: React.FC<{ crypto?: boolean }> = ({ crypto }) => {
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", pointerEvents: "none" }}>
      <div
        style={{
          margin: "0 40px 24px",
          padding: "14px 22px",
          borderRadius: 14,
          background: "rgba(8,12,22,0.82)",
          border: `1px solid ${crypto ? BRAND.colors.danger : "rgba(255,255,255,0.12)"}`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: BRAND.fonts.body,
            fontSize: 26,
            lineHeight: 1.3,
            color: BRAND.colors.textMuted,
          }}
        >
          {crypto ? DISCLAIMERS.asci : DISCLAIMERS.notAdvice}
        </p>
      </div>
    </AbsoluteFill>
  );
};
