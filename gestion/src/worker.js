import HTML from './index.html';
import { icono, manifiesto } from '../../compartido/iconos.js';

const COLECCIONES = ['clientes', 'proveedores', 'presupuestos', 'partes', 'ajustes'];
const json = (obj, status = 200) => new Response(JSON.stringify(obj), {status, headers: {'content-type': 'application/json;charset=utf-8', 'cache-control': 'no-store'}});

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(HTML, {headers: {'content-type': 'text/html;charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'x-frame-options': 'DENY', 'referrer-policy': 'no-referrer'}});
    }
    if (url.pathname === '/manifest.webmanifest') return manifiesto('Gestión Jardinería Adrover', 'Gestión', '/');
    const ico = icono(url.pathname); if (ico) return ico;
    if (!url.pathname.startsWith('/api/')) return new Response('No encontrado', {status: 404});
    if (!env.CLAVE || req.headers.get('x-clave') !== env.CLAVE) return json({error: 'clave'}, 401);

    if (url.pathname === '/api/datos' && req.method === 'GET') {
      const {results} = await env.DB.prepare('SELECT coleccion, id, data FROM docs').all();
      const out = {};
      for (const r of results) (out[r.coleccion] ||= {})[r.id] = JSON.parse(r.data);
      return json(out);
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
