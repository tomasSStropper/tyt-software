#!/usr/bin/env bash
A="${1%/}"
B="${2%/}"
if [ -z "$A" ] || [ -z "$B" ]; then echo "Uso: $0 https://www.tytsoftware.com https://tyt-software.pages.dev"; exit 2; fi
W=$(mktemp -d)
trap 'rm -rf "$W"' EXIT

paths="/ /index.html /arenadesk /arenadesk/ /sitios-web-turismo /sitios-web-inmobiliarias /privacidad-agenda /condiciones-agenda /privacidad-redes /condiciones-redes /diagnostico/abc /propuesta/abc /nada /nada/x /404.html /robots.txt /sitemap.xml /manifest.webmanifest /favicon.png /apple-touch-icon.png /icon-192.png /icon-512.png /icon-512-maskable.png /og.jpg /og-azul.jpg"

curl -s -m 30 -o "$W/home" "$A/"
assets=$(grep -oE '/assets/[A-Za-z0-9_.-]+\.(js|css)' "$W/home" | grep -v '/assets/index-.*\.js' | sort -u)
all="$paths $assets"

norm() {
  tr -d '\r' < "$1" | sed -E 's#https?://[^"'"'"' <>)]*(tytsoftware\.com|pages\.dev|vercel\.app)##g;s#/assets/index-[A-Za-z0-9_-]+\.js#/assets/index-X.js#g' | tr -s ' \t\n' ' ' | { sha256sum 2>/dev/null || shasum -a 256; } | cut -c1-12
}

probe() {
  base="$1"; p="$2"; out="$3"
  code=$(curl -s -m 30 -o "$out" -w '%{http_code}|%{redirect_url}|%{content_type}' "$base$p")
  c="${code%%|*}"; rest="${code#*|}"; loc="${rest%%|*}"; ct="${rest#*|}"
  loc="${loc#$base}"
  ct="${ct%%;*}"
  if [ -n "$loc" ]; then h="-"; else h=$(norm "$out"); fi
  echo "$c|$loc|$ct|$h"
}

diffs=0; total=0
printf '%-48s %-26s %-26s %s\n' RUTA A B ESTADO
for p in $all; do
  ra=$(probe "$A" "$p" "$W/a.out")
  rb=$(probe "$B" "$p" "$W/b.out")
  total=$((total+1))
  ca="${ra%%|*}"; cb="${rb%%|*}"
  la=$(echo "$ra" | cut -d'|' -f2); lb=$(echo "$rb" | cut -d'|' -f2)
  cta=$(echo "$ra" | cut -d'|' -f3); ctb=$(echo "$rb" | cut -d'|' -f3)
  ha=$(echo "$ra" | cut -d'|' -f4); hb=$(echo "$rb" | cut -d'|' -f4)
  estado=OK
  [ "$ca" != "$cb" ] && estado="DIFIERE codigo"
  [ "$estado" = OK ] && [ "$la" != "$lb" ] && estado="DIFIERE destino"
  [ "$estado" = OK ] && [ "$cta" != "$ctb" ] && estado="DIFIERE tipo"
  [ "$estado" = OK ] && [ "$ha" != "$hb" ] && estado="DIFIERE contenido"
  [ "$estado" != OK ] && diffs=$((diffs+1))
  printf '%-48s %-26s %-26s %s\n' "$p" "$ca ${la:-$ha}" "$cb ${lb:-$hb}" "$estado"
done

echo "--- redirecciones de host (solo informativo)"
for u in "http://www.tytsoftware.com/" "https://tytsoftware.com/"; do
  echo "$u -> $(curl -s -o /dev/null -m 20 -w '%{http_code} %{redirect_url}' "$u")"
done
echo "--- cabeceras de seguridad (sin lo de la barra de Vercel)"
hd() { curl -sI -m 20 "$1" | tr -d '
' | grep -iE '^(content-security|x-content|x-frame|referrer|cross-origin|permissions|x-robots|cache-control)' | tr 'A-Z' 'a-z' | sed 's# https://vercel.live##g;s# https://vercel.com##g;s# https://assets.vercel.com##g;s# wss://ws-us3.pusher.com##g' | sort; }
for p in / /diagnostico/abc /favicon.png; do if diff <(hd "$A$p") <(hd "$B$p") >/dev/null; then echo "$p cabeceras iguales"; else echo "$p cabeceras DIFIEREN"; diffs=$((diffs+1)); fi; done
echo "--- el paquete trae la direccion de la base (la variable se lee al compilar)"
for b in "$A" "$B"; do js=$(curl -s -m 30 "$b/" | grep -oE '/assets/index-[A-Za-z0-9_-]+\.js' | head -1); n=$(curl -s -m 30 "$b$js" | grep -o 'supabase\.co' | wc -l | tr -d ' '); echo "$b: apariciones de supabase.co en el paquete = $n"; [ "$b" = "$A" ] && na=$n; [ "$b" = "$B" ] && nb=$n; done
if [ "$na" != "$nb" ]; then echo "FALTAN VARIABLES VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el sitio B (o hay que volver a desplegar)"; diffs=$((diffs+1)); fi
echo "--- total $total rutas, $diffs diferencias"
[ "$diffs" -eq 0 ]
