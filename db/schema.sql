-- Phase 5 — job + dedupe tables. Auto-loaded by Postgres on first boot
-- (mounted into /docker-entrypoint-initdb.d by infra/docker-compose.yml).
-- n8n uses its OWN tables in the same DB; these live alongside them.

-- ---------------------------------------------------------------------------
-- jobs: one row per video as it flows queued -> scripted -> ... -> published
-- Mirrors the "Job schema" in the build plan (Phase 5).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jobs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type         TEXT NOT NULL CHECK (type IN ('short', 'long')),
    status       TEXT NOT NULL DEFAULT 'queued'
                 CHECK (status IN ('queued','scripted','checked','rendered',
                                   'ready','published','failed')),
    topic        TEXT,
    brief        TEXT,
    angle        TEXT,
    fact_pack    JSONB DEFAULT '{}'::jsonb,
    sources      JSONB DEFAULT '[]'::jsonb,
    script       TEXT,
    onscreen     JSONB DEFAULT '[]'::jsonb,
    caption      TEXT,
    factcheck    TEXT CHECK (factcheck IN ('PASS','FLAG') OR factcheck IS NULL),
    flags        JSONB DEFAULT '[]'::jsonb,
    audio_url    TEXT,
    video_url    TEXT,
    thumb_url    TEXT,
    seo          JSONB DEFAULT '{}'::jsonb,
    priority     TEXT DEFAULT 'normal' CHECK (priority IN ('high','normal','low')),
    source_url   TEXT,                     -- set when YOU inject a topic via Telegram/form
    youtube_id   TEXT,
    publish_at   TIMESTAMPTZ,              -- scheduled slot
    error        TEXT,                     -- last failure detail for the error workflow
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_status   ON jobs (status);
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs (priority, created_at);

-- keep updated_at fresh on every change
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_jobs_touch ON jobs;
CREATE TRIGGER trg_jobs_touch BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ---------------------------------------------------------------------------
-- seen: dedupe ledger for Workflow A. Hash of the RSS item (url or title+date)
-- so the same headline never re-enters the topic queue.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seen (
    hash       TEXT PRIMARY KEY,           -- sha256 of normalized url/title
    url        TEXT,
    title      TEXT,
    source     TEXT,
    seen_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seen_at ON seen (seen_at);

-- ---------------------------------------------------------------------------
-- node_log: optional I/O log per node (the "no-bug" checklist asks for this).
-- Workflow B can insert here after each Claude/ElevenLabs/Remotion node.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS node_log (
    id         BIGSERIAL PRIMARY KEY,
    job_id     UUID REFERENCES jobs(id) ON DELETE CASCADE,
    node       TEXT NOT NULL,
    input      JSONB,
    output     JSONB,
    ms         INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_node_log_job ON node_log (job_id, created_at);
