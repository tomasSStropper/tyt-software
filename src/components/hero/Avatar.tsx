import { useEffect, useRef, useState } from 'react'
import { useLang } from '../../i18n/LanguageContext'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/**
 * Constantes de ajuste fino de las pupilas — % relativos a la caja de la imagen.
 * La imagen (public/tyt-avatar.webp, 1:1, fondo transparente) ya trae el
 * resplandor de los ojos; aquí solo se dibujan las pupilas móviles encima.
 */
export const EYES = {
  left: { x: 43.6, y: 13.8 },
  right: { x: 53.2, y: 13.9 },
  /** diámetro de la pupila, % del ancho de la caja */
  size: 4.2,
  /** desplazamiento máximo hacia el cursor, % del ancho de la caja */
  travel: 0.9,
  /** suavizado del lerp por frame (0–1) */
  ease: 0.09,
} as const

/** Placeholder transparente con la misma proporción por si falta la imagen real. */
const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <path d="M120 400v-52c0-45 35-75 80-75s80 30 80 75v52z" fill="#4a443a"/>
  <path d="M185 276h30l-7 40h-16z" fill="#e8e0cd"/>
  <path d="M198 280h6l4 30-7 10-7-10z" fill="#5c544a"/>
  <rect x="140" y="14" width="120" height="108" rx="10" fill="#c9bda1"/>
  <rect x="152" y="26" width="96" height="66" rx="5" fill="#2b2620"/>
  <rect x="160" y="104" width="60" height="6" rx="3" fill="#b5a98c"/>
  <circle cx="174.4" cy="55" r="9" fill="#e8b088" opacity=".55"/>
  <circle cx="212.8" cy="55.5" r="9" fill="#e8b088" opacity=".55"/>
  <rect x="188" y="122" width="24" height="24" fill="#cfc4aa"/>
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
      {/* anillos de semitono: asientan la figura en el papel */}
      <div className="halftone absolute -inset-10 -z-10" aria-hidden="true" />
      {/* sombra cálida bajo la figura, sin caja ni marco */}
      <div
        className="absolute inset-x-8 bottom-0 -z-10 h-2/5"
        style={{
          background: 'radial-gradient(55% 65% at 50% 78%, rgba(31, 29, 26, 0.22), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div ref={boxRef} className="relative aspect-square">
        <img
          src={failed ? PLACEHOLDER : '/characters/tyt-avatar.webp'}
          onError={() => setFailed(true)}
          alt={t.hero.avatarAlt}
          width={500}
          height={500}
          className="h-full w-full object-contain"
          style={{ filter: 'drop-shadow(0 18px 28px rgba(31, 29, 26, 0.28))' }}
          fetchPriority="high"
        />
        {/* pupilas — se mueven dentro del resplandor impreso en la imagen */}
        <div ref={leftRef} className="eye" style={eyeStyle(EYES.left)} aria-hidden="true" />
        <div ref={rightRef} className="eye" style={eyeStyle(EYES.right)} aria-hidden="true" />
      </div>
    </figure>
  )
}
