-- İstanbul Bekliyor — Bildirge (manifesto) imzaları.
-- Public read (only visible rows), insert via service-role only (no anon policy).

CREATE TABLE IF NOT EXISTS manifesto_signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 2 AND 50),
  city TEXT NOT NULL CHECK (length(city) BETWEEN 2 AND 60),
  message TEXT CHECK (message IS NULL OR length(message) <= 200),
  ip_hash TEXT NOT NULL,
  user_agent TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS manifesto_signatures_recent_idx
  ON manifesto_signatures (created_at DESC)
  WHERE is_visible = true;

-- One signature per IP per Istanbul-day. Server-side guarantee against rapid
-- re-submission from the same client (rate-limit + this together).
CREATE UNIQUE INDEX IF NOT EXISTS manifesto_signatures_one_per_ip_per_day
  ON manifesto_signatures (
    ip_hash,
    ((created_at AT TIME ZONE 'Europe/Istanbul')::date)
  );

ALTER TABLE manifesto_signatures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "manifesto_public_read" ON manifesto_signatures;
DROP POLICY IF EXISTS "manifesto_authenticated_write" ON manifesto_signatures;
CREATE POLICY "manifesto_public_read"
  ON manifesto_signatures FOR SELECT
  USING (is_visible = true);
-- INSERT/UPDATE/DELETE only via service-role (no anon/authenticated policy).
-- Service-role bypasses RLS entirely so writes still work from the server.

-- Aggregated stats — used by the home counter and the live wall header.
CREATE OR REPLACE VIEW manifesto_stats AS
SELECT
  COUNT(*) FILTER (WHERE is_visible)::int AS total,
  COUNT(*) FILTER (
    WHERE is_visible
      AND created_at > NOW() - INTERVAL '24 hours'
  )::int AS last_24h,
  MAX(created_at) FILTER (WHERE is_visible) AS last_signed_at
FROM manifesto_signatures;
