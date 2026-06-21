import { z } from "zod";

// Props contract between n8n (Workflow B) and Remotion. n8n POSTs JSON matching
// these schemas to the render server; Remotion validates with the same zod schema.

export const onscreenItem = z.object({
  t: z.number().describe("approx start time in seconds"),
  type: z
    .enum(["caption", "number", "card", "lower_third", "chart", "disclaimer"])
    .default("caption"),
  text: z.string().default(""),
  // for type === "chart"
  chart: z
    .object({
      kind: z.enum(["line", "bar"]).default("line"),
      x: z.array(z.union([z.string(), z.number()])).default([]),
      y: z.array(z.number()).default([]),
      label: z.string().default(""),
    })
    .optional(),
  durationInSeconds: z.number().optional(),
});
export type OnscreenItem = z.infer<typeof onscreenItem>;

// A pre-rendered chart PNG (chartjs-node-canvas writes these in the server before render)
export const chartImage = z.object({
  src: z.string(), // staticFile() path or absolute URL
  t: z.number(),
  durationInSeconds: z.number().default(4),
});

export const shortsProps = z.object({
  title: z.string().default(""),
  script: z.string().default(""),
  audioUrl: z.string().describe("S3/HTTPS url to the ElevenLabs MP3"),
  audioDurationInSeconds: z.number().default(40),
  onscreen: z.array(onscreenItem).default([]),
  // word-level captions from Whisper (perfect sync); empty = fall back to even-timing
  captions: z
    .array(
      z.object({
        text: z.string(),
        startMs: z.number(),
        endMs: z.number(),
        timestampMs: z.number().nullable().optional(),
        confidence: z.number().nullable().optional(),
      })
    )
    .default([]),
  brollUrls: z.array(z.string()).default([]),
  showCryptoDisclaimer: z.boolean().default(false),
  fps: z.number().default(30),
});
export type ShortsProps = z.infer<typeof shortsProps>;

export const longFormProps = z.object({
  title: z.string().default(""),
  audioUrl: z.string(),
  audioDurationInSeconds: z.number().default(420),
  sections: z
    .array(z.object({ title: z.string(), startInSeconds: z.number() }))
    .default([]),
  onscreen: z.array(onscreenItem).default([]),
  charts: z.array(chartImage).default([]),
  brollUrls: z.array(z.string()).default([]),
  showCryptoDisclaimer: z.boolean().default(false),
  fps: z.number().default(30),
});
export type LongFormProps = z.infer<typeof longFormProps>;
