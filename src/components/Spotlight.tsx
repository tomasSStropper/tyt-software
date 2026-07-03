import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/LanguageContext'
import { useReducedMotion } from '../hooks/useReducedMotion'

/** Ajuste fino de la linterna */
const SPOT = {
  /** radio del haz, px */
  radius: 300,
  /** suavizado del lerp por frame (0–1) */
  ease: 0.1,
} as const

export function Spotlight() {
  const { t } = useLang()
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const maskRef = useRef<HTMLDivElement>(null)
  const [plain, setPlain] = useState(false)

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches
    if (reduced || !finePointer) {
      setPlain(true)
      return
    }

    const section = sectionRef.current
    if (!section) return

    // arranca centrada; el objetivo vuelve al centro cuando el cursor sale
    let targetTo: 'cursor' | 'center' = 'center'
    const cursor = { x: 0, y: 0 }
    const current = { x: 0.5, y: 0.42 } // fracción del tamaño de la sección
    let raf = 0
    let running = false

    const apply = () => {
      const el = maskRef.current
      if (!el) return
      const rect = section.getBoundingClientRect()
      el.style.setProperty('--sx', `${(current.x * rect.width).toFixed(1)}px`)
      el.style.setProperty('--sy', `${(current.y * rect.height).toFixed(1)}px`)
    }

    const tick = () => {
      const rect = section.getBoundingClientRect()
      const tx = targetTo === 'cursor' ? (cursor.x - rect.left) / rect.width : 0.5
      const ty = targetTo === 'cursor' ? (cursor.y - rect.top) / rect.height : 0.42
      current.x += (tx - current.x) * SPOT.ease
      current.y += (ty - current.y) * SPOT.ease
      apply()
      if (Math.abs(tx - current.x) < 0.001 && Math.abs(ty - current.y) < 0.001) {
        running = false
        return
      }
      raf = requestAnimationFrame(tick)
    }

    const wake = () => {
      if (!running) {
        running = true
        raf = requestAnimationFrame(tick)
      }
    }
    const onMove = (e: PointerEvent) => {
      cursor.x = e.clientX
      cursor.y = e.clientY
      targetTo = 'cursor'
      wake()
    }
    const onLeave = () => {
      targetTo = 'center'
      wake()
    }

    apply()
    section.addEventListener('pointermove', onMove, { passive: true })
    section.addEventListener('pointerleave', onLeave)
    return () => {
      section.removeEventListener('pointermove', onMove)
      section.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  const maskImage = `radial-gradient(circle ${SPOT.radius}px at var(--sx, 50%) var(--sy, 42%), black 0%, black 45%, transparent 72%)`

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#131009]"
      aria-label={t.spotlight.title}
    >
      <div className="relative h-[62vh] min-h-105 lg:h-[78vh]">
        {plain ? (
          <img
            src="/tyt-terrain.webp"
            alt={t.spotlight.alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            {/* eco apenas visible del terreno, para intuir que hay algo */}
            <img
              src="/tyt-terrain.webp"
              alt=""
              loading="lazy"
              decoding="async"
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-[0.06]"
            />
            {/* la revelación: solo existe dentro del haz */}
            <div
              ref={maskRef}
              className="absolute inset-0"
              style={{
                maskImage,
                WebkitMaskImage: maskImage,
              }}
            >
              <img
                src="/tyt-terrain.webp"
                alt={t.spotlight.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </>
        )}

        {/* titular sobre la oscuridad */}
        <div className="pointer-events-none absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-6xl px-5 pb-12 sm:px-8 lg:pb-16">
            <h2
              className="display max-w-[14ch] text-4xl text-paper-lift sm:text-6xl lg:text-7xl"
              style={{ textShadow: '0 2px 24px rgba(0, 0, 0, 0.55)' }}
            >
              {t.spotlight.title}
            </h2>
          </div>
        </div>
      </div>
    </section>
  )
}
