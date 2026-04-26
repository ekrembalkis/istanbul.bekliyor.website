import { useId } from 'react'
import type { Detainee } from '../../lib/detainees'

type Props = {
  detainees: Detainee[]
  value: string  // detainee.id or '' for general
  onChange: (next: string) => void
}

const GENERAL_VALUE = ''

export function RecipientPicker({ detainees, value, onChange }: Props) {
  const id = useId()
  return (
    <div>
      <label
        htmlFor={id}
        className="editorial-mono text-accent block"
        style={{ letterSpacing: '0.32em' }}
      >
        — KİME?
      </label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="mt-3 w-full font-serif text-ink bg-transparent border border-rule focus:border-accent focus:outline-none p-3 transition-colors"
        style={{ fontSize: 18 }}
      >
        <option value={GENERAL_VALUE}>Genel duvara — herkes okuyabilir</option>
        {detainees.map(d => (
          <option key={d.id} value={d.id}>
            {d.name}{d.title ? ` — ${d.title}` : ''} ({d.day_count} gündür)
          </option>
        ))}
      </select>
    </div>
  )
}
