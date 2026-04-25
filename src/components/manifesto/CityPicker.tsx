import { useId, useMemo } from 'react'
import { ALL_CITY_OPTIONS } from '../../data/cities'

type Props = {
  value: string
  onChange: (next: string) => void
  error?: string
}

const DATALIST_ID = 'manifesto-city-options'

export function CityPicker({ value, onChange, error }: Props) {
  const inputId = useId()
  const errorId = useId()
  const options = useMemo(() => ALL_CITY_OPTIONS, [])

  return (
    <div>
      <label
        htmlFor={inputId}
        className="editorial-mono text-accent block"
        style={{ letterSpacing: '0.32em' }}
      >
        — İL
      </label>
      <input
        id={inputId}
        type="text"
        list={DATALIST_ID}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete="address-level1"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        placeholder="Yazmaya başla — İstanbul, Ankara, İzmir…"
        className="mt-3 w-full font-serif text-ink bg-transparent border border-rule focus:border-accent focus:outline-none p-3 transition-colors"
        style={{ fontSize: 18 }}
      />
      <datalist id={DATALIST_ID}>
        {options.map(city => (
          <option key={city.slug} value={city.name}>
            {city.region}
          </option>
        ))}
      </datalist>
      {error && (
        <div id={errorId} className="editorial-mono text-accent mt-2" style={{ fontSize: 11, letterSpacing: '0.22em' }}>
          {error}
        </div>
      )}
    </div>
  )
}
