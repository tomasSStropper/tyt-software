/**
 * UNIDAD DE VIEWPORT ESTABLE (--u)
 *
 * En móviles la barra del navegador aparece y desaparece al hacer scroll, y
 * con ella cambia `100vh`. Si el recorrido midiera con eso, todo saltaría.
 * Aquí se fija el alto UNA vez (y solo se recalcula si cambia el ancho o la
 * orientación) y se publica como variable CSS `--u` en píxeles.
 */
let unit = typeof window !== 'undefined' ? window.innerHeight : 800
let lastWidth = typeof window !== 'undefined' ? window.innerWidth : 0
let installed = false
const listeners = new Set<() => void>()

function apply() {
  document.documentElement.style.setProperty('--u', `${unit}px`)
}

function onResize() {
  const w = window.innerWidth
  const h = window.innerHeight
  // mismo ancho y cambio pequeño de alto = barra del navegador: se ignora
  if (w === lastWidth && Math.abs(h - unit) < 160) return
  lastWidth = w
  unit = h
  apply()
  listeners.forEach((fn) => fn())
}

export function installUnit(): void {
  if (installed) return
  installed = true
  unit = window.innerHeight
  lastWidth = window.innerWidth
  apply()
  window.addEventListener('resize', onResize)
}

/** Alto de pantalla estable, en px */
export function getUnit(): number {
  return unit
}

export function onUnitChange(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
