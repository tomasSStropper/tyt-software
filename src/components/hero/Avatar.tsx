import { useEffect, useRef, useState } from 'react'
import { useLang } from '../../i18n/LanguageContext'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/**
 * Constantes de ajuste fino de las pupilas — % relativos a la caja de la imagen.
 * La imagen (public/hero-computer.jpg, 1:1) ya trae el resplandor de los ojos;
 * aquí solo se dibujan las pupilas móviles sobre ese resplandor.
 */
export const EYES = {
  left: { x: 43.7, y: 15.0 },
  right: { x: 53.3, y: 14.9 },
  /** diámetro de la pupila, % del ancho de la caja */
  size: 3.2,
  /** desplazamiento máximo hacia el cursor, % del ancho de la caja */
  travel: 0.9,
  /** suavizado del lerp por frame (0–1) */
  ease: 0.09,
} as const

/** Placeholder con la misma relación de aspecto (1:1) por si falta la imagen real. */
const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#ddd3bd"/>
  <path d="M120 400v-60c0-45 35-75 80-75s80 30 80 75v60z" fill="#4a443a"/>
  <path d="M185 268h30l-7 40h-16z" fill="#e8e0cd"/>
  <path d="M198 272h6l4 30-7 10-7-10z" fill="#5c544a"/>
  <rect x="140" y="18" width="120" height="105" rx="10" fill="#c9bda1"/>
  <rect x="152" y="30" width="96" height="68" rx="5" fill="#2b2620"/>
  <rect x="160" y="108" width="60" height="6" rx="3" fill="#b5a98c"/>
  <circle cx="174.8" cy="60" r="9" fill="#e8b088" opacity=".55"/>
  <circle cx="213.2" cy="59.6" r="9" fill="#e8b088" opacity=".55"/>
  <rect x="188" y="123" width="24" height="22" fill="#cfc4aa"/>
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
    let running = false

    // el bucle arranca con el primer movimiento y se apaga al converger:
    // sin cursor no hay trabajo por frame
    const onMove = (e: PointerEvent) => {
      cursor.x = e.clientX
      cursor.y = e.clientY
      if (!running) {
        running = true
        raf = requestAnimationFrame(tick)
      }
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
      if (Math.abs(tx - current.x) < 0.05 && Math.abs(ty - current.y) < 0.05) {
        running = false
        return
      }
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
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
        className="relative aspect-square overflow-hidden border border-ink/25 bg-paper-deep shadow-[0_2px_0_rgba(42,37,30,0.25),0_24px_60px_-24px_rgba(42,37,30,0.45)]"
      >
        <img
          src={failed ? PLACEHOLDER : '/hero-computer.jpg'}
          onError={() => setFailed(true)}
          alt={t.hero.avatarAlt}
          width={1024}
          height={1024}
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
        {/* pupilas — se mueven dentro del resplandor impreso en la imagen */}
        <div ref={leftRef} className="eye" style={eyeStyle(EYES.left)} aria-hidden="true" />
        <div ref={rightRef} className="eye" style={eyeStyle(EYES.right)} aria-hidden="true" />
      </div>

      {/* placa de museo */}
      <figcaption className="mono-label mt-3 flex items-center justify-between text-mist">
        <span>FIG. 01 — TyT/OS</span>
        <span aria-hidden="true">8.8203° N — 82.9708° W</span>
      </figcaption>
    </figure>
  )
}
