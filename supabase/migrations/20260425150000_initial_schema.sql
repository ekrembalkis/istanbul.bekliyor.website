-- İstanbul Bekliyor Campaign Management Schema
-- Run this in Supabase SQL Editor (idempotent: safe to re-run)

-- Planned tweets table
CREATE TABLE IF NOT EXISTS tweets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_number INTEGER NOT NULL,
  tweet_date DATE NOT NULL,
  theme TEXT NOT NULL,
  tweet_text TEXT NOT NULL,
  nano_prompt TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'ready', 'posted', 'skipped')),
  hashtags TEXT[] DEFAULT ARRAY['#İstanbulBekliyor'],
  algorithm_score INTEGER DEFAULT 0,
  algorithm_notes TEXT[],
  engagement_likes INTEGER DEFAULT 0,
  engagement_replies INTEGER DEFAULT 0,
  engagement_reposts INTEGER DEFAULT 0,
  engagement_views INTEGER DEFAULT 0,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign settings
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings (idempotent)
INSERT INTO settings (key, value) VALUES
  ('arrest_date', '"2025-03-19"'),
  ('account_handle', '"@istbekliyor"'),
  ('display_name', '"İSTANBUL BEKLİYOR"'),
  ('primary_hashtag', '"#İstanbulBekliyor"'),
  ('brand_colors', '{"red": "#E30A17", "white": "#FFFFFF", "dark": "#0C0C12", "gold": "#D4A843"}')
ON CONFLICT (key) DO NOTHING;

-- Style library: stores style cloning profiles with DNA, fingerprint, and quality metrics
CREATE TABLE IF NOT EXISTS style_library (
  username TEXT PRIMARY KEY,
  category TEXT DEFAULT 'diger',
  notes TEXT DEFAULT '',
  is_pinned BOOLEAN DEFAULT false,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  generated_count INTEGER DEFAULT 0,
  topics TEXT[] DEFAULT '{}',
  personality_dna JSONB,
  style_summary TEXT,
  fingerprint JSONB,
  tweets_since_summary INTEGER DEFAULT 0,
  tweets_since_dna INTEGER DEFAULT 0,
  extracted_tweet_count INTEGER DEFAULT 0,
  data_quality TEXT DEFAULT 'low' CHECK (data_quality IN ('high', 'medium', 'low')),
  topic_coverage JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE style_library ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on style_library" ON style_library;
DROP POLICY IF EXISTS "style_library_public_read" ON style_library;
DROP POLICY IF EXISTS "style_library_authenticated_write" ON style_library;
-- Read open (anon may need read for UI hydration); writes require authenticated session.
CREATE POLICY "style_library_public_read"
  ON style_library FOR SELECT USING (true);
CREATE POLICY "style_library_authenticated_write"
  ON style_library FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS style_library_updated_at ON style_library;
CREATE TRIGGER style_library_updated_at
  BEFORE UPDATE ON style_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Webhook counter increment function (called by style-webhook.js)
CREATE OR REPLACE FUNCTION increment_style_counters(target_username TEXT)
RETURNS void AS $$
BEGIN
  UPDATE style_library
  SET tweets_since_summary = COALESCE(tweets_since_summary, 0) + 1,
      tweets_since_dna = COALESCE(tweets_since_dna, 0) + 1,
      updated_at = NOW()
  WHERE username = target_username;
END;
$$ LANGUAGE plpgsql;

-- Image storage bucket (run in Supabase dashboard > Storage)
-- Create bucket: "tweet-images" (public)

-- Row Level Security
-- Read: public (anon JWT may SELECT)
-- Write: authenticated only — anon JWT can NOT INSERT/UPDATE/DELETE.
-- Admin operations should use the service-role key from a server context only.
ALTER TABLE tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on tweets" ON tweets;
DROP POLICY IF EXISTS "tweets_public_read" ON tweets;
DROP POLICY IF EXISTS "tweets_authenticated_write" ON tweets;
CREATE POLICY "tweets_public_read"
  ON tweets FOR SELECT USING (true);
CREATE POLICY "tweets_authenticated_write"
  ON tweets FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on settings" ON settings;
DROP POLICY IF EXISTS "settings_public_read" ON settings;
DROP POLICY IF EXISTS "settings_authenticated_write" ON settings;
CREATE POLICY "settings_public_read"
  ON settings FOR SELECT USING (true);
CREATE POLICY "settings_authenticated_write"
  ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tweets_updated_at ON tweets;
CREATE TRIGGER tweets_updated_at
  BEFORE UPDATE ON tweets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
