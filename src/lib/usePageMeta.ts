import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Dominio canónico: el apex (tytsoftware.com) redirige a www en Vercel. */
export const SITE_ORIGIN = 'https://www.tytsoftware.com'

function setAttr(selector: string, attr: string, value: string) {
  document.head.querySelector(selector)?.setAttribute(attr, value)
}

/**
 * SEO por ruta: título, descripción, URL canónica y tarjeta social.
 * `noindex` saca la página de los buscadores (se usa en el 404).
 * Nota: quien comparte un enlace en WhatsApp/redes lee el index.html sin
 * ejecutar JS, así que la tarjeta social base vive allí; esto la mantiene
 * coherente para Google, que sí renderiza la página.
 */
export function usePageMeta(title: string, description: string, opts: { noindex?: boolean } = {}) {
  const { pathname } = useLocation()
  const { noindex = false } = opts

  useEffect(() => {
    const url = SITE_ORIGIN + (pathname === '/' ? '/' : pathname.replace(/\/+$/, ''))
    document.title = title
    setAttr('meta[name="description"]', 'content', description)
    setAttr('link[rel="canonical"]', 'href', url)
    setAttr('meta[name="robots"]', 'content', noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large')
    setAttr('meta[property="og:url"]', 'content', url)
    setAttr('meta[property="og:title"]', 'content', title)
    setAttr('meta[property="og:description"]', 'content', description)
    setAttr('meta[name="twitter:title"]', 'content', title)
    setAttr('meta[name="twitter:description"]', 'content', description)
  }, [title, description, pathname, noindex])
}
