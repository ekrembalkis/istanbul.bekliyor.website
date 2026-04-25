-- İstanbul Bekliyor — Tutuklu profil sayfaları için biyografi + olay timeline.
-- Run after 20260425150001_detainees.sql.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Biography column on detainees (markdown body)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE detainees ADD COLUMN IF NOT EXISTS bio_md TEXT;

-- Recreate the computed view to pick up bio_md.
-- Postgres OR REPLACE refuses column shape changes, so drop + recreate.
DROP VIEW IF EXISTS detainees_with_days;
CREATE VIEW detainees_with_days AS
SELECT
  d.*,
  GREATEST(0, EXTRACT(DAY FROM (NOW() - d.arrest_date::timestamp))::int) AS day_count
FROM detainees d
ORDER BY d.is_featured DESC, d.display_order ASC, d.arrest_date ASC;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Detainee events table — timeline of arrests, hearings, rulings, etc.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS detainee_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  detainee_id UUID NOT NULL REFERENCES detainees(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'arrest', 'detention', 'indictment', 'hearing', 'ruling',
    'release', 'statement', 'transfer', 'other'
  )),
  title TEXT NOT NULL,
  description TEXT,
  source_url TEXT,
  source_label TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS detainee_events_timeline_idx
  ON detainee_events (detainee_id, event_date DESC, display_order DESC);

ALTER TABLE detainee_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "detainee_events_public_read" ON detainee_events;
DROP POLICY IF EXISTS "detainee_events_authenticated_write" ON detainee_events;
CREATE POLICY "detainee_events_public_read"
  ON detainee_events FOR SELECT
  USING (true);
CREATE POLICY "detainee_events_authenticated_write"
  ON detainee_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Seed — İmamoğlu biography + arrest event
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE detainees
SET bio_md = $bio$Ekrem İmamoğlu, 27 Haziran 1970'te Trabzon'da doğdu. İşletme okudu, özel sektörde yöneticilik yaptı; 2014'te Beylikdüzü Belediye Başkanı seçildi. 2019 yerel seçimlerinde İstanbul Büyükşehir Belediye Başkanlığı'nı kazandı; aynı yıl seçim Yüksek Seçim Kurulu kararıyla yenilendi ve İmamoğlu görev başına ikinci kez geldi.

2024 yerel seçimlerinde rekor oy oranıyla yeniden seçildi. 19 Mart 2025 sabaha karşı evine yapılan baskınla gözaltına alındı; aynı gün İBB binasına polis girişi yapıldı, başkan tutuklandı.

Bu sayfa, başkanın özgürlüğünden mahrum kaldığı her gün için tutulan kayıttır. Hak, hukuk, adalet — herkes için.$bio$,
    updated_at = NOW()
WHERE slug = 'ekrem-imamoglu';

-- Arrest event — guarded so reruns don't duplicate.
INSERT INTO detainee_events (detainee_id, event_date, event_type, title, description, display_order)
SELECT
  d.id,
  '2025-03-19'::date,
  'arrest',
  'Sabaha karşı gözaltı, akşam tutuklama',
  'İBB Başkanı Ekrem İmamoğlu, 19 Mart 2025 sabaha karşı evine yapılan baskınla gözaltına alındı. Aynı gün tutuklanarak Silivri Cezaevi''ne gönderildi.',
  0
FROM detainees d
WHERE d.slug = 'ekrem-imamoglu'
  AND NOT EXISTS (
    SELECT 1 FROM detainee_events e
    WHERE e.detainee_id = d.id
      AND e.event_date = '2025-03-19'::date
      AND e.event_type = 'arrest'
  );
