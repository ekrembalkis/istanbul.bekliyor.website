-- Site-wide event stream foundation.
-- Allow detainee_id to be NULL (general events that aren't tied to one person)
-- and extend the event_type CHECK with four new categories: protest, legal,
-- press, milestone.
--
-- Switch ON DELETE behaviour CASCADE → SET NULL so deleting a detainee
-- doesn't wipe related general timeline entries.

ALTER TABLE detainee_events
  DROP CONSTRAINT IF EXISTS detainee_events_detainee_id_fkey;
ALTER TABLE detainee_events
  ALTER COLUMN detainee_id DROP NOT NULL;
ALTER TABLE detainee_events
  ADD CONSTRAINT detainee_events_detainee_id_fkey
    FOREIGN KEY (detainee_id) REFERENCES detainees(id) ON DELETE SET NULL;

ALTER TABLE detainee_events
  DROP CONSTRAINT IF EXISTS detainee_events_event_type_check;
ALTER TABLE detainee_events
  ADD CONSTRAINT detainee_events_event_type_check
    CHECK (event_type IN (
      'arrest', 'detention', 'indictment', 'hearing', 'ruling',
      'release', 'statement', 'transfer', 'other',
      'protest',     -- street demonstrations
      'legal',       -- AYM/AİHM applications, court rulings beyond hearings
      'press',       -- press release, joint statement, op-ed
      'milestone'    -- 50/100/200/365-day markers, public commemorations
    ));

CREATE INDEX IF NOT EXISTS detainee_events_date_idx
  ON detainee_events (event_date DESC, display_order DESC);

-- Seed 7 key general events. Idempotent: re-running won't duplicate rows.
INSERT INTO detainee_events (detainee_id, event_date, event_type, title, description, display_order)
SELECT NULL, e.event_date, e.event_type, e.title, e.description, 0
FROM (VALUES
  ('2025-03-23'::date, 'protest',
   'Saraçhane''de gece nöbeti başladı',
   'İmamoğlu''nun tutuklanmasının ardından İBB binası önünde başlayan bekleyiş, ilerleyen günlerde haftalık miting ve gündüz toplantılarına dönüştü.'),
  ('2025-03-26'::date, 'press',
   'CHP grubu Anayasa Mahkemesi''ne bireysel başvuru hazırlığını duyurdu',
   'Parti hukuk komisyonu, tutuklu vekil ve yöneticiler için bireysel başvuru dosyalarını derliyor. Çoklu adli mercilere paralel başvuru yolu açık tutuluyor.'),
  ('2025-04-15'::date, 'legal',
   'AİHM''e ilk başvuru iletildi',
   'Avrupa İnsan Hakları Mahkemesi''ne adil yargılanma hakkı (Madde 6) ve özgürlük hakkı (Madde 5) ekseninde ilk başvuru. Tedbir talebi gündemde.'),
  ('2025-06-26'::date, 'milestone',
   '100. gün',
   'İmamoğlu''nun tutukluluğunun 100. günü. İstanbul ve Ankara''da büyük meydan toplantıları; uluslararası basında geniş yer.'),
  ('2025-09-04'::date, 'milestone',
   '170. gün',
   'Yarı yıl eşiği. Davalardaki tutuklamaların büyük kısmı sürüyor; yeni iddianamelere itiraz dilekçeleri çoğalıyor.'),
  ('2026-03-19'::date, 'milestone',
   '1 yıl: tutsaklık birinci yılını doldurdu',
   'İmamoğlu''nun tutuklanmasının yıl dönümü. Saraçhane''de büyük buluşma; uluslararası gözlemciler ve siyasi liderlerden açıklamalar.'),
  ('2026-04-01'::date, 'press',
   'Aile ve hukuk ekibi ortak deklarasyon',
   'Tutuklu siyasilerin aileleri ortak bir deklarasyon yayımladı: somut tarih, somut talep, somut umut.')
) AS e(event_date, event_type, title, description)
WHERE NOT EXISTS (
  SELECT 1 FROM detainee_events
  WHERE detainee_id IS NULL
    AND event_date = e.event_date
    AND event_type = e.event_type
);
