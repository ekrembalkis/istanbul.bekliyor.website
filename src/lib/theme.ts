import { flushSync } from 'react-dom'

export type ThemeChoice = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'ib-theme'

function safeLocalGet(): ThemeChoice | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'light' || v === 'dark' || v === 'system' ? v : null
  } catch {
    return null
  }
}
function safeLocalSet(v: ThemeChoice) {
  try {
    localStorage.setItem(STORAGE_KEY, v)
  } catch {
    /* private mode — ignore */
  }
}

const mq = () =>
  typeof window === 'undefined'
    ? null
    : window.matchMedia('(prefers-color-scheme: dark)')

export function getStoredTheme(): ThemeChoice {
  return safeLocalGet() ?? 'system'
}

export function resolveTheme(choice: ThemeChoice): ResolvedTheme {
  if (choice === 'system') return mq()?.matches ? 'dark' : 'light'
  return choice
}

export function applyTheme(choice: ThemeChoice): ResolvedTheme {
  const resolved = resolveTheme(choice)
  document.documentElement.setAttribute('data-theme', resolved)
  document.documentElement.dataset.themeChoice = choice
  safeLocalSet(choice)
  return resolved
}

/** Subscribes to system theme changes. Only fires when current choice is 'system'. */
export function watchSystem(onChange: (resolved: ResolvedTheme) => void): () => void {
  const m = mq()
  if (!m) return () => {}
  const handler = () => {
    if (getStoredTheme() === 'system') {
      const next = m.matches ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', next)
      onChange(next)
    }
  }
  m.addEventListener('change', handler)
  return () => m.removeEventListener('change', handler)
}

interface RevealOrigin {
  x: number
  y: number
}

/**
 * Apply a theme choice with View Transitions API circular reveal from the
 * given screen coordinates. Falls back to instant swap when the API is
 * unavailable or the user prefers reduced motion.
 */
export function applyThemeWithTransition(
  next: ThemeChoice,
  origin: RevealOrigin,
  reactStateUpdate: () => void,
): void {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const start = document.startViewTransition

  if (!start || reduced) {
    reactStateUpdate()
    applyTheme(next)
    return
  }

  const w = window.innerWidth
  const h = window.innerHeight
  const radius = Math.hypot(
    Math.max(origin.x, w - origin.x),
    Math.max(origin.y, h - origin.y),
  )
  const root = document.documentElement
  root.style.setProperty('--vt-x', `${origin.x}px`)
  root.style.setProperty('--vt-y', `${origin.y}px`)
  root.style.setProperty('--vt-r', `${radius}px`)

  start.call(document, () => {
    flushSync(() => {
      reactStateUpdate()
    })
    applyTheme(next)
  })
}
