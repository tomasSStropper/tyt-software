import { useEffect, useRef, type ReactNode } from 'react'

interface SheetProps {
  /** nombre accesible del diálogo */
  label: string
  onClose: () => void
  children: ReactNode
  className?: string
}

/**
 * Capa a pantalla completa (detalle de proyecto, menú, formularios).
 * Se comporta como un diálogo modal: bloquea el scroll del fondo, cierra con
 * Escape, atrapa el foco con Tab y lo devuelve a quien la abrió al cerrar.
 */
export function Sheet({ label, onClose, children, className = '' }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const opener = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusables = () =>
      Array.from(el.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, textarea, summary'))
    focusables()[0]?.focus({ preventScroll: true })

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      opener?.focus?.({ preventScroll: true })
    }
  }, [])

  return (
    <div ref={ref} className={`sheet ${className}`} role="dialog" aria-modal="true" aria-label={label}>
      <div className="sheet__inner">{children}</div>
    </div>
  )
}
