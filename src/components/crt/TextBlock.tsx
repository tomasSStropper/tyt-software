import type { CSSProperties, ReactNode } from 'react'

interface TextBlockProps {
  title: string
  /** nivel del encabezado: el del hero es h1, los demás h2 */
  as?: 'h1' | 'h2'
  children: ReactNode
  /** enlace(s) "> ETIQUETA" al pie */
  action?: ReactNode
  className?: string
  style?: CSSProperties
  id?: string
}

/** Bloque de texto de terminal: regla punteada con flechas a la izquierda. */
export function TextBlock({ title, as: Tag = 'h2', children, action, className = '', style, id }: TextBlockProps) {
  return (
    <section className={`tblock ${className}`} style={style} aria-labelledby={id}>
      <span className="tblock__rule" aria-hidden="true" />
      <div>
        <Tag className="tblock__title" id={id}>
          {title}
        </Tag>
        <div className="tblock__body">{children}</div>
        {action}
      </div>
    </section>
  )
}
