# Phase 2 — Finplaza Brand & Creative Kit 🎨

Everything you need to make Finplaza *look* and *sound* like one channel. This folder is
generated + hand-tuned. If you're new: **read top to bottom once**, then use it as a reference.

> **Source of truth for code:** colours, fonts, name and handle live in
> [`render/src/brand.ts`](../../render/src/brand.ts). Change them there and every rendered
> video updates automatically.

---

## 0. Your locked decisions
| Thing | Choice |
|---|---|
| Brand name / handle | **Finplaza** / **@finplaza** *(working — see the upgrade note below)* |
| Personality | **Bold & energetic** — punchy, youthful, scroll-stopping |
| Colours | **Money green + deep navy** (exact hex below) |
| Fonts | **Anton** (display) + **Inter** (body) |
| Voice | ElevenLabs anchor voice — *you create it next, guide included* |

### ⚠️ Optional name upgrade (your call)
You said you're open to a better name. The naming pass scored **"Finplaza" 6/10** for a
*bold/energetic* channel (it's clean and safe, but "plaza" feels institutional and it sits in
the crowded Paisabazaar/Policybazaar family). Its top alternative was **PaisaPunch (@paisapunch, 9/10)**.
Full ranked list + honest verdict: [`name-options.md`](name-options.md).
**No pressure** — Finplaza is perfectly usable. If you switch, it's literally two lines in
[`render/src/brand.ts`](../../render/src/brand.ts). **Before committing to ANY name, check the
@handle is free on YouTube/Instagram/X and do a quick trademark check** (the agent can't verify availability).

---

## 1. Colours 🎨  (locked in `brand.ts`)
**Primary (use these 3 the most):**
| Role | Hex | Use |
|---|---|---|
| Deep navy | `#0B1220` | backgrounds, everything sits on this |
| Money green | `#16C784` | the brand colour — accents, positives, logo |
| Gold | `#F6C544` | **big numbers / stats only** (₹50k, 5%, etc.) |

**Supporting:** `#111A2E` (navy-2 / panels), `#1FE08F` (bright green hover/glow),
`#F4F7FB` (off-white text), `#9AA7BD` (muted sub-text), `#FF5C5C` (**alerts & the crypto
compliance bar only** — never decorative).

> Rule of thumb: navy background → green for brand/positive → gold for the one number you
> want people to remember → red **only** for warnings/compliance.

---

## 2. Fonts 🔤
- **Anton** — heavy condensed display. UPPERCASE for thumbnails, Shorts captions, big numbers.
- **Inter** — clean body. Sentence case for sub-lines, descriptions, disclaimers.

Both are **free Google Fonts**. In Canva, just search and pick "Anton" and "Inter".
In the video renderer they already load automatically ([`render/src/fonts.ts`](../../render/src/fonts.ts)).
Voice/usage rules + the thumbnail formula are in [`identity.md`](identity.md).

---

## 3. Logo 🟢  ([`logo/`](logo/))
| File | What it is | Use it for |
|---|---|---|
| **`logo-avatar.svg`** | clean **Fp** monogram, circle-safe | **➡️ your channel profile picture** (export PNG ~800×800) |
| `logo-primary.svg` | full **Fp + "Finplaza"** lockup (the winning concept B) | banner, end-cards — *tidy the wordmark spacing in Canva first* |
| `logo-concept-a/b/c.svg` | the 3 directions explored (B won) | reference / pick a different one if you prefer |

**Important:** these SVGs are **AI-generated drafts** — great starting points, not final art.
Open them in a browser to preview. The monogram avatar is clean and ready; the wordmark
lockup needs a quick spacing cleanup in Canva. When happy, **export PNG** (and an 800×800 avatar).
*(Anton must be installed wherever you open them, or the text falls back to a default font.)*

---

## 4. Templates 📐  ([`templates/`](templates/))
| File | Size | What it is |
|---|---|---|
| `thumbnail-template.svg` | 1280×720 | editable thumbnail layout (headline + gold number + photo box) |
| `shorts-safezone.svg` | 1080×1920 | **guide only** — shows where NOT to put text (UI covers it). Design inside the green box |
| `lower-third.svg` | 1920×1080 | name/section strip style |
| `intro-card.svg` | 1920×1080 | opening card |
| `outro-card.svg` | 1920×1080 | subscribe / end-screen card |

**How to use in Canva (beginner):** create a design at the right size → **Uploads → upload the
.svg** → drop it in as a layer → swap the placeholder text → export. For the safe-zone, keep it
as a **locked background guide** while you design, then **hide/delete it before exporting** (never publish the red overlay).

> Note: your **videos** already get lower-thirds, intro and outro **automatically** from the
> Remotion code. These SVGs are for **manual thumbnails** + as the visual spec.

---

## 5. Copy / text assets ✍️  ([`copy/`](copy/))
Ready to paste, all compliance-checked (no buy/sell, disclaimers + affiliate disclosure included):
- [`channel-about.md`](copy/channel-about.md) → paste into your channel **About** section
- [`description-boilerplate.md`](copy/description-boilerplate.md) → reusable video description (with `{{placeholders}}`)
- [`pinned-comment.md`](copy/pinned-comment.md) → engagement pinned comment
- [`end-screen-cta.md`](copy/end-screen-cta.md) → outro on-screen + spoken CTAs
- [`thumbnail-copy-formulas.md`](copy/thumbnail-copy-formulas.md) → 6 hook formulas for thumbnail text

Plus [`prompts/compliance-block.md`](../../prompts/compliance-block.md) = the rules every script obeys.
*(The end-screen and About copy were auto-corrected to remove "get richer"-style return promises
and to add the affiliate disclosure — they're safe as saved.)*

---

## 6. The voice 🎙️  ([`voice/elevenlabs-voice-guide.md`](voice/elevenlabs-voice-guide.md))
Your complete beginner walkthrough: sign up, Creator plan, create + **lock ONE voice**, the exact
starting settings, and **3 ready-to-read test scripts**. When you've made the voice, copy its
`voice_id` into [`infra/.env`](../../infra/.env.example) as `ELEVENLABS_VOICE_ID`. That's the
**last manual step** of Phase 2.

---

## 7. Your existing channel (18 subs) — rebrand checklist ♻️
18 subs is tiny, so **rebrand what you have** rather than starting over:
- [ ] Check it's a **Brand Account** (Settings → Advanced). If it's a personal channel, use
      YouTube's **"move channel to a Brand Account"** flow (keeps subs + videos).
- [ ] Rename channel → **Finplaza**; claim **@finplaza** (handle changeable every 14 days).
- [ ] Upload the **avatar** (`logo-avatar.svg` → PNG) + a banner; paste `channel-about.md` into **About**.
- [ ] Turn on **2-Step Verification** on the Google account (required for monetization later).
- [ ] Set any old off-brand videos to **unlisted/private** so the channel reads as a clean finance brand.

---

## ✅ Phase 2 "done when" checklist
- [x] Logo + colour/font system → `logo-avatar.svg` + [`brand.ts`](../../render/src/brand.ts)
- [x] Thumbnail + lower-third / intro / outro templates → [`templates/`](templates/)
- [x] Reusable text saved (description, pinned, CTA, About, compliance block) → [`copy/`](copy/)
- [ ] **One locked ElevenLabs voice** → follow the guide, save the `voice_id`  ← *your next action*
- [ ] Finalize the logo PNG in Canva + apply branding to the channel

---

### Want to regenerate this kit?
The generator workflow is saved as a script — change the brand brief at the top and re-run it
(ask me to "re-run the brand kit"). Colours/fonts/name all flow from
[`render/src/brand.ts`](../../render/src/brand.ts).
