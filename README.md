# TyT Software & Solutions — Sitio estático multipágina

Este proyecto es 100% estático (HTML/CSS/JS). Ideal para GitHub + Vercel.

## Estructura
- `index.html` (Home)
- `servicios.html`
- `proyectos.html`
- `proceso.html`
- `contacto.html` (form abre mailto)
- `privacidad.html`, `terminos.html`
- `assets/styles.css`, `assets/main.js`

## Deploy en Vercel
1. Subí esta carpeta a GitHub
2. En Vercel: New Project → Import repo
3. Framework: Other
4. Build Command: vacío
5. Output Directory: vacío
6. Deploy

## Personalización rápida
- Email de contacto: `contacto@tytsoftware.com`
- URL del sitio: actualizá `https://example.com` en `sitemap.xml` y el JSON-LD en el `<head>`
- Si querés formulario 100% web: conectá Formspree o Netlify Forms (ver `contacto.html`)
