// NBP (Nano Banana Pro) prompt generation service
// Calls /api/generate-prompt serverless endpoint

import { trackGeminiUsage } from './costTracker'
import type { GeminiUsage } from './costTracker'

export interface NbpPromptRequest {
  theme: string
  scene: string
  goldenElement: string
  dayNumber: number
  mode: 'generate' | 'refine'
  existingPrompt?: string
  topicContext?: string
}

export interface NbpPromptResponse {
  prompt: string
  mode: string
  theme: string
  dayNumber: number
  geminiUsage: GeminiUsage
}

export async function generateNbpPrompt(req: NbpPromptRequest): Promise<NbpPromptResponse> {
  const res = await fetch('/api/generate-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Prompt üretimi başarısız')
  }

  const data: NbpPromptResponse = await res.json()

  if (data.geminiUsage) {
    trackGeminiUsage(data.geminiUsage)
  }

  return data
}
