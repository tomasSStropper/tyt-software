import { useEffect, useRef, useState } from 'react'
import { useLang } from '../../i18n/LanguageContext'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/**
 * Constantes de ajuste fino de los ojos — % relativos a la caja de la imagen.
 * Ajustar tras el preview si la pantalla del monitor no coincide.
 */
export const EYES = {
  left: { x: 41.5, y: 29.0 },
  right: { x: 58.5, y: 29.0 },
  /** diámetro del ojo, % del ancho de la caja */
  size: 6.5,
  /** desplazamiento máximo hacia el cursor, % del ancho de la caja */
  travel: 1.9,
  /** suavizado del lerp por frame (0–1) */
  ease: 0.09,
} as const

/** Placeholder con la misma relación de aspecto (4:5) por si falta la imagen real. */
const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
  <rect width="400" height="500" fill="#ddd3bd"/>
  <g fill="none" stroke="#2a251e" stroke-opacity=".08"><path d="M0 40h400M0 460h400"/></g>
  <path d="M110 500V400c0-60 40-95 90-95s90 35 90 95v100z" fill="#2a251e"/>
  <path d="M178 310h44l-10 60h-24z" fill="#e8e0cd"/>
  <path d="M196 318h8l6 44-10 14-10-14z" fill="#b3372a"/>
  <rect x="186" y="270" width="28" height="46" fill="#cfc4aa"/>
  <rect x="112" y="58" width="176" height="150" rx="14" fill="#c9bda1"/>
  <rect x="112" y="58" width="176" height="150" rx="14" fill="none" stroke="#2a251e" stroke-opacity=".25" stroke-width="2"/>
  <rect x="134" y="82" width="132" height="98" rx="6" fill="#1e1a14"/>
  <g stroke="#eae4d6" stroke-opacity=".05"><path d="M134 96h132M134 112h132M134 128h132M134 144h132M134 160h132"/></g>
  <rect x="150" y="216" width="100" height="10" rx="5" fill="#b5a98c"/>
</svg>`)

export function Avatar() {
  const { t } = useLang()
  const reduced = useReducedMotion()
  const boxRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches
    if (reduced || !finePointer) return

    const box = boxRef.current
    if (!box) return

    const cursor = { x: -1, y: -1 }
    const current = { x: 0, y: 0 }
    let raf = 0

    const onMove = (e: PointerEvent) => {
      cursor.x = e.clientX
      cursor.y = e.clientY
    }

    const tick = () => {
      const rect = box.getBoundingClientRect()
      const maxPx = (EYES.travel / 100) * rect.width
      let tx = 0
      let ty = 0
      if (cursor.x >= 0) {
        // vector desde el centro de la pantalla del monitor hacia el cursor
        const cx = rect.left + rect.width * ((EYES.left.x + EYES.right.x) / 200)
        const cy = rect.top + rect.height * (EYES.left.y / 100)
        const dx = cursor.x - cx
        const dy = cursor.y - cy
        const dist = Math.hypot(dx, dy)
        if (dist > 1) {
          const pull = Math.min(1, dist / 260)
          tx = (dx / dist) * maxPx * pull
          ty = (dy / dist) * maxPx * pull
        }
      }
      current.x += (tx - current.x) * EYES.ease
      current.y += (ty - current.y) * EYES.ease
      const transform = `translate(calc(-50% + ${current.x.toFixed(2)}px), calc(-50% + ${current.y.toFixed(2)}px))`
      if (leftRef.current) leftRef.current.style.transform = transform
      if (rightRef.current) rightRef.current.style.transform = transform
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  const eyeStyle = (eye: { x: number; y: number }) => ({
    left: `${eye.x}%`,
    top: `${eye.y}%`,
    width: `${EYES.size}%`,
    aspectRatio: '1',
    transform: 'translate(-50%, -50%)',
  })

  return (
    <figure className="relative mx-auto w-full max-w-105">
      {/* anillos de semitono tras la figura */}
      <div className="halftone absolute -inset-8 -z-10" aria-hidden="true" />

      <div
        ref={boxRef}
        className="relative aspect-4/5 overflow-hidden border border-ink/25 bg-paper-deep shadow-[0_2px_0_rgba(42,37,30,0.25),0_24px_60px_-24px_rgba(42,37,30,0.45)]"
      >
        <img
          src={failed ? PLACEHOLDER : '/tyt-avatar-hero.jpg'}
          onError={() => setFailed(true)}
          alt={t.hero.avatarAlt}
          className="h-full w-full object-cover"
          style={{ filter: 'sepia(0.14) saturate(0.9) contrast(1.02)' }}
          fetchPriority="high"
        />
        {/* capa de ojos — siguen el cursor dentro de la pantalla */}
        <div
          ref={leftRef}
          className={`eye ${reduced ? '' : 'eye-idle'}`}
          style={eyeStyle(EYES.left)}
          aria-hidden="true"
        />
        <div
          ref={rightRef}
          className={`eye ${reduced ? '' : 'eye-idle'}`}
          style={eyeStyle(EYES.right)}
          aria-hidden="true"
        />
      </div>

      {/* placa de museo */}
      <figcaption className="mono-label mt-3 flex items-center justify-between text-mist">
        <span>FIG. 01 — TyT/OS</span>
        <span aria-hidden="true">EST. 2024 · CR</span>
      </figcaption>
    </figure>
  )
}
