Confirmed — the workflow already hard-codes exactly the settings the user described: `stability: 0.5`, `similarity_boost: 0.75`, `style: 0.15`, model `eleven_flash_v2_5` for Shorts and `eleven_multilingual_v2` for long. The voice_id and API key come from env vars. The guide below matches this exactly.

---

# Finplaza Anchor Voice — Complete Beginner Setup (ElevenLabs)

A friendly, click-by-click guide to give Finplaza its voice. No prior ElevenLabs experience needed. By the end you'll have ONE locked-in voice powering every Short and long-form video automatically.

Finplaza's vibe: **Bold and energetic** — punchy, youthful, scroll-stopping. The voice has to match: confident, fast, high-contrast, "stop scrolling and listen to me" energy — but still clear enough to understand at 1.5x speed.

---

## Step 1 — Sign up and pick the Creator plan (~$22/mo)

1. Go to **https://elevenlabs.io** and click **Sign up** (top right). Use your Google account or an email + password. It's free to start.
2. Once you're in, click your **profile icon (bottom-left)** -> **Subscription** (or **Billing**).
3. Choose the **Creator plan** (~$22/month; ~$11 if billed yearly).

**Why the Creator plan specifically — don't skip this:**

- **Commercial rights / license.** The Free and Starter tiers do NOT give you a clean commercial license for monetized YouTube. Finplaza is a business channel, so you need this. Creator includes it.
- **Professional Voice Cloning (PVC).** Only Creator and above unlock high-quality cloning from your own recordings. If you ever want Finplaza's voice to be *your* voice (or a hired voice artist's), you need this tier.
- **Enough characters.** Creator gives ~100,000 characters/month (roughly 100k characters ≈ ~2 hours of audio). Plenty for a starting channel doing daily Shorts + a few long-forms.
- **Higher quality audio output** and priority over free users.

Pay, confirm, and you're on Creator. Done.

---

## Step 2 — Two paths: Stock/Designed voice vs Clone your own

You have two ways to get Finplaza's anchor voice. Here's the honest beginner recommendation.

### Path A — Use a stock / "Designed" voice (RECOMMENDED for you)

ElevenLabs ships with a big **Voice Library** of ready-made, professional, commercially-usable voices. You browse, preview, and add one to your account in about 5 minutes.

**Why this is the right call for a beginner:**
- **Zero recording, zero gear.** No mic, no quiet room, no editing.
- **Consistent every time.** Stock voices are rock-solid — no weird breaths or clone glitches.
- **Instant.** You can be live today.
- **Still on-brand.** The library has plenty of young, high-energy Indian-English and neutral-English voices that nail the punchy Finplaza feel.

### Path B — Clone your own voice (do this later, not now)

Record ~3+ minutes (Instant Clone) or ~30 min of clean audio (Professional Voice Cloning) of you or a hired narrator, and ElevenLabs builds a custom voice.

**Why NOT for your first setup:** it needs a decent mic, a silent room, careful recording, and trial-and-error. Great for making Finplaza unique *once the channel is working* — but it'll slow down your launch and a bad recording = a bad voice forever.

> **Recommendation: Start with Path A (a stock Designed voice).** Get Finplaza shipping videos this week. Upgrade to a cloned voice in a month or two once everything runs smoothly. The setup steps below are identical either way — both end with a `voice_id` you copy.

### How to find a Bold & energetic voice (Path A)

1. Left sidebar -> **Voices** -> **Voice Library** (or **Explore Voices**).
2. Use the filters/search:
   - **Use case:** Social media / Narrative / Advertisement
   - **Age:** Young
   - **Accent:** Indian (or American/British if you prefer neutral English) — try both
   - **Search terms** that fit Finplaza: `energetic`, `punchy`, `confident`, `upbeat`, `narration`, `youthful`
3. Click the **play ▶ button** on a few. Read your brand vibe out loud in your head: *scroll-stopping, high-contrast, youthful*. Pick the one that makes you lean in.
4. When you love one, click **Add to my voices** (or the **+ / Add** button). It now appears under **Voices -> My Voices**.

Pick **one**. (Seriously — see the lock warning in Step 7.)

---

## Step 3 — Exact starting settings (and what each does in plain words)

When you open a voice (or use the **Settings / sliders** in the speech panel), you'll see these. Set them like this to start:

| Setting | Starting value | What it actually does (plain English) |
|---|---|---|
| **Stability** | **~50** (0.50) | How calm vs expressive the voice is. **Low** = more emotional, energetic, but can sound erratic/random run-to-run. **High** = steady and monotone. **50 is the sweet spot:** lively enough for Finplaza's energy, consistent enough to not sound unhinged. |
| **Similarity** (Similarity Boost) | **~75** (0.75) | How hard the AI tries to sound exactly like the original voice. **Higher** = closer to the source, but too high can drag in recording artifacts. **75** keeps it faithful and clean. |
| **Style** (Style Exaggeration) | **~15** (0–20 range) | How much it amplifies the voice's expressive/dramatic flair. **0** = flat. **Higher** = more theatrical (good for hype) but slower and can hurt clarity. For Finplaza, **15** adds punch without garbling words. Stay ≤20. |
| **Speaker Boost** | **On** | Small toggle that sharpens fidelity to the chosen voice. Leave it on. |

> Good news: Finplaza's automation **already sends exactly these** — `stability 0.5`, `similarity_boost 0.75`, `style 0.15`. So this table is mainly so you understand what's happening and can preview/tune in the ElevenLabs web app. The sliders in the website are just for your ear-testing; the real production values live in the workflow.

---

## Step 4 — Energetic-but-clear tuning: Shorts vs Long-form

Two different jobs, two different AI models. **Finplaza's automation picks the model for you automatically** based on whether the item is a Short or a long-form video:

| Format | Model used | Why |
|---|---|---|
| **Shorts** (vertical, ~30–60s, fast hooks) | **`eleven_flash_v2_5`** | Super fast and cheap to generate, low latency, punchy. Perfect for high-volume daily Shorts where speed and that snappy energy matter most. |
| **Long-form** (horizontal, multi-minute explainers) | **`eleven_multilingual_v2`** | Highest quality, most natural and stable over long passages. Handles longer scripts and mixed Hindi/English finance terms more gracefully. |

**Tuning advice for "energetic but still clear":**
- For **Shorts**: you *want* the high-energy edge. The default `style 0.15` + `stability 0.5` gives that. If a Short ever sounds too frantic/garbled, nudge **Stability up to ~0.55–0.6** in your test (calmer = clearer). If it sounds flat, nudge **Style up toward 0.20**.
- For **Long-form**: clarity wins over hype because people listen for minutes. If a long video sounds tiring, raise **Stability to ~0.55–0.6** and drop **Style to ~0.10**.
- **Write punchy scripts.** Short sentences. One idea per line. The voice can only be as scroll-stopping as the words. Use the test scripts below.

You don't have to set the model anywhere — it's automatic. This section is just so you understand why two videos can sound slightly different.

---

## Step 5 — Find and COPY the voice_id

Every ElevenLabs voice has a unique ID (looks like `21m00Tcm4TlvDq8ikWAM`). This is the single most important thing to copy.

**Easiest way:**
1. Left sidebar -> **Voices** -> **My Voices**.
2. Find your chosen Finplaza voice. Click the **three-dot menu (⋮)** on its card -> **Copy Voice ID** (sometimes labeled **View / Copy ID**).
3. It's now on your clipboard. Paste it somewhere safe for a second (a notepad).

**If you don't see "Copy Voice ID":**
- Click the voice to open it; the **Voice ID** is shown in the details/settings panel — copy it there.
- Or click into the voice and look at your browser's address bar — the long code in the URL is often the voice_id.

**Also grab your API key now (you'll need it next):**
1. Click your **profile icon (bottom-left)** -> **API Keys** (or **Profile + API Key**).
2. Click **Create API Key** (name it `finplaza-n8n`), then **Copy** it. It looks like `sk_xxxxxxxxxxxxxxxx`.
3. ⚠️ You can only see it once. Paste it into your notepad too. Treat it like a password — never share it, never commit it to GitHub.

---

## Step 6 — EXACTLY where to paste them (`infra/.env`)

Finplaza's automation reads the voice and key from environment variables. The n8n **Workflow B (produce)** calls ElevenLabs like this (it literally reads `$env.ELEVENLABS_VOICE_ID` and `$env.ELEVENLABS_API_KEY`), so the names must match **exactly**.

1. On your server/box, go to the **`infra/`** folder.
2. If you haven't already, copy the template to a real env file (the real one is never committed):
   ```bash
   cp infra/.env.example infra/.env
   ```
3. Open **`infra/.env`** in an editor and add these two lines (paste your real values from your notepad):
   ```bash
   # --- ElevenLabs (anchor voice) ---
   ELEVENLABS_VOICE_ID=PASTE_YOUR_VOICE_ID_HERE
   ELEVENLABS_API_KEY=PASTE_YOUR_API_KEY_HERE
   ```
   - **No quotes**, **no spaces** around the `=`. Example: `ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM`
4. Save the file. Lock its permissions so it stays private:
   ```bash
   chmod 600 infra/.env
   ```
5. **Restart n8n so it picks up the new variables** (without this, n8n won't see them). In the `infra/` folder:
   ```bash
   docker compose up -d
   ```
   (or restart however you start your stack).

**How it all connects:** n8n **Workflow B** (the "produce" workflow) sends your script to `https://api.elevenlabs.io/v1/text-to-speech/<your voice_id>`, authenticated with your API key, and gets back an MP3 — using `eleven_flash_v2_5` for Shorts and `eleven_multilingual_v2` for long-form, with stability 0.5 / similarity 0.75 / style 0.15 baked in. You do **not** edit the workflow for voice settings — just set these two env vars and you're done.

> ⚠️ **Never** put the API key or voice_id directly inside the workflow JSON or commit `infra/.env` to git. Env vars only.

---

## Step 7 — LOCK ONE VOICE FOREVER 🔒

**Pick ONE voice and never change it.** This is a branding rule, not a technical one.

- A YouTube channel's voice **is** its identity. Viewers subconsciously recognize Finplaza by its sound. Swapping voices mid-channel feels like a different channel and **breaks trust and recognition** — the opposite of what a bold, scroll-stopping brand needs.
- Once you set `ELEVENLABS_VOICE_ID`, **leave it.** Don't "try a new voice this week." Inconsistency quietly kills retention and subscriber loyalty.
- The only acceptable time to change: a **deliberate, planned, one-time** upgrade (e.g., moving from a stock voice to a polished cloned voice in a few months) — and even then, do it once and re-lock.
- Test thoroughly **before** you commit (use the scripts below). Choose like it's permanent, because for Finplaza, it is.

**Decide once. Lock it. Move on to making great videos.**

---

## Three ready-to-read TEST SCRIPTS (~30s each)

Paste each into the ElevenLabs speech box (or run through Workflow B) with your candidate voice. Listen for: Is it punchy? Is it clear at speed? Does it make you want to keep listening? If yes to all three — you found Finplaza's voice.

---

### Test 1 — Shorts hook (Credit cards) · use `eleven_flash_v2_5`

> Stop. Your credit card is quietly charging you forty-two percent a year — and the bank is hoping you never notice. Here's the trap: you pay the "minimum due," feel responsible, and your balance barely moves. That's not a payment. That's a leash. Every rupee you don't clear gets hit with interest, and then the interest earns interest. Pay the FULL amount, every single month, on time — or the card owns you. Credit cards aren't evil. Used right, they're free money for forty-five days. Used wrong, they're the most expensive loan you'll ever take. Which one are you? Follow for more money moves they don't teach you.

---

### Test 2 — Long-form open (RBI rule) · use `eleven_multilingual_v2`

> The RBI just changed a rule, and almost nobody is talking about how much it affects your money. So in the next few minutes, I'm going to break it down in plain Hindi-English — no jargon, no fluff, just what it means for your wallet. Here's the big idea: the Reserve Bank of India sets the rules that every bank, every lender, and every payment app in the country has to follow. When the RBI tightens a rule, your loan EMIs, your savings interest, and even your UPI limits can shift. Most people find out only when the money's already gone. Not you. By the end of this video, you'll understand exactly what changed, why the RBI did it, and the three things you should do this week to stay ahead. Let's get into it.

---

### Test 3 — Crypto explainer (includes ASCI disclaimer) · use `eleven_flash_v2_5` for Shorts or `eleven_multilingual_v2` for long

> Everyone's asking me about crypto again, so let's keep it simple. Cryptocurrency is digital money that runs on a network of computers instead of a bank. Bitcoin, Ethereum, and thousands of others rise and fall fast — sometimes thirty percent in a day. That volatility is exactly why people get rich, and exactly why people get wiped out. Before you put in a single rupee, hear this clearly. Crypto products and NFTs are unregulated and can be highly risky. There may be no regulatory recourse for any loss. So never invest money you can't afford to lose, do your own research, and treat it as the high-risk corner of your portfolio — not your foundation. Smart investing isn't about the hottest coin. It's about not blowing up. Follow for finance that actually protects you.

---

**You're set.** One locked voice, two auto-selected models, the right starting settings, and a `voice_id` + API key sitting safely in `infra/.env` for Workflow B to use. Go make Finplaza loud. 🚀
