import { useEffect, useId, useMemo, useState } from 'react'
import { CityPicker } from '../manifesto/CityPicker'
import { Chip } from '../cards/form/Chip'
import {
  OUTREACH_TEMPLATES,
  findTemplate,
  type OutreachTemplateId,
} from '../../config/outreachTemplates'
import {
  buildXIntentUrl,
  composeLongMessage,
  composeShortMessage,
  TBMM_DEPUTY_SEARCH_URL,
  TBMM_EDILEKCE_URL,
} from '../../lib/outreach'
import { findCityByName, type City } from '../../data/cities'
import { seatsForPlate } from '../../data/deputies'
import { getDayCount } from '../../lib/utils'

const DEFAULT_TEMPLATE: OutreachTemplateId = 'adalet'

export function OutreachForm() {
  const day = getDayCount()
  const [cityName, setCityName] = useState('')
  const [templateId, setTemplateId] = useState<OutreachTemplateId>(DEFAULT_TEMPLATE)
  const [shortText, setShortText] = useState('')
  const [longText, setLongText] = useState('')
  const messageId = useId()

  const city: City | null = useMemo(() => findCityByName(cityName), [cityName])
  const seats: number | null =
    city && city.plate !== null ? seatsForPlate(city.plate) : null

  // Refresh templates whenever city/template changes — but preserve user edits.
  // We track if the user has edited the textarea by comparing against the
  // last auto-generated value.
  const [autoShort, setAutoShort] = useState('')
  const [autoLong, setAutoLong] = useState('')

  useEffect(() => {
    if (!city || seats === null) {
      setAutoShort('')
      setAutoLong('')
      return
    }
    const tpl = findTemplate(templateId)
    const s = composeShortMessage(tpl, { city: city.name, seats, day })
    const l = composeLongMessage(tpl, { city: city.name, seats, day })
    setAutoShort(s)
    setAutoLong(l)
    // If textarea matches the previous auto-message OR is empty, replace.
    setShortText(prev => (prev === '' || prev === autoShort ? s : prev))
    setLongText(prev => (prev === '' || prev === autoLong ? l : prev))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city?.slug, seats, templateId, day])

  function regenerate() {
    setShortText(autoShort)
    setLongText(autoLong)
  }

  function onShareX() {
    if (!shortText.trim()) return
    window.open(buildXIntentUrl(shortText), '_blank', 'noopener,noreferrer')
  }

  function onOpenEDilekce() {
    if (!longText.trim()) return
    // Copy long version to clipboard so the user can paste it into the
    // e-Dilekçe form once it loads in the new tab.
    navigator.clipboard?.writeText(longText).catch(() => null)
    window.open(TBMM_EDILEKCE_URL, '_blank', 'noopener,noreferrer')
  }

  function onOpenDeputySearch() {
    window.open(TBMM_DEPUTY_SEARCH_URL, '_blank', 'noopener,noreferrer')
  }

  const ready = Boolean(city && seats !== null && shortText.trim())

  return (
    <div className="flex flex-col gap-8">
      <CityPicker value={cityName} onChange={setCityName} />

      {city && seats !== null && (
        <div
          className="border-t border-rule pt-8 editorial-reveal"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex items-baseline justify-between flex-wrap gap-4">
            <div>
              <span className="editorial-mono text-accent" style={{ letterSpacing: '0.32em' }}>
                — HEDEF
              </span>
              <h2
                className="editorial-h1 text-ink mt-2"
                style={{ fontSize: 'clamp(36px, 5vw, 72px)', lineHeight: 1 }}
              >
                {city.name.toLocaleUpperCase('tr-TR')} · {seats}{' '}
                <em className="italic editorial-display text-ornament">vekil</em>
              </h2>
            </div>
            <span className="editorial-mono text-ink-muted" style={{ letterSpacing: '0.22em', fontSize: 12 }}>
              28. DÖNEM · {city.region.toLocaleUpperCase('tr-TR')}
            </span>
          </div>

          <div className="mt-8">
            <span className="editorial-mono text-accent" style={{ letterSpacing: '0.32em' }}>
              — ŞABLON
            </span>
            <div className="flex flex-wrap gap-2 mt-3" role="group" aria-label="Mektup şablonu">
              {OUTREACH_TEMPLATES.map(t => (
                <Chip
                  key={t.id}
                  label={t.label}
                  selected={t.id === templateId}
                  hint={t.hint}
                  onClick={() => setTemplateId(t.id)}
                />
              ))}
            </div>
            <p className="font-serif italic text-ink-muted mt-2" style={{ fontSize: 14 }}>
              {findTemplate(templateId).hint}
            </p>
          </div>

          <div className="mt-8">
            <label
              htmlFor={messageId}
              className="editorial-mono text-accent block"
              style={{ letterSpacing: '0.32em' }}
            >
              — MEKTUP (kısa, X için ≤280)
            </label>
            <textarea
              id={messageId}
              value={shortText}
              onChange={e => setShortText(e.target.value.slice(0, 280))}
              rows={4}
              maxLength={280}
              className="mt-3 w-full font-serif text-ink bg-transparent border border-rule focus:border-accent focus:outline-none p-3 transition-colors"
              style={{ fontSize: 16, lineHeight: 1.45, resize: 'vertical' }}
            />
            <div className="flex items-center justify-between mt-2 editorial-mono text-ink-muted" style={{ fontSize: 11, letterSpacing: '0.22em' }}>
              <span>{shortText.length} / 280</span>
              <button
                type="button"
                onClick={regenerate}
                className="hover:text-accent transition-colors"
              >
                ↻ ŞABLONA SIFIRLA
              </button>
            </div>
          </div>

          <details className="mt-6">
            <summary
              className="editorial-mono text-ink-muted hover:text-accent cursor-pointer"
              style={{ letterSpacing: '0.22em', fontSize: 11 }}
            >
              ↓ TBMM FORMU İÇİN UZUN VERSİYON
            </summary>
            <textarea
              value={longText}
              onChange={e => setLongText(e.target.value.slice(0, 1000))}
              rows={10}
              maxLength={1000}
              className="mt-3 w-full font-serif text-ink bg-transparent border border-rule focus:border-accent focus:outline-none p-3 transition-colors"
              style={{ fontSize: 14, lineHeight: 1.55, resize: 'vertical' }}
            />
            <div className="mt-2 editorial-mono text-ink-muted" style={{ fontSize: 11, letterSpacing: '0.22em' }}>
              {longText.length} / 1000
            </div>
          </details>

          <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-rule items-center">
            <button
              type="button"
              onClick={onShareX}
              disabled={!ready}
              className="editorial-mono px-6 py-3 bg-accent text-white border border-accent hover:bg-transparent hover:text-accent transition-colors disabled:opacity-50"
              style={{ letterSpacing: '0.22em' }}
            >
              X'TE PAYLAŞ
            </button>
            <button
              type="button"
              onClick={onOpenEDilekce}
              disabled={!ready}
              className="editorial-mono px-6 py-3 border border-rule text-ink hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
              style={{ letterSpacing: '0.22em' }}
            >
              E-DİLEKÇE GÖNDER
            </button>
            <button
              type="button"
              onClick={onOpenDeputySearch}
              className="editorial-mono px-6 py-3 border border-rule text-ink hover:border-accent hover:text-accent transition-colors"
              style={{ letterSpacing: '0.22em' }}
            >
              VEKİLİ BUL
            </button>
          </div>
          <p className="font-serif italic text-ink-muted mt-3" style={{ fontSize: 13, lineHeight: 1.55 }}>
            <strong>E-Dilekçe Gönder</strong>: uzun mektup panoya kopyalanır, TBMM'nin resmi e-Dilekçe portalı yeni sekmede açılır — yapıştırıp gönderin. <strong>Vekili Bul</strong>: TBMM'nin vekil arama formunda ilini ve partiyi süzgeçleyerek tek tek vekil sayfasına ulaşırsın.
          </p>
        </div>
      )}

      {cityName && !city && (
        <div className="editorial-mono text-ink-muted opacity-70" style={{ letterSpacing: '0.22em', fontSize: 11 }}>
          — Bu il listede yok. Lütfen önerilenlerden seçin.
        </div>
      )}
    </div>
  )
}
