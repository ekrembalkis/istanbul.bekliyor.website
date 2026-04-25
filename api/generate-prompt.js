// Serverless NBP prompt generator using the centralized Gemini helper.
// POST /api/generate-prompt { theme, scene, goldenElement, dayNumber, mode, existingPrompt?, topicContext? }

import { geminiGenerate, sanitizePromptInput, handleGeminiError } from './_lib/gemini.js'

const SYSTEM_PROMPT = `Sen bir Nano Banana Pro gorsel prompt muhendisisin. Istanbul Bekliyor kampanyasi icin gunluk gorsel promptlari yaziyorsun.

GORSEL FORMUL (ASLA degistirme):
- Minimalist siyah beyaz fotograf
- TEK bir eleman altin/amber renkte (#D4A843)
- "GUN [sayi]" yazisi: buyuk, temiz, sans-serif, karenin ust kisminda
- 1:1 kare format, 2K cozunurluk
- Brutalist, minimalist, editorial estetik
- Derin siyah, koyu gri tonlar, yuksek kontrast
- Negatif alan bol kullan

PROMPT DILI: Ingilizce (Nano Banana Pro Ingilizce anliyor)

PROMPT YAPISI (bu siraya uy):
1. Gorsel tipi ve sahne ("Minimalist photograph of..." veya "Minimalist editorial photograph of...")
2. Sahne detaylari (kompozisyon, perspektif, isik yonu, atmosfer)
3. Siyah beyaz vurgusu ("shot in stark black and white")
4. Altin eleman tanimi (renk kodu #D4A843 dahil, "warm amber gold" ifadesi kullan)
5. Kontrast vurgusu ("Everything else is deep black and charcoal gray")
6. Kamera/lens detayi (35mm, 50mm, 85mm, 135mm veya 200mm — sahneye uygun sec)
7. "Bold clean text reading \\"GUN [sayi]\\" in large uppercase sans-serif font at the top of the frame"
8. Stil: "Brutalist minimalist style" veya "Brutalist minimalist editorial style"
9. "1:1 aspect ratio at 2K resolution"

YASAKLAR:
- Renkli gorsel (altin disinda)
- Keyword listesi (dogal Ingilizce cumleler yaz)
- 600 karakteri gecme
- Insan yuzu veya taninabilir kisi
- Marka/logo
- Emoji veya ozel karakter
- "4k, masterpiece, trending" gibi kalite keyword'leri

GUNDEM BAGLAMI: Eger gundem bilgisi verilmisse, sahneyi o baglamla incelikle iliskilendir ama kampanya gorsel formulunden SAPMA.`

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    theme: rawTheme,
    scene: rawScene,
    goldenElement: rawGolden,
    dayNumber,
    mode = 'generate',
    existingPrompt: rawExisting = '',
    topicContext: rawTopic = '',
  } = req.body || {}

  if (!rawTheme || !rawScene || !rawGolden || !dayNumber) {
    return res.status(400).json({ error: 'theme, scene, goldenElement, and dayNumber are required' })
  }

  // Length-cap + escape every user-supplied string.
  const theme = sanitizePromptInput(rawTheme, { maxLen: 200 })
  const scene = sanitizePromptInput(rawScene, { maxLen: 800 })
  const goldenElement = sanitizePromptInput(rawGolden, { maxLen: 200 })
  const existingPrompt = sanitizePromptInput(rawExisting, { maxLen: 1500 })
  const topicContext = sanitizePromptInput(rawTopic, { maxLen: 1500 })
  const dayNum = Number.isFinite(Number(dayNumber)) ? Number(dayNumber) : 0

  try {
    let userPrompt
    if (mode === 'refine') {
      userPrompt = `Asagidaki mevcut Nano Banana Pro prompt'u iyilestir. Ayni temayi ve altin elemani koru ama sahne kompozisyonunu, isik yonlendirmesini ve atmosferi daha etkileyici ve sinematik yap.

Mevcut prompt:
${existingPrompt}

Tema: ${theme}
Sahne: ${scene}
Altin eleman: ${goldenElement}
Gun numarasi: ${dayNum}
${topicContext ? `\nGundem baglami: ${topicContext}\n` : ''}
Iyilestirilmis prompt'u yaz. Sadece Ingilizce prompt metnini dondur, baska hicbir sey yazma.`
    } else {
      userPrompt = `Bu tema icin orijinal bir Nano Banana Pro gorsel prompt'u yaz.

Tema: ${theme}
Sahne: ${scene}
Altin eleman: ${goldenElement}
Gun numarasi: ${dayNum}
${topicContext ? `\nGundem baglami: ${topicContext}\n` : ''}
Sadece Ingilizce prompt metnini dondur, baska hicbir sey yazma.`
    }

    const { text, usage } = await geminiGenerate({
      prompt: userPrompt,
      systemInstruction: SYSTEM_PROMPT,
      generationConfigOverrides: { maxOutputTokens: 600 },
    })

    const geminiUsage = { ...usage, calls: 1 }
    let prompt = text
      .replace(/```[\s\S]*?```/g, '')  // Remove code blocks
      .replace(/^["']|["']$/g, '')      // Remove wrapping quotes
      .replace(/^\s*prompt:\s*/i, '')    // Remove "prompt:" prefix
      .trim()

    if (!prompt || prompt.length < 50) {
      return res.status(500).json({ error: 'Prompt generation failed — response too short', geminiUsage })
    }

    // Post-process validation: ensure critical elements exist
    if (!prompt.includes('#D4A843') && !prompt.includes('D4A843')) {
      prompt += ' The golden element glows with warm amber color (#D4A843).'
    }
    if (!/GUN|GÜN/i.test(prompt)) {
      prompt += ` Bold clean text reading "GUN ${dayNum}" in large uppercase sans-serif font at the top of the frame.`
    }
    if (!prompt.includes('1:1')) {
      prompt += ' 1:1 aspect ratio at 2K resolution.'
    }

    // Trim if too long
    if (prompt.length > 700) {
      prompt = prompt.substring(0, 697) + '...'
    }

    return res.status(200).json({
      prompt,
      mode,
      theme,
      dayNumber: dayNum,
      geminiUsage,
    })
  } catch (error) {
    console.error('Generate prompt error:', error)
    return handleGeminiError(error, res)
  }
}
