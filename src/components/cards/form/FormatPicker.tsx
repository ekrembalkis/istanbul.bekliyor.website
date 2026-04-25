import {
  ALL_FORMATS,
  FORMAT_DIMENSIONS,
  FORMAT_LABELS,
  type CardFormat,
} from '../../../lib/cards/templates'
import { Chip } from './Chip'

type Props = {
  value: CardFormat
  onChange: (next: CardFormat) => void
}

export function FormatPicker({ value, onChange }: Props) {
  return (
    <div>
      <span className="editorial-mono text-accent" style={{ letterSpacing: '0.32em' }}>
        — FORMAT
      </span>
      <div className="flex flex-wrap gap-2 mt-3" role="group" aria-label="Kart formatı">
        {ALL_FORMATS.map(f => (
          <Chip
            key={f}
            label={FORMAT_LABELS[f]}
            selected={value === f}
            hint={`${FORMAT_DIMENSIONS[f].w} × ${FORMAT_DIMENSIONS[f].h}`}
            onClick={() => onChange(f)}
          />
        ))}
      </div>
    </div>
  )
}
