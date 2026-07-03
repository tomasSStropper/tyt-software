import { Reveal } from './Reveal'

interface SectionHeadingProps {
  index: string
  label: string
  title: string
  intro?: string
  dark?: boolean
}

/** Encabezado editorial numerado: `01 / Servicios` + titular display. */
export function SectionHeading({ index, label, title, intro, dark = false }: SectionHeadingProps) {
  return (
    <Reveal>
      <p className={`mono-label flex items-baseline gap-3 ${dark ? 'text-coal-text/60' : 'text-mist'}`}>
        <span className="text-red">{index}</span>
        <span aria-hidden="true">/</span>
        {label}
      </p>
      <h2
        className={`display mt-4 max-w-[16ch] text-4xl sm:text-5xl lg:text-6xl ${dark ? 'text-paper' : 'text-ink'}`}
      >
        {title}
      </h2>
      {intro && (
        <p className={`mt-5 max-w-md text-base ${dark ? 'text-coal-text/80' : 'text-ink-soft'}`}>
          {intro}
        </p>
      )}
    </Reveal>
  )
}
