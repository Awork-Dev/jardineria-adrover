import HTML from './index.html';
import { icono, manifiesto } from '../../compartido/iconos.js';

const COLECCIONES = ['clientes', 'proveedores', 'presupuestos', 'notas', 'partes', 'ajustes'];
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
    if (url.pathname === '/manifest.webmanifest') return manifiesto('Gestión Jardinería Adrover', 'Gestión', '/');
    const ico = icono(url.pathname); if (ico) return ico;
    if (!url.pathname.startsWith('/api/')) return new Response('No encontrado', {status: 404});
    const ip = req.headers.get('cf-connecting-ip') || 'desconocida';
    if (await bloqueada(env, ip)) return json({error: 'demasiados intentos'}, 429);
    // Sin la clave configurada en Cloudflare no se puede entrar: se avisa en vez de decir «clave incorrecta».
    if (!env.CLAVE) return json({error: 'sin clave configurada'}, 503);
    if (!(await igual(req.headers.get('x-clave') || '', env.CLAVE))) {
      await fallo(env, ip);
      return json({error: 'clave'}, 401);
    }

    if (url.pathname === '/api/datos' && req.method === 'GET') return json(await todosLosDatos(env));

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
        await env.DB.prepare('INSERT INTO docs (coleccion, id, data, actualizado) VALUES (?, ?, ?, ?) ON CONFLICT(coleccion, id) DO UPDATE SET data = excluded.data, actualizado = excluded.actualizado')
          .bind(col, id, JSON.stringify(body), new Date().toISOString()).run();
        return json({ok: true});
      }
      if (req.method === 'DELETE') {
        await env.DB.prepare('DELETE FROM docs WHERE coleccion = ? AND id = ?').bind(col, id).run();
        return json({ok: true});
      }
    }
    return json({error: 'no existe'}, 404);
  }
};
