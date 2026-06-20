# Faceless Finance Channel — Automation Repo

Code + config for the pipeline in [`Finance-Channel-End-to-End-Build-Plan.md`](Finance-Channel-End-to-End-Build-Plan.md):
a compliant, mostly-automated Indian personal-finance YouTube channel with a **human
approval gate before every publish**.

> Stack: Gmail/Brand Account → YouTube → n8n + Claude + ElevenLabs + Remotion on one EC2 box
> → Telegram approval gate → YouTube publish → Looker Studio.

## What's in here (the codeable phases)
```
infra/        Phase 3 — docker-compose (n8n + Postgres + Caddy auto-HTTPS) + backups
db/           Phase 5 — Postgres schema (jobs / seen / node_log)
prompts/      Phase 2/5 — the Claude prompts that ARE your editorial config
render/       Phase 6 — Remotion Shorts + LongForm templates + render worker (Express)
workflows/    Phase 5 — the five n8n workflows as importable JSON
assets/brand/ Phase 2 — drop your logo / colors / fonts here
```
The rest of the plan (Gmail, YouTube Brand Account, ElevenLabs voice, Google Cloud OAuth,
domain, affiliate signups) is **manual account setup** — follow the build plan doc for those.

## The pipeline at a glance
```
        ┌─────────────── you steer here ───────────────┐
RSS ─▶ A: rank ─▶ Telegram digest ─▶ (greenlight) ─▶ B: produce
                                                        │  research → script
                                                        │  → FACT-CHECK GATE
                                                        │  → TTS → render → SEO
                                                        ▼
                                          Telegram preview + Approve/Reject
                                                        │ (you watch full video)
                                                        ▼
                                   C: publish ─▶ YouTube (private + scheduled slot)
                                                        │
                                   D: analytics ─▶ Google Sheet ─▶ Looker Studio
```
A `job` row (see [db/schema.sql](db/schema.sql)) flows `queued → scripted → checked →
rendered → ready → published`, one step per node, with two human gates: **you pick topics**
and **you watch + approve every finished video**.

## Bring-up order
1. **Accounts & brand** — Build Plan Phases 1–2 (manual). Lock the ElevenLabs voice id.
2. **Infra** — Build Plan Phase 3:
   ```bash
   # on the EC2 box, in ~/stack (copy of infra/)
   cp .env.example .env && nano .env   # fill PG_PASS, N8N_KEY, N8N_HOST; chmod 600 .env
   docker compose up -d                # n8n live over HTTPS via Caddy; schema auto-loads
   ```
3. **Render worker** — Build Plan Phase 6:
   ```bash
   cd render && npm ci && npx pm2 start ecosystem.config.js && npx pm2 save
   curl localhost:4000/health
   ```
4. **API keys** — Build Plan Phase 4 (Claude, ElevenLabs, Telegram, YouTube OAuth **in
   production mode**, Google Sheets). Create the matching n8n credentials.
5. **Workflows** — import `workflows/*.json`, bind credentials + env vars
   (see [workflows/README.md](workflows/README.md)), test each, then activate.
6. **Dry run** — Build Plan Phase 7: 3 test topics → private uploads → tune → go live at
   3 Shorts/day + 2 long-form/week, approval gate on every one.

## Compliance is baked in, not bolted on
[`prompts/compliance-block.md`](prompts/compliance-block.md) goes into every script prompt;
[`prompts/factcheck.md`](prompts/factcheck.md) runs a **fresh, skeptical** check that can
fail the gate; [render/src/components/Disclaimer.tsx](render/src/components/Disclaimer.tsx)
renders the ASCI crypto bar ≥5s when needed. No buy/sell/hold, no price targets, education +
post-facto news only. The human gate is the final firewall.

## Editing the channel = editing config
- More credit-card content / new beat → edit [prompts/rank.md](prompts/rank.md).
- Tone / length / stricter compliance → edit the script + compliance prompts.
- Brand colors / fonts / name → [render/src/brand.ts](render/src/brand.ts).
No rebuilds — the prompts and brand file are the dials.

## Costs (from the plan)
~₹4,000–5,000/mo (ElevenLabs Creator is the only thing that scales with volume; split Shorts
to a cheaper TTS if it climbs). EC2 runs ~free on your $120 credits for ~4 months on `t3.medium`.

## Status
Scaffolding + infra + DB + prompts + Remotion templates + n8n workflow JSON are in place.
Next real-world steps are the manual account setup and wiring live credentials — none of which
can be done from this repo. See the build plan doc for those, phase by phase.
