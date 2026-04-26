-- Detainee roster expansion v2: 6 new figures + photo_url backfill for 6 existing.
-- New figures (all İBB davası bağlantılı, plate=34 İstanbul):
--   • Hasan Mutlu (Bayrampaşa BB)
--   • İnan Güney (Beyoğlu BB)
--   • Hakan Bahçetepe (Gaziosmanpaşa BB)
--   • Hasan Akgün (Büyükçekmece BB)
--   • Necati Özkan (İmamoğlu danışmanı, "siyasi casusluk" dosyası)
--   • Buğra Gökçe (İPA Başkanı)
-- Photo_url backfill for: Demirtaş, Kavala, Çalık, Şahan, Böcek, Özcan
-- (Wikipedia commons portraits downloaded to public/<slug>.jpg|png)
-- Idempotent: ON CONFLICT DO UPDATE for detainees, NOT EXISTS for events.

-- ============================================================================
-- 1) PHOTO BACKFILL — existing 6 detainees who have Wikipedia portraits
-- ============================================================================

UPDATE detainees SET photo_url = '/demirtas.jpg', updated_at = NOW() WHERE slug = 'selahattin-demirtas';
UPDATE detainees SET photo_url = '/kavala.jpg',   updated_at = NOW() WHERE slug = 'osman-kavala';
UPDATE detainees SET photo_url = '/calik.jpg',    updated_at = NOW() WHERE slug = 'mehmet-murat-calik';
UPDATE detainees SET photo_url = '/sahan.jpg',    updated_at = NOW() WHERE slug = 'resul-emrah-sahan';
UPDATE detainees SET photo_url = '/bocek.jpg',    updated_at = NOW() WHERE slug = 'muhittin-bocek';
UPDATE detainees SET photo_url = '/ozcan.png',    updated_at = NOW() WHERE slug = 'tanju-ozcan';

-- ============================================================================
-- 2) NEW DETAINEES — 6 figures
-- ============================================================================

INSERT INTO detainees (slug, name, title, arrest_date, release_date, photo_url,
  is_featured, display_order, bio_md, province_plate)
VALUES

  ('hasan-mutlu',
   'Hasan Mutlu',
   'Bayrampaşa Belediye Başkanı (CHP)',
   '2025-09-16'::date, NULL, NULL, false, 100,
   $bio$CHP Bayrampaşa Belediye Başkanı.

16 Eylül 2025'te 26 belediye personeli ile birlikte tutuklandı; aynı gün İçişleri Bakanlığı'nca görevden uzaklaştırıldı. İstanbul 6. Sulh Ceza Hakimliği "kuvvetli suç ve kaçma şüphesi" gerekçesiyle tutuklamaya hükmetti — adli kontrol tedbirlerinin yetersiz kalacağı belirtildi. Toplam 45 kişi gözaltına alındı, 26'sı tutuklandı, 19'u adli kontrolle serbest kaldı.

Suçlamalar: zimmet, rüşvet, ihaleye fesat. İddianamede Forum İstanbul AVM önündeki bir kafenin başlangıçta usulsüz izinle kurulmasına göz yumulduğu, sonra mühürletilip belediye yardımcıları üzerinden 3 milyon TL ve ortaklık talep edildiği iddia edildi. Tutuklamasından önce AK Parti'den geçiş teklifi aldığı haberlere yansımıştı.

## Kaynaklar
- [Medyascope — Hasan Mutlu tutuklandı](https://medyascope.tv/2025/09/16/hasan-mutlu-tutuklandi/)
- [Euronews — Bayrampaşa Belediye Başkanı tutuklandı](https://tr.euronews.com/2025/09/16/bayrampasa-belediye-baskani-hasan-mutlu-tutuklandi-ak-partiden-teklif-aldigi-iddia-edilmis)
- [T24 — Mutlu'nun tutuklanma gerekçesi](https://t24.com.tr/haber/hasan-mutlu-nun-tutuklanma-gerekcesi-kuvvetli-suc-ve-kacma-suphesinin-varligi-nedeniyle,1262085)
$bio$,
   34),

  ('inan-guney',
   'İnan Güney',
   'Beyoğlu Belediye Başkanı (CHP)',
   '2025-08-19'::date, NULL, NULL, false, 110,
   $bio$1977 Beyoğlu (Örnektepe) doğumlu, Sivas kökenli CHP'li siyasetçi. Kabataş Erkek Lisesi mezunu; Uludağ Üniversitesi Kamu Yönetimi lisans, Marmara Üniversitesi Yerel Yönetimler yüksek lisans tamamladı.

1995'te CHP Gençlik Kolları'nda siyasi hayatına başladı; 2011-2014 arasında CHP Beyoğlu İlçe Başkanı olarak görev yaptı. 31 Mart 2024 yerel seçiminde Beyoğlu Belediye Başkanı seçildi.

19 Ağustos 2025'te İstanbul 3. Sulh Ceza Hakimliği'nin kararıyla tutuklandı — "suç işlemek amacıyla kurulmuş örgüte üye olma" ve "kamu kurum ve kuruluşlarının zararına dolandırıcılık" suçlamaları kapsamında. Aynı gün İçişleri Bakanlığı'nca görevden uzaklaştırıldı.

## Kaynaklar
- [Euronews — İnan Güney görevden uzaklaştırıldı](https://tr.euronews.com/2025/08/19/chpli-beyoglu-belediye-baskani-inan-guney-gorevden-uzaklastirildi)
- [AA — Beyoğlu Belediye Başkanı tutuklandı](https://www.aa.com.tr/tr/gundem/beyoglu-belediye-baskani-inan-guney-tutuklandi/3663089)
- [İçişleri Bakanlığı — Görevden uzaklaştırma basın açıklaması](https://www.icisleri.gov.tr/beyoglu-belediye-baskani-inan-guneyin-icisleri-bakanliginca-gorevden-uzaklastirilmasina-dair-basin-aciklamasi)
$bio$,
   34),

  ('hakan-bahcetepe',
   'Hakan Bahçetepe',
   'Gaziosmanpaşa Belediye Başkanı (CHP)',
   '2025-06-22'::date, NULL, NULL, false, 120,
   $bio$1988 Gaziosmanpaşa doğumlu, Erzincan kökenli CHP'li siyasetçi. İlk ve ortaöğrenimini Gaziosmanpaşa'da tamamladı; lisans eğitimini İstanbul Aydın Üniversitesi Muhasebe ve Finans Yönetimi bölümünde aldı. İşletme Yönetimi alanında yüksek lisans öğrenimi sürdürdü.

22 Haziran 2025 "Şafak Operasyonu"nda Büyükçekmece, Avcılar, Seyhan ve Ceyhan belediye başkanları ile birlikte gözaltına alındı; 22 kişilik grupla tutuklandı. Suçlamalar: "rüşvet alıp verme", "mal varlığı değerlerini aklama" ve "ihaleye fesat karıştırma".

Aynı gün İçişleri Bakanlığı'nca görevden uzaklaştırıldı; sonra Gaziosmanpaşa Belediyesi başkan vekilliği AK Parti'ye geçti.

## Kaynaklar
- [BirGün — Bahçetepe tutuklandı](https://www.birgun.net/haber/gaziosmanpasa-belediyesi-baskani-hakan-bahcetepe-tutuklandi-628197)
- [Mynet Finans — Şafak Operasyonu](https://finans.mynet.com/haber/detay/ekonomi/safak-operasyonuyla-gozaltina-alinan-hakan-bahcetepe-utku-caner-caykara-ve-hasan-akgun-kimdir/504914/)
- [Gazete Oksijen — 5. dalga operasyon](https://gazeteoksijen.com/turkiye/ibbye-5-dalga-operasyonu-buyukcekmece-avcilar-gaziosmanpasa-seyhan-ve-ceyhan-belediye-baskanlari-dahil-22-kisi-tutuklandi-243474)
$bio$,
   34),

  ('hasan-akgun',
   'Hasan Akgün',
   'Büyükçekmece Belediye Başkanı (CHP)',
   '2025-06-22'::date, NULL, NULL, false, 130,
   $bio$Trabzon Araklı doğumlu CHP'li siyasetçi, Türkiye'nin en uzun süre görev yapan belediye başkanlarından biri. İlkokulu Adapazarı Kaynarca'da, ortaokulu Florya Şenlikköy'de, liseyi Yeşilköy 50. Yıl Lisesi'nde okudu; 1979'da İstanbul Yabancı Diller Enstitüsü'nden mezun oldu. 1975'ten itibaren Sefaköy (Küçükçekmece) Belediyesi'nde sekreter ve başkan yardımcısı olarak görev yaptı (1975-1980). Büyükçekmece Belediye Başkanı olarak 1999'dan beri görevde.

22 Haziran 2025 "Şafak Operasyonu" kapsamında diğer 4 CHP'li belediye başkanı ile birlikte tutuklandı. Suçlamalar arasında rüşvet ve zimmet yer aldı. Aynı gün İçişleri Bakanlığı'nca görevden uzaklaştırıldı.

## Kaynaklar
- [Cumhuriyet — Hasan Akgün kimdir](https://www.cumhuriyet.com.tr/turkiye/buyukcekmece-belediye-baskani-hasan-akgun-kimdir-hasan-akgun-neden-gozaltina-alindi-2405595)
- [Dünya — Hasan Akgün biyografi](https://www.dunya.com/gundem/buyukcekmece-belediye-baskani-hasan-akgun-kimdir-neden-gozaltina-alindi-haberi-778845)
- [Mynet Finans — Şafak Operasyonu](https://finans.mynet.com/haber/detay/ekonomi/safak-operasyonuyla-gozaltina-alinan-hakan-bahcetepe-utku-caner-caykara-ve-hasan-akgun-kimdir/504914/)
$bio$,
   34),

  ('necati-ozkan',
   'Necati Özkan',
   'Siyasi danışman, İmamoğlu kampanya direktörü',
   '2025-03-23'::date, NULL, NULL, false, 140,
   $bio$Siyasi danışman, iletişimci ve kampanya stratejisti. 31 Mart 2019 İstanbul yerel seçimlerinde Ekrem İmamoğlu kampanyasının direktörlüğünü yürüttü. Seçim sonrası 19 gün İBB Başkan Danışmanlığı, ardından Temmuz 2019 - Ekim 2024 arasında İSBAK (İBB iştiraki) Genel Müdür Yardımcısı Danışmanı olarak çalıştı.

23 Mart 2025'te İBB ana yolsuzluk dosyasından İmamoğlu ile birlikte ilk tutuklananlardan oldu. 27 Ekim 2025'te aynı dosyaya ek olarak "siyasi casusluk" suçlamasıyla yeniden tutuklama kararı verildi — gazeteci Merdan Yanardağ ve Hüseyin Gün de aynı dosyada tutuklandı. İddianame, 2019 yerel seçimlerinin "manipüle edilmiş" olduğunu, İstanbul sakinlerinin kişisel verilerinin yurt dışı istihbarat servislerine aktarıldığını ve şifreli mesajlaşma uygulamaları üzerinden bilgi paylaşımı yapıldığını öne sürdü. 15-20 yıl hapis cezası talep edildi.

## Kaynaklar
- [Medyascope — Casusluk suçlamasıyla tutuklandı](https://medyascope.tv/2025/10/27/ekrem-imamoglu-merdan-yanardag-ve-necati-ozkan-casusluk-suclamasiyla-tutuklandi/)
- [T24 — Casusluk iddianamesi tamamlandı](https://www.t24.com.tr/haber/casusluk-sorusturmasinda-iddianame-tamamlandi-ekrem-imamoglu-necati-ozkan-ve-merdan-yanardag-hakkinda-kamu-davasi,1296686)
- [T24 (Cansu Çamlıbel söyleşi) — Necati Özkan](https://t24.com.tr/yazarlar/cansu-camlibel/necati-ozkan-onceki-casusluk-davalariyla-silahli-kuvvetler-zafiyete-ugratildi-bununla-ise-demokrasi-dejenere-ediliyor,52434)
$bio$,
   34),

  ('bugra-gokce',
   'Buğra Gökçe',
   'İstanbul Planlama Ajansı (İPA) Başkanı',
   '2025-03-23'::date, NULL, NULL, false, 150,
   $bio$1974 Ankara doğumlu şehir plancısı ve akademisyen. Gazi Üniversitesi Mimarlık Fakültesi Şehir ve Bölge Planlama bölümü mezunu (1995); aynı bölümde 2000'de yüksek lisans, 2008'de ODTÜ Şehir Planlama Anabilim Dalı'nda doktora derecesi aldı. Ocak 2025'te doçentlik unvanını aldı.

Kamu kariyerine 1996'da Ankara Büyükşehir Belediyesi İmar Dairesi'nde başladı. 2014-2017 İzmir Büyükşehir Belediyesi Fen İşleri Daire Başkanı, sonra Genel Sekreter Yardımcısı, 2017-2022 Genel Sekreter olarak çalıştı. 2022'de İBB Genel Sekreter Yardımcısı, 2023'te İETT Genel Müdürü oldu. Nisan 2024'ten itibaren İPA Başkanı.

23 Mart 2025'te İBB ana yolsuzluk soruşturması kapsamında tutuklandı. Bazı kaynaklar Gökçe'nin İPA'da yayımladığı yaşam maliyeti ve yoksulluk raporları nedeniyle hedef alındığını öne sürdü. "Onurla söylüyorum ki geçim sıkıntısı yaşıyorum, maaşıma el konuldu" ifadeleri kamuoyunda yankı yarattı.

## Kaynaklar
- [Medyascope — Buğra Gökçe kimdir](https://medyascope.tv/2025/03/21/bugra-gokce-kimdir/)
- [Hürriyet — İPA Başkanı tutuklandı](https://www.hurriyet.com.tr/gundem/istanbul-planlama-ajansi-baskani-bugra-gokce-tutuklandi-42738718)
- [12punto — "Geçim sıkıntısı yaşıyorum"](https://12punto.com.tr/gundem/istanbul-planlama-ajansi-baskani-bugra-gokce-onurla-soyluyorum-ki-gecim-sikintisi-yasiyorum-maasima-el-konuldu-99141)
- [Cumhuriyet söyleşisi](https://www.cumhuriyet.com.tr/turkiye/tutuklanan-istanbul-planlama-ajansi-baskani-bugra-gokce-cumhuriyetin-2314732)
$bio$,
   34)

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  arrest_date = EXCLUDED.arrest_date,
  release_date = EXCLUDED.release_date,
  photo_url = EXCLUDED.photo_url,
  is_featured = EXCLUDED.is_featured,
  display_order = EXCLUDED.display_order,
  bio_md = EXCLUDED.bio_md,
  province_plate = EXCLUDED.province_plate,
  updated_at = NOW();

-- ============================================================================
-- 3) NEW DETAINEE EVENTS — keyed by slug; idempotent
-- ============================================================================

INSERT INTO detainee_events (detainee_id, event_date, event_type, title, description, source_url, display_order)
SELECT d.id, e.event_date::date, e.event_type, e.title, e.description, e.source_url, 0
FROM detainees d
CROSS JOIN LATERAL (VALUES
  -- hasan-mutlu (Bayrampaşa, 16 Eylül 2025)
  ('hasan-mutlu', '2025-09-16', 'detention', 'Tutuklama',           '26 belediye personeli ile birlikte tutuklandı; zimmet, rüşvet, ihaleye fesat suçlamaları.', NULL),
  ('hasan-mutlu', '2025-09-16', 'other',     'Görevden uzaklaştırma', 'İçişleri Bakanlığı, Belediye Kanunu 47. madde uyarınca.', NULL),
  -- inan-guney (Beyoğlu, 19 Ağustos 2025)
  ('inan-guney', '2025-08-19', 'detention', 'Tutuklama',           'İstanbul 3. Sulh Ceza Hakimliği; suç örgütü üyeliği + kamu zararına dolandırıcılık.', NULL),
  ('inan-guney', '2025-08-19', 'other',     'Görevden uzaklaştırma', 'İçişleri Bakanlığı görevden uzaklaştırdı.', NULL),
  -- hakan-bahcetepe (Gaziosmanpaşa, 22 Haziran 2025)
  ('hakan-bahcetepe', '2025-06-22', 'detention', 'Tutuklama',           'Şafak Operasyonu; 5 belediye başkanı ile birlikte tutuklandı; rüşvet + mal varlığı aklama + ihaleye fesat.', NULL),
  ('hakan-bahcetepe', '2025-06-22', 'other',     'Görevden uzaklaştırma', 'İçişleri Bakanlığı görevden uzaklaştırdı; başkan vekilliği AK Parti''ye geçti.', NULL),
  -- hasan-akgun (Büyükçekmece, 22 Haziran 2025)
  ('hasan-akgun', '2025-06-22', 'detention', 'Tutuklama',           'Şafak Operasyonu; rüşvet + zimmet suçlamaları.', NULL),
  ('hasan-akgun', '2025-06-22', 'other',     'Görevden uzaklaştırma', 'İçişleri Bakanlığı görevden uzaklaştırdı.', NULL),
  -- necati-ozkan (siyasi danışman)
  ('necati-ozkan', '2025-03-23', 'detention',  'Tutuklama',           'İBB ana yolsuzluk dosyası; İmamoğlu ile birlikte tutuklandı.', NULL),
  ('necati-ozkan', '2025-10-27', 'indictment', 'Casusluk dosyasından yeniden tutuklama', 'Siyasi casusluk suçlaması; Yanardağ ve Gün ile birlikte; 15-20 yıl talep.', NULL),
  -- bugra-gokce (İPA Başkanı)
  ('bugra-gokce', '2025-03-23', 'detention', 'Tutuklama', 'İBB ana yolsuzluk soruşturması; İmamoğlu ile birlikte tutuklandı.', NULL)
) AS e(slug, event_date, event_type, title, description, source_url)
WHERE d.slug = e.slug
  AND NOT EXISTS (
    SELECT 1 FROM detainee_events ev
    WHERE ev.detainee_id = d.id
      AND ev.event_date = e.event_date::date
      AND ev.event_type = e.event_type
      AND ev.title = e.title
  );
