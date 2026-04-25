// Serverless Instagram content generator: Gemini AI
// POST /api/generate-instagram { title, description, url, source, category }
// Returns: { imageText, captionHook, captionBody }

import { geminiGenerate, sanitizePromptInput, handleGeminiError } from './_lib/gemini.js'
import { rateLimit } from './_lib/rateLimit.js'

const INSTAGRAM_SCHEMA = {
  type: 'object',
  properties: {
    imageText: { type: 'string' },
    captionHook: { type: 'string' },
    captionBody: { type: 'string' },
    imageSearchQuery: { type: 'string' },
  },
  required: ['imageText', 'captionHook', 'captionBody'],
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' })
  }
  if (!rateLimit(req, res, { scope: 'gen-instagram', limit: 30 })) return

  const { title: rawTitle, description: rawDesc, source: rawSource } = req.body || {}

  if (!rawTitle) {
    return res.status(400).json({ error: 'title is required' })
  }

  // RSS-derived input — sanitize before interpolating into the prompt.
  const title = sanitizePromptInput(rawTitle, { maxLen: 300 })
  const description = sanitizePromptInput(rawDesc || 'Detay yok', { maxLen: 2000 })
  const source = sanitizePromptInput(rawSource || 'Bilinmiyor', { maxLen: 100 })

  const systemPrompt = `Sen İstanbul Bekliyor (@istbekliyor) kampanyasının Instagram içerik editörüsün.

KİMLİK:
- Haber odaklı bir hesap
- Türkiye gündemini takip eden kampanya
- Clickbait YAPMA, ama etkili hook yaz

DİL KURALLARI — ZORUNLU:
- Türkçe yazım kurallarına MUTLAKA uy (TDK kuralları)
- Doğru noktalama: virgül, nokta, iki nokta, tırnak işaretleri
- Doğru büyük-küçük harf kullanımı (cümle başı büyük, özel isimler büyük)
- "de/da" bağlacı ayrı yazılır, "-de/-da" eki bitişik
- "-ki" bağlacı ayrı, "-ki" eki bitişik
- Apostropler doğru yerde olmalı (özel isimlerde: Özel'in, Türkiye'de)
- Yanlış: "suc duyurusunda" → Doğru: "suç duyurusunda"
- Yanlış: "gerekcesiyle" → Doğru: "gerekçesiyle"

GÖREV: Verilen haberden TAM OLARAK 1 adet JSON objesi üret. DİZİ DÖNDÜRME.

OUTPUT 1 — imageText:
- Instagram post görselinin alt kısmına yazılacak metin
- Haberi yeniden yaz: öz, net, sade haber dili
- 1-3 cümle, max ~200 karakter ideal
- BÜYÜK HARF kullanma, normal cümle yapısı
- Orijinal başlığı birebir kopyalama, kendi cümlenle yaz

OUTPUT 2 — captionHook:
- 2-3 BÜYÜK KELİME — haberin özünü vurucu şekilde sıkıştır
- Jenerik kelimeler YASAK: "Son Dakika", "Gündem", "Haber Alert", "Flaş" gibi her habere yazılabilecek hook kullanma
- Habere ÖZEL olmalı — o haberi okumadan bu hook'u yazamazsın
- İYİ örnekler: "KUMPAS ÇÖKTÜ", "HESAP SORULACAK", "EVRAK TAKTİĞİ", "BAKAN HAREKETE GEÇTİ", "SUÇ DUYURUSU BOMBASI"
- KÖTÜ örnekler: "SON DAKİKA", "GÜNDEM", "FLAŞ HABER", "ÖNEMLİ GELİŞME"
- Sadece hook kelimeleri ver, tire veya ek açıklama KOYMA

OUTPUT 3 — captionBody:
- Instagram caption metni, EN AZ 4-5 paragraf
- Tamamen tarafsız haber dili — kişisel yorum KATMA, editoryal yorum KATMA
- Sadece haberi aktar: ne oldu, kim yaptı, ne söylendi, süreç nasıl ilerliyor
- YAPI: Giriş → Gelişme → Detay → Sonuç (payoff SONDA)
- Giriş (1. paragraf): Haberin özeti, okuyucuyu içeri çeker
- Gelişme (2-3. paragraf): Ne oldu, kim ne dedi, detayları açar
- Detay (4. paragraf): Bağlam verir, sürecin nereye gittiğini anlatır
- Sonuç/Payoff (son paragraf): Güçlü kapanış, vurucu son cümle
- Paragrafları \\n\\n ile ayır
- Son satır: "Kaynak: [kaynak adı]" sonra \\n\\n#İstanbulBekliyor

OUTPUT 4 — imageSearchQuery:
- Google Görseller'de bu habere en uygun fotoğrafı bulmak için arama terimi
- Haberdeki kişilerin AD SOYAD'larını kullan (en önemli kısım)
- Varsa olayın geçtiği YER'i ekle
- 2-5 kelime, kısa ve doğrudan
- Örnek: haber "Adalet Bakanı Akın Gürlek, Özgür Özel hakkında suç duyurusu" → "Akın Gürlek Özgür Özel"
- Örnek: haber "İstanbul'da sel felaketi" → "İstanbul sel"
- Sadece isim ve anahtar olay kelimesi, gereksiz fiil ve bağlaç KOYMA

ÖNEMLİ: Sadece TEK bir JSON objesi dön, DİZİ DÖNME. Markdown code block KOYMA.`

  const userPrompt = `HABER:
Başlık: ${title}
Detay: ${description}
Kaynak: ${source}

Bu haberden Instagram içeriği üret. Tek bir JSON objesi dön (DİZİ DEĞİL): {"imageText":"...","captionHook":"...","captionBody":"...","imageSearchQuery":"..."}`

  try {
    const { json: result } = await geminiGenerate({
      systemInstruction: systemPrompt,
      prompt: userPrompt,
      responseJsonSchema: INSTAGRAM_SCHEMA,
      generationConfigOverrides: { maxOutputTokens: 2500 },
    })

    if (!result || !result.imageText || !result.captionHook || !result.captionBody) {
      return res.status(502).json({ error: 'Incomplete Gemini response', raw: result })
    }

    return res.status(200).json({
      imageText: result.imageText,
      captionHook: result.captionHook,
      captionBody: result.captionBody,
      imageSearchQuery: result.imageSearchQuery || '',
    })
  } catch (err) {
    console.error('generate-instagram error:', err)
    return handleGeminiError(err, res)
  }
}
