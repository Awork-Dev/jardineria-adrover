import PAGINA from './index.html';
import AYUDA from './ayuda.html';
// El manual (docs/manual-equipo.md) va dentro de la página, en el botón «?»: se puede leer sin cobertura.
const HTML = PAGINA.replace('<!--AYUDA-->', AYUDA);
import { icono, manifiesto } from '../../compartido/iconos.js';
import { ICONOS } from '../../compartido/iconos-equipo.js';

// Los datos se guardan en la tabla «docs» de la gestión (colecciones operarios, fichajes, partes, gastos,
// fotos y clientes), las sesiones de los móviles en la tabla «sesiones» y las imágenes en el KV FOTOS.
const json = (obj, status = 200) => new Response(JSON.stringify(obj), {status, headers: {'content-type': 'application/json;charset=utf-8', 'cache-control': 'no-store'}});
const TAREAS = ['Corte de césped', 'Poda', 'Desbroce', 'Riego', 'Plantación', 'Limpieza', 'Retirada de restos', 'Tratamiento'];
const TIPOS_GASTO = ['Gasolina', 'Material', 'Comida', 'Peaje o parking', 'Otros'];
const MAX_FOTO = 3 * 1024 * 1024, MAX_FOTOS = 12;
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
// Solo los documentos de una persona (usa los índices docs_operario y docs_autor).
async function deOperario(env, col, id, campo = 'operarioId') {
  const {results} = await env.DB.prepare(`SELECT id, data FROM docs WHERE coleccion = ? AND json_extract(data, '$.${campo}') = ?`).bind(col, id).all();
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
// Fotos ya subidas por esta persona. Se comprueba en D1 (la tabla fotos_subidas), que ve los datos al
// instante; el KV puede tardar unos segundos en ver una foto recién guardada.
async function fotosDe(env, yo, lista) {
  const ids = [...new Set(Array.isArray(lista) ? lista : [])].filter(id => ID.test(id)).slice(0, MAX_FOTOS);
  if (!ids.length) return [];
  const {results} = await env.DB.prepare(`SELECT id FROM fotos_subidas WHERE operarioId = ? AND id IN (${ids.map(() => '?').join(',')})`).bind(yo.id, ...ids).all();
  const hay = new Set(results.map(r => r.id));
  return ids.filter(id => hay.has(id));
}

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

    // Subir una foto (el móvil la manda ya reducida). «mini» es la miniatura para las listas de la gestión.
    if (ruta === '/api/fotos' && req.method === 'POST') {
      const id = url.searchParams.get('id') || '', mini = url.searchParams.get('mini') === '1';
      if (!ID.test(id) || req.headers.get('content-type') !== 'image/jpeg') return json({error: 'Foto no válida.'}, 400);
      const buf = await req.arrayBuffer();
      if (!buf.byteLength || buf.byteLength > MAX_FOTO) return json({error: 'La foto es demasiado grande.'}, 400);
      const duena = await env.DB.prepare('SELECT operarioId FROM fotos_subidas WHERE id = ?').bind(id).first();
      if (duena && duena.operarioId !== yo.id) return json({error: 'datos'}, 400);
      await env.FOTOS.put((mini ? 'mini:' : 'foto:') + id, buf, {metadata: {operarioId: yo.id, ts: Date.now()}});
      // Se apunta después de guardarla: si existe la fila, la foto está guardada.
      if (!mini) await env.DB.prepare('INSERT OR IGNORE INTO fotos_subidas (id, operarioId, creado) VALUES (?, ?, ?)').bind(id, yo.id, Date.now()).run();
      return json({ok: true});
    }

    // Gasto con la foto del ticket (cualquier operario)
    if (ruta === '/api/gastos' && req.method === 'POST') {
      const b = await req.json().catch(() => ({}));
      const importe = Math.round(Number(String(b.importe).replace(',', '.')) * 100) / 100;
      if (!ID.test(b.id || '') || !FECHA.test(b.fecha || '') || !TIPOS_GASTO.includes(b.tipo)) return json({error: 'Revisa el tipo y la fecha.'}, 400);
      if (!(importe > 0 && importe < 100000)) return json({error: 'Pon el importe del ticket.'}, 400);
      const previo = await doc(env, 'gastos', b.id);
      if (previo && previo.operarioId !== yo.id) return json({error: 'datos'}, 400);
      const fotos = await fotosDe(env, yo, b.fotos);
      if (!fotos.length) return json({error: 'Falta la foto del ticket.'}, 400);
      await guardar(env, 'gastos', b.id, {operarioId: yo.id, operario: yo.nombre, fecha: b.fecha, tipo: b.tipo, importe, nota: texto(b.nota, 500), fotos,
        estado: previo?.estado || 'pendiente', creado: previo?.creado || Date.now()});
      return json({ok: true});
    }

    // Fotos de un trabajo (cualquier operario)
    if (ruta === '/api/fotos-trabajo' && req.method === 'POST') {
      const b = await req.json().catch(() => ({}));
      if (!ID.test(b.id || '') || !FECHA.test(b.fecha || '')) return json({error: 'datos'}, 400);
      if (!(await doc(env, 'clientes', String(b.clienteId || '')))) return json({error: 'Elige un cliente.'}, 400);
      const previo = await doc(env, 'fotos', b.id);
      if (previo && previo.operarioId !== yo.id) return json({error: 'datos'}, 400);
      const fotos = await fotosDe(env, yo, b.fotos);
      if (!fotos.length) return json({error: 'Añade al menos una foto.'}, 400);
      await guardar(env, 'fotos', b.id, {operarioId: yo.id, operario: yo.nombre, clienteId: String(b.clienteId), fecha: b.fecha, nota: texto(b.nota, 1000), fotos, creado: previo?.creado || Date.now()});
      return json({ok: true});
    }

    // Todo lo que necesita la app al abrirse (se guarda en el móvil para usarla sin cobertura)
    if (ruta === '/api/inicio' && req.method === 'GET') {
      const desde = Date.now() - 62 * DIA;
      const fichajes = (await deOperario(env, 'fichajes', yo.id)).filter(f => f.ts >= desde)
        .map(({id, tipo, ts}) => ({id, tipo, ts})).sort((a, b) => a.ts - b.ts);
      const hace62 = new Date(desde).toISOString().slice(0, 10);
      const gastos = (await deOperario(env, 'gastos', yo.id)).filter(g => g.fecha >= hace62)
        .map(({id, fecha, tipo, importe, nota, estado, fotos}) => ({id, fecha, tipo, importe, nota, estado, fotos: (fotos || []).length}));
      // Los clientes los ven todos para poder mandar fotos de un trabajo; sin precios ni datos de contacto.
      const clientes = (await coleccion(env, 'clientes')).map(c => ({id: c.id, nombre: c.nombre || '', lugar: [c.direccion, c.poblacion].filter(Boolean).join(', ')}))
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
      const out = {yo: publico(yo), fichajes, gastos, clientes, tareas: TAREAS, tiposGasto: TIPOS_GASTO, servidor: Date.now()};
      if (jefe) {
        out.equipo = (await coleccion(env, 'operarios')).filter(o => o.activo !== false).map(publico).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
        const hace14 = new Date(Date.now() - 14 * DIA).toISOString().slice(0, 10);
        out.partes = (await deOperario(env, 'partes', yo.id, 'autorId')).filter(p => p.fecha >= hace14)
          .map(({id, fecha, clienteId, operarios, inicio, fin, tareas, descripcion, incidencias, fotos}) => ({id, fecha, clienteId, operarios, inicio, fin, tareas, descripcion, incidencias, fotos: fotos || []}));
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
      // Si la oficina ya lo ha corregido, no se pisa su corrección.
      if (previo && previo.editadoOficina) return json({error: 'La oficina ya ha revisado este parte. Para cambiarlo, llama a la oficina.'}, 409);
      await guardar(env, 'partes', b.id, {
        fecha: b.fecha, clienteId: cliente === null ? '' : String(b.clienteId), inicio: b.inicio, fin: b.fin,
        operarios: ids, operario: ids.map(id => activos.get(id).nombre).join(', '),
        duracion, horas: Math.round(duracion * ids.length * 100) / 100,
        tareas: (Array.isArray(b.tareas) ? b.tareas : []).filter(t => TAREAS.includes(t)),
        descripcion: texto(b.descripcion, 2000), incidencias: texto(b.incidencias, 2000),
        fotos: [...new Set([...(previo?.fotos || []), ...(await fotosDe(env, yo, b.fotos))])].slice(0, MAX_FOTOS),
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
