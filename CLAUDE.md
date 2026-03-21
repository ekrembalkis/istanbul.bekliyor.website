# CLAUDE.md — İstanbul Bekliyor Kampanya Projesi

## Proje Özeti

Bu, İstanbul Büyükşehir Belediye Başkanı Ekrem İmamoğlu'nun 19 Mart 2025'te tutuklanmasının ardından başlatılan **tek kişilik dijital iletişim kampanyası** için kampanya yönetim panelidir.

**Kampanya adı:** İstanbul Bekliyor
**X hesabı:** @istbekliyor
**Display name:** İSTANBUL BEKLİYOR · GÜN [sayı]
**Konsept:** Her gün bir minimalist AI görseli + kısa tweet. Gün sayacı formatı. Birikim etkisi.
**Görsel kimlik:** Kırmızı (#E30A17) zemin + beyaz kum saati logosu. Günlük görseller siyah/beyaz + tek altın (#D4A843) aksan.
**Hedef kitle:** Türkiye'deki vatandaşlar (VPN kullananlar dahil)
**Dil:** Sadece Türkçe
**Yürütücü:** Tek kişi, sıfır bütçe

## İnşa Edilecek Sistem

React + TypeScript + Supabase + Vercel üzerine kurulu kampanya yönetim paneli.

### Temel Özellikler

1. **Günlük Tweet Planlayıcı:** Bugün kaçıncı gün, hangi tema, Nano Banana Pro prompt şablonu, tweet metni. Kopyala/yapıştır ile hızlı üretim.
2. **Algoritma Optimizasyon Kontrolü:** Tweet taslağını yapıştır, sistem X algoritmasına göre analiz etsin (link var mı, uzunluk, hashtag sayısı, soru içeriyor mu, format uygun mu).
3. **Görsel Arşiv:** Geçmiş günlerin görselleri, tweetleri ve performans notları.
4. **Otomatik Gün Sayacı:** 19 Mart 2025'ten itibaren otomatik hesaplama + günün teması önerisi.
5. **İçerik Takvimi:** 30 günlük görünüm, her günün teması ve durumu (planlandı/yayınlandı/atlandı).

### Teknik Yığın

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL + Auth + Storage)
- **Deployment:** Vercel
- **Görsel üretim:** Nano Banana Pro (harici, promptlar panelden kopyalanır)
- **Domain:** istanbulbekliyor.com veya benzeri (opsiyonel)

### Supabase Şeması

```sql
-- Günlük içerik planı
CREATE TABLE daily_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_number INTEGER NOT NULL UNIQUE,
  date DATE NOT NULL,
  theme TEXT NOT NULL,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'published', 'skipped')),
  nano_prompt TEXT, -- Nano Banana Pro prompt
  tweet_text TEXT, -- Tweet metni
  image_url TEXT, -- Supabase Storage URL
  tweet_url TEXT, -- Yayınlandıktan sonra tweet linki
  performance_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tema havuzu
CREATE TABLE themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  scene_keywords TEXT, -- Nano Banana Pro sahne anahtar kelimeleri
  used_count INTEGER DEFAULT 0,
  last_used_date DATE
);

-- Algoritma kontrol kuralları
CREATE TABLE algorithm_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  description TEXT NOT NULL,
  check_type TEXT NOT NULL, -- 'error' | 'warning' | 'tip'
  is_active BOOLEAN DEFAULT true
);
```

### Sayfa Yapısı

```
/                 → Dashboard (bugünün özeti, gün sayacı, hızlı eylemler)
/plan             → Günlük planlayıcı (tema seç, prompt al, tweet yaz)
/check            → Algoritma kontrolü (tweet taslağını analiz et)
/archive          → Geçmiş günler galerisi
/calendar         → 30 günlük takvim görünümü
/settings         → Tema havuzu yönetimi, kurallar
```

### Renk Paleti ve Tasarım

```css
:root {
  --brand-red: #E30A17;
  --brand-red-dark: #B80813;
  --accent-gold: #D4A843;
  --bg-dark: #0C0C12;
  --bg-card: #16161E;
  --text-primary: #E8E6E3;
  --text-secondary: rgba(255,255,255,0.5);
  --text-muted: rgba(255,255,255,0.3);
}
```

Font: sistem fontları (başlıklar bold, gövde regular). Panel dark mode.

## Önemli Dosyalar

- `docs/algorithm-analysis.md` — X algoritmasının kaynak kod analizi (engagement ağırlıkları, Author Diversity, OON factor)
- `docs/research-global-playbook.md` — Uluslararası sansür atlama kampanyalarının araştırması (Navalny, Iran, Belarus, Hong Kong, Venezuela, Myanmar)
- `docs/research-solo-campaigns.md` — Tek kişinin başlattığı viral kampanyaların araştırması (Fazlıoğlu, Hajipour, Butcher, Damra, vb.)
- `docs/research-avatar-design.md` — Profil fotoğrafı ve marka kimliği araştırması (Goldberg-Polin gün sayacı, HRC equal sign, BlueForSudan)
- `docs/campaign-strategy.md` — Tam kampanya stratejisi (günlük iş akışı, tweet format kuralları, optimizasyon)
- `docs/brand-guidelines.md` — Görsel kimlik kuralları
- `prompts/daily-prompts.md` — İlk 14 günün Nano Banana Pro promptları ve tweet metinleri
- `prompts/profile-banner.md` — Profil fotoğrafı ve banner promptları

## X Algoritması

Kaynak: x-algorithm-main (2026, Grok-based transformer)

### Dogrulanmis (kaynak koddan)
- 19 Phoenix sinyali: favorite, reply, repost, quote, click, profile_click, vqv, photo_expand, share, share_via_dm, share_via_copy_link, dwell, dwell_time, follow_author, not_interested, block_author, mute_author, report
- Sabit agirlik YOKTUR — transformer ogreniyor
- Candidate isolation: tweetler birbirini gormez (self-attention only)

### Algoritma Kontrolleri
Algoritma skorlama Xquik compose API uzerinden CANLI yapilir (11 kontrol).
Lokal hardcoded kurallar kaldirildi — src/lib/algorithmData.ts 24 saat cache ile Xquik'ten ceker.

### Kampanya Kurallari (algoritma degil, marka kimligi)
- Tweet "GUN [sayi]" ile baslar
- #IstanbulBekliyor hashtag'i (tek hashtag, Xquik 0-1 hashtag'e izin veriyor)
- Paylasim 09:00 TSI
- 1:1 gorsel (siyah/beyaz + altin)
- checkCampaignRules() ile kontrol edilir (src/lib/utils.ts)

## Nano Banana Pro Görsel Üretim Kuralları

Her günlük görsel şu formülü takip eder:
1. Arka plan siyah veya koyu gri
2. Sahne İstanbul'a ait bir mekan veya sembolik nesne
3. Tüm sahne siyah beyaz
4. TEK BİR eleman altın (#D4A843) renginde
5. Görselin üstünde büyük "GÜN [SAYI]" yazısı, temiz sans serif
6. 1:1 kare format
7. 2K çözünürlük, temperature 0.7

Prompt şablonu:
```
Minimalist [photograph/editorial] of [SAHNE], shot in stark black and 
white. [SAHNE DETAYI]. [TEK ALTIN ELEMAN] has a warm amber gold color 
(#D4A843). Everything else is deep black and charcoal gray. [KAMERA]. 
Bold clean text reading "GÜN [SAYI]" in large uppercase sans-serif 
font at the top of the frame. Brutalist minimalist style. 
1:1 aspect ratio at 2K resolution.
```
