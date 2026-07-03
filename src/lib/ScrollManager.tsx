import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Al cambiar de ruta: sube al inicio (suave, salvo reduced-motion).
 * Si la URL trae hash, desplaza hasta esa sección cuando exista.
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth'

    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior, block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, behavior })
  }, [pathname, hash])

  return null
}
