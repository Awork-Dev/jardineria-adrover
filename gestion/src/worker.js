import HTML from './index.html';
import { icono, manifiesto } from '../../compartido/iconos.js';
import { ICONOS } from '../../compartido/iconos-gestion.js';

const COLECCIONES = ['clientes', 'proveedores', 'presupuestos', 'notas', 'partes', 'ajustes', 'operarios', 'fichajes', 'gastos', 'fotos'];
// Tras 10 claves incorrectas desde la misma conexión, se bloquea 15 minutos.
const MAX_FALLOS = 10, VENTANA = 15 * 60e3;
async function bloqueada(env, ip) {
  try {
    const r = await env.DB.prepare('SELECT fallos, desde FROM intentos WHERE ip = ?').bind(ip).first();
    return !!r && r.fallos >= MAX_FALLOS && Date.now() - r.desde < VENTANA;
  } catch { return false; }
}
async function fallo(env, ip) {
  try {
    const ahora = Date.now();
    await env.DB.prepare('INSERT INTO intentos (ip, fallos, desde) VALUES (?, 1, ?) ON CONFLICT(ip) DO UPDATE SET fallos = CASE WHEN ? - desde > ? THEN 1 ELSE fallos + 1 END, desde = CASE WHEN ? - desde > ? THEN ? ELSE desde END')
      .bind(ip, ahora, ahora, VENTANA, ahora, VENTANA, ahora).run();
  } catch {}
}
// Compara la clave sin dar pistas por el tiempo que tarda.
async function igual(a, b) {
  const h = async (x) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(x)));
  const [x, y] = await Promise.all([h(a), h(b)]);
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0;
}
const json = (obj, status = 200) => new Response(JSON.stringify(obj), {status, headers: {'content-type': 'application/json;charset=utf-8', 'cache-control': 'no-store'}});

// ---------- Copias de seguridad ----------
const DIAS_COPIA = 60;
async function todosLosDatos(env) {
  const {results} = await env.DB.prepare('SELECT coleccion, id, data FROM docs').all();
  const out = {};
  for (const r of results) (out[r.coleccion] ||= {})[r.id] = JSON.parse(r.data);
  return out;
}
async function hacerCopia(env) {
  const fecha = new Date().toISOString().slice(0, 10);
  await env.COPIAS.put('copia:' + fecha, JSON.stringify(await todosLosDatos(env)), {expirationTtl: DIAS_COPIA * 86400});
  return fecha;
}

export default {
  async scheduled(event, env, ctx) { ctx.waitUntil(hacerCopia(env)); },

  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(HTML, {headers: {'content-type': 'text/html;charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'x-frame-options': 'DENY', 'referrer-policy': 'no-referrer'}});
    }
    if (url.pathname === '/manifest.webmanifest') return manifiesto('Gestión Jardinería Adrover', 'Gestión', '/', 'gestion');
    const ico = icono(url.pathname, ICONOS); if (ico) return ico;
    if (!url.pathname.startsWith('/api/')) return new Response('No encontrado', {status: 404});
    const ip = req.headers.get('cf-connecting-ip') || 'desconocida';
    if (await bloqueada(env, ip)) return json({error: 'demasiados intentos'}, 429);
    // Sin la clave configurada en Cloudflare no se puede entrar: se avisa en vez de decir «clave incorrecta».
    if (!env.CLAVE) return json({error: 'sin clave configurada'}, 503);
    if (!(await igual(req.headers.get('x-clave') || '', env.CLAVE))) {
      await fallo(env, ip);
      return json({error: 'clave'}, 401);
    }

    // Con ?desde=<fecha ISO> devuelve solo lo cambiado y lo borrado desde entonces (usa índices).
    if (url.pathname === '/api/datos' && req.method === 'GET') {
      const desde = url.searchParams.get('desde');
      if (!desde) return json(await todosLosDatos(env));
      const hasta = new Date().toISOString();
      const {results} = await env.DB.prepare('SELECT coleccion, id, data FROM docs WHERE actualizado > ?').bind(desde).all();
      const {results: fuera} = await env.DB.prepare('SELECT coleccion, id FROM borrados WHERE cuando > ?').bind(desde).all();
      return json({cambios: results.map(r => [r.coleccion, r.id, JSON.parse(r.data)]), borrados: fuera.map(r => [r.coleccion, r.id]), hasta});
    }

    // Fotos del equipo (tickets y trabajos): /api/fotos/<id> o /api/fotos/<id>?mini=1
    const f = url.pathname.match(/^\/api\/fotos\/([\w-]{6,60})$/);
    if (f && req.method === 'GET') {
      const v = await env.FOTOS.get((url.searchParams.get('mini') === '1' ? 'mini:' : 'foto:') + f[1], 'arrayBuffer');
      return v ? new Response(v, {headers: {'content-type': 'image/jpeg', 'cache-control': 'private, max-age=86400'}}) : json({error: 'no existe'}, 404);
    }

    // Lista de copias automáticas y descarga de una de ellas.
    if (url.pathname === '/api/copias' && req.method === 'GET') {
      const {keys} = await env.COPIAS.list({prefix: 'copia:'});
      return json(keys.map(k => k.name.slice(6)).sort().reverse());
    }
    if (url.pathname === '/api/copias' && req.method === 'POST') return json({fecha: await hacerCopia(env)});
    const c = url.pathname.match(/^\/api\/copias\/(\d{4}-\d{2}-\d{2})$/);
    if (c && req.method === 'GET') {
      const v = await env.COPIAS.get('copia:' + c[1]);
      return v ? new Response(v, {headers: {'content-type': 'application/json;charset=utf-8', 'cache-control': 'no-store'}}) : json({error: 'no existe'}, 404);
    }

    const m = url.pathname.match(/^\/api\/doc\/([^/]+)\/([^/]+)$/);
    if (m) {
      const col = decodeURIComponent(m[1]), id = decodeURIComponent(m[2]);
      if (!COLECCIONES.includes(col) || !id || id.length > 200) return json({error: 'ruta'}, 400);
      if (req.method === 'PUT') {
        const body = await req.json().catch(() => null);
        if (!body || typeof body !== 'object' || Array.isArray(body)) return json({error: 'cuerpo'}, 400);
        await env.DB.batch([
          env.DB.prepare('INSERT INTO docs (coleccion, id, data, actualizado) VALUES (?, ?, ?, ?) ON CONFLICT(coleccion, id) DO UPDATE SET data = excluded.data, actualizado = excluded.actualizado')
            .bind(col, id, JSON.stringify(body), new Date().toISOString()),
          env.DB.prepare('DELETE FROM borrados WHERE coleccion = ? AND id = ?').bind(col, id),
        ]);
        return json({ok: true});
      }
      if (req.method === 'DELETE') {
        const cuando = new Date().toISOString();
        await env.DB.batch([
          env.DB.prepare('DELETE FROM docs WHERE coleccion = ? AND id = ?').bind(col, id),
          env.DB.prepare('INSERT INTO borrados (coleccion, id, cuando) VALUES (?, ?, ?) ON CONFLICT(coleccion, id) DO UPDATE SET cuando = excluded.cuando').bind(col, id, cuando),
        ]);
        return json({ok: true});
      }
    }
    return json({error: 'no existe'}, 404);
  }
};
