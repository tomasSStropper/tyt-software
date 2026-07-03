import { useState } from 'react'
import { ArrowRight, Plus } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { SectionHeading } from './SectionHeading'
import { Reveal } from './Reveal'
import { ServiceModal } from './ServiceModal'

/**
 * Opacidad del patrón de circuito de fondo (0–1).
 * Presente y con identidad, sin pelear con la lectura.
 */
const CIRCUIT_OPACITY = 0.16

/** Tile de trazas de circuito — pistas oscuras con pads y acentos rojos, estático */
const CIRCUIT_TILE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" fill="none" stroke="#222120" stroke-width="1.5">
  <path d="M12 36h86l32 32v54h58"/><circle cx="12" cy="36" r="4"/><circle cx="188" cy="122" r="4"/>
  <path d="M308 62h-58l-28 28v46"/><circle cx="308" cy="62" r="4"/><circle cx="222" cy="136" r="4"/>
  <path d="M40 306v-64l30-30h56"/><circle cx="40" cy="306" r="4"/><circle cx="126" cy="212" r="4"/>
  <path d="M302 300v-76l-42-42"/><circle cx="302" cy="300" r="4"/><circle cx="260" cy="182" r="4"/>
  <path d="M152 14v44"/><circle cx="152" cy="14" r="3"/><circle cx="152" cy="58" r="3"/>
  <path d="M84 118v54l-38 38"/><circle cx="84" cy="118" r="3"/><circle cx="46" cy="210" r="3"/>
  <rect x="196" y="216" width="44" height="44"/>
  <path d="M196 228h-22M196 248h-22M240 228h22M240 248h22"/>
  <circle cx="188" cy="122" r="4" fill="#e10600" stroke="none"/>
  <circle cx="46" cy="210" r="3.5" fill="#e10600" stroke="none"/>
  <circle cx="302" cy="300" r="4" fill="#e10600" stroke="none"/>
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
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <section id="servicios" className="relative isolate overflow-hidden py-24 lg:py-32">
      {/* circuito fantasma: vive en los márgenes, cede bajo la columna de lectura */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          backgroundImage: `url("${CIRCUIT_TILE}")`,
          backgroundSize: '320px 320px',
          opacity: CIRCUIT_OPACITY,
          maskImage:
            'linear-gradient(to right, black 0%, rgba(0,0,0,0.45) 30%, rgba(0,0,0,0.45) 70%, black 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, black 0%, rgba(0,0,0,0.45) 30%, rgba(0,0,0,0.45) 70%, black 100%)',
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
              <button
                type="button"
                onClick={() => setOpenIdx(i)}
                className="mono-label mt-5 inline-flex cursor-pointer items-center gap-1.5 text-red-ink transition-colors duration-200 hover:text-red"
              >
                <Plus size={13} aria-hidden="true" />
                {t.services.detailCta}
              </button>
              <ServiceModal
                open={openIdx === i}
                onClose={() => setOpenIdx(null)}
                index={i}
                service={item}
              />
            </article>
          </Reveal>
        ))}
      </div>
      </div>
    </section>
  )
}
