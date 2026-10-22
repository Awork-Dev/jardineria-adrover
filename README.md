# Jardinería Adrover

Web y gestión interna de **Jardinería Adrover** (Zones Verdes S.L., Capdepera, Mallorca).
Todo funciona en Cloudflare Workers y se publica solo desde este repositorio.

| Parte | Carpeta | Worker | Dirección |
|---|---|---|---|
| Web pública (es, ca, en, de) y vigilante de noticias | `web/` | `hall` | jardineriaadrover.es · hall.jardineriaadrover.workers.dev |
| Gestión: clientes, proveedores, presupuestos y partes | `gestion/` | `gestionadrover` | gestionadrover.jardineriaadrover.workers.dev (con clave) |
| App del equipo: fichajes y partes desde el móvil | `equipo/` | `equipo` | equipo.jardineriaadrover.workers.dev (con PIN) |
| Página de accesos rápidos para el cliente | `accesos/` | — | no se publica sola |

Datos del cliente, recursos de Cloudflare y pendientes: [`docs/cliente.md`](docs/cliente.md).

## Estructura

```
web/
  wrangler.jsonc        Worker «hall»: KV DATOS y cron cada 3 horas
  src/worker.js         Rutas, páginas, imágenes, fuentes, avisos de temporada
  src/datos.js          Teléfonos, correo, idiomas y fotos (IDs de Google Drive)
  src/textos.js         Textos de la web en los cuatro idiomas
  src/guia.js           Guía verde: plantas, calendario, doctor, xerojardinería, planta del mes
  src/legal.js          Aviso legal, privacidad y cookies (datos del titular)
  src/noticias.js       Vigilante de noticias (feeds → KV)
gestion/
  wrangler.jsonc        Worker «gestionadrover»: D1 DB, KV COPIAS y copia cada noche
  src/worker.js         Sirve la página y la API /api/* protegida con la clave
  src/index.html        La aplicación de gestión (incluye el PDF de presupuestos)
  schema.sql            Tablas de la base D1: «docs» (datos) e «intentos» (accesos fallidos)
equipo/
  wrangler.jsonc        Worker «equipo»: misma base D1 que la gestión
  src/worker.js         API de la app: entrar con PIN, fichar, partes (solo jefes de cuadrilla)
  src/index.html        La app de los operarios (funciona sin cobertura y envía al volver la señal)
compartido/
  iconos/<app>/         Iconos de cada app: web en verde, gestión en dorado, equipo en lima y negro
  iconos.js             Sirve los iconos y el manifiesto de la web app
  iconos-<app>.js       Iconos en base64 de cada app (se generan con generar-iconos.mjs)
  generar-pngs.mjs      Dibuja los PNG de las tres apps a partir del logo
accesos/index.html      Accesos rápidos: web, gestión y panel de Cloudflare
docs/cliente.md         Ficha del proyecto
```

Lo más habitual al hacer cambios:
- Cambiar un teléfono, el correo o una foto → `web/src/datos.js`.
- Cambiar un texto de la web → `web/src/textos.js` (hay que tocar los cuatro idiomas).
- Cambiar los datos legales → `web/src/legal.js`.
- Cambiar los iconos → `node compartido/generar-pngs.mjs` (colores en ese archivo), crear el
  `favicon.ico` de cada app y ejecutar `node compartido/generar-iconos.mjs`.
- Cambiar las tareas rápidas de los partes → `TAREAS` en `equipo/src/worker.js`.
- Cambiar la ayuda de las apps (botón «?») → editar `docs/manual-oficina.md` o `docs/manual-equipo.md`
  y ejecutar `python3 compartido/generar-ayuda.py`.
- Cargar los datos de ejemplo → GitHub, Actions → «Cargar ejemplos» (se borran en la gestión con «Borrar ejemplos»).

## Trabajar en local

```
npm install
npm run comprobar        # prepara los dos Workers sin publicar nada
npm run local:web        # la web en http://localhost:8787
npm run local:gestion    # la gestión en local (http://localhost:8788)
npm run local:equipo     # la app del equipo en local (http://localhost:8789), con la misma base que la gestión
```

## Publicar

Al subir cambios a `main` en `web/`, `gestion/`, `equipo/` o `compartido/`, `.github/workflows/publicar.yml` publica en Cloudflare
solo la parte que ha cambiado. También se puede lanzar a mano desde la pestaña **Actions**.

Secretos necesarios en el repositorio (Settings → Secrets and variables → Actions):
- `CLOUDFLARE_API_TOKEN`: token de Cloudflare con la plantilla «Edit Cloudflare Workers».
- `CLOUDFLARE_ACCOUNT_ID`: el ID de la cuenta de Cloudflare de Jardinería Adrover.

La clave de la gestión es el secreto `CLAVE` del Worker `gestionadrover`, guardado en Cloudflare.
No va en el repositorio; para cambiarla: `cd gestion && npx wrangler secret put CLAVE`.
