# Render worker (Phase 6)

Remotion compositions + an Express render endpoint that n8n calls. Renders an MP4,
grabs a fallback thumbnail, uploads both to S3, returns the URLs.

## Local dev
```bash
npm install
npm run dev          # opens Remotion Studio to preview Shorts / LongForm
npm run render:shorts  # renders examples/shorts.props.json -> out/shorts.mp4
```

## On the EC2 box
```bash
npm ci --omit=dev
npx pm2 start ecosystem.config.js
npx pm2 save && npx pm2 startup    # restart on reboot
curl localhost:4000/health
```

## How n8n calls it
`POST http://host.docker.internal:4000/render` (or `RENDER_URL` from infra/.env):
```json
{ "template": "Shorts", "jobId": "<uuid>", "props": { ... }, "charts": [ ... ] }
```
Response: `{ "ok": true, "video_url": "...", "thumb_url": "...", "durationInSeconds": 38 }`

## Pieces
| File | Role |
|---|---|
| `src/Root.tsx` | registers the `Shorts` (1080×1920) + `LongForm` (1920×1080) compositions; duration derived from audio length |
| `src/compositions/*` | the two templates |
| `src/components/*` | Captions, BigNumber, LowerThird, DisclaimerBar, ChartLayer |
| `src/lib/types.ts` | zod props contract shared with n8n |
| `src/lib/timing.ts` | even caption timing (swap for whisper-timestamps for frame-perfect sync) |
| `server.js` | bundle once → pre-render charts → renderMedia → S3 upload |

## Notes
- Charts: pass `charts[]` specs and the server pre-renders them to PNG with Chart.js
  (Node canvas), keeping the browser render light. PNGs land in `public/` for `staticFile()`.
- Compliance: set `showCryptoDisclaimer: true` whenever the script touches crypto so the
  ASCI bar renders ≥5s (the fact-check gate in Workflow B decides this).
- Reliability fallback (per the plan): if self-host renders fight you, point Workflow B's
  render node at Creatomate's API instead — same job object, different endpoint.
