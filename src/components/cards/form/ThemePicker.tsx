import type { CardTheme } from '../../../lib/cards/templates'
import { Chip } from './Chip'

type Props = {
  value: CardTheme
  onChange: (next: CardTheme) => void
}

export function ThemePicker({ value, onChange }: Props) {
  return (
    <div>
      <span className="editorial-mono text-accent" style={{ letterSpacing: '0.32em' }}>
        — KART TEMASI
      </span>
      <div className="flex gap-2 mt-3" role="group" aria-label="Kart teması">
        <Chip label="AÇIK" selected={value === 'light'} onClick={() => onChange('light')} />
        <Chip label="KOYU" selected={value === 'dark'} onClick={() => onChange('dark')} />
      </div>
    </div>
  )
}
