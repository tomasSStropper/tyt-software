import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Al cambiar de ruta: sube al inicio. Si la URL trae hash, desplaza hasta esa
 * ancla cuando exista. En la portada las anclas son marcas del recorrido 3D
 * (ver experience/timeline.ts), así que "ir a #contacto" es viajar hasta allá.
 * `key` cambia en cada navegación: repetir el mismo enlace vuelve a desplazar.
 */
export function ScrollManager() {
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth'

    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (el) {
        el.scrollIntoView({ behavior, block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash, key])

  return null
}
