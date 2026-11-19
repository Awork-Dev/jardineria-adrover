import PAGINA from './index.html';
import AYUDA from './ayuda.html';
import { constantesJS, PIN_TODAS } from '../../compartido/constantes.js';
import { vozJS } from '../../compartido/voz.js';
import { jornadaJS } from '../../compartido/jornada.js';
import { TIPOS_DOC, MIMES_DOC, MAX_ARCHIVO, guardarArchivo, leerArchivo, borrarArchivo, respuestaArchivo, adjuntosPDF, mesDe, quienEs } from '../../compartido/archivos.js';
// El manual (docs/manual-oficina.md) va dentro de la página, en el botón «?».
const HTML = PAGINA.replace('<!--ICONOS-->', cabeceraIconos('Gestión', 'gestion')).replace('<!--AYUDA-->', AYUDA).replace('/*CONSTANTES*/', constantesJS()).replace('/*VOZ*/', () => vozJS()).replace('/*JORNADA*/', () => jornadaJS());
import { icono, manifiesto, cabeceraIconos } from '../../compartido/iconos.js';
import { cabecerasPagina } from '../../compartido/cabeceras.js';
import { ICONOS } from '../../compartido/iconos-gestion.js';
import * as google from './google.js';

const COLECCIONES = ['clientes', 'proveedores', 'presupuestos', 'notas', 'partes', 'ajustes', 'operarios', 'fichajes', 'gastos', 'fotos', 'documentos', 'ausencias'];
// Guarda un documento nuevo (su archivo y sus datos). Devuelve su id.
async function nuevoDocumento(env, bytes, datos) {
  const id = 'a' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
  await guardarArchivo(env, id, bytes);
  await env.DB.prepare('INSERT INTO docs (coleccion, id, data, actualizado) VALUES (?, ?, ?, ?)')
    .bind('documentos', id, JSON.stringify({...datos, tamano: bytes.byteLength, subido: Date.now()}), new Date().toISOString()).run();
  return id;
}
const binario = (buf) => { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return s; };
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
// Con «version», cada documento lleva _v (su fecha de última modificación) para detectar ediciones cruzadas.
async function todosLosDatos(env, version = false) {
  const {results} = await env.DB.prepare('SELECT coleccion, id, data, actualizado FROM docs').all();
  const out = {};
  for (const r of results) (out[r.coleccion] ||= {})[r.id] = version ? {...JSON.parse(r.data), _v: r.actualizado} : JSON.parse(r.data);
  return out;
}
async function hacerCopia(env) {
  const fecha = new Date().toISOString().slice(0, 10), datos = await todosLosDatos(env);
  for (const [id, f] of Object.entries(datos.fichajes || {})) datos.fichajes[id] = limpiarUbicacion(f);
  const texto = JSON.stringify(datos);
  await env.COPIAS.put('copia:' + fecha, texto, {expirationTtl: DIAS_COPIA * 86400});
  // Con la cuenta de Google conectada, la copia se guarda también en su Drive (si falla, la de aquí ya está hecha).
  await google.copia(env, fecha, texto).catch(() => {});
  return fecha;
}

// ---------- Ubicación de los fichajes ----------
// Se guarda solo hasta que la oficina valida las horas del mes (para pagar las horas extra) y, si nadie
// las valida, como mucho DIAS_UBICACION días. No va en las copias: al borrarla, desaparece del todo.
const DIAS_UBICACION = 92;
const limpiarUbicacion = ({lat, lon, precision, sinUbicacion, ...f}) => f;
async function quitarUbicacion(env, filas, extra = {}) {
  const ahora = new Date().toISOString();
  const cambios = filas.map(r => env.DB.prepare("UPDATE docs SET data = ?, actualizado = ? WHERE coleccion = 'fichajes' AND id = ?")
    .bind(JSON.stringify({...limpiarUbicacion(JSON.parse(r.data)), ...extra}), ahora, r.id));
  for (let i = 0; i < cambios.length; i += 50) await env.DB.batch(cambios.slice(i, i + 50));
}
async function caducarUbicaciones(env) {
  const {results} = await env.DB.prepare("SELECT id, data FROM docs WHERE coleccion = 'fichajes' AND json_extract(data, '$.lat') IS NOT NULL AND json_extract(data, '$.ts') < ?")
    .bind(Date.now() - DIAS_UBICACION * 86400e3).all();
  await quitarUbicacion(env, results);
}

let CABECERAS;
export default {
  // Nóminas por correo: el correo que llega a la dirección de las nóminas (Cloudflare Email Routing → este Worker)
  // se lee aquí y cada PDF adjunto se guarda como nómina, ya asignada a su trabajador si su nombre sale en el
  // nombre del archivo o en el asunto. Si NOMINAS_DE tiene direcciones (separadas por comas), solo se aceptan de ellas.
  async email(message, env) {
    const permitidos = String(env.NOMINAS_DE || '').toLowerCase().split(',').map((x) => x.trim()).filter(Boolean);
    if (permitidos.length && !permitidos.some((p) => String(message.from || '').toLowerCase().includes(p))) return message.setReject('No autorizado');
    const crudo = binario(await new Response(message.raw).arrayBuffer());
    const {asunto, pdfs} = adjuntosPDF(crudo);
    const {results} = await env.DB.prepare("SELECT id, data FROM docs WHERE coleccion = 'operarios'").all();
    const ops = Object.fromEntries(results.map((r) => [r.id, JSON.parse(r.data)]));
    for (const p of pdfs) {
      if (!p.bytes.length || p.bytes.length > MAX_ARCHIVO) continue;
      const operarioId = quienEs(p.nombre, ops) || (pdfs.length === 1 ? quienEs(asunto, ops) : '');
      await nuevoDocumento(env, p.bytes, {tipo: 'nomina', operarioId, nombre: p.nombre, mime: 'application/pdf', mes: mesDe(p.nombre) || mesDe(asunto), origen: 'correo', asunto: asunto.slice(0, 200)});
    }
  },

  async scheduled(event, env, ctx) {
    // Cada media hora solo se envía a Google lo que haya cambiado; de noche, además, la copia y la limpieza.
    if (event.cron === '*/30 * * * *') return ctx.waitUntil(google.sincronizar(env, {revisar: 'calendario'}));
    ctx.waitUntil(Promise.all([hacerCopia(env), caducarUbicaciones(env)]).then(() => google.apuntarMeses(env)).then(() => google.sincronizar(env, {revisar: 'todo'})));
  },

  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const aGoogle = () => ctx.waitUntil(google.sincronizar(env).catch(() => {}));
    if (url.pathname === '/' || url.pathname === '/index.html') {
      // «blob:» en las conexiones: las fotos del equipo se piden con la clave y se leen de memoria al hacer los PDF.
      CABECERAS ||= await cabecerasPagina(HTML, {conexiones: "'self' blob:", permisos: 'geolocation=(), camera=(), microphone=(self), payment=()'});
      return new Response(HTML, {headers: {...CABECERAS, 'cache-control': 'no-store'}});
    }
    if (url.pathname === '/manifest.webmanifest') return manifiesto('Gestión Jardinería Adrover', 'Gestión', '/', 'gestion');
    // Los PDF para clientes llevan el logo verde de la empresa, no el dorado de la gestión.
    if (url.pathname === '/logo.png') return icono('/logo-verde.png', ICONOS);
    const ico = icono(url.pathname, ICONOS); if (ico) return ico;
    // Vuelta de Google tras pedir el permiso: no trae la clave de la gestión, vale por el código de un solo uso
    // que se dio al empezar (google.empezar).
    if (url.pathname === google.VUELTA && req.method === 'GET') return Response.redirect(url.origin + '/?google=' + await google.volver(env, url), 302);
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
      if (!desde) return json(await todosLosDatos(env, true));
      const hasta = new Date().toISOString();
      const {results} = await env.DB.prepare('SELECT coleccion, id, data, actualizado FROM docs WHERE actualizado > ?').bind(desde).all();
      const {results: fuera} = await env.DB.prepare('SELECT coleccion, id FROM borrados WHERE cuando > ?').bind(desde).all();
      // Lo que llega de la app del equipo también va a Google: se aprovecha que la gestión pregunta cada minuto.
      if (results.some(r => google.SIGUE.includes(r.coleccion)) || fuera.length) aGoogle();
      return json({cambios: results.map(r => [r.coleccion, r.id, {...JSON.parse(r.data), _v: r.actualizado}]), borrados: fuera.map(r => [r.coleccion, r.id]), hasta});
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

    // Validar las horas: los fichajes quedan marcados y se borra su ubicación (las horas se conservan).
    if (url.pathname === '/api/validar' && req.method === 'POST') {
      const b = await req.json().catch(() => null);
      const ids = [...new Set((b && Array.isArray(b.ids) ? b.ids : []).filter(x => typeof x === 'string' && x && x.length <= 200))];
      if (!ids.length || ids.length > 2000) return json({error: 'datos'}, 400);
      const filas = [];
      for (let i = 0; i < ids.length; i += 50) {
        const parte = ids.slice(i, i + 50);
        const {results} = await env.DB.prepare(`SELECT id, data FROM docs WHERE coleccion = 'fichajes' AND id IN (${parte.map(() => '?').join(',')})`).bind(...parte).all();
        filas.push(...results);
      }
      await quitarUbicacion(env, filas, {validado: Date.now()});
      return json({ok: true, validados: filas.length});
    }

    // Google: estado de la conexión, conectar, desconectar, enviar lo pendiente y guardar un PDF en Drive.
    if (url.pathname === '/api/google' && req.method === 'GET') return json(await google.estado(env, url.origin));
    if (url.pathname === '/api/google' && req.method === 'DELETE') { await google.desconectar(env); return json(await google.estado(env, url.origin)); }
    if (url.pathname === '/api/google/conectar' && req.method === 'POST') {
      const destino = await google.empezar(env, url.origin);
      return destino ? json({url: destino}) : json({error: 'sin configurar'}, 400);
    }
    if (url.pathname === '/api/google/sincronizar' && req.method === 'POST') {
      await google.sincronizar(env, {manual: true, revisar: url.searchParams.get('revisar') ? 'todo' : ''});
      return json(await google.estado(env, url.origin));
    }
    if (url.pathname === '/api/google/pdf' && req.method === 'POST') {
      const tipo = url.searchParams.get('tipo'), nombre = String(url.searchParams.get('nombre') || '').replace(/[^\w.\- áéíóúñüÁÉÍÓÚÑÜ()]/g, '-').slice(0, 120);
      const bytes = await req.arrayBuffer();
      if (!google.TIPOS_PDF.includes(tipo) || !/\.pdf$/i.test(nombre) || !bytes.byteLength || bytes.byteLength > 25e6) return json({error: 'datos'}, 400);
      const r = await google.pdf(env, tipo, nombre, bytes);
      return json(r, r.ok ? 200 : 502);
    }

    // PIN incorrectos en la app del equipo (todas las conexiones juntas): cuántos van y si la entrada está bloqueada.
    // La oficina puede desbloquearla si ha sido un despiste del equipo.
    if (url.pathname === '/api/pin' && req.method === 'GET') {
      const r = await env.DB.prepare('SELECT fallos, desde FROM intentos WHERE ip = ?').bind(PIN_TODAS.clave).first();
      const vivo = !!r && Date.now() - r.desde < PIN_TODAS.ventana;
      return json({fallos: vivo ? r.fallos : 0, desde: vivo ? r.desde : 0, bloqueado: vivo && r.fallos >= PIN_TODAS.max});
    }
    if (url.pathname === '/api/pin' && req.method === 'DELETE') {
      await env.DB.prepare('DELETE FROM intentos WHERE ip = ?').bind(PIN_TODAS.clave).run();
      return json({ok: true});
    }

    // La web: visitas de los últimos 30 días y plantas que se buscan y no están en la guía. Las cuenta la propia
    // web sin cookies ni datos de quien entra (web/src/visitas.js); la gestión solo las lee y puede quitar búsquedas.
    if (url.pathname === '/api/web' && req.method === 'GET') {
      if (!env.WEB) return json({dias: null, busquedas: []});
      const desde = new Date(Date.now() - 29 * 86400e3).toLocaleDateString('sv-SE', {timeZone: 'Europe/Madrid'});
      const q = sql => env.WEB.prepare(sql).bind(desde);
      try {
        const [dias, paginas, paises, idiomas, busquedas] = await env.WEB.batch([
          q('SELECT dia, SUM(n) AS n FROM visitas WHERE dia >= ? GROUP BY dia ORDER BY dia'),
          q('SELECT ruta, SUM(n) AS n FROM visitas WHERE dia >= ? GROUP BY ruta ORDER BY n DESC, ruta LIMIT 10'),
          q('SELECT pais, SUM(n) AS n FROM visitas WHERE dia >= ? GROUP BY pais ORDER BY n DESC, pais LIMIT 8'),
          q('SELECT idioma, SUM(n) AS n FROM visitas WHERE dia >= ? GROUP BY idioma ORDER BY n DESC, idioma'),
          env.WEB.prepare('SELECT q, idioma, n, ultima FROM busquedas ORDER BY n DESC, ultima DESC, q LIMIT 200'),
        ]);
        return json({desde, dias: dias.results, paginas: paginas.results, paises: paises.results, idiomas: idiomas.results, busquedas: busquedas.results});
      } catch { return json({dias: null, busquedas: []}); }
    }
    if (url.pathname === '/api/web/busquedas' && req.method === 'DELETE') {
      const b = await req.json().catch(() => null);
      if (!env.WEB || !b || typeof b.q !== 'string' || !b.q) return json({error: 'datos'}, 400);
      await env.WEB.prepare('DELETE FROM busquedas WHERE q = ?').bind(b.q).run();
      return json({ok: true});
    }

    // Documentos del personal: subir (el archivo va en el cuerpo, sus datos en la dirección) y ver o descargar.
    if (url.pathname === '/api/archivos' && req.method === 'POST') {
      const q = (k) => String(url.searchParams.get(k) || '').trim(), mime = (req.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
      const tipo = q('tipo'), operarioId = q('operarioId'), mes = q('mes');
      if (!TIPOS_DOC.includes(tipo) || !MIMES_DOC.includes(mime) || operarioId.length > 60 || (mes && !/^\d{4}-\d{2}$/.test(mes))) return json({error: 'datos'}, 400);
      const bytes = await req.arrayBuffer();
      if (!bytes.byteLength || bytes.byteLength > MAX_ARCHIVO) return json({error: 'tamaño'}, 413);
      const id = await nuevoDocumento(env, bytes, {tipo, operarioId, mes, mime, nombre: q('nombre').replace(/[\\/<>:"|?*\x00-\x1f]/g, '-').slice(0, 120) || 'documento', origen: 'oficina'});
      return json({ok: true, id});
    }
    const ar = url.pathname.match(/^\/api\/archivos\/([\w-]{6,60})$/);
    if (ar && req.method === 'GET') {
      const fila = await env.DB.prepare("SELECT data FROM docs WHERE coleccion = 'documentos' AND id = ?").bind(ar[1]).first();
      const bytes = fila && await leerArchivo(env, ar[1]);
      return bytes ? respuestaArchivo(bytes, JSON.parse(fila.data), url.searchParams.get('bajar') === '1') : json({error: 'no existe'}, 404);
    }

    const m = url.pathname.match(/^\/api\/doc\/([^/]+)\/([^/]+)$/);
    if (m) {
      const col = decodeURIComponent(m[1]), id = decodeURIComponent(m[2]);
      if (!COLECCIONES.includes(col) || !id || id.length > 200) return json({error: 'ruta'}, 400);
      if (req.method === 'PUT') {
        const body = await req.json().catch(() => null);
        if (!body || typeof body !== 'object' || Array.isArray(body)) return json({error: 'cuerpo'}, 400);
        const {_v, id: _id, ...data} = body;
        const ahora = new Date().toISOString(), version = req.headers.get('if-match');
        if (version) {
          // Solo se guarda si nadie lo ha cambiado desde que se cargó (la app del equipo u otro ordenador).
          const r = await env.DB.prepare('UPDATE docs SET data = ?, actualizado = ? WHERE coleccion = ? AND id = ? AND actualizado = ?')
            .bind(JSON.stringify(data), ahora, col, id, version).run();
          if (!r.meta.changes) return json({error: 'cambiado'}, 409);
        } else {
          await env.DB.batch([
            env.DB.prepare('INSERT INTO docs (coleccion, id, data, actualizado) VALUES (?, ?, ?, ?) ON CONFLICT(coleccion, id) DO UPDATE SET data = excluded.data, actualizado = excluded.actualizado')
              .bind(col, id, JSON.stringify(data), ahora),
            env.DB.prepare('DELETE FROM borrados WHERE coleccion = ? AND id = ?').bind(col, id),
          ]);
        }
        if (google.SIGUE.includes(col)) aGoogle();
        return json({ok: true, _v: ahora});
      }
      if (req.method === 'DELETE') {
        const cuando = new Date().toISOString();
        await env.DB.batch([
          env.DB.prepare('DELETE FROM docs WHERE coleccion = ? AND id = ?').bind(col, id),
          env.DB.prepare('INSERT INTO borrados (coleccion, id, cuando) VALUES (?, ?, ?) ON CONFLICT(coleccion, id) DO UPDATE SET cuando = excluded.cuando').bind(col, id, cuando),
        ]);
        // Al borrar un documento se borra también su archivo.
        if (col === 'documentos') await borrarArchivo(env, id);
        if (google.SIGUE.includes(col)) aGoogle();
        return json({ok: true});
      }
    }
    return json({error: 'no existe'}, 404);
  }
};
