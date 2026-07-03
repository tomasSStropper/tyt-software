import { ArrowRight } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { SectionHeading } from './SectionHeading'
import { Reveal } from './Reveal'

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
    <section id="servicios" className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
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
            <article className="group border-t-2 border-ink/70 pt-5">
              <div className="flex h-44 items-end justify-center overflow-visible pb-2 sm:h-52">
                <img
                  src={CHARACTERS[i].src}
                  alt={item.characterAlt}
                  width={CHARACTERS[i].w}
                  height={CHARACTERS[i].h}
                  loading="lazy"
                  decoding="async"
                  className="max-h-full w-auto max-w-full drop-shadow-[0_14px_22px_rgba(42,36,27,0.3)] transition-transform duration-300 group-hover:-translate-y-1.5"
                />
              </div>
              <span className="mono-label text-red">0{i + 1}</span>
              <h3 className="display mt-3 text-2xl text-ink sm:text-3xl">{item.name}</h3>
              <p className="mt-4 text-lg text-ink-soft">
                <span className="strike-wrap">{item.problem}</span>
              </p>
              <dl className="mt-5 space-y-3">
                <div>
                  <dt className="mono-label text-mist">{t.services.buildLabel}</dt>
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
    </section>
  )
}
