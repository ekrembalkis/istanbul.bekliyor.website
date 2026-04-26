-- Detainee roster seed: 1 update (İmamoğlu) + 9 new figures.
-- Editorial content sourced via web research (Bianet, Medyascope, Wikipedia,
-- Cumhuriyet, T24, AA, Hürriyet, Euronews TR, BirGün, NTV, Onedio).
-- Idempotent: ON CONFLICT DO UPDATE for detainees, NOT EXISTS for events.

-- ============================================================================
-- 1) DETAINEES — 10 entries (1 update, 9 new)
-- ============================================================================

INSERT INTO detainees (slug, name, title, arrest_date, release_date, photo_url,
  is_featured, display_order, bio_md, province_plate)
VALUES
  ('ekrem-imamoglu',
   'Ekrem İmamoğlu',
   'İBB Başkanı',
   '2025-03-23'::date, NULL, '/imamoglu.jpg', true, 1,
   $bio$İstanbul Büyükşehir Belediye Başkanı. 23 Haziran 2019 yenilenen seçimde 800 binin üzerinde farkla yeniden seçildi; bu zafer, 2014'ten beri AKP iktidarına karşı muhalefetin en güçlü sembolik kazanımı sayıldı. 31 Mart 2024 yerel seçiminde de görevini korudu.

19 Mart 2025 sabahı evinden gözaltına alındı. Bir gün önce, 18 Mart'ta İstanbul Üniversitesi 1994 mezuniyet diplomasını idari bir kararla iptal etmişti — bu, anayasal cumhurbaşkanı adaylığı şartını (yükseköğretim mezunu olmak) doğrudan hedefliyordu. 23 Mart'ta dört ayrı dosyada (suç örgütü kurma, irtikap, rüşvet, ihaleye fesat, nitelikli dolandırıcılık, kişisel veri ihlali) Silivri Cezaevi'ne sevk edildi. Aynı gün CHP ön seçimini ezici çoğunlukla (~15 milyon oy) kazandı.

13 Mayıs 2025'te AYM'ye bireysel başvuru yapıldı. 27 Ekim 2025'te dosyaya "siyasi casusluk" suçlaması eklendi (15-20 yıl öngörülüyor). 10 Kasım 2025'te AİHM'e başvuru iletildi — Strasbourg başvuruyu önceliğe alıp Türkiye'ye 6 soru yöneltti. 11 Kasım 2025'te 407 sanıklı (105 tutuklu) İBB iddianamesi mahkemeye gönderildi. 9 Mart 2026'da ana dava başladı.

## Kaynaklar
- [Vikipedi — Ekrem İmamoğlu'nun tutuklanması](https://tr.wikipedia.org/wiki/Ekrem_İmamoğlu'nun_tutuklanması)
- [Medyascope — 19 Mart operasyonlarının 1. yılı](https://medyascope.tv/2026/03/17/19-mart-operasyonlarinin-1-yili-ekrem-imamoglu-1-yildir-tutuklu-ibb-davasi-suruyor/)
- [Cumhuriyet — AİHM'den iktidara kritik İmamoğlu soruları](https://www.cumhuriyet.com.tr/siyaset/aihm-den-iktidara-kritik-imamoglu-sorulari-2494758)
- [Bianet — İBB operasyonları](https://bianet.org/haber/ibb-operasyonlari-kac-kisi-gozaltina-alindi-307707)
$bio$,
   34),

  ('selahattin-demirtas',
   'Selahattin Demirtaş',
   'HDP Eski Eş Genel Başkanı',
   '2016-11-04'::date, NULL, NULL, false, 10,
   $bio$1973 Palu (Elazığ) doğumlu Kürt siyasetçi, avukat ve yazar. DTP, BDP ve HDP'de görev aldı; 2014-2018 arasında Figen Yüksekdağ ile birlikte HDP Eş Genel Başkanı'ydı. 2014 ve 2018 cumhurbaşkanlığı seçimlerinde aday oldu.

4 Kasım 2016'da, 8 HDP'li milletvekili ile birlikte Diyarbakır'da gözaltına alındı; aynı gece Edirne F Tipi Cezaevi'ne sevk edildi. 22 Aralık 2018'de AİHM, ifade özgürlüğü ve seçilme hakkı ihlali tespit etti (*Demirtaş v Türkiye No. 2*, 14305/17). 22 Aralık 2020 Büyük Daire kararı ihlal kararını onayladı, ek olarak Sözleşme'nin 18. maddesi ihlalini saptadı — tutukluluğun çoğulcu siyasi tartışmayı bastırma yönünde gizli amaca hizmet ettiği belirtildi.

16 Mayıs 2024'te Ankara 22. Ağır Ceza Mahkemesi *Kobani davası* kapsamında 28 yıl hapis cezasına çarptırdı; birikmiş cezalar toplamı 42 yılı buldu. 8 Temmuz 2025'te AİHM yeniden ihlal kararı verdi. 3 Kasım 2025'te Büyük Daire itirazı reddedip kararı kesinleştirdi. 2026 itibariyle Edirne Cezaevi'nde tutuklu/hükümlü olmaya devam ediyor.

## Kaynaklar
- [Vikipedi — Selahattin Demirtaş](https://tr.wikipedia.org/wiki/Selahattin_Demirtaş)
- [T24 — AİHM kararı kesinleşti](https://t24.com.tr/haber/demirtas-hakkinda-aihm-karari-kesinlesti-tahliye-basvurusu-yapildi,1273498)
- [Medyascope — Demirtaş tahliye süreci](https://medyascope.tv/2025/11/07/demirtasin-tahliye-sureci-nasil-isleyecek-ozel-haber/)
$bio$,
   21),

  ('osman-kavala',
   'Osman Kavala',
   'İş insanı, yayıncı, Anadolu Kültür kurucusu',
   '2017-11-01'::date, NULL, NULL, false, 20,
   $bio$Mehmet Osman Kavala, 1957 Paris doğumlu iş insanı ve yayıncı. İletişim Yayınları (1983) ve Ana Yayıncılık (1985) kurucu ortağı; 2002'de Anadolu Kültür'ü (Türkiye'nin etnik ve bölgesel çeşitliliği üzerine kültür projeleri) kurdu.

1 Kasım 2017'de havalimanında gözaltına alındı; sonra Silivri Cezaevi'ne (Marmara Cezaevi) sevk edildi. Önce Gezi Parkı protestolarını organize etmek, sonra 15 Temmuz darbe girişimine yardım etmek/casusluk yapmakla suçlandı.

10 Aralık 2019'da AİHM, *Kavala v Türkiye* (28749/18) kararında Sözleşme'nin 5/1, 5/4 ve 18. maddelerinin ihlal edildiğini saptadı — §232'de tutukluluğun "başvurucuyu susturmaya ve diğer insan hakları savunucularını caydırmaya yönelik gizli bir amaç güttüğü" belirtildi. Türkiye karara uymadığı için Bakanlar Komitesi 2 Şubat 2022'de ilk kez bir üye devlet hakkında ihlal işlemi başlattı.

25 Nisan 2022'de İstanbul 13. Ağır Ceza Mahkemesi "hükümeti devirmeye teşebbüs" suçundan ağırlaştırılmış müebbet hapis cezasına çarptırdı; 28 Eylül 2023'te Yargıtay onadı. 30 Nisan 2024'te yargılamanın yenilenmesi başvurusu yapıldı. 25 Mart 2026'da AİHM Büyük Daire mahkumiyet kararına ilişkin başvuruyu görmek üzere duruşma açıkladı. 2026 itibariyle Marmara Cezaevi'nde 8+ yıldır tutuklu.

## Kaynaklar
- [Vikipedi — Osman Kavala](https://tr.wikipedia.org/wiki/Osman_Kavala)
- [Medyascope — Kavala röportaj 2026](https://medyascope.tv/2026/01/07/osman-kavala-medyascopea-konustu-aihm-surecini-degerlendirdi/)
$bio$,
   34),

  ('murat-ongun',
   'Murat Ongun',
   'İBB Medya AŞ Yönetim Kurulu Başkanı',
   '2025-03-23'::date, NULL, NULL, false, 30,
   $bio$21 Nisan 1975 Ankara doğumlu gazeteci, aslen Giresunlu. Ankara Üniversitesi İletişim Fakültesi mezunu (1996). Mezuniyet sonrası Show Haber'in Ankara muhabiri olarak başladı; sonra İstanbul'a taşınarak Star TV ve ATV'de çalıştı. 2001'de Habertürk TV'nin kuruluşunda yer aldı.

2014'ten itibaren Beylikdüzü Belediye Başkanı Ekrem İmamoğlu'nun danışmanı oldu. 2019 yerel seçimlerinden sonra İstanbul Büyükşehir Belediyesi Sözcüsü görevine getirildi; 2022'den itibaren İBB iştiraki Medya AŞ Yönetim Kurulu Başkanı.

19 Mart 2025 sabahında İmamoğlu ile aynı operasyonda gözaltına alındı; 23 Mart 2025'te tutuklanan 20 isim arasında yer aldı. Suçlamalar arasında suç örgütü üyeliği, ihaleye fesat, kişisel veri hukuka aykırı temin yer aldı. Silivri Cezaevi'nde tutuklu.

## Kaynaklar
- [Wikipedia — Murat Ongun (EN)](https://en.wikipedia.org/wiki/Murat_Ongun)
- [Hürriyet — Murat Ongun kimdir](https://www.hurriyet.com.tr/bilgi/galeri-murat-ongun-kimdir-kac-yasinda-nereli-murat-ongun-tutuklandi-mi-neden-tutuklandi-42738786)
$bio$,
   34),

  ('mehmet-murat-calik',
   'Mehmet Murat Çalık',
   'Beylikdüzü Belediye Başkanı (CHP)',
   '2025-03-23'::date, NULL, NULL, false, 40,
   $bio$19 Kasım 1972 Maçka (Trabzon) doğumlu CHP'li siyasetçi, şehir plancısı. İstanbul Teknik Üniversitesi Mimarlık Fakültesi Şehir ve Bölge Planlama bölümünden mezun (1997). 2008-2014 arasında Şehir Plancıları Odası İstanbul Şubesi'nde yöneticilik yaptı.

2014-2018 yıllarında dönemin Beylikdüzü Belediye Başkanı Ekrem İmamoğlu'nun yanında Teknik Koordinatör ve Başkan Yardımcısı olarak görev yaptı. 2019 yerel seçimlerinde, İmamoğlu'nun İBB Başkan Adaylığı'na geçmesi üzerine CHP Beylikdüzü Belediye Başkan Adayı oldu ve büyük farkla seçildi. 2024'te yeniden seçildi.

19 Mart 2025'te İBB operasyonunda gözaltına alındı, 23 Mart 2025'te Silivri Cezaevi'ne sevk edildi. Belediyeye kayyım atandı. Suçlamalar İBB ana davasıyla ortaklaşa.

## Kaynaklar
- [Vikipedi — Mehmet Murat Çalık](https://tr.wikipedia.org/wiki/Mehmet_Murat_Çalık)
- [Beylikdüzü Belediyesi resmi sitesi](https://www.beylikduzu.istanbul/baskan)
- [Euronews — 11 CHP'li belediye başkanı tutuklu](https://tr.euronews.com/2025/06/04/11-chpli-belediye-baskani-tutuklu-imamoglu-ve-diger-10-ismin-tutuklanma-sureci)
$bio$,
   34),

  ('resul-emrah-sahan',
   'Resul Emrah Şahan',
   'Şişli Belediye Başkanı (CHP)',
   '2025-03-23'::date, NULL, NULL, false, 50,
   $bio$11 Haziran 1982 Ankara doğumlu, Erzincan kökenli şehir plancısı ve siyasetçi. 2005 yılında Mimar Sinan Güzel Sanatlar Üniversitesi Mimarlık Fakültesi Şehir ve Bölge Planlama Bölümü'nden mezun oldu.

2014-2019 arasında Beylikdüzü Belediyesi Teknik Koordinasyon ve Projeler Birimi'nde Proje Koordinatörü oldu; İmamoğlu'nun 2019 İBB kampanyasında Politika ve Projeler Bildirgesi'nin teknik koordinasyonunu yönetti. 2019-2023 arasında İstanbul Planlama Ajansı Başkanlığı, Bimtaş Yönetim Kurulu Başkanlığı ve Şişli Belediyesi Başkan Yardımcılığı görevlerinde bulundu. 2024 yerel seçimlerinde rekor oyla Şişli Belediye Başkanı seçildi.

19 Mart 2025'te İBB operasyonunda gözaltına alındı, 23 Mart'ta tutuklandı. 11 Şubat 2026'da "Kent Uzlaşısı" davasından tahliye kararı çıktı, fakat İBB ana davasından da tutuklu olduğu için cezaevinden çıkamadı. Halen Silivri Cezaevi'nde.

## Kaynaklar
- [Vikipedi — Resul Emrah Şahan](https://tr.wikipedia.org/wiki/Resul_Emrah_Şahan)
- [Medyascope — Şahan kimdir](https://medyascope.tv/2025/03/19/resul-emrah-sahan-kimdir/)
- [Medyascope — Kent uzlaşısı tahliye kararları](https://medyascope.tv/2026/02/11/kent-uzlasisi-dosyasinda-tahliye-kararlari/)
$bio$,
   34),

  ('riza-akpolat',
   'Rıza Akpolat',
   'Beşiktaş Belediye Başkanı (CHP)',
   '2025-01-17'::date, NULL, NULL, false, 60,
   $bio$CHP Beşiktaş Belediye Başkanı. Mart 2024 yerel seçiminde yeniden seçildi.

12 Ocak 2025'te "suç örgütüne üye olma", "ihaleye fesat karıştırma" ve "haksız mal edinme" suçlamalarıyla 22 şüpheli ile birlikte gözaltına alındı. 16 Ocak'ta hakimlik tutuklama kararı verdi; 17 Ocak 2025'te (Cuma) cezaevine sevk edildi. 19 Mart İmamoğlu operasyonu öncesi tutuklanan ilk CHP'li büyük belediye başkanı olarak dalganın öncüsü sayıldı. Halen tutuklu.

## Kaynaklar
- [Vikipedi — Rıza Akpolat](https://tr.wikipedia.org/wiki/Rıza_Akpolat)
- [Euronews — Beşiktaş Belediye Başkanı tutuklandı](https://tr.euronews.com/2025/01/17/besiktas-belediye-baskani-riza-akpolat-tutuklandi)
- [Medyascope — Akpolat tutuklandı](https://medyascope.tv/2025/01/16/riza-akpolat-tutuklandi-besiktas-belediyesinde-simdi-ne-olacak/)
$bio$,
   34),

  ('muhittin-bocek',
   'Muhittin Böcek',
   'Antalya Büyükşehir Belediye Başkanı (CHP)',
   '2025-07-05'::date, NULL, NULL, false, 70,
   $bio$CHP Antalya Büyükşehir Belediye Başkanı. 31 Mart 2019 yerel seçiminde göreve geldi, 2024'te yeniden seçildi.

5 Temmuz 2025'te Antalya Cumhuriyet Başsavcılığı'nın yürüttüğü rüşvet ve yolsuzluk soruşturması kapsamında tutuklandı; 702 sayfalık iddianamede "icbar suretiyle irtikap, haksız mal edinme, nüfuz ticareti, suçtan kaynaklanan mal varlığı değerlerini aklama, nitelikli dolandırıcılık ve iftira" suçları yöneltildi. İddianamede 2024 yerel seçimleri sırasında oğlu M.G. Böcek aracılığıyla bir iş insanından 25 milyon lira talep edildiği, karşılanmayınca araç giydirme hizmeti üzerinden 8,5 milyon liralık fatura ödemesinin yapıldığı öne sürüldü. Halen tutuklu.

## Kaynaklar
- [Medyascope — Böcek tutuklandı](https://medyascope.tv/2025/07/05/muhittin-bocek-tutuklandi/)
- [AA — Böcek tutuklandı](https://www.aa.com.tr/tr/gundem/antalya-buyuksehir-belediye-baskani-muhittin-bocek-tutuklandi/3622412)
- [Hürriyet — Antalya BŞB rüşvet davası](https://www.hurriyet.com.tr/gundem/antalya-buyuksehir-belediyesine-yonelik-rusvet-ve-yolsuzluk-davasi-basladi-43130399)
$bio$,
   7),

  ('kadir-aydar',
   'Kadir Aydar',
   'Ceyhan Belediye Başkanı (CHP)',
   '2025-06-03'::date, '2026-04-22'::date, NULL, false, 80,
   $bio$6 Haziran 1988 Ceyhan (Adana) doğumlu CHP'li siyasetçi. Piri Reis, Çukurova ve Çağ Üniversitelerinde eğitim gördü. 18 yaşında CHP'ye üye oldu, 2015'te CHP Ceyhan İlçe Başkanı seçildi. 2019 yerel seçimlerinde Ceyhan Belediye Başkanlığı'na aday oldu, %50.6 oyla seçildi; 2024'te %45.67 oyla yeniden seçildi.

3 Haziran 2025'te İBB beşinci dalga operasyonunda 47 kişi ile birlikte "icbar suretiyle irtikap" suçlamasıyla gözaltına alındı, aynı gün tutuklandı; 5 Haziran'da İçişleri Bakanlığı tarafından görevden uzaklaştırıldı. Aziz İhsan Aktaş davası kapsamında tutuklu yargılandı; 22 Nisan 2026'da, 327 gün sonra tahliye edildi.

## Kaynaklar
- [Cumhuriyet — Kadir Aydar kimdir](https://www.cumhuriyet.com.tr/turkiye/ceyhan-belediye-baskani-kadir-aydar-kimdir-kadir-aydar-neden-gozaltina-alindi-2405604)
- [Euronews — Aziz İhsan Aktaş davasında tahliye](https://tr.euronews.com/2026/04/22/aziz-ihsan-aktas-davasi-adana-ceyhan-belediye-baskani-kadir-aydar-dahil-5-kisiye-tahliye)
- [Medyascope — Aydar hakkında tahliye kararı](https://medyascope.tv/2026/04/22/ceyhan-belediye-baskani-kadir-aydar-hakkinda-tahliye-karari/)
$bio$,
   1),

  ('tanju-ozcan',
   'Tanju Özcan',
   'Bolu Belediye Başkanı (CHP)',
   '2026-03-02'::date, NULL, NULL, false, 90,
   $bio$CHP Bolu Belediye Başkanı.

2 Mart 2026'da Belediye Başkan Yardımcısı Süleyman Can ile birlikte 13 kişilik bir gözaltı dalgasında "icbar suretiyle irtikap" suçlamasıyla tutuklandı (Bolu 2. Sulh Ceza Hakimliği, sorgu numarası 2026/48). Özcan ve Can tutuklanırken kalan 11 kişiye adli kontrol uygulandı. İçişleri Bakanlığı 5393 sayılı Belediye Kanunu'nun 47. maddesi uyarınca görevden uzaklaştırma kararı aldı. İddialar belediye-bağlantılı vakıflar ve reklam sözleşmeleri üzerinden menfaat temini etrafında toplandı; ŞOK, A101, BİM ve Carrefoursa zincirlerinin reklam görüşmelerinde belediye baskısı şikayetleri öne sürüldü. Özcan suçlamaları reddetti, "siyasi operasyon" olarak nitelendirdi.

## Kaynaklar
- [Medyascope — Tanju Özcan tutuklandı](https://medyascope.tv/2026/03/02/tanju-ozcan-irtikap-suclamasiyla-tutuklandi/)
- [Euronews — Bolu Belediye Başkanı tutuklandı](https://tr.euronews.com/2026/03/02/bolu-belediye-baskani-tanju-ozcan-tutuklandi)
- [İçişleri Bakanlığı basın açıklaması](https://www.icisleri.gov.tr/bolu-belediye-baskani-tanju-ozcanin-icisleri-bakanliginca-gorevden-uzaklastirilmasina-dair-basin-aciklamasi)
$bio$,
   14)

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
-- 2) DETAINEE_EVENTS — keyed by detainee slug; idempotent via NOT EXISTS
-- ============================================================================

INSERT INTO detainee_events (detainee_id, event_date, event_type, title, description, source_url, display_order)
SELECT d.id, e.event_date::date, e.event_type, e.title, e.description, e.source_url, 0
FROM detainees d
CROSS JOIN LATERAL (VALUES
  -- ekrem-imamoglu
  ('ekrem-imamoglu', '2025-03-18', 'other',      'Diploma iptali',         'İstanbul Üniversitesi 1994 mezuniyet diplomasını idari kararla iptal etti.', NULL),
  ('ekrem-imamoglu', '2025-03-19', 'arrest',     'Gözaltı',                 'Sabah ~07:00 evinden gözaltı; 100+ kişilik geniş çaplı operasyon.', NULL),
  ('ekrem-imamoglu', '2025-03-23', 'detention',  'Tutuklama',               'Silivri Cezaevi''ne sevk; 4 ayrı dosyada tutuklama; aynı gün CHP ön seçimi kazandı.', NULL),
  ('ekrem-imamoglu', '2025-05-13', 'legal',      'AYM bireysel başvurusu',  'Anayasa Mahkemesi''ne bireysel başvuru.', NULL),
  ('ekrem-imamoglu', '2025-10-27', 'indictment', 'Casusluk suçlaması',      'Mevcut dosyaya "siyasi casusluk" suçlaması eklendi (15-20 yıl).', NULL),
  ('ekrem-imamoglu', '2025-11-10', 'legal',      'AİHM başvurusu',          'Strasbourg başvuruya öncelik tanıdı, 6 soru yöneltti.', NULL),
  ('ekrem-imamoglu', '2025-11-11', 'indictment', 'İBB iddianamesi',         '407 sanıklı (105 tutuklu) iddianame mahkemeye gönderildi.', NULL),
  ('ekrem-imamoglu', '2026-03-09', 'hearing',    'Ana dava başladı',        'İBB davası ilk duruşma.', NULL),
  -- selahattin-demirtas
  ('selahattin-demirtas', '2016-11-04', 'arrest',  'Tutuklama (HDP operasyonu)', 'Diyarbakır''da gözaltı, 8 milletvekili ile birlikte; Edirne Cezaevi.', NULL),
  ('selahattin-demirtas', '2018-12-22', 'ruling',  'AİHM ilk ihlal kararı',       'Demirtaş v Türkiye No. 2, ifade ve seçilme hakkı ihlali.', NULL),
  ('selahattin-demirtas', '2020-12-22', 'ruling',  'AİHM Büyük Daire',             'İhlal onaylandı + Madde 18 (siyasi amaç) ihlali.', NULL),
  ('selahattin-demirtas', '2024-05-16', 'ruling',  'Kobani davası kararı',         'Ankara 22. Ağır Ceza, 28 yıl hapis (toplam birikmiş 42 yıl).', NULL),
  ('selahattin-demirtas', '2025-07-08', 'legal',   'AİHM yeniden ihlal kararı',    'Tutukluluğun siyasi amaçla sürdüğü tespit.', NULL),
  ('selahattin-demirtas', '2025-11-03', 'legal',   'AİHM Büyük Daire kesinleşti',   'İtiraz reddedildi, karar bağlayıcı.', NULL),
  -- osman-kavala
  ('osman-kavala', '2017-11-01', 'arrest',  'Tutuklama',                  'Havalimanında gözaltı, Silivri Cezaevi''ne sevk.', NULL),
  ('osman-kavala', '2019-12-10', 'ruling',  'AİHM ihlal kararı',          'Kavala v Türkiye 28749/18, §232 — siyasi amaç tespiti.', NULL),
  ('osman-kavala', '2022-02-02', 'legal',   'AB Bakanlar Komitesi ihlal', 'İlk kez bir üye devlet hakkında ihlal işlemi başlatıldı.', NULL),
  ('osman-kavala', '2022-04-25', 'ruling',  'Müebbet kararı',             'İstanbul 13. Ağır Ceza, ağırlaştırılmış müebbet.', NULL),
  ('osman-kavala', '2023-09-28', 'ruling',  'Yargıtay onadı',             'Mahkumiyet kararı kesinleşti.', NULL),
  ('osman-kavala', '2024-04-30', 'legal',   'Yeniden yargılanma başvurusu','Yargılamanın yenilenmesi başvurusu.', NULL),
  ('osman-kavala', '2026-03-25', 'hearing', 'AİHM Büyük Daire duruşması', 'Mahkumiyet kararına ilişkin başvuru görülüyor.', NULL),
  -- murat-ongun
  ('murat-ongun', '2025-03-19', 'arrest',    'Gözaltı',  'İBB operasyonu kapsamında.', NULL),
  ('murat-ongun', '2025-03-23', 'detention', 'Tutuklama', 'Silivri Cezaevi''ne sevk.', NULL),
  -- mehmet-murat-calik
  ('mehmet-murat-calik', '2025-03-19', 'arrest',    'Gözaltı',  'İBB operasyonu kapsamında.', NULL),
  ('mehmet-murat-calik', '2025-03-23', 'detention', 'Tutuklama', 'Silivri Cezaevi''ne sevk; belediyeye kayyım.', NULL),
  -- resul-emrah-sahan
  ('resul-emrah-sahan', '2025-03-19', 'arrest',    'Gözaltı',                'İBB operasyonu kapsamında.', NULL),
  ('resul-emrah-sahan', '2025-03-23', 'detention', 'Tutuklama',               'Silivri Cezaevi''ne sevk; belediyeye kayyım.', NULL),
  ('resul-emrah-sahan', '2026-02-11', 'legal',     'Kent Uzlaşısı tahliye',   'Bu davadan tahliye kararı çıktı; İBB davasından tutuklu olduğu için tahliye uygulanmadı.', NULL),
  -- riza-akpolat
  ('riza-akpolat', '2025-01-12', 'arrest',    'Gözaltı',         '22 şüpheli ile gözaltı: suç örgütü, ihaleye fesat, haksız mal edinme.', NULL),
  ('riza-akpolat', '2025-01-16', 'detention', 'Tutuklama kararı', 'Hakimlik tutuklamaya hükmetti.', NULL),
  ('riza-akpolat', '2025-01-17', 'detention', 'Cezaevine sevk',   'Beşiktaş Belediyesi başkanına kayyım atandı.', NULL),
  -- muhittin-bocek
  ('muhittin-bocek', '2025-07-05', 'detention', 'Tutuklama', 'Antalya BŞB rüşvet/yolsuzluk soruşturması; 702 sayfalık iddianame.', NULL),
  -- kadir-aydar
  ('kadir-aydar', '2025-06-03', 'arrest',  'Gözaltı + tutuklama', 'İBB 5. dalga operasyonu, 47 kişiyle gözaltı; aynı gün tutuklandı.', NULL),
  ('kadir-aydar', '2025-06-05', 'other',   'Görevden uzaklaştırma', 'İçişleri Bakanlığı görevden uzaklaştırdı.', NULL),
  ('kadir-aydar', '2026-04-22', 'release', 'Tahliye',              'Aziz İhsan Aktaş davasından tahliye, 327 gün sonra.', NULL),
  -- tanju-ozcan
  ('tanju-ozcan', '2026-03-02', 'detention', 'Tutuklama',           '13 kişilik gözaltı; icbar suretiyle irtikap; Bolu 2. Sulh Ceza Hakimliği.', NULL),
  ('tanju-ozcan', '2026-03-02', 'other',     'Görevden uzaklaştırma', 'İçişleri Bakanlığı, Belediye Kanunu 47. madde uyarınca.', NULL)
) AS e(slug, event_date, event_type, title, description, source_url)
WHERE d.slug = e.slug
  AND NOT EXISTS (
    SELECT 1 FROM detainee_events ev
    WHERE ev.detainee_id = d.id
      AND ev.event_date = e.event_date::date
      AND ev.event_type = e.event_type
      AND ev.title = e.title
  );
