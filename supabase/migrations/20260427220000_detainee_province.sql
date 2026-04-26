-- Tutsaklık haritası altyapısı (Faz 2 #8).
-- detainees.province_plate sütunu — Türkiye plaka kodu 1..81.
-- NULL allowed (henüz il bilgisi girilmemiş kayıtlar için).

ALTER TABLE detainees
  ADD COLUMN IF NOT EXISTS province_plate INTEGER;

ALTER TABLE detainees
  DROP CONSTRAINT IF EXISTS detainees_province_plate_check;
ALTER TABLE detainees
  ADD CONSTRAINT detainees_province_plate_check
    CHECK (province_plate IS NULL OR (province_plate BETWEEN 1 AND 81));

CREATE INDEX IF NOT EXISTS detainees_province_plate_idx
  ON detainees (province_plate)
  WHERE province_plate IS NOT NULL;

-- Recreate the days view since we ALTER'd the underlying table. CREATE OR REPLACE
-- can't change column ORDER, so DROP + CREATE.
DROP VIEW IF EXISTS detainees_with_days;
CREATE VIEW detainees_with_days AS
SELECT
  d.*,
  GREATEST(0, EXTRACT(DAY FROM (NOW() - d.arrest_date::timestamp))::int) AS day_count
FROM detainees d
ORDER BY d.is_featured DESC, d.display_order ASC, d.arrest_date ASC;

-- Seed: İmamoğlu = İstanbul (plate 34).
UPDATE detainees
SET province_plate = 34, updated_at = NOW()
WHERE slug = 'ekrem-imamoglu' AND province_plate IS NULL;
