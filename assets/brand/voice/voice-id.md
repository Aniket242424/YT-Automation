# 🔒 Finplaza — Locked Anchor Voice

**ElevenLabs Voice ID:** `1qaDMTNewpz5zBaenVio`

This is the ONE voice for the whole channel — do not change it once you're publishing
(consistency = your channel's identity).

## Where it gets used
At Phase 3, this goes into [`infra/.env`](../../../infra/.env.example) as:
```
ELEVENLABS_VOICE_ID=1qaDMTNewpz5zBaenVio
```
n8n **Workflow B** reads it to generate every voiceover.

## Production voice settings (set in code, NOT the ElevenLabs web UI)
These live in the TTS node of [`workflows/B-produce.json`](../../../workflows/B-produce.json),
so the web-playground sliders don't affect your automation:
| Setting | Value | Why |
|---|---|---|
| Stability | `0.50` | balanced — consistent but still expressive |
| Similarity | `0.75` | stays true to the voice |
| Style | `0.15` | a little energy, not over-acted |
| Model | `eleven_flash_v2_5` (Shorts) / `eleven_multilingual_v2` (long) | both handle Hindi/Hinglish |

> Language: **Hinglish** (Roman-script Hindi + English finance terms). If a Hindi word ever
> mispronounces, write that one word in Devanagari (देवनागरी) in the script.
