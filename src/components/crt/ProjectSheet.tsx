import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PROJECTS } from '../../content/projects'
import { useLang } from '../../i18n/LanguageContext'
import { PosterCanvas } from './PosterCanvas'
import { Sheet } from './Sheet'

const pad = (n: number) => String(n).padStart(2, '0')

/** Ficha de un proyecto: sala oscura con sus pantallas en fila. */
export function ProjectSheet({
  index,
  onClose,
  onOpen,
}: {
  index: number
  onClose: () => void
  onOpen: (index: number) => void
}) {
  const { t, lang } = useLang()
  const project = PROJECTS[index]
  const slides = Math.max(3, project.shots.length)
  const track = useRef<HTMLDivElement>(null)
  const [slide, setSlide] = useState(0)

  // el contador "01 / 03" sigue a la pantalla que queda centrada
  useEffect(() => {
    const el = track.current
    if (!el) return
    el.scrollTo({ left: 0 })
    setSlide(0)
    const onScroll = () => {
      const center = el.scrollLeft + el.clientWidth / 2
      let best = 0
      let dist = Infinity
      Array.from(el.children).forEach((child, i) => {
        const c = child as HTMLElement
        const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center)
        if (d < dist) {
          dist = d
          best = i
        }
      })
      setSlide(best)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [index])

  const next = (index + 1) % PROJECTS.length

  return (
    <Sheet label={`${t.sheet.project}: ${project.name}`} onClose={onClose}>
      <div className="sheet__meta mono">
        <span>{t.sheet.project}</span>
        <button type="button" className="tlink tlink--both" onClick={onClose}>
          {t.sheet.close}
        </button>
        <span aria-live="polite">
          {pad(slide + 1)} / {pad(slides)}
        </span>
      </div>
      <h2 className="display sheet__title">
        {project.name} / {project.tag[lang]}
      </h2>

      <div className="reel">
        <div className="reel__track" ref={track} tabIndex={0} aria-label={project.name}>
          {Array.from({ length: slides }, (_, i) => (
            <div className="reel__item" key={`${project.id}-${i}`}>
              <div className="reel__screen">
                <PosterCanvas project={project} variant={i} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mono sheet__label">{t.sheet.info}</p>
        <p className="mono sheet__text">{project.info[lang]}</p>

        <p className="mono sheet__label" style={{ marginTop: '1.4rem' }}>
          {t.sheet.role}
        </p>
        <ul className="mono sheet__tags">
          {project.roles[lang].map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>

        <div className="mono sheet__tags" style={{ marginTop: '1.1rem', columnGap: '1.8rem' }}>
          {project.url && (
            <a className="tlink" href={project.url} target="_blank" rel="noopener noreferrer">
              {t.sheet.visit}
            </a>
          )}
          {project.route && (
            <Link className="tlink" to={project.route}>
              {t.sheet.product}
            </Link>
          )}
          {!project.url && !project.route && (
            <span className="tlink" style={{ cursor: 'default', color: '#8f8d89' }}>
              {t.sheet.soon}
            </span>
          )}
          <button type="button" className="tlink" onClick={() => onOpen(next)}>
            {t.sheet.next}
          </button>
        </div>
      </div>
    </Sheet>
  )
}
