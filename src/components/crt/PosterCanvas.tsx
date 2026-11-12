import { useEffect, useRef } from 'react'
import type { Project } from '../../content/projects'
import { renderPoster } from '../../experience/posters'
import { useLang } from '../../i18n/LanguageContext'

/**
 * Una "captura" de proyecto. Si el proyecto tiene captura real en esa posición
 * la muestra; si no, compone la maqueta con su foto de rubro.
 */
export function PosterCanvas({ project, variant }: { project: Project; variant: number }) {
  const { lang } = useLang()
  const ref = useRef<HTMLCanvasElement>(null)
  const shot = project.shots[variant]

  useEffect(() => {
    if (shot || !ref.current) return
    void renderPoster(ref.current, project, variant, lang)
  }, [project, variant, lang, shot])

  if (shot) return <img src={shot} alt="" loading="lazy" decoding="async" />
  return <canvas ref={ref} aria-hidden="true" />
}
