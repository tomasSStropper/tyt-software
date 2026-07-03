import { ArrowRight } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { SectionHeading } from './SectionHeading'
import { Reveal } from './Reveal'

/**
 * Opacidad del patrón de circuito de fondo (0–1).
 * Susurro técnico: si dudas, más tenue.
 */
const CIRCUIT_OPACITY = 0.05

/** Tile de trazas de circuito — líneas oscuras con pads, estático */
const CIRCUIT_TILE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260" fill="none" stroke="#222120" stroke-width="1">
  <path d="M20 40h70v60h50"/><circle cx="20" cy="40" r="3"/><circle cx="140" cy="100" r="3"/>
  <path d="M240 20v70l-40 40"/><circle cx="240" cy="20" r="3"/><circle cx="200" cy="130" r="3"/>
  <path d="M40 220h60l30-30v-40"/><circle cx="40" cy="220" r="3"/><circle cx="130" cy="150" r="3"/>
  <path d="M180 240v-40h50"/><circle cx="180" cy="240" r="3"/><circle cx="230" cy="200" r="3"/>
  <path d="M60 120v40"/><circle cx="60" cy="120" r="2"/><circle cx="60" cy="160" r="2"/>
</svg>`)

/** Personaje de cada servicio — flotan sin marco sobre el papel */
const CHARACTERS = [
  { src: '/characters/tyt-web.webp', w: 900, h: 480 },
  { src: '/characters/tyt-automatizacion.webp', w: 360, h: 520 },
  { src: '/characters/tyt-archivador.webp', w: 556, h: 418 },
  { src: '/characters/tyt-speaker.webp', w: 667, h: 511 },
] as const

export function Services() {
  const { t } = useLang()

  return (
    <section id="servicios" className="relative isolate overflow-hidden py-24 lg:py-32">
      {/* circuito fantasma: vive en los márgenes, cede bajo la columna de lectura */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          backgroundImage: `url("${CIRCUIT_TILE}")`,
          backgroundSize: '260px 260px',
          opacity: CIRCUIT_OPACITY,
          maskImage:
            'linear-gradient(to right, black 0%, rgba(0,0,0,0.25) 28%, rgba(0,0,0,0.25) 72%, black 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, black 0%, rgba(0,0,0,0.25) 28%, rgba(0,0,0,0.25) 72%, black 100%)',
        }}
      />

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
      <SectionHeading
        index="01"
        label={t.services.label}
        title={t.services.title}
        intro={t.services.intro}
      />

      <div className="mt-14 grid gap-x-10 gap-y-14 md:grid-cols-2">
        {t.services.items.map((item, i) => (
          <Reveal key={item.name} delay={i * 80}>
            {/* group: al pasar el cursor, la pluma roja tacha el problema */}
            <article className="group border-t-2 border-ink/70 pt-5 transition-colors duration-300 hover:border-red">
              <div className="flex h-44 items-end justify-center overflow-visible pb-2 sm:h-52">
                <img
                  src={CHARACTERS[i].src}
                  alt={item.characterAlt}
                  width={CHARACTERS[i].w}
                  height={CHARACTERS[i].h}
                  loading="lazy"
                  decoding="async"
                  className="max-h-full w-auto max-w-full drop-shadow-[0_14px_22px_rgba(31,29,26,0.3)] transition-transform duration-300 group-hover:-translate-y-1.5"
                />
              </div>
              <span className="mono-label text-red-ink">0{i + 1}</span>
              <h3 className="display mt-3 text-2xl text-ink sm:text-3xl">{item.name}</h3>
              <p className="mt-4 text-lg text-ink">
                <span className="strike-wrap">{item.problem}</span>
              </p>
              <dl className="mt-5 space-y-3">
                <div>
                  <dt className="mono-label text-ink-soft">{t.services.buildLabel}</dt>
                  <dd className="mt-1 text-ink">{item.build}</dd>
                </div>
                <div className="flex items-start gap-2">
                  <dt className="sr-only">{t.services.resultLabel}</dt>
                  <ArrowRight
                    size={18}
                    className="mt-0.5 shrink-0 text-red transition-transform duration-250 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                  <dd className="font-medium text-ink">{item.result}</dd>
                </div>
              </dl>
            </article>
          </Reveal>
        ))}
      </div>
      </div>
    </section>
  )
}
