# tytsoftware.com

Sitio de TyT Software & Solutions. Vite + React + TypeScript + Tailwind CSS 4 + three.js.

La portada es **un solo recorrido con scroll** dibujado en WebGL con estética de
tubo CRT: holograma del robot → galería de proyectos → túnel de circuito →
ciudad de bloques → pabellón rojo → contacto.

## Desarrollo

```bash
npm install
npm run dev      # servidor local
npm run build    # typecheck + build a dist/
```

Deploy: Vercel conectado a `main` (`vercel.json` define build y `dist`). Cada
rama genera su propio preview.

## Mapa del código

| Qué | Dónde |
| --- | --- |
| Proyectos de la galería (textos, fotos, capturas) | `src/content/projects.ts` |
| Todo el copy ES/EN | `src/i18n/dictionary.ts` |
| Marcas del scroll (qué pasa en qué momento) | `src/experience/timeline.ts` |
| Motor WebGL (scroll → cámara → post-proceso) | `src/experience/Experience.ts` |
| Shaders: holograma, pantallas, tubo CRT | `src/experience/shaders.ts` |
| Mundos 3D por código (túnel, ciudad, pabellón) | `src/experience/worlds.ts` |
| Maquetas de proyecto compuestas con Canvas 2D | `src/experience/posters.ts` |
| Interfaz: nav, menú, fichas, formulario, contacto | `src/components/crt/` |
| Tema (colores, tipografía dot-matrix, capas) | `src/index.css` |

### Cómo se sincroniza el scroll

La unidad es `u` = un alto de pantalla (variable CSS `--u`, ver
`src/experience/unit.ts`). `s = scrollY / u`. El motor y el DOM leen las mismas
marcas de `timeline.ts`, así el texto y la escena nunca se desfasan. Para mover
una sección basta cambiar su número ahí.

## Imágenes de proyectos

Cada proyecto en `src/content/projects.ts` tiene dos niveles:

- `photos` — fotos de banco del rubro (`public/stock/`, licencia Unsplash, ver
  `public/stock/CREDITS.md`). Con ellas se compone una maqueta de sitio.
- `shots` — capturas **reales**. Si existen, mandan y se muestran tal cual.

Para publicar capturas reales: guárdalas en `public/projects/` (ideal `.webp`,
1600×960) y lista sus rutas en `shots`. No hay que tocar nada más.

## El robot

`public/characters/tyt-avatar.webp` se convierte en holograma dentro de
`HERO_FRAG` (`shaders.ts`): se muestrea por celdas, se tiñe y se le dibujan los
ojos rojos, que siguen al cursor. Si cambia la imagen, ajustar ahí la posición
de los ojos y el rectángulo de la pantalla del monitor.

## Accesibilidad y respaldo

- Con `prefers-reduced-motion` o sin WebGL se sirve una versión estática con el
  mismo contenido (`Home.tsx`, rama `!webgl`).
- La galería vive en el lienzo; una lista oculta de botones la hace alcanzable
  con teclado y lector de pantalla.
- Si el equipo no llega a ~30 fps, el motor baja solo su resolución interna.

## SEO, seguridad y dispositivos

**SEO** (dominio canónico: `https://www.tytsoftware.com`)

- `index.html`: título, descripción, canonical, tarjeta social (Open Graph /
  Twitter con `public/og.jpg`) y datos estructurados JSON-LD
  (`ProfessionalService`, `WebSite`, `SoftwareApplication` de ArenaDesk).
- `index.html` trae además un **contenido de arranque** dentro de `#root`
  (titular, servicios, proyectos, contacto). React lo reemplaza al montar; sirve
  a quien no ejecuta JavaScript. **Si cambian servicios o proyectos, actualizarlo.**
- `src/lib/usePageMeta.ts` ajusta título, descripción y canonical por ruta; el
  404 (`src/pages/NotFound.tsx`) va con `noindex`.
- `public/sitemap.xml` y `public/robots.txt`. Al agregar una ruta, sumarla al sitemap.

**Seguridad** (`vercel.json`)

- Content-Security-Policy estricta (solo scripts propios; conexiones a Supabase),
  `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`.
  Si se agrega un servicio externo (analítica, mapas, fuentes), hay que
  permitirlo en la CSP o el navegador lo bloqueará.
- Formulario: campo trampa anti-bots (`.hp`), límites de longitud en el cliente
  y antes de enviar. La base solo acepta `INSERT` anónimo (RLS).
- Caché: `/assets/*` inmutable un año (llevan hash en el nombre); imágenes y
  fuentes, 30 días.

**Dispositivos**

- El diseño vertical/horizontal se decide por proporción (`aspect < 0.8`), igual
  en el motor (`Experience.layout`) y en el CSS (`min-aspect-ratio: 4/5`).
- Zonas seguras (notch, barra de gestos) con `env(safe-area-inset-*)`.
- Reglas propias para pantallas ≤ 380 px, poco alto (apaisado ≤ 520 px) y ≥ 1600 px.
- Si el sistema le quita el contexto WebGL a la pestaña, el motor se detiene y
  retoma solo; con una capa abierta encima deja de dibujar.

## Formulario de leads

`submitLead()` inserta en `public.leads` de Supabase usando variables de
entorno (ver `.env.example`). Sin variables, degrada a
`mailto:tomas@tytsoftware.com`. Tabla esperada:

```sql
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text,
  phone text,
  message text not null,
  source text not null default 'web'
);

alter table public.leads enable row level security;

create policy "leads: insert publico" on public.leads
  for insert to anon with check (true);
-- sin política de select para anon: los leads solo se leen con service role
```

## Idiomas

Español primario, inglés secundario. El toggle está en el menú.

## Páginas legales

`/privacidad-agenda` y `/condiciones-agenda` renderizan `src/content/legal/*.md` con un
markdown mínimo propio (`src/lib/markdown.tsx`, sin dependencias ni innerHTML).
La **fuente** de esos textos es el repo `agendatyt` (`docs/legal/`): se edita allá y se
copia aquí. Se publican solo en español; en inglés la página lo avisa.

## Fuentes

Self-hosted en `public/fonts/`: **Doto** (dot-matrix, SIL OFL) para el texto de
sistema y **Archivo** para titulares, que se ven a través de una máscara de
puntos (`.display` en `index.css`).
