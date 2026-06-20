// Phase 6 — render worker. Runs on the EC2 box under pm2 (see ecosystem.config.js).
// n8n's Workflow B POSTs here; we render the MP4 and upload it to S3, returning the URL.
//
//   POST /render
//   {
//     "template": "Shorts" | "LongForm",
//     "props": { ...matches src/lib/types.ts... },
//     "jobId": "uuid",                 // used for the S3 key + idempotency
//     "charts": [                      // optional; long-form chart specs to pre-render
//       { "t": 30, "durationInSeconds": 5, "kind": "line", "x": [...], "y": [...], "label": "" }
//     ]
//   }
//
// Returns: { ok: true, video_url, thumb_url, durationInSeconds }

const express = require("express");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { bundle } = require("@remotion/bundler");
const { renderMedia, renderStill, selectComposition } = require("@remotion/renderer");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const PORT = process.env.RENDER_PORT || 4000;
const BUCKET = process.env.ASSETS_BUCKET || "yourbrand-assets";
const REGION = process.env.AWS_REGION || "ap-south-1";
const PUBLIC_BASE = process.env.ASSETS_PUBLIC_BASE || `https://${BUCKET}.s3.${REGION}.amazonaws.com`;
const ENTRY = path.join(__dirname, "src", "index.ts");
const PUBLIC_DIR = path.join(__dirname, "public"); // staticFile() root (chart PNGs land here)

const s3 = new S3Client({ region: REGION }); // creds come from the instance IAM role
const chartCanvas = new ChartJSNodeCanvas({ width: 1280, height: 720, backgroundColour: "#0B1220" });

let serveUrlPromise = null;
function getServeUrl() {
  // bundle once on first request, then reuse for the process lifetime
  if (!serveUrlPromise) {
    serveUrlPromise = bundle({ entryPoint: ENTRY, onProgress: () => {} });
  }
  return serveUrlPromise;
}

async function renderChartsToPng(charts, jobId) {
  if (!Array.isArray(charts) || charts.length === 0) return [];
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  const out = [];
  for (let i = 0; i < charts.length; i++) {
    const c = charts[i];
    const config = {
      type: c.kind || "line",
      data: {
        labels: c.x,
        datasets: [
          {
            label: c.label || "",
            data: c.y,
            borderColor: "#16C784",
            backgroundColor: "rgba(22,199,132,0.25)",
            borderWidth: 4,
            tension: 0.3,
            fill: c.kind !== "bar",
          },
        ],
      },
      options: {
        plugins: { legend: { labels: { color: "#F4F7FB", font: { size: 22 } } } },
        scales: {
          x: { ticks: { color: "#9AA7BD", font: { size: 18 } }, grid: { color: "rgba(255,255,255,0.06)" } },
          y: { ticks: { color: "#9AA7BD", font: { size: 18 } }, grid: { color: "rgba(255,255,255,0.06)" } },
        },
      },
    };
    const buf = await chartCanvas.renderToBuffer(config);
    const fname = `chart_${jobId}_${i}.png`;
    fs.writeFileSync(path.join(PUBLIC_DIR, fname), buf);
    out.push({ src: fname, t: c.t, durationInSeconds: c.durationInSeconds || 5 });
  }
  return out;
}

async function uploadToS3(localPath, key, contentType) {
  const Body = fs.readFileSync(localPath);
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body, ContentType: contentType }));
  return `${PUBLIC_BASE}/${key}`;
}

const app = express();
app.use(express.json({ limit: "8mb" }));

app.get("/health", (_req, res) => res.json({ ok: true, up: true }));

app.post("/render", async (req, res) => {
  const started = Date.now();
  const { template, props = {}, jobId = "adhoc", charts } = req.body || {};
  if (!["Shorts", "LongForm"].includes(template)) {
    return res.status(400).json({ ok: false, error: "template must be 'Shorts' or 'LongForm'" });
  }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "render-"));
  const videoPath = path.join(tmp, `${jobId}.mp4`);
  const thumbPath = path.join(tmp, `${jobId}.jpg`);

  try {
    // 1. pre-render charts (long-form) and merge into props
    const chartImages = await renderChartsToPng(charts, jobId);
    const inputProps = { ...props, charts: [...(props.charts || []), ...chartImages] };

    // 2. select composition (duration is derived in calculateMetadata from audio length)
    const serveUrl = await getServeUrl();
    const composition = await selectComposition({ serveUrl, id: template, inputProps });

    // 3. render video
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation: videoPath,
      inputProps,
      publicDir: PUBLIC_DIR, // so staticFile(chart.png) resolves
      chromiumOptions: { gl: "angle" },
      concurrency: 2,
    });

    // 4. grab a still for a fallback thumbnail (Workflow B may overwrite with a Canva one)
    await renderStill({
      composition,
      serveUrl,
      output: thumbPath,
      frame: Math.floor(composition.durationInFrames * 0.15),
      inputProps,
      publicDir: PUBLIC_DIR,
    });

    // 5. upload both to S3
    const stamp = `${jobId}`;
    const video_url = await uploadToS3(videoPath, `videos/${stamp}.mp4`, "video/mp4");
    const thumb_url = await uploadToS3(thumbPath, `thumbs/${stamp}.jpg`, "image/jpeg");

    res.json({
      ok: true,
      video_url,
      thumb_url,
      durationInSeconds: composition.durationInFrames / composition.fps,
      ms: Date.now() - started,
    });
  } catch (e) {
    console.error("[render] failed", e);
    res.status(500).json({ ok: false, error: String(e && e.stack ? e.stack : e) });
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

app.listen(PORT, () => console.log(`render worker up on :${PORT}`));
