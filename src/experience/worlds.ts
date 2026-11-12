import * as THREE from 'three'
import { makeSignCanvas } from './posters'

/**
 * MUNDOS 3D PROCEDURALES
 *
 * Ninguno usa modelos ni fotos: todo son cajas y cilindros colocados por
 * código con InstancedMesh (miles de copias de una misma geometría en una
 * sola llamada de dibujo — por eso corre fluido en un teléfono).
 *
 *   buildTunnel(): pasillo de circuito — rieles, chips con LED verde, disipadores
 *   buildCity():   cañón de bloques azul niebla que termina en el pabellón rojo de TyT
 */

export interface World {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  /** c = avance 0..1 dentro del mundo; t = segundos */
  update(c: number, t: number): void
  dispose(): void
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

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Acumula instancias y las convierte en un solo InstancedMesh. */
class Batch {
  private m: THREE.Matrix4[] = []
  private c: THREE.Color[] = []
  private static d = new THREE.Object3D()

  add(x: number, y: number, z: number, sx: number, sy: number, sz: number, color: number, rx = 0, ry = 0, rz = 0) {
    const d = Batch.d
    d.position.set(x, y, z)
    d.rotation.set(rx, ry, rz)
    d.scale.set(sx, sy, sz)
    d.updateMatrix()
    this.m.push(d.matrix.clone())
    this.c.push(new THREE.Color(color))
  }

  build(geo: THREE.BufferGeometry, mat: THREE.Material): THREE.InstancedMesh {
    const mesh = new THREE.InstancedMesh(geo, mat, this.m.length)
    this.m.forEach((mm, i) => {
      mesh.setMatrixAt(i, mm)
      mesh.setColorAt(i, this.c[i])
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.frustumCulled = false
    return mesh
  }
}

function disposeScene(scene: THREE.Scene) {
  scene.traverse((o) => {
    const m = o as THREE.Mesh
    if (m.geometry) m.geometry.dispose()
    const mat = m.material as THREE.Material | THREE.Material[] | undefined
    if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
    else if (mat) {
      const map = (mat as THREE.MeshBasicMaterial).map
      if (map) map.dispose()
      mat.dispose()
    }
  })
}

// ════════════════════════════════════════════════════════════
// TÚNEL — el interior de la máquina
// ════════════════════════════════════════════════════════════
export function buildTunnel(): World {
  const scene = new THREE.Scene()
  const dark = new THREE.Color(0x030304)
  scene.background = dark
  scene.fog = new THREE.Fog(dark, 5, 44)

  scene.add(new THREE.AmbientLight(0xc4d2e8, 0.75))
  const sun = new THREE.DirectionalLight(0xffffff, 2.1)
  sun.position.set(0.5, 3, 2.2)
  scene.add(sun)

  const box = new THREE.BoxGeometry(1, 1, 1)
  const cyl = new THREE.CylinderGeometry(1, 1, 1, 10)
  const lit = new THREE.MeshLambertMaterial({ color: 0xffffff })
  const glow = new THREE.MeshBasicMaterial({ color: 0xffffff })

  const solid = new Batch()
  const led = new Batch()
  const knobs = new Batch()
  const r = rng(4107)

  const Z0 = 8
  const Z1 = -150
  const LEN = Z0 - Z1
  const MID = (Z0 + Z1) / 2

  // piso
  solid.add(0, -0.05, MID, 40, 0.1, LEN, 0x0b0c0e)

  // rieles centrales
  for (const x of [-0.52, 0.52]) solid.add(x, 0.06, MID, 0.075, 0.12, LEN, 0xdfe3e6)
  for (const x of [-0.07, 0.07]) solid.add(x, 0.02, MID, 0.02, 0.04, LEN, 0x8d9498)
  for (const x of [-0.78, 0.78]) solid.add(x, 0.03, MID, 0.03, 0.06, LEN, 0x565b60)

  // durmientes con contacto verde entre los rieles
  for (let z = Z0; z > Z1; z -= 0.44) {
    for (const x of [-0.28, 0.28]) {
      solid.add(x, 0.03, z, 0.27, 0.05, 0.15, 0xc8ccd0)
      solid.add(x, 0.04, z, 0.2, 0.05, 0.09, 0x1a1c1e)
      if (r() > 0.25) led.add(x, 0.05, z, 0.11, 0.05, 0.05, r() > 0.2 ? 0x37e06a : 0xdff5e6)
    }
  }

  // chips en dos carriles a cada lado
  for (let z = Z0; z > Z1; z -= 2.05) {
    for (const side of [-1, 1]) {
      for (const [lane, off] of [
        [1.55, 0],
        [2.7, 1.02],
      ]) {
        const x = side * lane
        const zz = z - off
        solid.add(x, 0.04, zz, 0.66, 0.08, 0.46, 0xc2c6c6)
        solid.add(x, 0.06, zz, 0.54, 0.08, 0.34, 0x16181a)
        led.add(x, 0.085, zz, 0.36, 0.05, 0.18, 0x33d862)
        led.add(x, 0.09, zz, 0.16, 0.05, 0.07, 0x0c3d1c)
        // patitas del chip
        for (let k = -2; k <= 2; k++) solid.add(x + k * 0.12, 0.02, zz + 0.27, 0.035, 0.03, 0.09, 0x9da2a6)
      }
    }
  }

  // perillas y tornillos sueltos
  for (let z = Z0; z > Z1; z -= 0.7) {
    const side = r() > 0.5 ? 1 : -1
    const x = side * (1.0 + r() * 2.5)
    const h = 0.18 + r() * 0.26
    knobs.add(x, h / 2, z - r() * 0.5, 0.1, h, 0.1, 0x1d1f22)
    knobs.add(x, h + 0.012, z - r() * 0.5, 0.085, 0.024, 0.085, 0xd9dcde)
  }

  // paredes: disipadores pálidos inclinados y mazos de cable
  const cable = [0xc8261c, 0x2553c9, 0xd9b21f, 0x2a9d4a, 0xc8261c]
  for (let z = Z0; z > Z1; z -= 0.58) {
    for (const side of [-1, 1]) {
      const h = 2.3 + r() * 0.9
      solid.add(side * (4.15 + r() * 0.15), h / 2 - 0.1, z, 0.36, h, 1.45, 0xb9c6d8, 0, 0, side * -0.3)
      if (r() > 0.4) solid.add(side * 5.3, 2.4, z, 0.5, 3.4, 0.5, 0x7d8898, 0, 0, side * -0.18)
      if (r() > 0.35) {
        const c = cable[(r() * cable.length) | 0]
        solid.add(side * (3.35 + r() * 0.35), 0.75 + r() * 0.3, z + r() * 0.3, 0.055, 1.7, 0.055, c, r() * 0.3, 0, side * (-0.35 - r() * 0.3))
      }
    }
  }

  const floorAndParts = solid.build(box, lit)
  const leds = led.build(box, glow)
  const knobMesh = knobs.build(cyl, lit)
  scene.add(floorAndParts, leds, knobMesh)

  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 80)

  return {
    scene,
    camera,
    update(c, t) {
      const e = smooth(0, 1, c)
      camera.position.set(Math.sin(t * 0.23) * 0.04, lerp(2.55, 1.02, e), lerp(5, -104, c))
      camera.rotation.set(lerp(-0.66, -0.2, e), Math.sin(t * 0.17) * 0.012, 0)
    },
    dispose() {
      disposeScene(scene)
    },
  }
}

// ════════════════════════════════════════════════════════════
// CIUDAD — cañón de bloques y, al fondo, el pabellón rojo
// ════════════════════════════════════════════════════════════
export function buildCity(): World {
  const scene = new THREE.Scene()
  const mist = new THREE.Color(0xbfe4e6)
  const night = new THREE.Color(0x060202)
  const bg = mist.clone()
  scene.background = bg
  const fog = new THREE.Fog(bg, 5, 58)
  scene.fog = fog

  const ambient = new THREE.AmbientLight(0x9fc0d6, 1.0)
  scene.add(ambient)
  const sun = new THREE.DirectionalLight(0xe6f6ff, 1.5)
  sun.position.set(0.25, 0.7, 1)
  scene.add(sun)

  const box = new THREE.BoxGeometry(1, 1, 1)
  const lit = new THREE.MeshLambertMaterial({ color: 0xffffff })
  const glow = new THREE.MeshBasicMaterial({ color: 0xffffff })

  const END = -100
  const blocks = new Batch()
  const windows = new Batch()
  const r = rng(90210)
  const slate = new THREE.Color()

  for (let i = 0; i < 3000; i++) {
    const side = r() > 0.5 ? 1 : -1
    const z = 10 - r() * 132
    const y = (r() - 0.5) * 50
    const sx = 0.6 + r() * 2.8
    const sy = 0.5 + r() * 3.4
    const sz = 0.6 + r() * 3.2
    const x = side * (1.75 + sx / 2 + Math.pow(r(), 1.8) * 5.5)
    // hueco alrededor del pabellón
    if (Math.abs(z - END) < 9 && Math.abs(x) < 7.5 && Math.abs(y) < 7) continue
    slate.setHSL(0.565 + r() * 0.03, 0.26 + r() * 0.12, 0.1 + r() * 0.13)
    blocks.add(x, y, z, sx, sy, sz, slate.getHex())

    if (r() < 0.16) {
      const n = 3 + ((r() * 4) | 0)
      const faceX = x - side * (sx / 2 + 0.03)
      const wy = y + (r() - 0.5) * sy * 0.5
      const wz = z - (n * 0.17) / 2
      for (let k = 0; k < n; k++) windows.add(faceX, wy, wz + k * 0.17, 0.05, 0.3, 0.1, 0xe9f6f2)
    }
  }
  scene.add(blocks.build(box, lit), windows.build(box, glow))

  // ── Pabellón rojo: el letrero encendido de TyT al final del cañón ──
  const pav = new THREE.Group()
  pav.position.set(0, -2.15, END)
  scene.add(pav)

  const warm = new THREE.MeshLambertMaterial({ color: 0xffffff, fog: false })
  const hot = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false })
  const parts = new Batch()
  const lights = new Batch()

  parts.add(0, -0.12, 0, 13, 0.24, 11, 0x1a0605) // piso
  parts.add(0, 2.3, -2.4, 9.5, 5.2, 0.3, 0x4a0c08) // fondo
  for (const x of [-3.3, -1.25, 1.25, 3.3]) parts.add(x, 2.05, 0.9 - Math.abs(x) * 0.22, 0.42, 4.1, 0.42, 0xd21c10)
  parts.add(0, 4.25, 0.4, 8.6, 0.42, 0.55, 0xdf2512) // viga
  parts.add(0, 4.85, 0.1, 9.6, 0.3, 0.9, 0xa3140c)
  parts.add(0, 3.55, 0.45, 8.2, 0.16, 0.3, 0x8c110a)
  // toldos diagonales arriba a los lados
  parts.add(-4.2, 4.9, 1.6, 4.4, 0.24, 2.6, 0xb5160d, 0.2, 0, 0.62)
  parts.add(4.2, 4.9, 1.6, 4.4, 0.24, 2.6, 0xb5160d, 0.2, 0, -0.62)
  // mostrador y siluetas
  parts.add(0, 0.55, -1.2, 5.4, 1.1, 0.6, 0x2a0706)
  for (const x of [-1.9, -0.7, 0.5, 1.7]) parts.add(x, 1.0, -0.35, 0.3, 1.5 + ((x * 7) % 0.3), 0.24, 0x0c0303)

  lights.add(0, 2.15, -2.2, 6.2, 2.5, 0.05, 0xff6a14) // interior encendido
  lights.add(0, 3.95, 0.72, 8.0, 0.07, 0.05, 0xffb347) // tira bajo la viga
  lights.add(3.05, 2.5, 1.0, 0.36, 0.95, 0.36, 0xff2a12) // farol rojo
  lights.add(3.05, 3.05, 1.0, 0.2, 0.08, 0.2, 0x2a0706)
  lights.add(-4.6, 0.75, 1.9, 0.3, 0.5, 0.3, 0xffb347)
  pav.add(parts.build(box, warm), lights.build(box, hot))

  const signTex = (c: HTMLCanvasElement) => {
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.NoColorSpace
    return t
  }
  const tall = new THREE.Mesh(
    new THREE.PlaneGeometry(0.62, 1.86),
    new THREE.MeshBasicMaterial({ map: signTex(makeSignCanvas('TYT', true, '#1a0d00', '#ffd43a')), fog: false }),
  )
  tall.position.set(-1.25, 2.35, 1.25)
  const wide = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 0.65),
    new THREE.MeshBasicMaterial({ map: signTex(makeSignCanvas('ABIERTO', false, '#ffb347', '#5c0d08')), fog: false }),
  )
  wide.position.set(2.1, 3.25, 0.95)
  wide.rotation.z = -0.04
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 0.7),
    new THREE.MeshBasicMaterial({ map: signTex(makeSignCanvas(':)', false, '#eaffff', '#1fa8d8')), fog: false }),
  )
  screen.position.set(2.75, 0.75, 2.2)
  pav.add(tall, wide, screen)

  const lamp = new THREE.PointLight(0xff5a1e, 26, 22, 1.1)
  lamp.position.set(0, 2.6, 2.4)
  pav.add(lamp)

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 90)

  return {
    scene,
    camera,
    update(c, t) {
      // llega al pabellón en c≈0.64 y se queda quieta hasta el fundido (ver timeline)
      const travel = Math.pow(smooth(0, 0.64, c), 1.45)
      const z = lerp(9, END + 9.6, travel)
      const turn = smooth(0.36, 0.64, c)
      const roll = Math.sin(Math.PI * turn) * 1.12
      const settle = smooth(0.54, 0.64, c)
      camera.position.set(
        Math.sin(t * 0.15) * 0.08 * (1 - settle),
        Math.sin(c * 6.0) * 0.5 * (1 - settle) + Math.sin(t * 0.21) * 0.05,
        z,
      )
      camera.rotation.set(
        Math.sin(Math.PI * turn) * -0.32,
        Math.sin(c * 4.2) * 0.07 * (1 - settle),
        roll,
      )

      // de la niebla azul a la noche roja
      const k = smooth(0.38, 0.62, c)
      bg.copy(mist).lerp(night, k)
      fog.near = lerp(5, 9, k)
      fog.far = lerp(58, 30, k)
      ambient.intensity = lerp(1.0, 0.3, k)
      sun.intensity = lerp(1.5, 0.15, k)
      pav.visible = c > 0.2
      lamp.intensity = 26 * (0.92 + 0.08 * Math.sin(t * 7.0))
    },
    dispose() {
      disposeScene(scene)
    },
  }
}
