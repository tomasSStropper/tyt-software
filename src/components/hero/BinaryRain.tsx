import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/**
 * Constantes de calibración de la lluvia binaria.
 * Fantasma, no protagonista: opacidades bajas, caída lenta.
 */
export const RAIN = {
  /** tamaño del dígito, px */
  fontSize: 14,
  /** separación horizontal entre columnas, px */
  columnGap: 24,
  /** dígitos simultáneos por columna (densidad) */
  glyphsPerColumn: 4,
  /** velocidad de caída, px/s (min–max por columna) */
  minSpeed: 14,
  maxSpeed: 34,
  /** opacidad de los dígitos carbón (~texto fantasma) */
  inkOpacity: 0.22,
  /** opacidad de los acentos rojos */
  redOpacity: 0.45,
  /** proporción de dígitos en rojo (~1 de cada 9) */
  redRatio: 0.11,
  /** cadencia de redibujado, cuadros por segundo (calma) */
  fps: 14,
  /** hasta dónde baja la lluvia antes de reciclarse (fracción de la altura) */
  fadeEnd: 0.62,
} as const

interface Glyph {
  x: number
  y: number
  speed: number
  char: string
  red: boolean
}

export function BinaryRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    // los colores salen de los tokens: si la marca cambia, la lluvia sigue
    const styles = getComputedStyle(document.documentElement)
    const red = styles.getPropertyValue('--color-red').trim() || '#e10600'
    const ink = styles.getPropertyValue('--color-ink').trim() || '#222120'

    let glyphs: Glyph[] = []
    let W = 0
    let H = 0

    const spawn = (col: number, atTop = false): Glyph => ({
      x: col * RAIN.columnGap + RAIN.columnGap / 2,
      y: atTop ? -RAIN.fontSize - Math.random() * H * 0.35 : Math.random() * H * RAIN.fadeEnd,
      speed: RAIN.minSpeed + Math.random() * (RAIN.maxSpeed - RAIN.minSpeed),
      char: Math.random() < 0.5 ? '0' : '1',
      red: Math.random() < RAIN.redRatio,
    })

    // sprites pre-renderizados: drawImage es mucho más barato que fillText por frame
    const SPRITE = RAIN.fontSize + 4
    const sprites: Record<string, HTMLCanvasElement> = {}
    const makeSprite = (char: string, color: string, alpha: number) => {
      const c = document.createElement('canvas')
      c.width = c.height = SPRITE * 2
      const sctx = c.getContext('2d')!
      sctx.scale(2, 2)
      sctx.font = `${RAIN.fontSize}px "IBM Plex Mono", ui-monospace, monospace`
      sctx.textBaseline = 'top'
      sctx.textAlign = 'center'
      sctx.globalAlpha = alpha
      sctx.fillStyle = color
      sctx.fillText(char, SPRITE / 2, 2)
      return c
    }
    for (const char of ['0', '1']) {
      sprites[`${char}-ink`] = makeSprite(char, ink, RAIN.inkOpacity)
      sprites[`${char}-red`] = makeSprite(char, red, RAIN.redOpacity)
    }

    const init = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      W = rect.width
      H = rect.height
      canvas.width = Math.max(1, Math.round(W * dpr))
      canvas.height = Math.max(1, Math.round(H * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const cols = Math.max(1, Math.floor(W / RAIN.columnGap))
      glyphs = []
      for (let c = 0; c < cols; c++) {
        for (let g = 0; g < RAIN.glyphsPerColumn; g++) glyphs.push(spawn(c))
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      for (const g of glyphs) {
        const sprite = sprites[`${g.char}-${g.red ? 'red' : 'ink'}`]
        ctx.drawImage(sprite, g.x - SPRITE / 2, g.y, SPRITE, SPRITE)
      }
    }

    init()
    draw()

    const ro = new ResizeObserver(() => {
      init()
      draw()
    })
    ro.observe(canvas)

    // reduced-motion: un solo cuadro estático, sin bucle
    if (reduced) {
      return () => ro.disconnect()
    }

    let raf = 0
    let running = false
    let last = 0
    let acc = 0
    const frameMs = 1000 / RAIN.fps

    const tick = (now: number) => {
      if (!running) return
      const dt = Math.min(100, now - last)
      last = now
      acc += dt
      if (acc >= frameMs) {
        const step = acc / 1000
        acc = 0
        for (let i = 0; i < glyphs.length; i++) {
          const g = glyphs[i]
          g.y += g.speed * step
          if (g.y > H * RAIN.fadeEnd) {
            glyphs[i] = spawn(Math.floor(g.x / RAIN.columnGap), true)
          }
        }
        draw()
      }
      raf = requestAnimationFrame(tick)
    }

    // solo anima mientras el hero está en pantalla
    let visible = true
    const syncLoop = () => {
      if (visible && armed && !running) {
        running = true
        last = performance.now()
        raf = requestAnimationFrame(tick)
      } else if ((!visible || !armed) && running) {
        running = false
        cancelAnimationFrame(raf)
      }
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      syncLoop()
    })
    io.observe(canvas)

    // arranque diferido: la lluvia espera a que la carga respire
    let armed = false
    const armTimer = setTimeout(() => {
      armed = true
      syncLoop()
    }, 2500)

    return () => {
      clearTimeout(armTimer)
      ro.disconnect()
      io.disconnect()
      running = false
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{
        // la lluvia vive arriba y se disuelve hacia la mitad del hero
        maskImage: 'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.55) 28%, transparent 52%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.55) 28%, transparent 52%)',
      }}
    />
  )
}
