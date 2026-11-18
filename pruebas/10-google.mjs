// Conexión de la gestión con Google: calendario, contactos, Drive y hoja de horas (gestion/src/google.js).
// Google se simula aquí mismo: un servidor que guarda lo que le llega, para comprobar qué se envía y qué no.
import http from 'node:http';
import { G, CLAVE, T, ok, fin, lanzar, pagina, entrarGestion } from './comun.mjs';
import { tablaHoras, telefonos, cuerpoEvento } from '../gestion/src/google.js';

console.log('Google: calendario, contactos, Drive y hoja de horas');

// ---------- Las cuentas, sin servidor ----------
ok(JSON.stringify(telefonos('600 111 222 / +49 170 1234567')) === JSON.stringify(['+34 600 111 222', '+49 170 1234567']) && telefonos('').length === 0,
  'los teléfonos españoles sin prefijo salen con +34 y los extranjeros, como están');
const ev = cuerpoEvento({ fecha: '2026-11-04', inicio: '08:00', fin: '13:30', tareas: ['Poda'], operario: 'Ana', horas: 5.5 }, { nombre: 'Hotel Sol', direccion: 'C/ Mar 1', cp: '07590', poblacion: 'Cala Rajada' });
const dia = cuerpoEvento({ fecha: '2026-12-31' }, null);
ok(ev.summary === 'Hotel Sol · Poda' && ev.start.dateTime === '2026-11-04T08:00:00' && ev.end.dateTime === '2026-11-04T13:30:00' && ev.start.timeZone === 'Europe/Madrid'
  && ev.location === 'C/ Mar 1, 07590 Cala Rajada' && ev.description.includes('Horas: 5,5') && dia.start.date === '2026-12-31' && dia.end.date === '2027-01-01' && dia.summary === '(sin cliente)',
  'la cita lleva cliente, tareas, lugar y horario; sin horario ocupa el día entero');
const t = (d, h) => Date.parse(`${d}T${h}:00+01:00`);
const th = tablaHoras('2026-11', { a: { nombre: 'Ana' }, z: { nombre: 'Zoe', activo: false } }, [
  { operarioId: 'a', tipo: 'entrada', ts: t('2026-11-04', '08:00'), validado: 1 }, { operarioId: 'a', tipo: 'salida', ts: t('2026-11-04', '18:00'), validado: 1 },
  { operarioId: 'a', tipo: 'entrada', ts: t('2026-11-07', '09:00') }, { operarioId: 'a', tipo: 'salida', ts: t('2026-11-07', '11:00') },
  { operarioId: 'a', tipo: 'entrada', ts: t('2026-11-05', '08:00') }, { operarioId: 'a', tipo: 'entrada', ts: t('2026-10-31', '23:30') },
], { horasDia: 8, festivos: [] }, '2026-11-13').filas;
ok(JSON.stringify(th[1]) === JSON.stringify(['Ana', 12, 2, 2, 4, 1, 'No']) && th.length === 8 && th[5][1] === '2026-11-04' && /^0?8:00–18:00$/.test(th[5][2]) && th[5][3] === 10 && th[5][4] === 2
  && th[6][5] === 'Falta un fichaje' && th[7][4] === 2,
  'las horas del mes salen como en la gestión: extra en laborables, sábados enteros y días con un fichaje de menos');

// ---------- Google de mentira ----------
const M = { llamadas: [], sinLlave: 0, revocado: false, n: 0, cal: null, eventos: new Map(), grupo: '', contactos: new Map(), archivos: new Map(), hoja: null, pestanas: new Map(), movida: '', raras: [] };
const ALCANCES = 'https://www.googleapis.com/auth/calendar.app.created https://www.googleapis.com/auth/contacts https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email';
const servidor = http.createServer((req, res) => {
  const trozos = [];
  req.on('data', (c) => trozos.push(c));
  req.on('end', () => {
    const u = new URL(req.url, 'http://x'), ruta = u.pathname, cuerpo = Buffer.concat(trozos);
    const J = () => { try { return JSON.parse(cuerpo.toString() || '{}'); } catch { return {}; } };
    const da = (obj, estado = 200) => { res.writeHead(estado, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };
    const no = (estado, texto) => da({ error: { code: estado, message: texto } }, estado);
    M.llamadas.push(req.method + ' ' + ruta);
    let m;
    if (ruta === '/oauth/token') {
      const f = new URLSearchParams(cuerpo.toString());
      if (f.get('client_id') !== 'id-de-prueba' || f.get('client_secret') !== 'secreto-de-prueba') return da({ error: 'invalid_client' }, 401);
      if (f.get('grant_type') === 'authorization_code') return f.get('code') === 'codigo-bueno' && f.get('redirect_uri') === G + '/google/vuelta'
        ? da({ access_token: 'acc1', refresh_token: 'ref-secreto', expires_in: 3600, scope: ALCANCES }) : da({ error: 'invalid_grant' }, 400);
      return f.get('refresh_token') === 'ref-secreto' && !M.revocado ? da({ access_token: 'acc2', expires_in: 3600 }) : da({ error: 'invalid_grant' }, 400);
    }
    if (ruta === '/oauth/revoke') { M.revocado = true; return da({}); }
    if (!/^Bearer acc[12]$/.test(req.headers.authorization || '')) { M.sinLlave++; return no(401, 'sin llave'); }
    if (ruta === '/api/oauth2/v3/userinfo') return da({ email: 'empresa@example.com' });
    // Calendario
    if (ruta === '/api/calendar/v3/calendars' && req.method === 'POST') { M.cal = J(); return da({ id: 'cal1' }); }
    // La gestión nunca debe borrar: este Google no entiende DELETE (acabaría en «raras»).
    if ((m = ruta.match(/^\/api\/calendar\/v3\/calendars\/cal1\/events(?:\/([^/]+))?$/))) {
      const sella = (b) => ({ ...b, etag: '"' + (++M.n) + '"', updated: new Date().toISOString() });
      if (!m[1] && req.method === 'GET') {
        const min = u.searchParams.get('updatedMin') || '', borradas = u.searchParams.get('showDeleted') === 'true';
        return da({ items: [...M.eventos.values()].filter((x) => x.updated >= min && (borradas || x.status !== 'cancelled')).map((x) => ({ id: x.id, status: x.status, etag: x.etag })) });
      }
      if (!m[1] && req.method === 'POST') {
        const b = J();
        if (!/^[a-v0-9]{5,1024}$/.test(b.id || '')) return no(400, 'identificador no válido');
        if (M.eventos.has(b.id)) return no(409, 'ya existe');
        const x = sella(b); M.eventos.set(b.id, x); return da(x);
      }
      const ya = M.eventos.get(m[1]);
      if (m[1] && !ya && req.method !== 'DELETE') return no(404, 'no existe');
      if (req.method === 'GET') return da(ya);
      if (req.method === 'PUT') { const x = sella({ ...J(), id: m[1] }); M.eventos.set(m[1], x); return da(x); }
      if (req.method === 'PATCH') { const x = sella({ ...ya, ...J() }); M.eventos.set(m[1], x); return da(x); }
    }
    // Contactos
    if (ruta === '/personas/v1/contactGroups' && req.method === 'POST') { M.grupo = J().contactGroup.name; return da({ resourceName: 'contactGroups/g1' }); }
    if (ruta === '/personas/v1/people:createContact' && req.method === 'POST') { const rn = 'people/c' + (++M.n); M.contactos.set(rn, { ...J(), etag: 'e1' }); return da({ resourceName: rn, etag: 'e1' }); }
    if (ruta === '/personas/v1/contactGroups/g1' && req.method === 'GET') return da({ resourceName: 'contactGroups/g1',
      memberResourceNames: [...M.contactos.entries()].filter(([, x]) => (x.memberships || []).some((y) => y.contactGroupMembership.contactGroupResourceName === 'contactGroups/g1')).map(([rn]) => rn) });
    if (ruta === '/personas/v1/people:batchGet') return da({ responses: u.searchParams.getAll('resourceNames').map((rn) => M.contactos.has(rn)
      ? { requestedResourceName: rn, httpStatusCode: 200, person: { resourceName: rn, etag: M.contactos.get(rn).etag } } : { requestedResourceName: rn, httpStatusCode: 404 }) });
    if ((m = ruta.match(/^\/personas\/v1\/(people\/c\d+)(:updateContact)?$/))) {
      const c = M.contactos.get(m[1]);
      if (!c) return no(404, 'no existe');
      if (req.method === 'GET') return da({ resourceName: m[1], etag: c.etag });
      if (req.method === 'PATCH') { const b = J(); if (b.etag !== c.etag) return no(400, 'etag antiguo'); const etag = 'e' + (++M.n); M.contactos.set(m[1], { ...b, etag }); return da({ resourceName: m[1], etag }); }
    }
    // Drive
    if (ruta === '/api/drive/v3/files' && req.method === 'POST') { const b = J(), id = 'f' + (++M.n); M.archivos.set(id, { id, name: b.name, parents: b.parents || [], carpeta: true }); return da({ id }); }
    if (ruta === '/api/drive/v3/files' && req.method === 'GET') {
      const q = u.searchParams.get('q') || '', padre = (q.match(/^'([^']+)' in parents/) || [])[1], nombre = (q.match(/name = '(.*)'$/) || [])[1];
      return da({ files: [...M.archivos.values()].filter((f) => f.parents.includes(padre) && (!nombre || f.name === nombre)).map((f) => ({ id: f.id, name: f.name })) });
    }
    if (ruta === '/api/upload/drive/v3/files' && req.method === 'POST') {
      const lim = (String(req.headers['content-type']).match(/boundary=(.+)$/) || [])[1], partes = cuerpo.toString('latin1').split('--' + lim);
      const trozo = (x) => x.slice(x.indexOf('\r\n\r\n') + 4, x.lastIndexOf('\r\n'));
      const meta = JSON.parse(Buffer.from(trozo(partes[1]), 'latin1').toString('utf8')), id = 'f' + (++M.n);
      if (!M.archivos.has(meta.parents[0])) return no(404, 'no existe la carpeta');
      M.archivos.set(id, { id, name: meta.name, parents: meta.parents, datos: Buffer.from(trozo(partes[2]), 'latin1'), veces: 1 }); return da({ id });
    }
    if ((m = ruta.match(/^\/api\/upload\/drive\/v3\/files\/(f\d+)$/)) && req.method === 'PATCH') {
      const f = M.archivos.get(m[1]); if (!f) return no(404, 'no existe');
      f.datos = cuerpo; f.veces++; return da({ id: f.id });
    }
    if ((m = ruta.match(/^\/api\/drive\/v3\/files\/(\w+)$/)) && req.method === 'PATCH') { M.movida = u.searchParams.get('addParents') || ''; return da({ id: m[1] }); }
    // Hojas de cálculo
    if (ruta === '/hojas/v4/spreadsheets' && req.method === 'POST') { M.hoja = J(); M.pestanas.set(M.hoja.sheets[0].properties.title, []); return da({ spreadsheetId: 'h1' }); }
    if (ruta === '/hojas/v4/spreadsheets/h1' && req.method === 'GET') return da({ sheets: [...M.pestanas.keys()].map((title) => ({ properties: { title } })) });
    if (ruta === '/hojas/v4/spreadsheets/h1:batchUpdate') { for (const r of J().requests) M.pestanas.set(r.addSheet.properties.title, []); return da({}); }
    if ((m = ruta.match(/^\/hojas\/v4\/spreadsheets\/h1\/values\/(.+?)(:clear)?$/))) {
      const pest = (decodeURIComponent(m[1]).match(/^'(.+)'!/) || [])[1];
      if (!M.pestanas.has(pest)) return no(400, 'no hay esa pestaña');
      M.pestanas.set(pest, m[2] ? [] : J().values); return da({});
    }
    M.raras.push(req.method + ' ' + ruta);
    no(404, 'ruta desconocida');
  });
});
await new Promise((r) => servidor.listen(Number(process.env.GOOGLE_FALSO) || 8791, '127.0.0.1', r));

// ---------- La gestión ----------
const pide = async (metodo, ruta, cuerpo) => {
  for (let i = 0; ; i++) {
    const r = await fetch(G + ruta, { method: metodo, headers: { 'x-clave': CLAVE, 'content-type': 'application/json' }, body: cuerpo ? JSON.stringify(cuerpo) : undefined });
    try { return await r.json(); } catch (e) { if (i >= 4) throw e; await new Promise((s) => setTimeout(s, 300)); }
  }
};
const doc = (col, id, d) => pide('PUT', `/api/doc/${col}/${id}`, d);
// Espera a que se cumpla algo; mientras, pregunta por los cambios como hace la gestión abierta (cada minuto).
const hasta = async (cond, ms = 12000) => {
  for (const t0 = Date.now(); Date.now() - t0 < ms;) {
    if (cond()) return true;
    await new Promise((r) => setTimeout(r, 400));
    await pide('GET', '/api/datos?desde=' + encodeURIComponent(new Date(Date.now() - 120e3).toISOString()));
  }
  return cond();
};
const hoy = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
const cli = 'cg' + T, par = 'tg' + T, viejo = 'tgv' + T, op = 'og' + T, NOMBRE = 'Hotel Google ' + T;
const eventosDe = (n) => [...M.eventos.values()].filter((x) => x.status !== 'cancelled' && String(x.summary).startsWith(n));
const contactoDe = (n) => [...M.contactos.values()].find((x) => x.names[0].givenName === n);
const carpetaDe = (n) => [...M.archivos.values()].find((f) => f.carpeta && f.name === n);
const dentroDe = (n) => { const c = carpetaDe(n); return c ? [...M.archivos.values()].filter((f) => f.parents.includes(c.id)) : []; };

const antes = await pide('GET', '/api/google');
await doc('clientes', cli, { nombre: NOMBRE, telefono: '600 111 222', email: 'hotel@example.com', direccion: 'C/ Mar 1', cp: '07590', poblacion: 'Cala Rajada', contacto: 'María', notas: 'llave bajo la maceta', cif: 'B00000000' });
await doc('partes', par, { fecha: hoy, clienteId: cli, inicio: '08:00', fin: '13:30', tareas: ['Poda'], operario: 'Ana', descripcion: 'Seto de la entrada', incidencias: 'aviso interno' });
await doc('partes', viejo, { fecha: '2020-01-10', clienteId: cli, tareas: ['Riego'] });
await new Promise((r) => setTimeout(r, 600));
ok(antes.configurado && !antes.conectado && antes.vuelta === G + '/google/vuelta' && M.llamadas.length === 0, 'sin conectar la cuenta no se envía nada a Google');

const falso = await fetch(G + '/google/vuelta?code=codigo-bueno&state=inventado', { redirect: 'manual' });
const { url } = await pide('POST', '/api/google/conectar'), destino = new URL(url), permisos = (destino.searchParams.get('scope') || '').split(' ');
ok(falso.status === 302 && falso.headers.get('location').endsWith('/?google=caducado') && M.llamadas.length === 0, 'la vuelta de Google sin el código que dio la gestión no conecta nada');
ok(destino.pathname.endsWith('/o/oauth2/v2/auth') && destino.searchParams.get('redirect_uri') === G + '/google/vuelta' && destino.searchParams.get('access_type') === 'offline'
  && permisos.includes('https://www.googleapis.com/auth/calendar.app.created') && permisos.includes('https://www.googleapis.com/auth/drive.file')
  && !permisos.includes('https://www.googleapis.com/auth/calendar') && !permisos.includes('https://www.googleapis.com/auth/drive'),
  'se piden los permisos mínimos: solo el calendario y los archivos que crea la gestión');
const vuelta = `${G}/google/vuelta?code=codigo-bueno&state=${destino.searchParams.get('state')}`;
const bien = await fetch(vuelta, { redirect: 'manual' }), repetida = await fetch(vuelta, { redirect: 'manual' });
ok(bien.headers.get('location').endsWith('/?google=ok') && repetida.headers.get('location').endsWith('/?google=caducado'), 'con el permiso dado queda conectada, y el código de vuelta vale una sola vez');

let e, pasadas = 0, maxLlamadas = 0;
for (; pasadas < 60; pasadas++) {
  const n0 = M.llamadas.length;
  e = await pide('POST', '/api/google/sincronizar');
  maxLlamadas = Math.max(maxLlamadas, M.llamadas.length - n0);
  if (!e.pendientes) break;
}
ok(e.conectado && e.cuenta === 'empresa@example.com' && e.pendientes === 0 && !e.error && !e.conError && M.sinLlave === 0 && M.raras.length === 0,
  `al conectar se envía todo lo que había, por tandas (${pasadas + 1} pasadas)` + (e.error ? ': ' + e.error : '') + (M.raras.length ? ' · ' + M.raras[0] : ''));
ok(maxLlamadas > 0 && maxLlamadas <= 45, `ninguna pasada supera las peticiones que admite Cloudflare (la mayor, ${maxLlamadas})`);
const cita = eventosDe(NOMBRE);
ok(M.cal && M.cal.summary === 'Trabajos Adrover' && M.cal.timeZone === 'Europe/Madrid' && cita.length === 1 && cita[0].summary === NOMBRE + ' · Poda' && cita[0].start.dateTime === hoy + 'T08:00:00'
  && cita[0].location === 'C/ Mar 1, 07590 Cala Rajada' && cita[0].description.includes('Equipo: Ana') && !JSON.stringify(cita[0]).includes('aviso interno'),
  'el parte de trabajo está en el calendario «Trabajos Adrover» con su cliente, lugar y horario, sin los avisos internos; el de 2020 no se envía');
const con = contactoDe(NOMBRE);
ok(M.grupo === 'Clientes Adrover' && con && con.phoneNumbers[0].value === '+34 600 111 222' && con.emailAddresses[0].value === 'hotel@example.com' && con.addresses[0].city === 'Cala Rajada'
  && con.biographies[0].value === 'Persona de contacto: María' && con.memberships.some((x) => x.contactGroupMembership.contactGroupResourceName === 'contactGroups/g1')
  && !/llave bajo la maceta|B00000000/.test(JSON.stringify(con)),
  'el cliente está en los contactos con teléfono (+34), correo y dirección, sin sus notas ni su NIF');
ok(e.enviados.evento >= 1 && e.enviados.contacto >= 1 && e.enlaces.calendario && e.permisos.calendario && e.permisos.contactos && e.permisos.drive, 'la gestión enseña cuánto hay enviado y los enlaces');

// Cambiar y borrar en la gestión: Google lo sigue solo.
const n1 = M.eventos.size, c1 = M.contactos.size;
await doc('clientes', cli, { nombre: 'Hotel Nuevo ' + T, telefono: '+49 170 1234567', direccion: 'C/ Sol 2', poblacion: 'Capdepera' });
ok(await hasta(() => !!contactoDe('Hotel Nuevo ' + T) && eventosDe('Hotel Nuevo ' + T).length === 1) && contactoDe('Hotel Nuevo ' + T).phoneNumbers[0].value === '+49 170 1234567'
  && contactoDe('Hotel Nuevo ' + T).emailAddresses.length === 0 && eventosDe('Hotel Nuevo ' + T)[0].location === 'C/ Sol 2, Capdepera' && M.eventos.size === n1 && M.contactos.size === c1,
  'al cambiar el cliente se actualizan su contacto y su cita, sin duplicarlos');
await doc('partes', par, { fecha: hoy, clienteId: cli, tareas: ['Riego'], operario: 'Ana' });
ok(await hasta(() => eventosDe('Hotel Nuevo ' + T).some((x) => x.summary.endsWith('Riego') && x.start.date === hoy && !x.start.dateTime)) && M.eventos.size === n1, 'al quitar el horario del parte, la cita pasa a ocupar el día');
// Alguien mueve la cita a mano en Google y borra el contacto: la gestión lo vuelve a poner como estaba.
const [gidC, evC] = [...M.eventos.entries()].find(([, x]) => x.summary === 'Hotel Nuevo ' + T + ' · Riego');
M.eventos.set(gidC, { ...evC, summary: 'Movida a mano', start: { date: '2030-01-01' }, etag: '"a mano"', updated: new Date().toISOString() });
M.contactos.delete([...M.contactos.entries()].find(([, x]) => x.names[0].givenName === 'Hotel Nuevo ' + T)[0]);
let rv = await pide('POST', '/api/google/sincronizar?revisar=1');
for (let i = 0; i < 6 && rv.pendientes; i++) rv = await pide('POST', '/api/google/sincronizar');
ok(M.eventos.get(gidC).summary === 'Hotel Nuevo ' + T + ' · Riego' && M.eventos.get(gidC).start.date === hoy && !!contactoDe('Hotel Nuevo ' + T) && !rv.error,
  'lo que se cambia o se borra a mano en Google, la gestión lo vuelve a poner como estaba' + (rv.error ? ': ' + rv.error : ''));
const n3 = M.llamadas.length;
await pide('POST', '/api/google/sincronizar?revisar=1');
ok(M.llamadas.slice(n3).every((l) => l.startsWith('GET')), 'si nadie ha tocado nada en Google, revisar no reescribe nada');
await pide('DELETE', `/api/doc/partes/${par}`); await pide('DELETE', `/api/doc/clientes/${cli}`);
ok(await hasta(() => String(M.eventos.get(gidC).summary).startsWith('ANULADO · Hotel Nuevo ' + T)) && M.eventos.get(gidC).colorId === '8' && !!contactoDe('Hotel Nuevo ' + T) && M.eventos.size === n1,
  'al borrar en la gestión no se borra nada en Google: la cita queda marcada «ANULADO» y el contacto se queda');

// Horas del mes → hoja de cálculo
await doc('operarios', op, { nombre: 'Google ' + T, activo: true });
await doc('fichajes', 'fg1' + T, { operarioId: op, tipo: 'entrada', ts: t('2026-11-04', '08:00') });
await doc('fichajes', 'fg2' + T, { operarioId: op, tipo: 'salida', ts: t('2026-11-04', '18:00') });
const filaDe = () => (M.pestanas.get('2026-11') || []).find((f) => f[0] === 'Google ' + T);
ok(await hasta(() => JSON.stringify(filaDe()) === JSON.stringify(['Google ' + T, 10, 2, 0, 2, 0, 'No'])) && M.pestanas.has('Léeme') && /Horas/.test(M.hoja.properties.title) && M.movida === carpetaDe('Horas').id,
  'las horas del mes están en la hoja de cálculo, en su pestaña, con las horas extra ya calculadas');
ok(!/lat|lon|precision/.test(JSON.stringify([...M.pestanas.values()])), 'a la hoja no llega la ubicación de los fichajes');

// Copia de seguridad y PDF → Drive
await pide('POST', '/api/copias'); await pide('POST', '/api/copias');
const copias = dentroDe('Copias de seguridad'), copia = copias[0] ? copias[0].datos.toString() : '';
ok(copias.length === 1 && /^copia-\d{4}-\d{2}-\d{2}\.json$/.test(copias[0].name) && copias[0].veces === 2 && copia.includes('Google ' + T) && !/ref-secreto|refresco|acc1/.test(copia)
  && carpetaDe('Copias de seguridad').parents[0] === carpetaDe('Jardinería Adrover · Gestión').id,
  'la copia de seguridad se guarda en Drive (una por día, sin la llave de Google)');
const sube = (tipo, nombre, texto, clave = CLAVE) => fetch(`${G}/api/google/pdf?tipo=${tipo}&nombre=${encodeURIComponent(nombre)}`, { method: 'POST', headers: { 'x-clave': clave, 'content-type': 'application/pdf' }, body: Buffer.from(texto) });
const s1 = await sube('partes', 'parte-prueba.pdf', '%PDF-1.4 uno'), s2 = await sube('partes', 'parte-prueba.pdf', '%PDF-1.4 dos'), s3 = await sube('otra', 'x.pdf', '%PDF'), s4 = await sube('partes', 'x.pdf', '%PDF', 'mala');
const pdfs = dentroDe('Partes de trabajo');
ok(s1.status === 200 && s2.status === 200 && pdfs.length === 1 && pdfs[0].name === 'parte-prueba.pdf' && pdfs[0].datos.toString() === '%PDF-1.4 dos' && s3.status === 400 && s4.status === 401,
  'los PDF se guardan en su carpeta de Drive y, si se repite el nombre, se sustituye');

// En pantalla
const nav = await lanzar(), g = await pagina(nav, {}, 'gestión');
await entrarGestion(g);
await g.click('.side [data-act=google]');
await g.waitForSelector('#gg-estado');
const panel = await g.textContent('#sheet-form');
ok(panel.includes('Conectada') && panel.includes('empresa@example.com') && panel.includes('Todo enviado') && await g.locator('#sheet-form a[href^="https://docs.google.com/spreadsheets/d/h1"]').count() === 1
  && await g.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'el panel «Google» de la gestión enseña la cuenta, lo enviado y los enlaces');
await g.click('[data-act=close]');
ok(await g.locator('.side a.ir-cal:not([hidden])').getAttribute('href') === 'https://calendar.google.com/calendar/r?authuser=empresa%40example.com', 'con la cuenta conectada, el botón «Calendario» abre Google Calendar con esa cuenta');
await g.click('[data-view=equipo]').catch(() => {});
await g.evaluate(() => { document.querySelector('[data-act=tab-equipo][data-v=extra]')?.click(); });
await g.waitForSelector('[data-act=pdf-extra]', { timeout: 5000 }).catch(() => {});
if (await g.locator('[data-act=pdf-extra]').count()) {
  const [bajado] = await Promise.all([g.waitForEvent('download'), g.click('[data-act=pdf-extra]')]);
  ok(await hasta(() => dentroDe('Horas').some((f) => f.name === bajado.suggestedFilename() && f.datos.subarray(0, 4).toString() === '%PDF'), 6000), 'el PDF de horas extra que se descarga se guarda también en Drive');
} else ok(false, 'no se ha encontrado el botón del PDF de horas extra');
await g.click('.side [data-act=google]');
await g.waitForSelector('#gg-estado');
await g.setViewportSize({ width: 390, height: 844 });
await g.waitForTimeout(300);
ok(await g.evaluate(() => document.documentElement.scrollWidth <= innerWidth && [...document.querySelectorAll('#sheet-form .row')].every((r) => r.getBoundingClientRect().right <= innerWidth)), 'el panel «Google» cabe en el móvil');

// Lo que no debe salir nunca de la gestión
const todo = JSON.stringify(await pide('GET', '/api/datos')) + JSON.stringify(await pide('GET', '/api/google'));
ok(!/ref-secreto|acc1|acc2|secreto-de-prueba/.test(todo), 'la llave de Google no aparece ni en los datos ni en el estado que ve la gestión');

// Desconectar
const fuera = await pide('DELETE', '/api/google'), n2 = M.llamadas.length;
await doc('clientes', 'cgz' + T, { nombre: 'Después ' + T });
await hasta(() => false, 1500);
ok(!fuera.conectado && M.revocado && M.llamadas.length === n2 && !contactoDe('Después ' + T), 'al desconectar se retira el permiso en Google y deja de enviarse nada');
ok(!M.llamadas.some((l) => l.startsWith('DELETE') || l.includes(':deleteContact')) && M.raras.length === 0, 'la gestión no ha borrado nada en Google en toda la prueba' + (M.raras.length ? ': ' + M.raras.join(', ') : ''));
await pide('DELETE', `/api/doc/clientes/cgz${T}`); await pide('DELETE', `/api/doc/operarios/${op}`);
await pide('DELETE', `/api/doc/fichajes/fg1${T}`); await pide('DELETE', `/api/doc/fichajes/fg2${T}`); await pide('DELETE', `/api/doc/partes/${viejo}`);
servidor.close();
await fin(nav);
