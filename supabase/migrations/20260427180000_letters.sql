-- İstanbul Bekliyor — Mektup duvarı (letters wall).
--
-- Anyone can leave a short letter; targeted at a specific detainee or
-- the general wall. Optional anonymous (author_name = NULL).
--
-- Public read (visible only), insert via service-role only — same
-- pattern as manifesto_signatures.

CREATE TABLE IF NOT EXISTS letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- NULL = general wall (no specific recipient)
  detainee_id UUID REFERENCES detainees(id) ON DELETE SET NULL,
  -- NULL = anonymous; otherwise validated 2-50 chars
  author_name TEXT CHECK (author_name IS NULL OR length(author_name) BETWEEN 2 AND 50),
  message TEXT NOT NULL CHECK (length(message) BETWEEN 4 AND 280),
  ip_hash TEXT NOT NULL,
  user_agent TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS letters_recent_idx
  ON letters (created_at DESC) WHERE is_visible = true;

CREATE INDEX IF NOT EXISTS letters_by_detainee_idx
  ON letters (detainee_id, created_at DESC) WHERE is_visible = true;

-- One letter per IP per Istanbul-minute. Looser than manifesto's per-day
-- because writing several letters in a session is normal.
CREATE UNIQUE INDEX IF NOT EXISTS letters_ip_minute
  ON letters (
    ip_hash,
    date_trunc('minute', created_at AT TIME ZONE 'Europe/Istanbul')
  );

ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "letters_public_read" ON letters;
DROP POLICY IF EXISTS "letters_authenticated_write" ON letters;
CREATE POLICY "letters_public_read"
  ON letters FOR SELECT
  USING (is_visible = true);

CREATE OR REPLACE VIEW letters_stats AS
SELECT
  COUNT(*) FILTER (WHERE is_visible)::int AS total,
  COUNT(*) FILTER (
    WHERE is_visible
      AND created_at > NOW() - INTERVAL '24 hours'
  )::int AS last_24h,
  COUNT(DISTINCT detainee_id) FILTER (
    WHERE is_visible AND detainee_id IS NOT NULL
  )::int AS distinct_recipients
FROM letters;
