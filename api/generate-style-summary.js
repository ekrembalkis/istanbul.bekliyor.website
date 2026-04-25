// Serverless style summary generator — distills tweets into a comprehensive style guide
// POST /api/generate-style-summary { tweets: string[], username: string, language?: string }

import { geminiGenerate, sanitizePromptInput, handleGeminiError } from './_lib/gemini.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { tweets = [], username = '', language = '' } = req.body || {}
  if (!Array.isArray(tweets) || tweets.length < 5) {
    return res.status(400).json({ error: 'Need at least 5 tweets' })
  }

  const slicedTweets = tweets.slice(0, 100)
  const numbered = slicedTweets
    .map((t, i) => {
      const cleaned = sanitizePromptInput(String(t).replace(/https?:\/\/\S+/g, '').trim(), { maxLen: 600 })
      return `${i + 1}. ${cleaned}`
    })
    .join('\n')
  const safeUsername = sanitizePromptInput(username, { maxLen: 64 })

  const lang = language || 'tr'
  const langInstruction = lang === 'tr'
    ? 'Turkce yaz. Tweet orneklerini oldugu gibi kullan.'
    : `Write in ${lang.toUpperCase()}. Use actual tweet quotes as examples.`

  try {
    const prompt = `Analyze these ${slicedTweets.length} tweets from @${safeUsername} and create a comprehensive STYLE SUMMARY that captures how this person writes.

TWEETS:
${numbered}

Create a detailed style guide covering ALL of these:

1. CUMLE YAPISI: Tipik cumle uzunlugu, yapi tercihleri (kisa-kesik mi, uzun-akici mi, karma mi)
2. KELIME TERCIHLERI: Sik kullandigi kelimeler, baglaclari, edatlari, dolgu kelimeleri
3. CUMLE RITMI: Kisa vurus + uzun cumle karisimlari, tekrar kaliplari
4. ACILIS STILI: Tweetlere nasil basliyor (soru, iddia, gozlem, tepki, anekdot)
5. KAPANIS STILI: Tweetleri nasil bitiriyor (acik birakma, punchline, soru, nokta)
6. KARAKTERISTIK KALIPLAR: Bu kisiye ozgu tekrar eden ifade kaliplari (EN AZ 8 TANE, tweetlerden direkt alintilarla)
7. ARGO/SLANG: Kullandigi informal ifadeler ve bunlari NASIL kullandigi (cumle basi, sonu, vurgu icin)
8. MIZAH TEKNIGI: Ironi, abarti, understatement, absurt, kara mizah — somut orneklerle
9. ARGUMAN AKISI: Bir konuda nasil fikir belirtiyor, nasil savunuyor, nasil elestiriyor
10. DUYGU IFADESI: Ofkeyi, sevinci, hayal kirikligini nasil ifade ediyor
11. NOKTALAMA ALISKANLIKLARI: Virgul, nokta, uc nokta, unlem, soru isareti kullanim frekansi
12. ASLA YAPMAYACAGI SEYLER: Bu kisinin asla kullanmayacagi stilistik tercihler (en az 5)

${langInstruction}
Somut, spesifik, uygulanabilir yaz. Her madde icin tweetlerden gercek ornekler ver.
500-800 kelime arasi saf stil kilavuzu metni dondur. JSON degil, markdown degil, duz metin.`

    const { text: summary, usage } = await geminiGenerate({
      prompt,
      systemInstruction:
        'You distill writing style into actionable plain-text style guides; never reply with JSON or markdown.',
      generationConfigOverrides: { maxOutputTokens: 1200 },
    })

    if (!summary || summary.length < 100) {
      return res.status(502).json({ error: 'Style summary generation failed (too short)' })
    }

    return res.status(200).json({
      summary,
      geminiUsage: { ...usage, calls: 1 },
      tweetCount: slicedTweets.length,
    })
  } catch (error) {
    console.error('generate-style-summary error:', error)
    return handleGeminiError(error, res)
  }
}
