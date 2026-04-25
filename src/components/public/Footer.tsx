import { SITE } from '../../config/site'

export function Footer() {
  return (
    <footer className="relative px-[6vw] pt-10 pb-16 border-t border-rule mt-24">
      <div
        className="absolute -top-[3px] left-[6vw] h-[7px] w-32 bg-accent"
        aria-hidden="true"
      />
      <div className="max-w-[1480px] mx-auto grid grid-cols-12 gap-6 editorial-mono text-ink-muted">
        <span className="col-span-12 sm:col-span-4">© Hak · Hukuk · Adalet</span>
        <span className="col-span-12 sm:col-span-4 sm:text-center">
          {SITE.arrestDateLabel}'ten beri
        </span>
        <span className="col-span-12 sm:col-span-4 sm:text-right flex sm:justify-end gap-5">
          <span className="text-accent">{SITE.primaryHashtag}</span>
          <a
            href={SITE.xProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink border-b border-current hover:text-accent transition-colors pb-[2px]"
          >
            {SITE.xHandle}
          </a>
        </span>
      </div>
    </footer>
  )
}
