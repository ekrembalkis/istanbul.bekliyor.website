import {
  ALL_TEMPLATES,
  TEMPLATE_DESCRIPTIONS,
  TEMPLATE_LABELS,
  type CardTemplate,
} from '../../../lib/cards/templates'
import { Chip } from './Chip'

type Props = {
  value: CardTemplate
  onChange: (next: CardTemplate) => void
}

export function TemplatePicker({ value, onChange }: Props) {
  return (
    <div>
      <Label>ŞABLON</Label>
      <div className="flex flex-wrap gap-2 mt-3" role="group" aria-label="Kart şablonu">
        {ALL_TEMPLATES.map(t => (
          <Chip
            key={t}
            label={TEMPLATE_LABELS[t]}
            selected={value === t}
            hint={TEMPLATE_DESCRIPTIONS[t]}
            onClick={() => onChange(t)}
          />
        ))}
      </div>
      <p className="font-serif italic text-ink-muted mt-2" style={{ fontSize: 14 }}>
        {TEMPLATE_DESCRIPTIONS[value]}
      </p>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="editorial-mono text-accent"
      style={{ letterSpacing: '0.32em' }}
    >
      — {children}
    </span>
  )
}
