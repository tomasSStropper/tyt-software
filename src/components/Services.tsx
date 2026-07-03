import { ArrowRight } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { SectionHeading } from './SectionHeading'
import { Reveal } from './Reveal'

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

      <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-2">
        {t.services.items.map((item, i) => (
          <Reveal key={item.name} delay={i * 80}>
            {/* group: al pasar el cursor, la pluma roja tacha el problema */}
            <article className="group border-t-2 border-ink/70 pt-5">
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
