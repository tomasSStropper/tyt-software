import { useEffect, useRef, type ReactNode } from 'react'
import { ArrowRight, X } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'

/** Renderiza texto con **negritas** como <strong> en carbón (sin subrayado). */
function Emphasized({ text }: { text: string }) {
  const parts = text.split('**')
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-ink">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  )
}

interface ServiceModalProps {
  open: boolean
  onClose: () => void
  index: number
  service: {
    name: string
    hook: string
    body: string
    resultText: string
    how: string
  }
}

function Label({ children }: { children: ReactNode }) {
  return <p className="mono-label text-ink-soft">{children}</p>
}

export function ServiceModal({ open, onClose, index, service }: ServiceModalProps) {
  const { t } = useLang()
  const ref = useRef<HTMLDialogElement>(null)

  // <dialog> nativo: focus trap, Escape y retorno de foco vienen del navegador
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  // la página de atrás no hace scroll mientras el diálogo está abierto
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const quote = () => {
    onClose()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('contacto')?.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  const titleId = `svc-modal-title-${index}`

  return (
    <dialog
      ref={ref}
      className="svc-modal m-auto w-[min(92vw,40rem)] rounded-[2px] border border-ink/25 bg-paper p-0 text-ink shadow-[0_32px_80px_-24px_rgba(0,0,0,0.5)]"
      aria-labelledby={titleId}
      aria-modal="true"
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        // clic fuera del panel = clic sobre el propio <dialog> (el ::backdrop)
        if (e.target === ref.current) onClose()
      }}
    >
      <div className="grain-local relative max-h-[85dvh] overflow-y-auto p-7 sm:p-9">
        <div className="flex items-start justify-between gap-4">
          <span className="mono-label text-red-ink">
            0{index + 1} <span className="text-mist">/ 04</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.services.modalClose}
            className="cursor-pointer p-1 text-ink-soft transition-colors duration-200 hover:text-red"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <h2 id={titleId} className="display mt-3 text-3xl text-ink sm:text-4xl">
          {service.name}
        </h2>

        <p className="mt-5 text-lg font-medium text-ink">{service.hook}</p>

        <p className="mt-4 leading-relaxed text-ink-soft">
          <Emphasized text={service.body} />
        </p>

        <div className="mt-6 border-l-2 border-red pl-4">
          <Label>{t.services.modalResultLabel}</Label>
          <p className="mt-1 font-medium text-ink">{service.resultText}</p>
        </div>

        <div className="mt-5">
          <Label>{t.services.modalHowLabel}</Label>
          <p className="mt-1 leading-relaxed text-ink-soft">{service.how}</p>
        </div>

        <button
          type="button"
          onClick={quote}
          className="group mono-label mt-8 inline-flex cursor-pointer items-center gap-2 rounded-[2px] border border-red bg-red px-6 py-3.5 text-on-red transition-colors duration-200 hover:border-red-bright hover:bg-red-bright"
        >
          {t.services.modalQuoteCta}
          <ArrowRight
            size={14}
            className="transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </button>
      </div>
    </dialog>
  )
}
