import { ArrowUpRight } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { PROJECT_META } from '../i18n/dictionary'
import { SectionHeading } from './SectionHeading'
import { Reveal } from './Reveal'

interface RowProps {
  index: number
  name: string
  tag: string
  outcome: string
  url: string | null
  image: string | null
  visitLabel: string
  liveLabel: string
}

function ProjectRow({ index, name, tag, outcome, url, image, visitLabel, liveLabel }: RowProps) {
  const inner = (
    <>
      <div className="flex items-baseline gap-4 sm:gap-6">
        <span className="mono-label w-7 shrink-0 text-red">0{index + 1}</span>
        <h3 className="display text-2xl text-ink transition-colors duration-200 group-hover:text-red sm:text-4xl">
          {name}
        </h3>
        <span className="mono-label ml-auto hidden shrink-0 text-mist sm:inline">{tag}</span>
        {url && (
          <ArrowUpRight
            size={20}
            className="shrink-0 -translate-x-1 translate-y-1 text-mist opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-red group-hover:opacity-100 group-focus-visible:opacity-100"
            aria-hidden="true"
          />
        )}
      </div>
      {/* La línea de resultado: siempre visible en móvil, se revela al pasar el cursor en escritorio */}
      <p className="mt-2 pl-11 text-ink-soft transition-all duration-300 sm:pl-13 md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
        {outcome}
        {url && <span className="stamp ml-4 hidden py-0.5 text-[0.6rem] md:inline-block">{liveLabel}</span>}
      </p>

      {/* Polaroid flotante — solo escritorio, solo decorativo */}
      <div
        className="pointer-events-none absolute right-16 -top-10 z-10 hidden rotate-3 bg-paper-lift p-2 pb-6 opacity-0 shadow-[0_18px_40px_-12px_rgba(42,37,30,0.5)] transition-all duration-300 group-hover:-rotate-2 group-hover:opacity-100 lg:block"
        aria-hidden="true"
      >
        {image ? (
          <img src={image} alt="" loading="lazy" width={224} height={140} className="h-35 w-56 border border-line object-cover object-top" />
        ) : (
          <div className="flex h-35 w-56 items-center justify-center border border-coal-line bg-coal">
            <span className="display text-5xl text-paper/90">{name.charAt(0)}</span>
            <span className="mono-label absolute bottom-8 text-coal-text/50">{tag}</span>
          </div>
        )}
        <p className="mono-label mt-2 text-center text-mist normal-case tracking-wide">{name}</p>
      </div>
    </>
  )

  const rowClass =
    'group relative block border-t border-ink/25 py-6 transition-colors duration-200 last:border-b'

  return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer" className={rowClass} aria-label={`${name} — ${visitLabel}`}>
      {inner}
    </a>
  ) : (
    <div className={rowClass}>{inner}</div>
  )
}

export function Projects() {
  const { t } = useLang()

  return (
    <section id="proyectos" className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
      <SectionHeading
        index="03"
        label={t.projects.label}
        title={t.projects.title}
        intro={t.projects.hint}
      />

      <div className="mt-14">
        {t.projects.items.map((p, i) => (
          <Reveal key={p.name} delay={i * 60}>
            <ProjectRow
              index={i}
              name={p.name}
              tag={p.tag}
              outcome={p.outcome}
              url={PROJECT_META[i].url}
              image={PROJECT_META[i].image}
              visitLabel={t.projects.visit}
              liveLabel={t.projects.live}
            />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
