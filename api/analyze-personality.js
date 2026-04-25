// Serverless personality DNA analyzer — Hybrid approach (full DNA + topic profiles)
// POST /api/analyze-personality { tweets: string[] }

import { geminiGenerate, sanitizePromptInput, handleGeminiError } from './_lib/gemini.js'
import { rateLimit } from './_lib/rateLimit.js'

const DNA_SCHEMA = {
  type: 'object',
  properties: {
    language: { type: 'string' },
    identity: {
      type: 'object',
      properties: {
        archetype: { type: 'string' },
        worldview: { type: 'string' },
        expertise: { type: 'array', items: { type: 'string' } },
      },
      required: ['archetype', 'worldview', 'expertise'],
    },
    voice: {
      type: 'object',
      properties: {
        toneSpectrum: { type: 'string' },
        openingStyle: { type: 'string' },
        closingStyle: { type: 'string' },
        signaturePhrases: { type: 'array', items: { type: 'string' } },
        humorStyle: { type: 'string' },
      },
    },
    reactions: {
      type: 'object',
      properties: {
        toGoodNews: { type: 'string' },
        toBadNews: { type: 'string' },
        toControversy: { type: 'string' },
      },
    },
    boundaries: {
      type: 'object',
      properties: {
        neverDoes: { type: 'array', items: { type: 'string' } },
        alwaysDoes: { type: 'array', items: { type: 'string' } },
      },
    },
    personalityTraits: {
      type: 'object',
      properties: {
        formality: { type: 'integer', minimum: 0, maximum: 100 },
        humor: { type: 'integer', minimum: 0, maximum: 100 },
        controversy: { type: 'integer', minimum: 0, maximum: 100 },
        empathy: { type: 'integer', minimum: 0, maximum: 100 },
        authenticity: { type: 'integer', minimum: 0, maximum: 100 },
      },
    },
    topicProfiles: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          topic: { type: 'string' },
          tone: { type: 'string' },
          behavior: { type: 'string' },
          typicalReaction: { type: 'string' },
        },
      },
    },
    slangPatterns: { type: 'array', items: { type: 'string' } },
    cognitiveFilters: { type: 'array', items: { type: 'string' } },
    narrativeTechniques: { type: 'array', items: { type: 'string' } },
    ironyTechniques: { type: 'array', items: { type: 'string' } },
    ironyExamples: { type: 'array', items: { type: 'string' } },
    contextualBehavior: {
      type: 'object',
      properties: {
        whenHappy: { type: 'string' },
        whenAngry: { type: 'string' },
        whenBored: { type: 'string' },
      },
    },
  },
  required: ['identity'],
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!rateLimit(req, res, { scope: 'analyze-personality', limit: 12 })) return

  const { tweets = [] } = req.body || {}
  if (!Array.isArray(tweets) || tweets.length < 5) {
    return res.status(400).json({ error: 'Need at least 5 tweets' })
  }

  const numberedTweets = tweets
    .slice(0, 100)
    .map((t, i) => {
      const cleaned = sanitizePromptInput(String(t).replace(/https?:\/\/\S+/g, '').trim(), { maxLen: 600 })
      return `${i + 1}. ${cleaned}`
    })
    .join('\n')

  try {
    const prompt = `These ${tweets.length} tweets belong to the same person. Extract their personality DNA and topic-based behavior profiles.

TWEETS:
${numberedTweets}

Fill in the JSON structure below completely. IMPORTANT: Write ALL values in the SAME LANGUAGE as the tweets above. If tweets are in Turkish, write in Turkish. If in English, write in English. Match the tweet language exactly.

{
  "language": "ISO 639-1 language code of the tweets (e.g. tr, en, ar, es, fr, de, ja, ko, pt)",
  "identity": {
    "archetype": "what type of person is this, 3-5 words",
    "worldview": "their worldview, what they believe in, what they defend",
    "expertise": ["top 3 topics they talk about"]
  },
  "voice": {
    "toneSpectrum": "main tone of voice",
    "openingStyle": "how they start tweets",
    "closingStyle": "how they end tweets",
    "signaturePhrases": ["at least 8 signature words/phrases in original language"],
    "humorStyle": "humor style"
  },
  "reactions": {
    "toGoodNews": "how they react to good news",
    "toBadNews": "how they react to bad news",
    "toControversy": "how they react to controversy"
  },
  "boundaries": {
    "neverDoes": ["things they never do, at least 5"],
    "alwaysDoes": ["things they always do, at least 5"]
  },
  "personalityTraits": {
    "formality": "0-100",
    "humor": "0-100",
    "controversy": "0-100",
    "empathy": "0-100",
    "authenticity": "0-100"
  },
  "topicProfiles": [
    {
      "topic": "topic name",
      "tone": "tone for this topic",
      "behavior": "how they behave on this topic, 1-2 sentences",
      "typicalReaction": "typical reaction to news about this topic"
    }
  ],
  "NOTE_topicProfiles": "MUST include at least 5 different topic profiles covering the person's main areas",
  "slangPatterns": ["slang/informal expressions this person uses, in original language. e.g. Turkish: amk, aq, valla. English: lol, bruh, ngl. List actual patterns from tweets."],
  "cognitiveFilters": [
    "through what lens does this person see events? e.g. 'connects everything to football', 'reduces serious topics to personal experience'. At least 2 filters."
  ],
  "narrativeTechniques": [
    "how does this person tell stories / be funny? e.g. 'gives concrete details (names, numbers, places)', 'makes absurd personal confessions'. Extract from tweets, at least 3."
  ],
  "ironyTechniques": [
    "how does this person use irony? e.g. 'understatement', 'reframing (presents good news as bad)', 'absurd context shifting'. Extract from tweets, at least 2."
  ],
  "ironyExamples": [
    "pick at least 5 REAL irony/humor examples from the tweets and write them as-is. These will be few-shot examples for the model."
  ],
  "contextualBehavior": {
    "whenHappy": "what they do when happy",
    "whenAngry": "what they do when angry",
    "whenBored": "what they do when bored"
  }
}

Return ONLY JSON, no explanation.`

    const { json: dna, usage } = await geminiGenerate({
      prompt,
      systemInstruction: 'You are a personality DNA analyst. Always reply with valid JSON matching the supplied schema.',
      responseJsonSchema: DNA_SCHEMA,
      generationConfigOverrides: { maxOutputTokens: 3000 },
    })

    if (!dna || !dna.identity) {
      return res.status(502).json({ error: 'DNA extraction failed (schema mismatch)' })
    }

    dna.version = 2
    dna.analyzedTweetCount = tweets.slice(0, 100).length

    return res.status(200).json({
      dna,
      geminiUsage: { ...usage, calls: 1 },
      tweetCount: tweets.length,
    })
  } catch (error) {
    console.error('analyze-personality error:', error)
    return handleGeminiError(error, res)
  }
}
