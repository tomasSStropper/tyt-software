# TyT Software & Solutions — Sitio corporativo estático

Web multipágina (HTML/CSS/JS) lista para deploy en Vercel, con navegación bilingüe ES/EN y enfoque B2B.

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

## Ejecutar local
Opciones simples:
1. Extensión **Live Server** en VS Code (abrir `index.html`).
2. Python:
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

> Nota: los assets usan rutas relativas (`assets/styles.css` y `assets/main.js`) para evitar problemas de carga.

## Dominio, SEO y sitemap
- Reemplazar `https://example.com` en:
  - `sitemap.xml`
  - `robots.txt`
  - meta `og:url` de cada HTML
- Si usas dominio propio, vuelve a desplegar para actualizar indexación.

## Idiomas (ES/EN)
- Toggle persistente en `localStorage` (`tyt-lang`).
- Los textos usan `data-es`, `data-en` y `data-*-html`.
