import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { PROJECT_META } from '../i18n/dictionary'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { SectionHeading } from './SectionHeading'
import { Reveal } from './Reveal'

/** Ajuste fino del haz por fila */
const SPOT = {
  /** radio del haz, px */
  radius: 200,
  /** suavizado del lerp por frame (0–1) */
  ease: 0.14,
} as const

const MASK = `radial-gradient(circle ${SPOT.radius}px at var(--mx, 50%) var(--my, 50%), black 0%, black 42%, transparent 72%)`

/** Lerp del haz dentro de una fila: escribe --mx/--my en el elemento. */
function useRowSpotlight<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return

    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    let raf = 0
    let running = false

    const apply = () => {
      el.style.setProperty('--mx', `${current.x.toFixed(1)}px`)
      el.style.setProperty('--my', `${current.y.toFixed(1)}px`)
    }
    const tick = () => {
      current.x += (target.x - current.x) * SPOT.ease
      current.y += (target.y - current.y) * SPOT.ease
      apply()
      if (Math.abs(target.x - current.x) < 0.3 && Math.abs(target.y - current.y) < 0.3) {
        running = false
        return
      }
      raf = requestAnimationFrame(tick)
    }
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      target.x = e.clientX - r.left
      target.y = e.clientY - r.top
      if (!running) {
        running = true
        raf = requestAnimationFrame(tick)
      }
    }
    const onEnter = (e: PointerEvent) => {
      // el haz nace donde entra el cursor, sin viajar desde la esquina
      const r = el.getBoundingClientRect()
      current.x = target.x = e.clientX - r.left
      current.y = target.y = e.clientY - r.top
      apply()
    }

    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [enabled])

  return ref
}

type Kind = 'web' | 'panel' | 'construction'

/** Contenido que la linterna revela, según el tipo de proyecto */
function RevealPanel({
  kind,
  image,
  name,
  tag,
  construction,
}: {
  kind: Kind
  image: string | null
  name: string
  tag: string
  construction: { title: string; note: string }
}) {
  if (kind === 'web' && image) {
    return (
      <img
        src={image}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover object-top"
        style={{ filter: 'sepia(0.12) saturate(0.94)' }}
      />
    )
  }
  if (kind === 'construction') {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-2 bg-paper-deep"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, rgba(42,36,27,0.12) 0 10px, transparent 10px 26px)',
        }}
      >
        <span className="stamp bg-paper-lift/80 text-sm sm:text-base">{construction.title}</span>
        <span className="mono-label text-ink-soft">{construction.note}</span>
      </div>
    )
  }
  // panel: consultoría / sistema interno, sin captura falsa
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-coal">
      <div className="halftone absolute inset-0 opacity-60" aria-hidden="true" />
      <span
        className="display text-4xl tracking-tight text-transparent uppercase sm:text-6xl"
        style={{ WebkitTextStroke: '1.5px var(--color-paper)' }}
      >
        {tag}
      </span>
      <span className="mono-label absolute bottom-4 text-coal-text/70">{name}</span>
    </div>
  )
}

interface RowProps {
  index: number
  name: string
  tag: string
  outcome: string
  url: string | null
  image: string | null
  kind: Kind
  spotlightOn: boolean
  visitLabel: string
  liveLabel: string
  construction: { title: string; note: string }
}

function ProjectRow(props: RowProps) {
  const { index, name, tag, outcome, url, kind, spotlightOn, visitLabel, liveLabel, construction } =
    props
  const rowRef = useRowSpotlight<HTMLDivElement>(spotlightOn)
  // affordance para filas sin enlace: su estado en vez de un destino
  const statusLabel = kind === 'construction' ? construction.note : tag

  const inner = (
    <>
      <div className="flex items-baseline gap-4 sm:gap-6">
        <span className="mono-label w-7 shrink-0 text-red">0{index + 1}</span>
        <h3 className="display text-2xl text-ink transition-[color,translate] duration-250 group-hover:translate-x-2 group-hover:text-red sm:text-4xl">
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
      <p className="mt-2 pl-11 text-ink-soft sm:pl-13">
        {outcome}
        {url && <span className="stamp ml-4 hidden py-0.5 text-[0.6rem] md:inline-block">{liveLabel}</span>}
        {url ? (
          <span className="mono-label ml-4 inline-flex items-center gap-1 text-red transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
            <span aria-hidden="true">→</span> {visitLabel}
          </span>
        ) : (
          <span className="mono-label ml-4 text-mist transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100">
            {statusLabel}
          </span>
        )}
      </p>
    </>
  )

  const rowClass = `relative block border-t border-ink/25 py-7 transition-colors duration-200 last:border-b sm:py-9 ${
    spotlightOn ? '' : 'sm:pr-72'
  }`

  const content = (
    <div ref={rowRef} className="group relative">
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={rowClass}
          aria-label={`${name} — ${visitLabel}`}
        >
          {inner}
        </a>
      ) : (
        <div className={rowClass}>{inner}</div>
      )}

      {spotlightOn && (
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ maskImage: MASK, WebkitMaskImage: MASK }}
          aria-hidden="true"
        >
          <RevealPanel {...props} />
        </div>
      )}

      {/* En touch / reduced-motion todo se muestra tal cual, sin linterna */}
      {!spotlightOn && (
        <div className="mb-7 aspect-[21/9] w-full overflow-hidden border border-ink/20 sm:hidden">
          <RevealPanel {...props} />
        </div>
      )}
      {!spotlightOn && (
        <div className="pointer-events-none absolute inset-y-4 right-0 z-10 hidden w-64 overflow-hidden border border-ink/20 sm:block">
          <RevealPanel {...props} />
        </div>
      )}
    </div>
  )

  return content
}

export function Projects() {
  const { t } = useLang()
  const reduced = useReducedMotion()
  const [finePointer, setFinePointer] = useState(true)

  useEffect(() => {
    setFinePointer(window.matchMedia('(pointer: fine)').matches)
  }, [])

  const spotlightOn = !reduced && finePointer

  return (
    <section id="proyectos" className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
      <div className="relative">
        <SectionHeading
          index="03"
          label={t.projects.label}
          title={t.projects.title}
          intro={t.projects.hint}
        />
        {/* el disquete: archivo de proyectos entregados */}
        <Reveal delay={200} className="absolute -top-8 right-0 hidden lg:block">
          <img
            src="/characters/tyt-disk.webp"
            alt={t.projects.diskAlt}
            width={325}
            height={346}
            loading="lazy"
            decoding="async"
            className="h-36 w-auto rotate-6 drop-shadow-[0_12px_18px_rgba(42,36,27,0.3)] transition-transform duration-300 hover:-rotate-3"
          />
        </Reveal>
      </div>

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
              kind={PROJECT_META[i].kind}
              spotlightOn={spotlightOn}
              visitLabel={t.projects.visit}
              liveLabel={t.projects.live}
              construction={t.projects.construction}
            />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
