// Loads the brand fonts so Remotion actually renders them (otherwise the
// font-family names in brand.ts fall back to a system font). Imported once in
// src/index.ts. The loaded family names ("Anton", "Inter") match brand.ts.
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

loadAnton(); // bold/energetic display — thumbnails, Shorts captions, big numbers
loadInter(); // clean body — sub-lines, disclaimers
