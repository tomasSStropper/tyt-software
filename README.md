# TyT Software & Solutions — Sitio corporativo estático

Web multipágina (HTML/CSS/JS vanilla) lista para deploy en Vercel, con navegación bilingüe ES/EN y enfoque B2B premium.

## Estructura
- `index.html`
- `servicios.html`
- `proyectos.html`
- `proceso.html`
- `contacto.html`
- `privacidad.html`
- `terminos.html`
- `assets/styles.css`
- `assets/main.js`
- `assets/favicon.svg`
- `assets/img/`
- `sitemap.xml`, `robots.txt`, `vercel.json`

## Qué se mejoró (visual / motion / performance / accessibility)
- **Sistema de tokens de diseño y motion**: sombras de elevación, superficies glass, ring de foco y duraciones/easings reutilizables en `:root`.
- **Background premium en 3 capas**: ambient gradients + mesh tenue + noise CSS (sin imágenes pesadas).
- **Micro-interacciones de nivel premium**:
  - CTAs con lift, glow y gradient shift.
  - Cards con hover depth, sheen y tracking highlight.
  - Links con underline animado.
  - Navbar sticky con transición refinada al hacer scroll.
  - Scroll indicator en hero.
- **Reveal mejorado con stagger automático** en grids/timeline vía `IntersectionObserver` (sin librerías).
- **Motion accesible**:
  - soporte global de `prefers-reduced-motion`.
  - en reduce se desactivan partículas/cursor custom y se minimizan transiciones.
- **Performance**:
  - animaciones basadas en `transform` + `opacity`.
  - partículas adaptativas (menos en móvil/low-power) y pausa automática al ocultar pestaña (`Page Visibility API`).

## Cómo correr local
1. Opción rápida con VS Code: extensión **Live Server** y abrir `index.html`.
2. Con Python:
   ```bash
   python3 -m http.server 8080
   ```
   Luego abrir `http://localhost:8080`.

## Deploy en Vercel
1. Subir el repo a GitHub.
2. En Vercel: **New Project** → importar repo.
3. Framework: `Other`.
4. Build Command: vacío.
5. Output Directory: vacío.
6. Deploy.

> Importante: los assets usan rutas relativas (`assets/styles.css` y `assets/main.js`) para evitar problemas de carga en Vercel.

## Dominio, SEO y sitemap
- Reemplazar `https://example.com` en:
  - `sitemap.xml`
  - `robots.txt`
  - meta `og:url` de cada HTML
- Re-deploy tras actualizar dominio para que robots/sitemap queden consistentes.

## Idiomas (ES/EN)
- Toggle persistente en `localStorage` (`tyt-lang`).
- Textos definidos con `data-es`, `data-en` y `data-*-html`.
