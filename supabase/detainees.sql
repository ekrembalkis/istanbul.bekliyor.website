-- İstanbul Bekliyor — Siyasi Tutuklular (Detainees) Schema
-- Run in Supabase SQL Editor after schema.sql

CREATE TABLE IF NOT EXISTS detainees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  arrest_date DATE NOT NULL,
  release_date DATE,
  photo_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 100,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS detainees_order_idx ON detainees (display_order, arrest_date);
CREATE INDEX IF NOT EXISTS detainees_featured_idx ON detainees (is_featured) WHERE is_featured = true;

-- Public read RLS
ALTER TABLE detainees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "detainees_public_read" ON detainees;
CREATE POLICY "detainees_public_read" ON detainees FOR SELECT USING (release_date IS NULL OR release_date > CURRENT_DATE - INTERVAL '30 days');

-- Computed view: day_count from arrest_date
CREATE OR REPLACE VIEW detainees_with_days AS
SELECT
  d.*,
  GREATEST(0, EXTRACT(DAY FROM (NOW() - d.arrest_date::timestamp))::int) AS day_count
FROM detainees d
ORDER BY d.is_featured DESC, d.display_order ASC, d.arrest_date ASC;

-- Seed: featured İmamoğlu
INSERT INTO detainees (slug, name, title, arrest_date, photo_url, is_featured, display_order)
VALUES
  ('ekrem-imamoglu', 'Ekrem İmamoğlu', 'İBB Başkanı', '2025-03-19', '/imamoglu.jpg', true, 1)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    title = EXCLUDED.title,
    arrest_date = EXCLUDED.arrest_date,
    photo_url = EXCLUDED.photo_url,
    is_featured = EXCLUDED.is_featured,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();
