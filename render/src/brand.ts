// Phase 2 brand kit, in code. Update hex/font once here and every composition follows.
export const BRAND = {
  colors: {
    bg: "#0B1220", // deep navy
    bgAlt: "#111A2E",
    accent: "#16C784", // money green
    accentSoft: "#1FE08F",
    warn: "#F6C544", // caption highlight / numbers
    text: "#F4F7FB",
    textMuted: "#9AA7BD",
    danger: "#FF5C5C",
  },
  fonts: {
    // Bold & energetic kit: Anton (heavy condensed display) + Inter (clean body).
    // These are loaded in src/fonts.ts; the family names below must match.
    display: "'Anton', 'Archivo Black', Impact, sans-serif",
    body: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  name: "Finplaza",
  handle: "@finplaza",
} as const;

export const DISCLAIMERS = {
  notAdvice: "Not investment advice. Educational only.",
  asci:
    "Crypto products and NFTs are unregulated and can be highly risky. " +
    "There may be no regulatory recourse for any loss.",
} as const;
