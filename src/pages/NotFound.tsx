import { Link } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext'
import { usePageMeta } from '../lib/usePageMeta'

/** Ruta inexistente. Va con noindex para que Google no la confunda con la portada. */
export function NotFound() {
  const { lang } = useLang()
  const es = lang === 'es'
  usePageMeta(es ? 'Página no encontrada | TyT' : 'Page not found | TyT', es ? 'Esta página no existe.' : 'This page does not exist.', {
    noindex: true,
  })
  return (
    <section className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center px-5 py-28 sm:px-8">
      <p className="mono-label text-red-soft">Error 404</p>
      <h1 className="display mt-4 text-5xl text-ink sm:text-7xl">{es ? 'Sin señal.' : 'No signal.'}</h1>
      <p className="mono-label mt-6 max-w-md text-ink-soft">
        {es ? 'Esta página no existe o cambió de lugar.' : 'This page does not exist or has moved.'}
      </p>
      <Link className="tlink mt-8" to="/">
        {es ? 'Volver al inicio' : 'Back to home'}
      </Link>
    </section>
  )
}
