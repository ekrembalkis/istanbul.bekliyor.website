import { useEffect, useRef, useState, useCallback, type ReactElement } from 'react'
import {
  applyThemeWithTransition,
  getStoredTheme,
  watchSystem,
  type ThemeChoice,
} from '../lib/theme'

const OPTIONS: { value: ThemeChoice; label: string; icon: ReactElement }[] = [
  {
    value: 'light',
    label: 'Aydınlık tema',
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <circle cx="12" cy="12" r="4" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <line x1="12" y1="2.5" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="21.5" />
          <line x1="2.5" y1="12" x2="5" y2="12" />
          <line x1="19" y1="12" x2="21.5" y2="12" />
          <line x1="5.2" y1="5.2" x2="6.9" y2="6.9" />
          <line x1="17.1" y1="17.1" x2="18.8" y2="18.8" />
          <line x1="5.2" y1="18.8" x2="6.9" y2="17.1" />
          <line x1="17.1" y1="6.9" x2="18.8" y2="5.2" />
        </g>
      </svg>
    ),
  },
  {
    value: 'system',
    label: 'Sistem teması',
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <rect x="3.5" y="4.5" width="17" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <line x1="8" y1="20" x2="16" y2="20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="12" y1="16.5" x2="12" y2="20" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Karanlık tema',
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path d="M20.5 14.5A8 8 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" fill="currentColor" />
      </svg>
    ),
  },
]

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [choice, setChoice] = useState<ThemeChoice>(() =>
    typeof window === 'undefined' ? 'system' : getStoredTheme(),
  )
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    return watchSystem(() => {
      /* attribute updated by watcher; React state stays on 'system' */
    })
  }, [])

  const select = useCallback(
    (next: ThemeChoice, originEl: HTMLElement) => {
      if (next === choice) return
      const rect = originEl.getBoundingClientRect()
      applyThemeWithTransition(
        next,
        { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
        () => setChoice(next),
      )
    },
    [choice],
  )

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = OPTIONS.findIndex(o => o.value === choice)
    let nextIdx = -1
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIdx = (idx + 1) % OPTIONS.length
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIdx = (idx - 1 + OPTIONS.length) % OPTIONS.length
        break
      case 'Home':
        nextIdx = 0
        break
      case 'End':
        nextIdx = OPTIONS.length - 1
        break
      default:
        return
    }
    e.preventDefault()
    const target = buttonRefs.current[nextIdx]
    if (target) {
      target.focus()
      select(OPTIONS[nextIdx].value, target)
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="Tema seçimi"
      onKeyDown={onKeyDown}
      className={
        'inline-flex items-center gap-0.5 p-[3px] rounded-full border border-rule bg-paper/40 backdrop-blur-[2px] ' +
        className
      }
    >
      {OPTIONS.map((opt, i) => {
        const active = choice === opt.value
        return (
          <button
            key={opt.value}
            ref={el => {
              buttonRefs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={opt.label}
            tabIndex={active ? 0 : -1}
            onClick={e => select(opt.value, e.currentTarget)}
            className={
              'relative flex items-center justify-center w-7 h-7 rounded-full transition-colors ' +
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ' +
              (active
                ? 'bg-accent text-white'
                : 'text-ink-muted hover:text-ink hover:bg-paper/60')
            }
          >
            {opt.icon}
          </button>
        )
      })}
    </div>
  )
}
