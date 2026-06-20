# n8n workflows (Phase 5)

Import each `*.json` into n8n (**Workflows → Import from File**). They're shipped
`active: false` — turn each on only after its credentials resolve and a manual test passes.

## The five workflows
| File | Trigger | Does |
|---|---|---|
| `A-ingest-rank.json` | Schedule 07:00 IST | RSS → dedupe vs `seen` → Claude ranks 5 topics → queues them → Telegram digest |
| `B-produce.json` | Execute-Workflow (per `job_id`) | research → script → **fact-check gate** → ElevenLabs TTS → Remotion render → SEO → `ready` + Telegram preview |
| `C-publish.json` | Telegram Approve/Reject button | YouTube upload (private + `publishAt` slot) → mark published |
| `D-analytics.json` | Schedule 08:00 IST | YouTube Analytics → Google Sheet (→ Looker Studio); weekly Claude summary |
| Workflow E (cross-post) | optional, later | push the same Shorts MP4 to Instagram Reels |

## Credentials to create in n8n (the JSON references these by name)
Open each node flagged with a credential and pick/create the matching credential — the
`id` values in the JSON (`PG_CRED`, `ANTHROPIC_CRED`, …) are placeholders n8n re-binds on import.

| Placeholder | Credential type | Notes |
|---|---|---|
| `ANTHROPIC_CRED` | **Header Auth** | header name `x-api-key`, value = your Claude API key |
| `PG_CRED` | **Postgres** | host `postgres`, db/user/pass from `infra/.env` |
| `TELEGRAM_CRED` | **Telegram API** | BotFather token |
| `AWS_CRED` | **AWS** | on EC2, prefer the instance IAM role; locally, keys |
| `YT_CRED` | **YouTube OAuth2** | client id/secret from Google Cloud; authorize with the brand Gmail (set app to **In production** for long-lived refresh tokens — Phase 4.1) |
| `GSHEETS_CRED` | **Google Sheets OAuth2** | for the analytics sheet |

## Environment variables n8n expects (set in `infra/docker-compose.yml` env or n8n's settings)
```
TELEGRAM_CHAT_ID      your chat id (from @userinfobot)
ELEVENLABS_API_KEY    ElevenLabs dashboard
ELEVENLABS_VOICE_ID   your locked anchor voice
ASSETS_BUCKET         e.g. yourbrand-assets
AWS_REGION            ap-south-1
RENDER_URL            http://host.docker.internal:4000  (the render worker)
ANALYTICS_SHEET_ID    the Google Sheet id behind Looker Studio
```

## Your control points (Phase 5.5)
- **Greenlight topics:** Workflow A only *queues* + notifies; you trigger Workflow B per chosen `job_id`.
- **Inject your own idea:** add a Telegram Trigger (message a URL) or n8n Form that sets
  `topic`/`source_url` and calls Workflow B — same path as an RSS topic.
- **Edit before publish:** the `ready` row is editable; change hook/title/thumbnail, then Approve.
- **Change the rules:** edit `prompts/*.md` and paste into the matching node — prompts are your config.

## Reliability (the "no-bug" checklist)
- The YouTube upload node has `retryOnFail` + 2 tries; the job `id` is the idempotency key.
- Add an n8n **Error Workflow** (Settings → Error Workflow) that posts failures to Telegram.
- Export workflows back to this folder after every change — treat them as code.

> The Claude prompts inside the HTTP nodes are condensed copies of `../prompts/*.md`.
> Edit the prompt file first (source of truth), then sync the node body.
