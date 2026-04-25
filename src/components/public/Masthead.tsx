import { SITE } from '../../config/site'
import { ThemeToggle } from '../ThemeToggle'

type Props = {
  day: number
  /** Optional override for the right-most label. Defaults to "İSTANBUL · MMXXVI". */
  rightLabel?: string
}

export function Masthead({ day, rightLabel }: Props) {
  return (
    <div className="col-span-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-rule pb-4 editorial-mono text-ink-muted">
      <span className="text-ink">
        <b className="font-semibold tracking-[0.22em]">{SITE.manifestoTitle}</b>
        <span className="ml-3 opacity-60">— MANIFESTO</span>
      </span>
      <span className="hidden md:inline">
        <span className="inline-block px-2.5 py-1 bg-accent text-white rounded-sm tracking-[0.22em]">
          N°&nbsp;{String(day).padStart(3, '0')}
        </span>
      </span>
      <span className="hidden lg:inline">{rightLabel ?? `İSTANBUL · ${SITE.romanYear}`}</span>
      <ThemeToggle />
    </div>
  )
}
