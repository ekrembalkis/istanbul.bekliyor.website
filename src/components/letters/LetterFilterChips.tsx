import { Chip } from '../cards/form/Chip'
import type { Detainee } from '../../lib/detainees'
import type { LettersFilter } from '../../lib/letters'

type Props = {
  detainees: Detainee[]
  value: LettersFilter
  onChange: (next: LettersFilter) => void
}

function isDetaineeFilter(v: LettersFilter, id: string): boolean {
  return v.kind === 'detainee' && v.id === id
}

export function LetterFilterChips({ detainees, value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3" role="group" aria-label="Mektup süzgeci">
      <Chip
        label="TÜMÜ"
        selected={value.kind === 'all'}
        onClick={() => onChange({ kind: 'all' })}
      />
      <Chip
        label="GENEL"
        selected={value.kind === 'general'}
        onClick={() => onChange({ kind: 'general' })}
      />
      {detainees.map(d => (
        <Chip
          key={d.id}
          label={d.name.toLocaleUpperCase('tr-TR')}
          selected={isDetaineeFilter(value, d.id)}
          onClick={() => onChange({ kind: 'detainee', id: d.id })}
        />
      ))}
    </div>
  )
}
