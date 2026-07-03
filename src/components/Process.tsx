import { useLang } from '../i18n/LanguageContext'
import { useInView } from '../hooks/useInView'
import { SectionHeading } from './SectionHeading'
import { Reveal } from './Reveal'

export function Process() {
  const { t } = useLang()
  const { ref, inView } = useInView<HTMLOListElement>(0.3)

  return (
    <section id="proceso" className="bg-paper-deep py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading index="04" label={t.process.label} title={t.process.title} />

        {/* Los numerales se entintan de rojo, uno por uno, al entrar en vista */}
        <ol ref={ref} className="mt-16 grid gap-10 md:grid-cols-5 md:gap-6">
          {t.process.steps.map((step, i) => (
            <li key={step.name} className="relative md:border-l md:border-ink/20 md:pl-5">
              <span
                className={`numeral block text-7xl md:text-6xl lg:text-7xl ${inView ? 'inked' : ''}`}
                style={{ transitionDelay: `${i * 160}ms` }}
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <h3 className="display mt-4 text-xl text-ink">
                <span className="sr-only">{i + 1}. </span>
                {step.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.desc}</p>
            </li>
          ))}
        </ol>

        {/* El manifiesto: la esencia de la agencia, en una línea */}
        <Reveal delay={200}>
          <p className="display mt-20 max-w-3xl text-2xl text-ink sm:text-3xl lg:text-4xl">
            {t.process.manifesto.split('.')[0]}.
            <span className="text-red"> {t.process.manifesto.split('. ')[1]}</span>
          </p>
        </Reveal>
      </div>
    </section>
  )
}
