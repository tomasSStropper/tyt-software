import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { PROJECTS } from '../content/projects'
import { ContactScreen } from '../components/crt/ContactScreen'
import { FormSheet, ProcessSheet, ServicesSheet } from '../components/crt/InfoSheets'
import { PosterCanvas } from '../components/crt/PosterCanvas'
import { ProjectSheet } from '../components/crt/ProjectSheet'
import { TextBlock } from '../components/crt/TextBlock'
import type { Experience } from '../experience/Experience'
import { ANCHORS, TL, type AnchorId } from '../experience/timeline'
import { getUnit, installUnit } from '../experience/unit'
import { useLang } from '../i18n/LanguageContext'
import { usePageMeta } from '../lib/usePageMeta'

type Open = { type: 'project'; index: number } | { type: 'services' } | { type: 'process' } | { type: 'form' } | null

/** ¿Puede este navegador correr la experiencia 3D? Si no, se sirve la versión estática. */
function canRunWebGL(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

const MIN_LOADER_MS = 1300

export function Home() {
  const { t, lang } = useLang()
  const h = t.home
  usePageMeta(
    lang === 'es'
      ? 'TyT Software — Sitios web y software a la medida en Costa Rica'
      : 'TyT Software — Custom websites and software in Costa Rica',
    lang === 'es'
      ? 'Desarrollo web, sistemas internos y automatización a la medida para empresas en Costa Rica. Hablá directo con quien construye. San Vito, Coto Brus.'
      : 'Custom web development, internal systems and automation for businesses in Costa Rica. Talk directly with the people who build. San Vito, Coto Brus.',
  )

  const [webgl, setWebgl] = useState(canRunWebGL)
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState<Open>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const journeyRef = useRef<HTMLDivElement>(null)
  const expRef = useRef<Experience | null>(null)
  const langRef = useRef(lang)
  langRef.current = lang

  // ── Arranque del motor 3D (se descarga aparte: no pesa en el primer pintado) ──
  useEffect(() => {
    installUnit()
    if (!webgl) {
      setLoaded(true)
      return
    }
    const canvas = canvasRef.current
    if (!canvas) return
    let dead = false
    const began = performance.now()

    import('../experience/Experience')
      .then(({ Experience }) => Experience.create({ canvas, projects: PROJECTS, lang: langRef.current }))
      .then((exp) => {
        if (dead) {
          exp.dispose()
          return
        }
        expRef.current = exp
        exp.start()
        const wait = Math.max(0, MIN_LOADER_MS - (performance.now() - began))
        window.setTimeout(() => !dead && setLoaded(true), wait)
      })
      .catch((err) => {
        console.warn('[tyt] sin WebGL, se usa la versión estática:', err)
        if (!dead) {
          setWebgl(false)
          setLoaded(true)
        }
      })

    return () => {
      dead = true
      expRef.current?.dispose()
      expRef.current = null
    }
  }, [webgl])

  useEffect(() => {
    expRef.current?.setLang(lang)
  }, [lang])

  // con una capa abierta la escena se atenúa, pero sigue viva detrás
  useEffect(() => {
    expRef.current?.setDim(open ? 0.22 : 1)
    // tapada por una capa, la escena deja de dibujarse: ahorra batería y GPU
    expRef.current?.setPaused(Boolean(open))
  }, [open])

  // el menú y los enlaces usan #hash: si la página carga con uno, salta ahí
  useEffect(() => {
    if (!loaded) return
    const id = window.location.hash.slice(1)
    if (id) document.getElementById(id)?.scrollIntoView({ block: 'start' })
  }, [loaded])

  // clic sobre una pantalla de la galería → abre su ficha
  const onJourneyClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('a, button, input, textarea, summary')) return
    const index = expRef.current?.pick(e.clientX, e.clientY)
    if (index != null) setOpen({ type: 'project', index })
  }, [])

  const onJourneyMove = useCallback(() => {
    const el = journeyRef.current
    const exp = expRef.current
    if (el && exp) el.style.cursor = exp.hovered >= 0 ? 'pointer' : ''
  }, [])

  const focusProject = (i: number) => window.scrollTo({ top: TL.panel(i) * getUnit() })

  const backToTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduced || !webgl ? 'auto' : 'smooth' })
  }

  const close = () => setOpen(null)
  const openForm = () => setOpen({ type: 'form' })

  const sheets = (
    <>
      {open?.type === 'project' && (
        <ProjectSheet index={open.index} onClose={close} onOpen={(index) => setOpen({ type: 'project', index })} />
      )}
      {open?.type === 'services' && <ServicesSheet onClose={close} onQuote={openForm} />}
      {open?.type === 'process' && <ProcessSheet onClose={close} onQuote={openForm} />}
      {open?.type === 'form' && <FormSheet onClose={close} />}
    </>
  )

  const heroBlock = (
    <TextBlock
      as="h1"
      id="hero-title"
      title={h.kicker}
      action={
        <Link className="tlink" to="/#proyectos">
          {h.seeWork}
        </Link>
      }
    >
      <p>{h.title}</p>
      <p className="tblock__soft">{h.body}</p>
    </TextBlock>
  )

  const blocks = [
    {
      id: 'services' as const,
      copy: h.services,
      action: (
        <button type="button" className="tlink" onClick={() => setOpen({ type: 'services' })}>
          {h.services.link}
        </button>
      ),
    },
    {
      id: 'arenadesk' as const,
      copy: h.arenadesk,
      action: (
        <Link className="tlink" to="/arenadesk">
          {h.arenadesk.link}
        </Link>
      ),
    },
    {
      id: 'process' as const,
      copy: h.process,
      action: (
        <button type="button" className="tlink" onClick={() => setOpen({ type: 'process' })}>
          {h.process.link}
        </button>
      ),
    },
  ]

  // ── Versión estática: mismo contenido, sin lienzo ni recorrido ──
  if (!webgl) {
    return (
      <>
        <div className="static-hero">
          <div className="static-hero__grid" aria-hidden="true" />
          <img className="static-hero__bot" src="/characters/tyt-avatar.webp" alt={h.avatarAlt} width={500} height={500} />
          <div style={{ position: 'relative' }}>{heroBlock}</div>
        </div>

        <section className="static-section" id="proyectos" aria-labelledby="st-projects">
          <h2 className="display" id="st-projects" style={{ fontSize: '2rem' }}>
            {h.projectsHeading}
          </h2>
          <div className="static-grid">
            {PROJECTS.map((p, i) => (
              <button key={p.id} type="button" className="static-card" onClick={() => setOpen({ type: 'project', index: i })}>
                <PosterCanvas project={p} variant={0} />
                <span className="mono">
                  {p.name} / {p.tag[lang]}
                </span>
              </button>
            ))}
          </div>
        </section>

        {blocks.map((b) => (
          <div className="static-section" key={b.id} id={b.id === 'services' ? 'servicios' : b.id === 'process' ? 'proceso' : b.id}>
            <TextBlock title={b.copy.title} action={b.action}>
              <p>{b.copy.lead}</p>
              <p className="tblock__soft">{b.copy.body}</p>
            </TextBlock>
          </div>
        ))}

        <div className="static-contact" id="contacto">
          <ContactScreen onForm={openForm} onBack={backToTop} />
        </div>
        {sheets}
      </>
    )
  }

  // ── Experiencia completa ──
  return (
    <>
      <div className="loader" data-done={loaded} role="status" aria-live="polite" aria-hidden={loaded}>
        <div className="loader__box">
          <span className="display loader__word">{h.loading}</span>
          <span className="loader__pill">
            <span className="loader__dot" />
          </span>
        </div>
      </div>

      <canvas ref={canvasRef} className="stage" aria-hidden="true" />

      <div
        ref={journeyRef}
        className="journey"
        style={{ height: `calc(var(--u) * ${TL.total})` }}
        onClick={onJourneyClick}
        onPointerMove={onJourneyMove}
      >
        {(Object.keys(ANCHORS) as AnchorId[]).map((id) => (
          <span key={id} id={id} className="journey__anchor" style={{ top: `calc(var(--u) * ${ANCHORS[id]})` }} />
        ))}

        <div className="hero-copy on-scene">{heroBlock}</div>

        {/* La galería vive en el lienzo; esta lista la hace alcanzable con teclado y lector de pantalla */}
        <div className="kbd-list">
          <h2 className="sr-only">{h.projectsHeading}</h2>
          {PROJECTS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onFocus={() => focusProject(i)}
              onClick={() => setOpen({ type: 'project', index: i })}
            >
              {h.openProject}: {p.name} — {p.tag[lang]}
            </button>
          ))}
        </div>

        {blocks.map((b, i) => (
          <TextBlock
            key={b.id}
            title={b.copy.title}
            className={`tblock--abs ${i === 1 ? 'tblock--right' : ''}`}
            style={{ top: `calc(var(--u) * ${TL.blocks[b.id]})` }}
            action={b.action}
          >
            <p>{b.copy.lead}</p>
            <p className="tblock__soft">{b.copy.body}</p>
          </TextBlock>
        ))}

        <ContactScreen onForm={openForm} onBack={backToTop} />
      </div>

      {sheets}
    </>
  )
}
