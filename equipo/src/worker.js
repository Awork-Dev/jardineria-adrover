import HTML from './index.html';
import { icono, manifiesto } from '../../compartido/iconos.js';
import { ICONOS } from '../../compartido/iconos-equipo.js';

// Los datos se guardan en la tabla «docs» de la gestión (colecciones operarios, fichajes, partes y clientes),
// y las sesiones de los móviles en la tabla «sesiones».
const json = (obj, status = 200) => new Response(JSON.stringify(obj), {status, headers: {'content-type': 'application/json;charset=utf-8', 'cache-control': 'no-store'}});
const TAREAS = ['Corte de césped', 'Poda', 'Desbroce', 'Riego', 'Plantación', 'Limpieza', 'Retirada de restos', 'Tratamiento'];
const DIA = 86400e3;

// La app se puede abrir sin cobertura: el service worker guarda la página y los iconos.
const SW = `const C='equipo-v1',A=['/','/manifest.webmanifest','/icon-192.png','/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.pathname.startsWith('/api/'))return;
e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})))});`;

async function doc(env, col, id) {
  const r = await env.DB.prepare('SELECT data FROM docs WHERE coleccion = ? AND id = ?').bind(col, id).first();
  return r ? JSON.parse(r.data) : null;
}
async function coleccion(env, col) {
  const {results} = await env.DB.prepare('SELECT id, data FROM docs WHERE coleccion = ?').bind(col).all();
  return results.map(r => ({id: r.id, ...JSON.parse(r.data)}));
}
async function guardar(env, col, id, data) {
  await env.DB.prepare('INSERT INTO docs (coleccion, id, data, actualizado) VALUES (?, ?, ?, ?) ON CONFLICT(coleccion, id) DO UPDATE SET data = excluded.data, actualizado = excluded.actualizado')
    .bind(col, id, JSON.stringify(data), new Date().toISOString()).run();
}

// ---------- Acceso con PIN ----------
// Tras 10 PIN incorrectos desde la misma conexión, se bloquea 15 minutos (misma tabla que la gestión).
const MAX_FALLOS = 10, VENTANA = 15 * 60e3;
async function bloqueada(env, ip) {
  const r = await env.DB.prepare('SELECT fallos, desde FROM intentos WHERE ip = ?').bind(ip).first().catch(() => null);
  return !!r && r.fallos >= MAX_FALLOS && Date.now() - r.desde < VENTANA;
}
async function fallo(env, ip) {
  const ahora = Date.now();
  await env.DB.prepare('INSERT INTO intentos (ip, fallos, desde) VALUES (?, 1, ?) ON CONFLICT(ip) DO UPDATE SET fallos = CASE WHEN ? - desde > ? THEN 1 ELSE fallos + 1 END, desde = CASE WHEN ? - desde > ? THEN ? ELSE desde END')
    .bind(ip, ahora, ahora, VENTANA, ahora, VENTANA, ahora).run().catch(() => {});
}
// La sesión deja de valer si el operario se da de baja o si se le cambia el PIN (por ejemplo, si pierde el móvil).
async function quienEs(req, env) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer /, '');
  if (!/^[\w-]{20,80}$/.test(token)) return null;
  const s = await env.DB.prepare('SELECT operarioId, pin FROM sesiones WHERE token = ?').bind(token).first();
  if (!s) return null;
  const op = await doc(env, 'operarios', s.operarioId);
  return op && op.activo !== false && op.pin === s.pin ? {id: s.operarioId, ...op} : null;
}
const publico = (op) => ({id: op.id, nombre: op.nombre, rol: op.rol === 'jefe' ? 'jefe' : 'operario'});

// ---------- Validación ----------
const ID = /^[\w-]{6,60}$/, HORA = /^([01]\d|2[0-3]):[0-5]\d$/, FECHA = /^\d{4}-\d{2}-\d{2}$/;
const minutos = (h) => +h.slice(0, 2) * 60 + +h.slice(3);
const texto = (x, max) => String(x ?? '').trim().slice(0, max);

export default {
  async fetch(req, env) {
    const url = new URL(req.url), ruta = url.pathname;
    if (ruta === '/' || ruta === '/index.html') {
      return new Response(HTML, {headers: {'content-type': 'text/html;charset=utf-8', 'cache-control': 'no-cache', 'x-content-type-options': 'nosniff', 'x-frame-options': 'DENY', 'referrer-policy': 'no-referrer', 'x-robots-tag': 'noindex'}});
    }
    if (ruta === '/sw.js') return new Response(SW, {headers: {'content-type': 'text/javascript;charset=utf-8', 'cache-control': 'no-cache'}});
    if (ruta === '/manifest.webmanifest') return manifiesto('Adrover Equipo', 'Equipo', '/', 'equipo');
    const ico = icono(ruta, ICONOS); if (ico) return ico;
    if (!ruta.startsWith('/api/')) return new Response('No encontrado', {status: 404});

    // Entrar con el PIN
    if (ruta === '/api/entrar' && req.method === 'POST') {
      const ip = 'equipo:' + (req.headers.get('cf-connecting-ip') || 'desconocida');
      if (await bloqueada(env, ip)) return json({error: 'Demasiados intentos. Espera 15 minutos.'}, 429);
      const {pin} = await req.json().catch(() => ({}));
      const op = /^\d{4}$/.test(pin || '') && (await coleccion(env, 'operarios')).find(o => o.pin === pin && o.activo !== false);
      if (!op) { await fallo(env, ip); return json({error: 'PIN incorrecto.'}, 401); }
      const token = crypto.randomUUID() + '-' + crypto.randomUUID();
      await env.DB.prepare('INSERT INTO sesiones (token, operarioId, pin, creado) VALUES (?, ?, ?, ?)').bind(token, op.id, op.pin, Date.now()).run();
      return json({token, yo: publico(op)});
    }

    const yo = await quienEs(req, env);
    if (!yo) return json({error: 'sesion'}, 401);
    const jefe = yo.rol === 'jefe';

    // Todo lo que necesita la app al abrirse (se guarda en el móvil para usarla sin cobertura)
    if (ruta === '/api/inicio' && req.method === 'GET') {
      const desde = Date.now() - 62 * DIA;
      const fichajes = (await coleccion(env, 'fichajes')).filter(f => f.operarioId === yo.id && f.ts >= desde)
        .map(({id, tipo, ts}) => ({id, tipo, ts})).sort((a, b) => a.ts - b.ts);
      const out = {yo: publico(yo), fichajes, tareas: TAREAS, servidor: Date.now()};
      if (jefe) {
        out.clientes = (await coleccion(env, 'clientes')).map(c => ({id: c.id, nombre: c.nombre || '', lugar: [c.direccion, c.poblacion].filter(Boolean).join(', ')}))
          .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
        out.equipo = (await coleccion(env, 'operarios')).filter(o => o.activo !== false).map(publico).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
        const hace14 = new Date(Date.now() - 14 * DIA).toISOString().slice(0, 10);
        out.partes = (await coleccion(env, 'partes')).filter(p => p.autorId === yo.id && p.fecha >= hace14)
          .map(({id, fecha, clienteId, operarios, inicio, fin, tareas, descripcion, incidencias}) => ({id, fecha, clienteId, operarios, inicio, fin, tareas, descripcion, incidencias}));
      }
      return json(out);
    }

    // Fichar entrada o salida. El id lo pone el móvil, así reenviar el mismo fichaje no lo duplica.
    if (ruta === '/api/fichar' && req.method === 'POST') {
      const b = await req.json().catch(() => ({}));
      if (!ID.test(b.id || '') || !['entrada', 'salida'].includes(b.tipo)) return json({error: 'datos'}, 400);
      const ahora = Date.now(), ts = Number(b.ts);
      // Se acepta la hora del móvil (fichajes hechos sin cobertura) si no es absurda.
      const valida = ts > ahora - 3 * DIA && ts < ahora + 5 * 60e3;
      await env.DB.prepare('INSERT INTO docs (coleccion, id, data, actualizado) VALUES (?, ?, ?, ?) ON CONFLICT(coleccion, id) DO NOTHING')
        .bind('fichajes', b.id, JSON.stringify({operarioId: yo.id, operario: yo.nombre, tipo: b.tipo, ts: valida ? ts : ahora, recibido: ahora, sinConexion: valida && ahora - ts > 2 * 60e3}), new Date().toISOString()).run();
      return json({ok: true});
    }

    // Parte de trabajo (solo jefes de cuadrilla)
    if (ruta === '/api/partes' && req.method === 'POST') {
      if (!jefe) return json({error: 'Solo los jefes de cuadrilla hacen partes.'}, 403);
      const b = await req.json().catch(() => ({}));
      if (!ID.test(b.id || '') || !FECHA.test(b.fecha || '') || !HORA.test(b.inicio || '') || !HORA.test(b.fin || '')) return json({error: 'Revisa la fecha y las horas.'}, 400);
      const duracion = (minutos(b.fin) - minutos(b.inicio)) / 60;
      if (duracion <= 0) return json({error: 'La hora de fin debe ser posterior a la de inicio.'}, 400);
      const cliente = await doc(env, 'clientes', String(b.clienteId || ''));
      if (!cliente) return json({error: 'Elige un cliente.'}, 400);
      const activos = new Map((await coleccion(env, 'operarios')).map(o => [o.id, o]));
      const ids = [...new Set(Array.isArray(b.operarios) ? b.operarios : [])].filter(id => activos.has(id));
      if (!ids.length) return json({error: 'Marca quién ha ido.'}, 400);
      const previo = await doc(env, 'partes', b.id);
      if (previo && previo.autorId !== yo.id) return json({error: 'datos'}, 400);
      await guardar(env, 'partes', b.id, {
        fecha: b.fecha, clienteId: cliente === null ? '' : String(b.clienteId), inicio: b.inicio, fin: b.fin,
        operarios: ids, operario: ids.map(id => activos.get(id).nombre).join(', '),
        duracion, horas: Math.round(duracion * ids.length * 100) / 100,
        tareas: (Array.isArray(b.tareas) ? b.tareas : []).filter(t => TAREAS.includes(t)),
        descripcion: texto(b.descripcion, 2000), incidencias: texto(b.incidencias, 2000),
        autorId: yo.id, autor: yo.nombre, origen: 'equipo', creado: previo?.creado || Date.now(),
      });
      return json({ok: true});
    }

    if (ruta === '/api/salir' && req.method === 'POST') {
      const token = (req.headers.get('authorization') || '').replace(/^Bearer /, '');
      await env.DB.prepare('DELETE FROM sesiones WHERE token = ?').bind(token).run();
      return json({ok: true});
    }
    return json({error: 'no existe'}, 404);
  },
};
