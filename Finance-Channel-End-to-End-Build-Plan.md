# End-to-End Build Plan — Faceless Finance Channel (Compliant, Automated, ~₹10k/mo)

*From zero (no Gmail) to a self-running pipeline. Stack: Gmail/Brand Account → YouTube → n8n + Claude + ElevenLabs + Remotion on one EC2 box → Telegram approval gate → YouTube publish → Looker Studio. Start volume: 3 Shorts/day + 2 long-form/week. Targets: 80k subs and revenue within 6 months.*

---

## Guardrails locked (read once, obey forever)

These are baked into every script prompt. Breaking them is the only thing that can end the business.

- **No buy/sell/hold, no target prices, no "multibagger," no return predictions** on any security. A disclaimer does not make this legal in India.
- **Stock-market content = education + post-facto news only.** "What this result means," "how an IPO is priced," "new SEBI rule explained." Respect the 3-month-lag rule on live prices.
- **No forex *trading* content / no forex platform promotion** (RBI/FEMA; the Alert List names channels promoting forex advisory). Macro "why the rupee moved" news only.
- **Crypto = news/explainers only, always with the ASCI disclaimer** ("Crypto products and NFTs are unregulated and can be highly risky. There may be no regulatory recourse for any loss.") on screen ≥5s + voiced.
- **Money is made on credit-card/banking affiliates + AdSense + your own products** — the SEBI-safe lane.
- **Human approval gate before every publish.** Non-negotiable; it's your compliance + hallucination firewall.

---

# PHASE 0 — Prep (30 min)

- [ ] Decide brand name + handle. Check availability on YouTube, Instagram, X, and as a domain — all at once. Pick one that's free everywhere.
- [ ] Set up a **password manager** (Bitwarden free). Every credential below goes in it.
- [ ] Have ready: a phone number for 2FA, a payment card for ElevenLabs/domain, your existing Claude API key + AWS account.

---

# PHASE 1 — Identity & Accounts (Day 1, all manual)

### 1.1 Create a dedicated Gmail (do NOT use your personal one)
1. Incognito → accounts.google.com → Create account → **For my personal use**.
2. Username = your brand (e.g., `themoneydesk.official@gmail.com`). Store in Bitwarden.
3. **Turn on 2-Step Verification immediately** (Security → 2-Step Verification). YPP *requires* this, and you don't want a brand account without it.
4. Add a recovery email + phone.

### 1.2 Create the YouTube channel as a Brand Account (important)
- YouTube → sign in → Settings → **Create a channel** → choose **"Use a custom name"** (this makes a **Brand Account**, not a personal channel).
- Why Brand Account: it can have multiple managers, can be transferred/sold, and survives independently of one personal login. A business should never sit on a personal channel.
- Set: channel name, @handle, profile picture (logo), banner, and the **About** section (1–2 line value prop + "Not investment advice. Educational only.").

### 1.3 Domain + brand email (recommended, ~₹800/yr)
- Buy `yourbrand.in` (or .com). Set up free email forwarding (most registrars include it) so `hello@yourbrand.in` lands in your Gmail.
- You'll also use a subdomain (`flow.yourbrand.in`) for n8n in Phase 3.

### 1.4 Reserve social handles
- Create Instagram + X with the same handle (you'll cross-post Shorts later for free reach). Don't build them yet — just claim the names.

**Phase 1 done when:** brand Gmail with 2FA, YouTube Brand Account fully branded, domain bought, handles reserved.

---

# PHASE 2 — Brand & Creative Kit (Day 1–2)

### 2.1 Visual identity (Canva, free tier)
- Logo (simple wordmark + 1 icon), 2–3 brand colors (save hex codes), 1 display font + 1 body font.
- Build reusable templates: **thumbnail** (1280×720), **Shorts safe-zone** guide, **lower-third** name strip, **intro/outro** cards.

### 2.2 The anchor voice (ElevenLabs Creator, ~₹1,900/mo)
- Subscribe to **Creator** ($22/mo — needed for Professional Voice Cloning + commercial rights).
- Create ONE voice and lock it forever (this is your channel's identity). Settings to start: Stability ~50, Similarity ~75, Style ~0–20. Save the `voice_id`.
- Optional cost-saver later: use OpenAI TTS for Shorts, ElevenLabs anchor only for long-form.

### 2.3 Reusable text assets
- **Description boilerplate**: 2-line hook → summary → timestamps → "📌 Not investment advice; educational only" → affiliate disclosure ("Some links are affiliate links; we may earn a commission at no cost to you.") → social links.
- **Pinned-comment template** + **end-screen CTA** ("Subscribe for the weekly card breakdown").
- **The compliance block** (you'll paste this into prompts):
```
COMPLIANCE (India, non-negotiable):
- Not SEBI-registered. Never say buy/sell/hold, target price, "multibagger",
  "guaranteed/assured returns", or predict any security's future price.
- Securities: concepts, mechanics, publicly disclosed facts, post-facto news only.
- Credit cards/banking/deals: factual features, fees, eligibility, pros/cons + "T&C apply, verify on official site".
- Crypto: include the ASCI disclaimer; news/education only.
- No forex trading/platform promotion.
- Flag any claim you're <90% sure of with [VERIFY].
```

**Phase 2 done when:** logo + color/font system, thumbnail/lower-third templates, one locked ElevenLabs voice, boilerplate text saved.

---

# PHASE 3 — Infrastructure on EC2 (Day 2–4, your wheelhouse)

### 3.1 Launch the box
- **Instance:** `t3.medium` (4 GB RAM) in **ap-south-1**, Amazon Linux 2023. (Remotion's headless Chromium will OOM on 2 GB; `t3.small` only if you keep renders light.)
- **Credits math:** `t3.medium` ≈ $0.042/hr ≈ ~$30/mo → your **$120 credits ≈ ~4 months free**. `t3.small` ≈ ~$15/mo → ~8 months.
- **Security group** (you've done this before): inbound 22 (SSH, your IP only), 80 + 443 (for n8n behind HTTPS). Nothing else.
- Attach an **Elastic IP**. Point `flow.yourbrand.in` A-record → that IP.
- Storage: 30 GB gp3 root + an **S3 bucket** (`yourbrand-assets`) for audio/video/thumbnails.
- Create an **IAM role** for the instance with least-privilege S3 access to that bucket (don't put long-lived keys on the box).

### 3.2 Install Docker + deploy n8n (with Postgres + auto-HTTPS)
SSH in, then:
```bash
sudo dnf update -y && sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user   # re-login after this
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
mkdir ~/stack && cd ~/stack
```
`~/stack/docker-compose.yml`:
```yaml
services:
  caddy:                      # auto HTTPS reverse proxy
    image: caddy:2
    ports: ["80:80","443:443"]
    volumes: ["./Caddyfile:/etc/caddy/Caddyfile","caddy_data:/data"]
    restart: unless-stopped
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: ${PG_PASS}
      POSTGRES_DB: n8n
    volumes: ["pg_data:/var/lib/postgresql/data"]
    restart: unless-stopped
  n8n:
    image: docker.n8n.io/n8nio/n8n
    environment:
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PASSWORD: ${PG_PASS}
      N8N_HOST: flow.yourbrand.in
      N8N_PROTOCOL: https
      WEBHOOK_URL: https://flow.yourbrand.in/
      N8N_ENCRYPTION_KEY: ${N8N_KEY}
      GENERIC_TIMEZONE: Asia/Kolkata
    volumes: ["n8n_data:/home/node/.n8n"]
    depends_on: [postgres]
    restart: unless-stopped
volumes: { pg_data: {}, n8n_data: {}, caddy_data: {} }
```
`~/stack/Caddyfile`:
```
flow.yourbrand.in {
    reverse_proxy n8n:5678
}
```
`~/stack/.env` (chmod 600): `PG_PASS=...` `N8N_KEY=<32+ random chars>`. Then:
```bash
docker-compose up -d
```
Visit `https://flow.yourbrand.in`, create the owner account (n8n's own login). HTTPS is automatic via Caddy.

### 3.3 Install the render worker (Remotion)
Run Remotion as a tiny always-on render service on the same box (Node + ffmpeg + Chromium deps). You'll build the templates in Phase 6; for now just install:
```bash
sudo dnf install -y nodejs ffmpeg
# Chromium libs for headless render:
sudo dnf install -y nss atk at-spi2-atk cups-libs libdrm libxkbcommon libXcomposite libXdamage libXrandr mesa-libgbm pango alsa-lib
mkdir ~/render && cd ~/render && npm init -y
npm i remotion @remotion/cli @remotion/renderer express
```
> **Remotion licensing:** free under their license for individuals and small companies below their revenue/headcount threshold — verify current terms on remotion.dev before you scale.
> **Reliability fallback:** if renders are flaky/slow, point the render node at **Creatomate's API** (~₹3–4k/mo) instead. Self-host first; switch only if it fights you.

### 3.4 Backups
- Daily EC2 snapshot (or `pg_dump` to S3 via cron). Export your n8n workflows to git after each change (n8n → workflow → Download). Treat workflows as code.

**Phase 3 done when:** n8n reachable over HTTPS, Postgres persistent, S3 bucket ready, Remotion deps installed, backups scheduled.

---

# PHASE 4 — API Keys & Connections (Day 4)

| Service | Get it | Store in |
|---|---|---|
| Claude API | console.anthropic.com (you have it) | n8n credential |
| ElevenLabs | dashboard → API key | n8n credential |
| YouTube Data + Analytics | Google Cloud Console (below) | n8n native YouTube OAuth2 |
| Telegram bot | @BotFather → `/newbot` → token; get your chat_id via @userinfobot | n8n credential |
| AWS S3 | instance IAM role (no static keys) | — |

### 4.1 YouTube API — the part everyone gets wrong
1. Google Cloud Console → new project → **Enable APIs**: *YouTube Data API v3* + *YouTube Analytics API*.
2. **OAuth consent screen** → External → add your brand Gmail as a **Test user**.
3. **CRITICAL gotcha:** while the consent screen is in **"Testing"**, refresh tokens **expire after 7 days** → your pipeline silently dies weekly. Fix: set the app to **"In production"** (you'll see an "unverified app" warning for your own account — that's fine for personal use with limited scopes; click through it). This gives long-lived refresh tokens.
4. Create **OAuth client ID** (type: *Web application*), add n8n's redirect URL (n8n shows it on the credential screen).
5. In n8n, create a **YouTube OAuth2** credential with that client ID/secret, authorize with the brand Gmail. n8n handles refresh from here.

### 4.2 Quota gotcha
- Default YouTube Data API quota = **10,000 units/day**. A `videos.insert` (upload) = **1,600 units**. So ~6 uploads/day max on default quota.
- Your start volume (3 Shorts + ~1 long-form/day ≈ 4 uploads = 6,400 units + thumbnails/playlist/analytics) **fits, but tightly**. When you scale, request a quota increase in the Cloud Console (takes days — do it early).

**Phase 4 done when:** all credentials saved in n8n, YouTube OAuth authorized in production mode, a test `videos.list` call succeeds.

---

# PHASE 5 — The Pipeline in n8n (Day 5–10)

Deterministic, not "agentic": five small workflows, each step one job, with retries + a human gate. One job object flows through.

### Job schema (store in Postgres `jobs` table)
```json
{
  "id": "uuid", "type": "short|long", "status": "queued|scripted|checked|rendered|ready|published|failed",
  "topic": "", "brief": "", "fact_pack": {}, "sources": [], "script": "", "onscreen": [],
  "caption": "", "factcheck": "PASS|FLAG", "flags": [], "audio_url": "", "video_url": "",
  "thumb_url": "", "seo": {}, "youtube_id": "", "created_at": "", "publish_at": ""
}
```

### Workflow A — Ingest & rank (Schedule: daily 07:00 IST)
`Schedule → RSS Read ×N → Merge → Dedupe(vs Postgres "seen") → Claude(rank) → write topic queue → Telegram digest`

- RSS sources: Economic Times, Mint, Moneycontrol, RBI press releases, plus credit-card/deals blogs. (Start RSS-only; no paid APIs.)
- **Claude rank prompt:**
```
You are a finance content editor for an Indian personal-finance brand.
From these headlines+summaries, pick the 5 best video topics for TODAY.
Prefer: credit cards, banking products, personal finance, savings/deals, and
post-facto explainers of market/economic news. AVOID anything needing a buy/sell view.
For each: {topic, angle, format: short|long, why_now (1 line), monetization_fit: high|med|low}.
Return JSON array only.
Input: {{rss_items}}
```
- Telegram digest lists the 5; you reply with which to greenlight (or default: auto-take the top 3 Shorts + 1 long unless you veto within 2h).

### Workflow B — Produce (Trigger: per approved topic)
`Claude Research → Claude Script → Claude Fact-Check → [gate if FLAG] → ElevenLabs TTS → Remotion render → Thumbnail → Claude SEO → write "ready" → Telegram preview`

- **Research node** (Claude, web search ON):
```
Research this topic for a factual Indian finance video: {{topic}} ({{angle}}).
Return JSON: {facts:[{claim, source_url, source_date}], key_numbers:[], caveats:[]}.
Only include facts you can attribute to a named source with a date. Prefer last 30 days.
```
- **Script node** (Claude) — paste the COMPLIANCE block, then the Shorts or Long template from your earlier templates. Output JSON `{script, onscreen[], caption}`.
- **Fact-Check node** (Claude, FRESH system prompt — does not see the script's framing as trusted):
```
You are a skeptical finance fact-checker. Given SCRIPT and SOURCES, for each factual
claim output {claim, verdict: supported|unsupported|needs_review, note}.
Then COMPLIANCE_CHECK: does the script contain any buy/sell view, return prediction,
forex promotion, or crypto claim missing the disclaimer? 
Return {claims:[...], compliance:"PASS|FAIL", reasons:[]}.
```
  → IF `compliance=FAIL` OR any `unsupported`/`needs_review`: set status `failed`/flag, push to Telegram for your decision. **Do not proceed automatically.**
- **TTS node:** ElevenLabs, your `voice_id`, `model_id` flash for Shorts / multilingual-v2 for long. Save MP3 → S3.
- **Render node:** HTTP POST to your Remotion service with `{template, script, onscreen, audio_url, broll[], charts[]}` → MP4 → S3.
- **Thumbnail node:** Canva template fill (or image-gen) → S3.
- **SEO node** (Claude): returns `{title(≤60 chars, keyword-front), description(boilerplate filled), tags[], chapters[], hashtags[]}`.
- Write `status=ready`; Telegram message = thumbnail + title + private video link + **Approve / Reject** inline buttons.

### Workflow C — Publish (Trigger: Approve button)
`YouTube upload (privacyStatus=private, publishAt=slot) → set thumbnail → add to playlist → mark published`
- Schedule slots (e.g., Shorts 9:00/14:00/19:00, long-form 18:00). Nothing goes live without your tap.
- Wrap in n8n **error workflow**: on failure → retry once → if still failing, Telegram alert with the error. Use the job `id` as idempotency key so retries don't double-upload.

### Workflow D — Analytics (Schedule: daily 08:00)
`YouTube Analytics API → append rows to Google Sheet → (weekly) Claude summary`
- Sheet → **Looker Studio** dashboard: views, CTR, avg % viewed, subs/video, RPM, revenue.
- Weekly Claude node: "Given last 7 days of per-video metrics + their tags (topic/hook/title pattern/length), tell me which features correlate with high CTR & retention, and propose next week's topic weighting." This is the compounding edge.

### Workflow E — Cross-post (optional, later)
Push the same Shorts MP4 to Instagram Reels via the IG Graph API for free extra reach.

**Phase 5 done when:** a topic flows end-to-end to a "ready" Telegram preview, and tapping Approve publishes a private/scheduled video.

---

# PHASE 5.5 — Control & Input Points (you stay editor-in-chief)

This is a pipeline you steer, not an employee that runs off on its own. The LLM nodes run on *whatever input you give them*, so feeding your own news/idea works identically to an RSS-sourced topic.

### Default control posture (chosen): **watch every video, then approve**
- Workflow C does **not** auto-publish. The "ready" Telegram message includes a **private video link** — you watch the full video end-to-end, then tap **Approve** (publishes on the next slot) or **Reject**.
- Set the topic stage to *assisted, not auto*: the daily digest **waits for your greenlight** rather than auto-taking the top picks. (Change `Workflow A` so nothing enters production without your reply.)
- Net effect: two human gates — you pick the topics, and you watch + sign off on every finished video. Nothing reaches YouTube unseen.

### Three ways to inject your own ideas / news
| What you want | How | Build |
|---|---|---|
| "Make a video on this" + a news link | Message the Telegram bot a URL → triggers Workflow B on your link | n8n **Telegram Trigger** → set `topic`/`source_url` → Produce |
| Drop a batch of ideas for later | Add rows to a **Topic Inbox** Google Sheet (`topic, angle, format, priority`) | Workflow A reads the Sheet alongside RSS |
| Quick idea with your angle/notes | A bookmarked **n8n Form** (paste idea + take) | n8n **Form Trigger** → Produce |
| Make your idea jump the queue | Set `priority: high` on any of the above | sort the queue by priority before RSS topics |

### Edit before publish (not just approve/reject)
- Add an **Edit** path to the preview: the "ready" job lives as an editable row (Sheet/Notion or an n8n form pre-filled with the draft). Change the **hook, title, or thumbnail**, save, then approve.
- Common quick edits: rewrite the first line (hook), shorten the title, swap the thumbnail variant, cut a weak sentence.

### Change scope and rules anytime (prompts are your config)
- Want more credit-card content, a new RBI-rule beat, or a sharper angle? Edit the **rank prompt** (Workflow A) — plain English, takes 30 seconds.
- Want stricter compliance, a different tone, or a length change? Edit the **compliance block** / **script prompt**. No rebuild.

### The control dial (you can move it per content type)
- **Manual:** nothing moves without your explicit pick at each stage.
- **Assisted (your current setting):** it suggests topics, you greenlight; it produces; you watch + approve every video.
- **Mostly-auto (later, optional):** auto-takes top topics unless you veto in X hours; you still approve final publish.
- Mix freely — e.g., long-forms always manual, routine Shorts assisted.

---

# PHASE 6 — Remotion Templates (Day 6–10, parallel with Phase 5)

Two compositions, fully parameterized by props (n8n passes JSON):

- **Shorts** (1080×1920): animated word-by-word captions synced to audio, big number call-outs, b-roll layer (Pexels free clips), brand lower-third, last frame loops to first.
- **Long-form** (1920×1080): intro sting → section cards → **chart layer** (render Chart.js/D3 to PNG per data point and drop in as image sequences) → b-roll → outro CTA. The charts are your differentiator and cost ₹0.

Minimal render service (`~/render/server.js`):
```js
const express = require("express");
const { renderMedia, selectComposition } = require("@remotion/renderer");
const app = express(); app.use(express.json({limit:"5mb"}));
app.post("/render", async (req,res) => {
  try {
    const { template, props, out } = req.body;
    const serveUrl = "./build";                 // pre-bundled Remotion project
    const comp = await selectComposition({ serveUrl, id: template, inputProps: props });
    await renderMedia({ composition: comp, serveUrl, codec: "h264",
      outputLocation: out, inputProps: props });
    res.json({ ok:true, out });
  } catch(e){ res.status(500).json({ ok:false, error:String(e) }); }
});
app.listen(4000, () => console.log("render up"));
```
Run it under `pm2` so it restarts on crash: `npx pm2 start server.js`. Bundle the Remotion project once (`npx remotion bundle`) into `./build`.

**Phase 6 done when:** POSTing test props returns a clean MP4 in S3 for both templates.

---

# PHASE 7 — Dry Run & Soft Launch (Day 10–15)

1. Run 3 test topics fully → upload **private** → watch each at 1.5×. Fix: caption sync, render timing, voice pacing, thumbnail legibility at phone size.
2. Tune until: Shorts hook lands in <3s, long-form has no dead air, thumbnails read at thumbnail size.
3. **Go live** at start volume: 3 Shorts/day + 2 long-form/week. Keep the approval gate on every single one.
4. Begin manual cross-posting Shorts to Instagram/X (automate later).

---

# PHASE 8 — Monetization & Growth (Day 15+, ongoing)

- **YPP:** chase 500 subs (early fan-funding tier) → 1,000 subs + 4,000 watch-hours OR 10M Shorts views/90 days → apply. Expect monetization review ~30 days; the branded voice + original charts help you clear the "inauthentic content" check.
- **Affiliates (SEBI-safe, your real revenue):** sign up for credit-card and banking affiliate programs (networks like INRDeals/Cuelinks/vCommission carry card + bank offers; cards/banking are not securities, so no SEBI block). Add **disclosed** links to descriptions. Also deal/cashback programs for the "offers" content.
- **Sponsors:** approach fintech apps, neobanks, and tools once you've ~20k+ subs.
- **Owned audience:** add a newsletter signup (free tier of any ESP) by month 5 — this is the durable asset; YouTube is just the funnel.

---

# PHASE 9 — Your 1-Hour Day (steady state)

- **Morning 15 min:** read overnight topic digest in Telegram → greenlight/veto.
- **Afternoon 15 min:** clear any Fact-Check FLAGs; approve titles/thumbnails.
- **Evening 30 min:** watch each finished video **in full** (1.25–1.5× is fine) → final compliance eyeball → tap Approve. Skim yesterday's dashboard. *(At start volume — 3 Shorts ≈ 2 min + 1 long-form ≈ 8 min — full review fits comfortably in the 30 min.)*
- Everything else (ingest, research, script, voice, render, SEO, upload, reporting) runs itself.
- *Reality:* weeks 1–3 are 2–3 hrs/day while you debug. It drops to ~1 hr once stable.

---

## "No-bug" reliability checklist
- Pin Claude + ElevenLabs model versions; log every node's I/O to Postgres.
- Idempotency key (job `id`) on uploads; retries with backoff; error workflow → Telegram alert.
- Human gate before publish (catches both bugs and compliance).
- `pm2`/`docker restart: unless-stopped` so services self-heal; daily snapshot + workflow git export.
- Start at low volume, run clean for 7 days, *then* scale.

## Monthly cost (ex-Claude), this build
ElevenLabs Creator ~₹1,900 · EC2+S3 ~₹0 (credits, then ~₹1,500–2,500) · stock footage/Canva/RSS/SEO free tiers ~₹0 · domain ~₹70 · buffer ₹500 → **~₹4,000–5,000/mo**, well under ₹10k. Voice is the only thing that scales with volume; split Shorts to OpenAI TTS if it climbs.

## Milestones
- **Day 15:** pipeline live, publishing daily, ~1 hr/day.
- **Day 45:** YPP early tier (500 subs); first affiliate links live.
- **Day 90:** full YPP applied/approved; analytics loop driving content; 8k–25k subs.
- **Month 6:** 25k–80k subs; ₹40k–₹1.2L/mo blended (AdSense + cards/affiliate).
