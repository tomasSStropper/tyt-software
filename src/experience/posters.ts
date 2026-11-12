import type { PosterStyle, Project } from '../content/projects'
import type { Lang } from '../i18n/dictionary'

/**
 * PÓSTERS COMPUESTOS
 *
 * Mientras un proyecto no tenga capturas reales (`shots` vacío) su pantalla
 * se compone aquí con Canvas 2D: una maqueta de sitio web hecha con su foto
 * de rubro (`photos`), su paleta y su titular. Tres variantes por proyecto
 * (0 = portada, 1 y 2 = interiores). Las mismas funciones alimentan las
 * texturas WebGL de la galería y el carrusel del detalle.
 */

export const POSTER_W = 1280
export const POSTER_H = 768

const SANS = 'Archivo, system-ui, sans-serif'
const MONO = 'Doto, ui-monospace, monospace'

interface Palette {
  bg: [string, string]
  fg: string
  accent: string
  accent2: string
  bar: string
}

const PALETTES: Record<PosterStyle, Palette> = {
  dark: { bg: ['#0c0c0d', '#060606'], fg: '#f2f1ee', accent: '#e10600', accent2: '#2a2928', bar: '#151515' },
  green: { bg: ['#0f4a34', '#051c13'], fg: '#f1ead8', accent: '#7fd6a0', accent2: '#0a3323', bar: '#082318' },
  yellow: { bg: ['#060606', '#060606'], fg: '#ffffff', accent: '#f7b500', accent2: '#1f9d4d', bar: '#000000' },
  blue: { bg: ['#0a22ff', '#19d2ff'], fg: '#ffffff', accent: '#ffffff', accent2: '#0618b8', bar: '#0a1fe6' },
  grey: { bg: ['#d9d9d9', '#8d8d8d'], fg: '#ffffff', accent: '#0a0a0a', accent2: '#bdbdbd', bar: '#cfcfcf' },
}

/** Espera a que las fuentes del lienzo estén listas (Canvas no hace fallback tardío). */
export async function fontsReady(): Promise<void> {
  if (!('fonts' in document)) return
  try {
    await Promise.all([
      document.fonts.load(`900 40px Doto`),
      document.fonts.load(`800 80px Archivo`),
      document.fonts.load(`500 20px Archivo`),
    ])
  } catch {
    /* si falla, se dibuja con la fuente del sistema */
  }
}

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedOf(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

function fillBg(ctx: CanvasRenderingContext2D, p: Palette) {
  const g = ctx.createLinearGradient(0, 0, 0, POSTER_H)
  g.addColorStop(0, p.bg[0])
  g.addColorStop(1, p.bg[1])
  ctx.fillStyle = g
  ctx.fillRect(0, 0, POSTER_W, POSTER_H)
}

/** Barra de navegador falsa: le dice al ojo "esto es un sitio web" */
function chrome(ctx: CanvasRenderingContext2D, p: Palette, name: string, dark: boolean) {
  ctx.fillStyle = p.bar
  ctx.fillRect(0, 0, POSTER_W, 46)
  ctx.fillStyle = dark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)'
  ctx.font = `700 17px ${SANS}`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillText(name, 28, 24)
  ctx.globalAlpha = 0.55
  for (let i = 0; i < 4; i++) ctx.fillRect(POSTER_W - 330 + i * 62, 20, 40, 6)
  ctx.globalAlpha = 1
  ctx.fillRect(POSTER_W - 72, 13, 46, 20)
}

function textLines(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, rows: number, color: string, r: () => number) {
  ctx.fillStyle = color
  for (let i = 0; i < rows; i++) ctx.fillRect(x, y + i * 13, w * (0.55 + r() * 0.45), 4)
}

function fitFont(ctx: CanvasRenderingContext2D, text: string, weight: number, max: number, width: number) {
  let size = max
  do {
    ctx.font = `${weight} ${size}px ${SANS}`
    size -= 4
  } while (ctx.measureText(text).width > width && size > 30)
}

// ── Fotos ───────────────────────────────────────────────────

const photoCache = new Map<string, Promise<HTMLImageElement | null>>()

/** Carga una foto una sola vez; si falla devuelve null y el póster cae a su degradado. */
export function loadPhoto(src: string | undefined): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null)
  let hit = photoCache.get(src)
  if (!hit) {
    hit = new Promise((res) => {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => res(img)
      img.onerror = () => res(null)
      img.src = src
    })
    photoCache.set(src, hit)
  }
  return hit
}

/** Pinta `img` cubriendo el rectángulo (recorte centrado, como object-fit: cover). */
function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, x: number, y: number, w: number, h: number) {
  if (!img) return
  const s = Math.max(w / img.width, h / img.height)
  const sw = w / s
  const sh = h / s
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h)
}

function shade(ctx: CanvasRenderingContext2D, from: string, to: string, horizontal: boolean, x = 0, y = 0, w = POSTER_W, h = POSTER_H) {
  const g = horizontal ? ctx.createLinearGradient(x, 0, x + w, 0) : ctx.createLinearGradient(0, y, 0, y + h)
  g.addColorStop(0, from)
  g.addColorStop(1, to)
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
}

/** Texto con salto de línea; devuelve la y donde terminó. */
function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number): number {
  const words = text.split(' ')
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y)
      y += lineH
      line = word
    } else line = test
  }
  ctx.fillText(line, x, y)
  return y + lineH
}

export interface PosterText {
  tag: string
  headline: string
}

// ── Portadas: cada una es la "home" de un sitio, con su foto de rubro ──

function coverDark(ctx: CanvasRenderingContext2D, p: Palette, t: PosterText, photo: HTMLImageElement | null) {
  cover(ctx, photo, 0, 0, POSTER_W, POSTER_H)
  shade(ctx, 'rgba(6,6,6,0.94)', 'rgba(6,6,6,0.28)', true)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `800 34px ${SANS}`
  ctx.fillStyle = p.fg
  ctx.fillText('Arena', 64, 118)
  ctx.fillStyle = p.accent
  ctx.fillText('Desk', 64 + ctx.measureText('Arena').width, 118)
  ctx.fillRect(64, 142, 70, 6)
  ctx.fillStyle = p.fg
  ctx.font = `900 82px ${SANS}`
  wrap(ctx, t.headline, 60, 250, 760, 84)
  // cifras del panel sobre vidrio oscuro
  const stats = [
    ['342', 'MIEMBROS'],
    ['4,18M', 'INGRESOS'],
    ['87', 'ASISTENCIA'],
    ['9', 'PENDIENTES'],
  ]
  stats.forEach(([n, l], i) => {
    const x = 64 + i * 232
    ctx.fillStyle = 'rgba(14,14,14,0.82)'
    ctx.fillRect(x, 566, 214, 136)
    ctx.fillStyle = i === 3 ? p.accent : p.fg
    ctx.font = `800 52px ${SANS}`
    ctx.fillText(n, x + 20, 640)
    ctx.fillStyle = '#8a8884'
    ctx.font = `700 15px ${SANS}`
    ctx.fillText(l, x + 20, 676)
  })
}

function coverGreen(ctx: CanvasRenderingContext2D, p: Palette, pr: Project, t: PosterText, photo: HTMLImageElement | null) {
  cover(ctx, photo, 0, 0, POSTER_W, POSTER_H)
  shade(ctx, 'rgba(5,34,22,0.96)', 'rgba(5,34,22,0.12)', true)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = p.fg
  ctx.font = `800 150px ${SANS}`
  ctx.fillText(pr.name, 60, 290)
  ctx.fillStyle = p.accent
  ctx.font = `600 26px ${SANS}`
  ctx.fillText('SUSTAINABILITY ADVISORS', 68, 342)
  ctx.fillStyle = p.fg
  ctx.font = `600 46px ${SANS}`
  const y = wrap(ctx, t.headline, 66, 500, 560, 54)
  ctx.fillStyle = p.accent
  ctx.fillRect(66, y - 8, 210, 52)
  ctx.strokeStyle = 'rgba(241,234,216,0.6)'
  ctx.lineWidth = 2
  ctx.strokeRect(294, y - 8, 160, 52)
  ctx.fillStyle = p.fg
  ctx.font = `800 40px ${SANS}`
  ;['25+', '5000+', '5+'].forEach((n, i) => ctx.fillText(n, 760 + i * 170, 704))
}

function coverYellow(ctx: CanvasRenderingContext2D, p: Palette, pr: Project, t: PosterText, photo: HTMLImageElement | null) {
  const title = pr.name.toUpperCase()
  ctx.fillStyle = p.fg
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  fitFont(ctx, title, 900, 250, POSTER_W - 60)
  ctx.fillText(title, 30, 268)
  // la foto va enmarcada en amarillo, como una postal
  ctx.fillStyle = p.accent
  ctx.fillRect(118, 300, 1044, 424)
  if (photo) cover(ctx, photo, 132, 314, 1016, 396)
  else {
    ctx.fillStyle = p.accent2
    ctx.fillRect(132, 314, 1016, 396)
  }
  ctx.font = `800 30px ${SANS}`
  const tw = ctx.measureText(t.headline).width
  ctx.fillStyle = p.accent
  ctx.fillRect(132, 642, tw + 44, 68)
  ctx.fillStyle = '#0a0a0a'
  ctx.fillText(t.headline, 154, 687)
}

function coverBlue(ctx: CanvasRenderingContext2D, p: Palette, pr: Project, t: PosterText, photo: HTMLImageElement | null) {
  cover(ctx, photo, 0, 0, POSTER_W, POSTER_H)
  shade(ctx, 'rgba(10,34,255,0.95)', 'rgba(25,200,255,0.18)', false)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  fitFont(ctx, pr.name, 900, 150, POSTER_W - 80)
  ctx.fillStyle = '#04104a'
  ctx.fillText(pr.name, 46, 196)
  ctx.fillStyle = p.fg
  ctx.fillText(pr.name, 38, 188)
  ctx.font = `600 38px ${SANS}`
  wrap(ctx, t.headline, 42, 262, 700, 46)
  // buscador de propiedades
  ctx.fillStyle = 'rgba(255,255,255,0.96)'
  ctx.fillRect(42, 640, 760, 74)
  ctx.fillStyle = '#0a22ff'
  ctx.fillRect(642, 640, 160, 74)
  ctx.fillStyle = '#7b86a8'
  ctx.fillRect(70, 672, 220, 8)
  ctx.fillRect(330, 672, 150, 8)
}

function coverGrey(ctx: CanvasRenderingContext2D, pr: Project, t: PosterText, photo: HTMLImageElement | null) {
  cover(ctx, photo, 0, 0, POSTER_W, POSTER_H)
  // desaturar: la mezcla "saturation" con gris quita el color sin ctx.filter
  ctx.globalCompositeOperation = 'saturation'
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, POSTER_W, POSTER_H)
  ctx.globalCompositeOperation = 'source-over'
  shade(ctx, 'rgba(16,16,16,0.82)', 'rgba(16,16,16,0.05)', true)
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `900 96px ${SANS}`
  const [a, b] = pr.name.length > 8 ? [pr.name.slice(0, 6), pr.name.slice(6)] : [pr.name, '']
  ctx.fillText(a.toUpperCase(), 64, 232)
  ctx.fillText(b.toUpperCase(), 64, 322)
  ctx.font = `500 36px ${SANS}`
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  wrap(ctx, t.headline, 68, 520, 560, 44)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(68, 584, 170, 46)
}

// ── Interiores ──────────────────────────────────────────────

/** Sección partida: texto a la izquierda, segunda foto a la derecha. */
function innerSplit(ctx: CanvasRenderingContext2D, p: Palette, pr: Project, t: PosterText, photo: HTMLImageElement | null, dark: boolean, r: () => number) {
  const split = 540
  cover(ctx, photo, split, 46, POSTER_W - split, POSTER_H - 46)
  ctx.fillStyle = dark ? p.bg[1] : '#ececec'
  ctx.fillRect(0, 46, split, POSTER_H - 46)
  const ink = dark ? p.fg : '#0a0a0a'
  ctx.fillStyle = p.accent
  ctx.fillRect(56, 150, 90, 8)
  ctx.fillStyle = ink
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `900 68px ${SANS}`
  const y = wrap(ctx, t.tag.toUpperCase(), 54, 250, split - 100, 70)
  textLines(ctx, 58, y + 6, split - 150, 7, dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)', r)
  ctx.font = `900 26px ${MONO}`
  ctx.fillStyle = ink
  ctx.fillText(`${pr.name.toUpperCase()} / 02`, 56, 700)
}

/** Foto a sangre con una franja inferior de pie. */
function innerFull(ctx: CanvasRenderingContext2D, p: Palette, pr: Project, t: PosterText, photo: HTMLImageElement | null, dark: boolean) {
  cover(ctx, photo, 0, 46, POSTER_W, POSTER_H - 46 - 104)
  ctx.fillStyle = dark ? p.bar : '#ececec'
  ctx.fillRect(0, POSTER_H - 104, POSTER_W, 104)
  ctx.fillStyle = p.accent
  ctx.fillRect(0, POSTER_H - 104, POSTER_W, 5)
  ctx.fillStyle = dark ? p.fg : '#0a0a0a'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.font = `800 36px ${SANS}`
  ctx.fillText(t.headline, 48, POSTER_H - 48)
  ctx.textAlign = 'right'
  ctx.font = `900 28px ${MONO}`
  ctx.fillText(`${pr.name.toUpperCase()} / 03`, POSTER_W - 48, POSTER_H - 48)
}

/** Dibuja la variante `variant` (0 portada, 1 y 2 interiores) del póster de `project`. */
export function drawPoster(
  canvas: HTMLCanvasElement,
  project: Project,
  variant: number,
  text: PosterText,
  photo: HTMLImageElement | null,
): void {
  canvas.width = POSTER_W
  canvas.height = POSTER_H
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const p = PALETTES[project.style]
  const dark = project.style !== 'grey'
  const r = rng(seedOf(project.id) + variant * 97)
  fillBg(ctx, p)
  if (variant === 0) {
    if (project.style === 'dark') coverDark(ctx, p, text, photo)
    else if (project.style === 'green') coverGreen(ctx, p, project, text, photo)
    else if (project.style === 'yellow') coverYellow(ctx, p, project, text, photo)
    else if (project.style === 'blue') coverBlue(ctx, p, project, text, photo)
    else coverGrey(ctx, project, text, photo)
  } else if (variant === 1) {
    innerSplit(ctx, p, project, text, photo, dark, r)
  } else {
    innerFull(ctx, p, project, text, photo, dark)
  }
  chrome(ctx, p, project.name, dark || variant === 0)
}

/** Carga fuentes + foto y dibuja el póster. Es lo que usan el lienzo WebGL y el carrusel. */
export async function renderPoster(canvas: HTMLCanvasElement, project: Project, variant: number, lang: Lang): Promise<void> {
  const [photo] = await Promise.all([loadPhoto(project.photos[variant % Math.max(1, project.photos.length)]), fontsReady()])
  drawPoster(canvas, project, variant, { tag: project.tag[lang], headline: project.headline[lang] }, photo)
}

/** Rótulo dot-matrix que flota sobre cada pantalla de la galería. */
export const LABEL_W = 1024
export const LABEL_H = 128
export function makeLabelCanvas(text: string): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = LABEL_W
  c.height = LABEL_H
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  let size = 74
  do {
    ctx.font = `900 ${size}px ${MONO}`
    size -= 4
  } while (ctx.measureText(text).width > LABEL_W - 40 && size > 24)
  ctx.fillText(text, LABEL_W / 2, LABEL_H / 2 + 4)
  return c
}

/**
 * Rejilla quadtree del holograma: una malla de alambre que se subdivide
 * alrededor de la silueta del robot, como un escáner afinando el contorno.
 * `rect` = dónde cae la imagen dentro del panel (uv, origen abajo-izquierda).
 */
export function makeGridCanvas(
  img: HTMLImageElement,
  aspect: number,
  rect: { x: number; y: number; w: number; h: number },
): HTMLCanvasElement {
  const H = 1024
  const W = Math.max(256, Math.round(H * aspect))
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d', { willReadFrequently: true })!

  // 1) silueta: se pinta la imagen en su sitio y se lee el alfa
  ctx.clearRect(0, 0, W, H)
  const dx = rect.x * W
  const dw = rect.w * W
  const dh = rect.h * H
  const dy = H - (rect.y + rect.h) * H
  ctx.drawImage(img, dx, dy, dw, dh)
  const alpha = ctx.getImageData(0, 0, W, H).data
  const solid = (x: number, y: number) => {
    const xi = Math.min(W - 1, Math.max(0, x | 0))
    const yi = Math.min(H - 1, Math.max(0, y | 0))
    return alpha[(yi * W + xi) * 4 + 3] > 110
  }

  // 2) rejilla
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = 'rgba(255,255,255,0.86)'
  ctx.lineWidth = 2

  const root = H / 9
  const minSize = root / 8

  const mixed = (x: number, y: number, s: number) => {
    let inside = 0
    let total = 0
    const step = Math.max(2, s / 6)
    for (let yy = y; yy <= y + s; yy += step)
      for (let xx = x; xx <= x + s; xx += step) {
        total++
        if (solid(xx, yy)) inside++
      }
    return inside > 0 && inside < total
  }

  const cell = (x: number, y: number, s: number) => {
    if (s > minSize && mixed(x, y, s)) {
      const h = s / 2
      cell(x, y, h)
      cell(x + h, y, h)
      cell(x, y + h, h)
      cell(x + h, y + h, h)
      return
    }
    ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(s), Math.round(s))
  }

  const offX = -((Math.ceil(W / root) * root - W) / 2)
  for (let y = 0; y < H; y += root) for (let x = offX; x < W; x += root) cell(x, y, root)
  return c
}

/** Texto tenue impreso en el piso de la sala blanca. */
export function makeFloorCanvas(): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 1024
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, 1024, 1024)
  ctx.fillStyle = '#fff'
  ctx.font = `900 30px ${MONO}`
  ctx.textBaseline = 'top'
  const lines = [
    'tyt software & solutions',
    'san vito, costa rica',
    '> sitios que venden',
    '> sistemas a la medida',
    'automatizacion 24/7',
    'una sola fuente de verdad',
    '$ deploy --prod  ok',
    'escuchar. diagnosticar.',
    'construir. automatizar.',
    'acompañar.',
    'arenadesk v2.4 online',
    'respuesta < 24 hrs',
    'hecho en costa rica',
    'throttled to 60 fps',
  ]
  const r = rng(77)
  for (let i = 0; i < 26; i++) {
    const t = lines[i % lines.length]
    ctx.globalAlpha = 0.45 + r() * 0.55
    ctx.fillText(t.toUpperCase(), r() * 560 - 40, i * 39 + 6)
  }
  return c
}

/** Rótulos luminosos del pabellón rojo. */
export function makeSignCanvas(text: string, vertical: boolean, fg: string, bg: string): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = vertical ? 128 : 512
  c.height = vertical ? 384 : 128
  const ctx = c.getContext('2d')!
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.fillStyle = fg
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  if (vertical) {
    ctx.font = `900 104px ${SANS}`
    ;[...text].forEach((ch, i, a) => ctx.fillText(ch, 64, (c.height / (a.length + 1)) * (i + 1)))
  } else {
    let size = 96
    do {
      ctx.font = `900 ${size}px ${SANS}`
      size -= 4
    } while (ctx.measureText(text).width > c.width - 30 && size > 20)
    ctx.fillText(text, c.width / 2, c.height / 2 + 4)
  }
  return c
}
