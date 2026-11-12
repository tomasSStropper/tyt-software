/**
 * SHADERS (GLSL)
 *
 * Un shader es un programa que corre en la tarjeta gráfica una vez por píxel.
 * Aquí viven los cuatro que le dan el carácter "tubo CRT" al sitio:
 *   - PANEL_*   : las pantallas de la galería (con barrido/tirón de señal)
 *   - HERO_FRAG : el holograma dot-matrix del robot de TyT
 *   - ROOM_FRAG : el fondo de la sala blanca con texto impreso en el piso
 *   - POST_FRAG : el paso final — curvatura de tubo, scanlines, ruido, agua
 */

const COMMON = /* glsl */ `
precision highp float;
float hash(float n){ return fract(sin(n) * 43758.5453123); }
float hash2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
`

/** La malla del panel es 30% más grande que su contenido: ese margen es
 *  el espacio donde la imagen puede "derramarse" cuando la señal se rompe. */
export const PANEL_MARGIN = 1.3

export const PANEL_VERT = /* glsl */ `
uniform float uBend;
varying vec2 vUv;
void main(){
  vUv = uv;
  vec3 p = position;
  vec2 c = (uv - 0.5) * 2.0;
  // abombado de tubo: el centro sale hacia el espectador
  p.z -= uBend * (c.x * c.x + 0.4 * c.y * c.y);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`

/** Deformación compartida por las pantallas: tirones horizontales por fila
 *  y ondulación en los bordes superior/inferior (como reflejo en agua). */
const PANEL_WARP = /* glsl */ `
uniform float uTime;
uniform float uGlitch;
uniform float uRipple;
varying vec2 vUv;

vec2 warp(){
  vec2 p = (vUv - 0.5) * ${PANEL_MARGIN.toFixed(2)} + 0.5;
  float row = floor(p.y * 74.0);
  float t = floor(uTime * 18.0);
  float pick = step(0.5, hash(row * 1.7 + t * 0.13));
  float smear = (hash(row + t) - 0.5) * 0.3 * uGlitch * pick;
  float edge = smoothstep(0.24, 0.0, min(p.y, 1.0 - p.y));
  float rip = sin(p.y * 240.0 + uTime * 9.0) * 0.04 * uRipple * edge;
  p.x += smear + rip;
  return p;
}
`

export const PROJECT_FRAG = /* glsl */ `
${COMMON}
${PANEL_WARP}
uniform sampler2D uTex;
uniform sampler2D uLabel;
uniform vec2 uTexScale;
uniform float uLabelA;
uniform float uLabelH;
uniform float uHover;
uniform float uFlipY;

void main(){
  vec2 p = warp();
  if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) discard;

  vec2 tuv = (p - 0.5) * uTexScale + 0.5;
  tuv.y = mix(tuv.y, 1.0 - tuv.y, uFlipY);
  float ca = 0.0016 + 0.012 * uGlitch + 0.002 * uHover;
  vec3 col = vec3(
    texture2D(uTex, tuv + vec2(ca, 0.0)).r,
    texture2D(uTex, tuv).g,
    texture2D(uTex, tuv - vec2(ca, 0.0)).b
  );
  // trama de fósforo propia de cada pantalla
  col *= 0.94 + 0.06 * sin(p.y * 620.0);
  col *= 1.0 + 0.08 * uHover;

  // rótulo dot-matrix centrado, con sombra dura
  vec2 luv = vec2((p.x - 0.5) / 0.84 + 0.5, (p.y - 0.5) / uLabelH + 0.5);
  float inside = step(0.0, luv.x) * step(luv.x, 1.0) * step(0.0, luv.y) * step(luv.y, 1.0);
  float jitter = (hash(floor(p.y * 90.0) + floor(uTime * 12.0)) - 0.5) * 0.02 * uGlitch;
  float la = texture2D(uLabel, luv + vec2(jitter, 0.0)).a * inside;
  float sh = texture2D(uLabel, luv + vec2(-0.004 + jitter, 0.05)).a * inside;
  col = mix(col, vec3(0.02), sh * 0.9 * uLabelA);
  col = mix(col, vec3(1.0), la * uLabelA);

  gl_FragColor = vec4(col, 1.0);
}
`

export const HERO_FRAG = /* glsl */ `
${COMMON}
${PANEL_WARP}
uniform sampler2D uImg;
uniform sampler2D uGrid;
uniform vec4 uRect;      // dónde cae la imagen del robot dentro del panel (x, y, w, h)
uniform float uAspect;   // ancho / alto del panel
uniform vec2 uEye;       // desplazamiento de las pupilas (siguen al cursor)
uniform float uBoot;     // 0→1 al encender

void main(){
  vec2 p = warp();
  if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) discard;

  // celdas del display: el robot se muestrea una vez por celda (dot-matrix)
  float rows = 164.0;
  vec2 g = vec2(p.x * uAspect, p.y) * rows;
  vec2 id = floor(g);
  vec2 f = fract(g);
  vec2 pc = (id + 0.5) / rows;
  pc.x /= uAspect;

  vec2 iuv = (pc - uRect.xy) / uRect.zw;
  float inImg = step(0.0, iuv.x) * step(iuv.x, 1.0) * step(0.0, iuv.y) * step(iuv.y, 1.0);
  vec4 tex = texture2D(uImg, clamp(iuv, 0.0, 1.0));
  float a = tex.a * inImg;
  float top = 1.0 - iuv.y;

  float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
  // la pantalla del monitor-cabeza se apaga para que solo brillen los ojos
  float scr = step(0.365, iuv.x) * step(iuv.x, 0.615) * step(0.062, top) * step(top, 0.255);
  lum = mix(lum, 0.045, scr);

  // luz clave desde la derecha, sombra profunda a la izquierda
  float key = smoothstep(0.34, 0.72, iuv.x + (top - 0.3) * 0.2);
  float v = pow(lum, 1.55) * mix(0.05, 1.25, key) * 2.1;
  vec3 holo = mix(vec3(0.008, 0.03, 0.065), vec3(0.56, 0.86, 0.88), smoothstep(0.03, 1.0, v));
  holo += vec3(0.85, 1.0, 1.0) * smoothstep(0.9, 1.5, v) * 0.35;

  // ojos rojos de TyT: núcleo blanco + halo, sobre la pantalla apagada
  vec2 eL = vec2(0.436, 1.0 - 0.138) + uEye;
  vec2 eR = vec2(0.532, 1.0 - 0.139) + uEye;
  float d = min(distance(iuv, eL), distance(iuv, eR));
  float blink = step(0.035, fract(uTime * 0.19)) ;
  float halo = exp(-d * d / 0.0016) * blink;
  float core = smoothstep(0.02, 0.006, d) * blink;
  holo += vec3(1.0, 0.16, 0.08) * halo * 1.25 * scr;
  holo += vec3(1.0, 0.82, 0.76) * core * scr;

  // forma de cada celda: bloque con ranura horizontal marcada
  float mx = smoothstep(0.0, 0.16, f.x) * smoothstep(1.0, 0.84, f.x);
  float my = smoothstep(0.0, 0.34, f.y) * smoothstep(1.0, 0.66, f.y);
  float cell = 0.28 + 0.72 * mx * my;

  // barrido de holograma que sube
  float band = smoothstep(0.035, 0.0, abs(fract(p.y - uTime * 0.085) - 0.5));
  float sweep = 0.9 + 0.1 * sin(p.y * 34.0 - uTime * 1.7) + band * 0.22;

  vec3 grid = texture2D(uGrid, vec2(p.x, p.y)).rgb;
  // la rejilla también se dibuja por filas, encendiéndose de arriba abajo
  float lit = step(1.0 - p.y, uBoot * 1.15);
  vec3 col = mix(grid * lit, holo * cell * sweep, step(0.5, a) * lit);

  // LED verde de señal
  vec2 q = vec2(p.x * uAspect, p.y) - vec2(0.8 * uAspect, 0.9);
  col = mix(col, vec3(0.2, 0.95, 0.3), step(length(q), 0.0042));

  col *= 0.965 + 0.035 * sin(uTime * 41.0);
  gl_FragColor = vec4(col, 1.0);
}
`

export const ROOM_VERT = /* glsl */ `
void main(){ gl_Position = vec4(position.xy, 1.0, 1.0); }
`

export const ROOM_FRAG = /* glsl */ `
${COMMON}
uniform sampler2D uFloor;
uniform vec2 uRes;
uniform float uScroll;
uniform float uTime;

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 q = uv - 0.5;
  q.x *= aspect;

  // sala blanca: la luz cae más gris hacia el piso y las esquinas
  float drift = 0.5 + 0.5 * sin(uScroll * 1.25 + uv.x * 2.2);
  float g = smoothstep(0.62, 0.0, uv.y) * (0.25 + 0.5 * drift);
  g += smoothstep(0.55, 1.1, length(q)) * 0.35;
  vec3 col = mix(vec3(0.972, 0.972, 0.966), vec3(0.8, 0.8, 0.8), clamp(g, 0.0, 1.0));

  // texto impreso en el piso, en perspectiva y con paralaje de scroll
  float persp = 1.0 / (1.45 - uv.y * 1.05);
  vec2 fuv = vec2(q.x * persp * 0.85, uv.y * persp * 1.3 - uScroll * 0.55);
  float cs = cos(0.16), sn = sin(0.16);
  fuv = mat2(cs, -sn, sn, cs) * fuv;
  float t = texture2D(uFloor, fuv).r;
  col += t * 0.11 * smoothstep(0.8, 0.1, uv.y);

  gl_FragColor = vec4(col, 1.0);
}
`

export const POST_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`

export const POST_FRAG = /* glsl */ `
${COMMON}
uniform sampler2D tA;
uniform sampler2D tB;
uniform float uMix;      // barrido A→B (0..1), B entra desde abajo
uniform float uBarrel;   // curvatura del tubo
uniform float uGlitch;   // rotura de señal global
uniform float uWater;    // altura de la franja de reflejo (0 = sin agua)
uniform float uFade;     // 1 = imagen completa, 0 = negro
uniform float uTime;
uniform vec2 uLow;       // resolución interna (la de los "píxeles gordos")
varying vec2 vUv;

vec2 barrel(vec2 uv){
  vec2 c = uv - 0.5;
  float r2 = dot(c, c);
  return 0.5 + c * (1.0 + uBarrel * r2) / (1.0 + uBarrel * 0.5);
}

vec3 scene(vec2 uv){
  float edge = (hash(floor(uv.x * 46.0) + floor(uTime * 14.0)) - 0.5) * 0.05;
  float m = step(uv.y + edge, uMix * 1.12 - 0.06);
  vec3 a = texture2D(tA, uv).rgb;
  if (uMix <= 0.0) return a;
  vec3 b = texture2D(tB, uv).rgb;
  // línea brillante en el frente del barrido
  float front = smoothstep(0.012, 0.0, abs(uv.y + edge - (uMix * 1.12 - 0.06))) * step(0.001, uMix) * step(uMix, 0.999);
  return mix(a, b, m) + front * 0.5;
}

void main(){
  vec2 uv = barrel(vUv);

  // agua: la franja inferior refleja lo de arriba con ondas
  float wet = 0.0;
  if (uWater > 0.001 && uv.y < uWater) {
    float d = uWater - uv.y;
    wet = 1.0;
    uv.y = uWater + d * 0.85;
    uv.x += sin(d * 150.0 - uTime * 2.4) * 0.011 * (0.35 + d / uWater);
    uv.x += (hash(floor(d * 220.0) + floor(uTime * 9.0)) - 0.5) * 0.012;
  }

  // tirones horizontales por fila cuando la señal se rompe
  float row = floor(vUv.y * 64.0);
  float t = floor(uTime * 22.0);
  float pick = step(0.72, hash(row * 0.91 + t * 0.37));
  uv.x += (hash(row + t) - 0.5) * 0.11 * uGlitch * pick;
  // salto vertical de sincronía
  uv.y += step(0.985, hash(t * 0.11)) * uGlitch * 0.05;

  float ca = 0.0011 + 0.007 * uGlitch;
  vec3 col = vec3(
    scene(uv + vec2(ca, 0.0)).r,
    scene(uv).g,
    scene(uv - vec2(ca, 0.0)).b
  );
  col *= mix(1.0, 0.72, wet);

  // scanlines atadas a la resolución interna: una por fila de píxel gordo
  float scan = 0.95 + 0.05 * sin(vUv.y * uLow.y * 3.14159);
  float mask = 0.98 + 0.02 * sin(vUv.x * uLow.x * 3.14159);
  col *= scan * mask;

  // guiones de interferencia: pocos, cortos, saltando
  vec2 cellId = floor(vec2(vUv.x * 9.0, vUv.y * 140.0));
  float tt = floor(uTime * 7.0);
  float on = step(0.9988 - uGlitch * 0.02, hash2(cellId + tt * 1.31));
  float len = step(fract(vUv.x * 9.0), 0.25 + 0.5 * hash2(cellId + 7.0));
  col = mix(col, vec3(0.92), on * len * 0.9);

  // grano y viñeta
  col += (hash2(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5) * 0.055;
  vec2 vc = vUv - 0.5;
  col *= 1.0 - dot(vc, vc) * 0.42;

  col *= uFade;
  gl_FragColor = vec4(col, 1.0);
}
`
