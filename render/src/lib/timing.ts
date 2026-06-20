// Caption timing without a forced-alignment service: split the VO into short
// chunks and distribute them evenly across the known audio duration. Good enough
// for word-by-word Shorts captions; swap for whisper-timestamps later if you want
// frame-perfect sync.

export type Chunk = {
  text: string;
  startInSeconds: number;
  endInSeconds: number;
};

const WEIGHT_PER_CHAR = 1; // longer words linger slightly longer
const WEIGHT_BASE = 4; // baseline weight so tiny words still get screen time

export function chunkCaptions(
  script: string,
  audioDurationInSeconds: number,
  wordsPerChunk = 3
): Chunk[] {
  const words = script
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  if (words.length === 0) return [];

  const groups: string[] = [];
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    groups.push(words.slice(i, i + wordsPerChunk).join(" "));
  }

  // weight each group by its length so dense captions hold a touch longer
  const weights = groups.map((g) => WEIGHT_BASE + g.length * WEIGHT_PER_CHAR);
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  let cursor = 0;
  return groups.map((text, i) => {
    const start = (cursor / totalWeight) * audioDurationInSeconds;
    cursor += weights[i];
    const end = (cursor / totalWeight) * audioDurationInSeconds;
    return { text, startInSeconds: start, endInSeconds: end };
  });
}

export const sec = (seconds: number, fps: number) => Math.round(seconds * fps);
