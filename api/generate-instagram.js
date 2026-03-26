// Serverless Instagram content generator: Gemini AI
// POST /api/generate-instagram { title, description, url, source, category }
// Returns: { imageText, captionHook, captionBody }

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/models'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' })
  }

  const { title, description, url, source } = req.body

  if (!title) {
    return res.status(400).json({ error: 'title is required' })
  }

  const systemPrompt = `Sen İstanbul Bekliyor (@istbekliyor) kampanyasının Instagram içerik editörüsün.

KİMLİK:
- Muhalefet destekçisi, haber odaklı hesap
- Türkiye gündemini takip eden, Ekrem İmamoğlu'nun tutuklanmasını protesto eden kampanya
- Haber dili korunur ama uygun yerlerde kısa, keskin yorum eklenir
- Clickbait YAPMA, ama etkili hook yaz

GÖREV: Verilen haberden 3 ayrı output üret.

OUTPUT 1 — GÖRSEL ÜSTÜ METİN (imageText):
- Instagram post görselinin alt kısmına yazılacak metin
- Haberi öz ve net açıklar
- Görsele sığacak uzunlukta (1-3 cümle, max ~200 karakter ideal)
- Haber dili, sade, serif font'a uygun
- BÜYÜK HARF kullanma, normal cümle yapısı

OUTPUT 2 — CAPTION HOOK (captionHook):
- 2-3 BÜYÜK KELİME — dikkat çekici ama clickbait değil
- Haberin özünü 2-3 kelimeye sıkıştır
- Örnekler: "KUMPAS ÇÖKTÜ", "HESAP SORULACAK", "ADALET NEREDE", "SKANDAL ORTAYA ÇIKTI", "BAKAN ÇILDIRDI"
- Sadece hook kelimeleri, tire veya ek açıklama KOYMA

OUTPUT 3 — CAPTION BODY (captionBody):
- Instagram caption metni
- YAPI: Giriş → Gelişme → Sonuç (payoff sonda)
- Giriş: Okuyucuyu haberin içine çeker, hook'un devamı niteliğinde
- Gelişme: Ne oldu, neden önemli, bağlam verir
- Sonuç/Payoff: Güçlü kapanış, gerekirse kampanya mesajına bağlar
- Uygun yerlerde kısa muhalefet yorumu eklenebilir (ama abartılmaz)
- Paragraflar arasında boş satır bırak
- Sonda kaynak belirt: "Kaynak: [kaynak adı]"
- En sonda: #İstanbulBekliyor hashtag'i

ZORUNLU JSON FORMATI:
{
  "imageText": "...",
  "captionHook": "...",
  "captionBody": "..."
}`

  const userPrompt = `HABER:
Başlık: ${title}
Detay: ${description || 'Detay yok'}
Kaynak: ${source || 'Bilinmiyor'}
URL: ${url || ''}

Bu haberden Instagram içeriği üret. JSON formatında dön.`

  try {
    const geminiUrl = `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      return res.status(502).json({ error: `Gemini API error: ${response.status}` })
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      return res.status(502).json({ error: 'Empty Gemini response' })
    }

    // Gemini sometimes returns unescaped control chars inside JSON string values
    // Fix: escape raw newlines/tabs that appear inside string literals
    const sanitized = text.replace(/[\x00-\x1f]/g, (ch) => {
      if (ch === '\n') return '\\n'
      if (ch === '\r') return '\\r'
      if (ch === '\t') return '\\t'
      return ''
    })

    const result = JSON.parse(sanitized)

    // Validate required fields
    if (!result.imageText || !result.captionHook || !result.captionBody) {
      return res.status(502).json({ error: 'Incomplete Gemini response', raw: result })
    }

    return res.status(200).json(result)
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unknown error' })
  }
}
