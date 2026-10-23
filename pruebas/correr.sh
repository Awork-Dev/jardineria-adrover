#!/usr/bin/env bash
# Pasa todas las pruebas de la web, la gestión y la app del equipo, en local y con una base de datos vacía.
# Uso: bash pruebas/correr.sh   (CHROMIUM=/ruta/a/chrome si Playwright no tiene su propio navegador)
set -uo pipefail
cd "$(dirname "$0")/.."
BASE=$(mktemp -d)
PG=${PUERTO_GESTION:-8788} PE=${PUERTO_EQUIPO:-8789} PW=${PUERTO_WEB:-8790}
export GESTION="http://localhost:$PG" EQUIPO="http://localhost:$PE" WEB="http://localhost:$PW" CLAVE=prueba123
[ -f gestion/.dev.vars ] || printf 'CLAVE=prueba123\n' > gestion/.dev.vars
parar() { pkill -f "wrangler dev --port $PG" 2>/dev/null; pkill -f "wrangler dev --port $PE" 2>/dev/null; pkill -f "wrangler dev --port $PW" 2>/dev/null; pkill -f "workerd.*$BASE" 2>/dev/null; true; }
trap parar EXIT
(cd gestion && npx wrangler d1 execute DB --local --persist-to "$BASE" --file schema.sql >/dev/null 2>&1)
(cd gestion && npx wrangler dev --port "$PG" --inspector-port 9601 --persist-to "$BASE" >"$BASE/gestion.log" 2>&1 &)
(cd equipo && npx wrangler dev --port "$PE" --inspector-port 9602 --persist-to "$BASE" >"$BASE/equipo.log" 2>&1 &)
(cd web && npx wrangler dev --port "$PW" --inspector-port 9603 --persist-to "$BASE/web" >"$BASE/web.log" 2>&1 &)
for i in $(seq 1 90); do curl -s -o /dev/null "$GESTION" && curl -s -o /dev/null "$EQUIPO" && curl -s -o /dev/null "$WEB" && break; sleep 1; done
fallo=0
for f in pruebas/[0-9]-*.mjs; do echo; node "$f" || fallo=1; done
echo; [ $fallo = 0 ] && echo "TODAS LAS PRUEBAS PASAN" || { echo "HAY PRUEBAS QUE FALLAN"; tail -n 20 "$BASE/gestion.log" "$BASE/equipo.log" "$BASE/web.log"; }
exit $fallo
