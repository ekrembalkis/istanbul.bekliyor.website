-- Fix: detainees_with_days computed in UTC ([NOW() - arrest_date::timestamp]
-- treats both as naive timestamps), so the day rolls over at 03:00 Istanbul
-- time instead of 00:00. Client-side `daysSinceArrest()` is locked to +03:00,
-- which produces a one-day mismatch every night between 00:00–03:00 Istanbul.
--
-- Recompute against Europe/Istanbul. We compute `floor((now_ist - arrest)/day) + 1`
-- so the arrest day itself is day 1 — same convention as `lib/utils.ts`.

DROP VIEW IF EXISTS detainees_with_days;

CREATE VIEW detainees_with_days AS
SELECT
  d.*,
  GREATEST(
    1,
    (
      ((NOW() AT TIME ZONE 'Europe/Istanbul')::date)
      - d.arrest_date
    )::int + 1
  ) AS day_count
FROM detainees d
ORDER BY d.is_featured DESC, d.display_order ASC, d.arrest_date ASC;
