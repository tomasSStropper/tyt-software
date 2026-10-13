import { useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext'
import { usePageMeta } from '../lib/usePageMeta'
import { parseBlocks, renderBlocks, renderInline } from '../lib/markdown'
import privacidadAgenda from '../content/legal/privacidad-agenda.md?raw'
import condicionesAgenda from '../content/legal/condiciones-agenda.md?raw'

/**
 * Documentos legales. El texto vive en src/content/legal/*.md (copia de
 * agendatyt/docs/legal/, que es la fuente). Se publican solo en español.
 */
export const LEGAL_DOCS = {
  'privacidad-agenda': {
    source: privacidadAgenda,
    description:
      'Política de Privacidad de TyT Agenda: qué datos se recopilan al solicitar una reunión con TyT Software & Solutions, para qué se usan y cómo ejercer sus derechos (Ley 8968).',
  },
  'condiciones-agenda': {
    source: condicionesAgenda,
    description:
      'Condiciones del Servicio de TyT Agenda: cómo funcionan las solicitudes de reunión con TyT Software & Solutions.',
  },
} as const

export type LegalDocId = keyof typeof LEGAL_DOCS

export function LegalPage({ doc }: { doc: LegalDocId }) {
  const { t, lang } = useLang()
  const { source, description } = LEGAL_DOCS[doc]

  const { title, body } = useMemo(() => {
    const blocks = parseBlocks(source)
    const first = blocks[0]
    const titleText = first?.type === 'heading' && first.level === 1 ? first.text : ''
    return { title: titleText, body: titleText ? blocks.slice(1) : blocks }
  }, [source])

  usePageMeta(`${title} | TyT`, description)

  return (
    <article className="mx-auto max-w-3xl px-5 pt-28 pb-24 sm:px-8 lg:pt-36" lang="es">
      <Link
        to="/"
        className="mono-label inline-flex items-center gap-2 text-mist transition-colors duration-200 hover:text-red-ink"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        {t.legal.back}
      </Link>

      <p className="mono-label mt-10 flex items-baseline gap-3 text-mist">
        <span className="text-red-ink">{t.legal.label}</span>
      </p>
      <span className="mt-3 block h-0.5 w-10 bg-red" aria-hidden="true" />
      <h1 className="display mt-4 text-4xl text-ink sm:text-5xl">{renderInline(title, 'title')}</h1>

      {lang !== 'es' && (
        <p className="mt-6 border-l-2 border-line pl-4 text-sm text-mist" lang="en">
          {t.legal.spanishOnly}
        </p>
      )}

      <div className="mt-6">{renderBlocks(body)}</div>
    </article>
  )
}
