// Conexión de la gestión con la cuenta de Google de la empresa.
// Solo la gestión escribe en Google y nunca borra nada allí. Lo que alguien cambie o borre a mano en Google se vuelve
// a poner como está en la gestión (revisarGoogle). Si se borra algo en la gestión, en Google se queda: la cita, marcada
// como «ANULADO»; el contacto, tal cual.
//   · Partes de trabajo  → un calendario propio, «Trabajos Adrover».
//   · Clientes           → contactos con la etiqueta «Clientes Adrover» (nombre, teléfono, correo y dirección).
//   · Copias y PDF       → una carpeta de Drive.
//   · Horas de cada mes  → una hoja de cálculo en esa carpeta.
// Los permisos son los mínimos: Google solo deja tocar el calendario, la carpeta y la hoja que crea la gestión
// (los contactos no admiten un permiso más corto). La llave para entrar se guarda cifrada y no va en las copias.
//
// Cloudflare limita lo que cabe en una pasada (peticiones a fuera y consultas a la base), así que se trabaja por
// tandas: lo pendiente se apunta en una cola (google_cola) y cada pasada envía un trozo. Lo ya enviado se recuerda
// con su huella (google_sinc) para no repetir lo que no ha cambiado.
import { JORNADA } from '../../compartido/jornada.js';

export const VUELTA = '/google/vuelta';
// Colecciones cuyos cambios hay que llevar a Google.
export const SIGUE = ['clientes', 'partes', 'fichajes', 'operarios', 'ajustes'];
export const TIPOS_PDF = ['documentos', 'partes', 'horas'];

const PERMISOS = {
  calendario: 'https://www.googleapis.com/auth/calendar.app.created',
  contactos: 'https://www.googleapis.com/auth/contacts',
  drive: 'https://www.googleapis.com/auth/drive.file',
};
const CORREO = 'https://www.googleapis.com/auth/userinfo.email';
const ZONA = 'Europe/Madrid';
const DIAS_ATRAS = 90;      // al conectar se envían los partes de los últimos tres meses
const MAX_LLAMADAS = 36;    // peticiones a Google por pasada (el plan gratuito de Cloudflare admite 50)
const MAX_COSAS = 25, MAX_ALTAS = 12, MAX_INTENTOS = 5;
const COSTE = {evento: 3, contacto: 2, hoja: 6};
const CARPETAS = {raiz: 'Jardinería Adrover · Gestión', copias: 'Copias de seguridad', documentos: 'Presupuestos y notas', partes: 'Partes de trabajo', horas: 'Horas'};
const AVISO = 'Lo escribe la gestión de Jardinería Adrover. Lo que se cambie o se borre aquí a mano, la gestión lo vuelve a poner como estaba.';
const ANULADO = 'ANULADO · ';
const CAMPOS = 'names,phoneNumbers,emailAddresses,addresses,biographies,memberships';
const FORM = {'content-type': 'application/x-www-form-urlencoded'};

const configurado = (env) => !!(env.GOOGLE_ID && env.GOOGLE_SECRETO);
const REAL = {cuentas: 'https://accounts.google.com', oauth: 'https://oauth2.googleapis.com', api: 'https://www.googleapis.com', personas: 'https://people.googleapis.com', hojas: 'https://sheets.googleapis.com'};
// Solo para las pruebas: un Google de mentira en el propio ordenador. Cualquier otra dirección se ignora,
// para que la llave nunca pueda acabar en un servidor que no sea de Google.
const sitios = (env) => /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(env.GOOGLE_API || '')
  ? Object.fromEntries(Object.keys(REAL).map((k) => [k, env.GOOGLE_API + '/' + k])) : REAL;

// ---------- Lo que se guarda (tabla google: clave → valor) ----------
const leer = async (env) => Object.fromEntries((await env.DB.prepare('SELECT clave, valor FROM google').all()).results.map((r) => [r.clave, r.valor]));
const pon = (env, clave, valor) => env.DB.prepare('INSERT INTO google (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor').bind(clave, String(valor));
const quita = (env, claves) => env.DB.prepare(`DELETE FROM google WHERE clave IN (${claves.map(() => '?').join(',')})`).bind(...claves);
const tiene = (c, cual) => (c.permisos || '').split(',').includes(cual);
const SI_YA = ' ON CONFLICT(tipo, id) DO UPDATE SET intentos = 0, error = NULL';
const PARES = "SELECT json_extract(value, '$[0]'), json_extract(value, '$[1]') FROM json_each(?)";

// La llave de Google se guarda cifrada con el secreto de la conexión: quien vea la base de datos no puede usarla.
const b64 = (u8) => btoa(String.fromCharCode(...u8));
const deB64 = (s) => Uint8Array.from(atob(s), (ch) => ch.charCodeAt(0));
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const sha = (texto) => crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
const huellaDe = async (x) => hex(await sha(JSON.stringify(x))).slice(0, 32);
const llave = async (env) => crypto.subtle.importKey('raw', await sha('adrover-google:' + env.GOOGLE_SECRETO), 'AES-GCM', false, ['encrypt', 'decrypt']);
async function cifrar(env, texto) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  return b64(iv) + '.' + b64(new Uint8Array(await crypto.subtle.encrypt({name: 'AES-GCM', iv}, await llave(env), new TextEncoder().encode(texto))));
}
async function descifrar(env, v) {
  try {
    const [iv, c] = String(v).split('.');
    return new TextDecoder().decode(await crypto.subtle.decrypt({name: 'AES-GCM', iv: deB64(iv)}, await llave(env), deB64(c)));
  } catch { return ''; }
}

// ---------- Fechas (siempre en hora de Mallorca) ----------
const diaDe = (ts) => new Date(ts).toLocaleDateString('sv-SE', {timeZone: ZONA});
const horaDe = (ts) => new Date(ts).toLocaleTimeString('es-ES', {timeZone: ZONA, hour: '2-digit', minute: '2-digit'});
const masDias = (dia, n) => new Date(Date.parse(dia + 'T12:00:00Z') + n * 86400e3).toISOString().slice(0, 10);
const mesAnterior = (mes) => { const [a, m] = mes.split('-').map(Number); return m === 1 ? (a - 1) + '-12' : a + '-' + String(m - 1).padStart(2, '0'); };
const FECHA = /^\d{4}-\d{2}-\d{2}$/, HORA = /^\d{2}:\d{2}$/, MES = /^\d{4}-\d{2}$/;

// ---------- Entrar: permiso de la cuenta de Google ----------
export async function empezar(env, origen) {
  if (!configurado(env)) return '';
  const estado = hex(crypto.getRandomValues(new Uint8Array(24)));
  await pon(env, 'estado', estado + '|' + (Date.now() + 10 * 60e3)).run();
  return sitios(env).cuentas + '/o/oauth2/v2/auth?' + new URLSearchParams({
    client_id: env.GOOGLE_ID, redirect_uri: origen + VUELTA, response_type: 'code', access_type: 'offline', prompt: 'consent',
    scope: [...Object.values(PERMISOS), CORREO].join(' '), state: estado,
  });
}

// Lo que se pone en la cola al conectar (o al perder algo en Google): todo lo que hay en la gestión.
function todo(env, desde, tipos = ['contacto', 'evento', 'hoja']) {
  const db = env.DB, sql = [];
  if (tipos.includes('contacto')) sql.push(db.prepare("INSERT INTO google_cola (tipo, id) SELECT 'contacto', id FROM docs WHERE coleccion = 'clientes'" + SI_YA));
  if (tipos.includes('evento')) sql.push(db.prepare("INSERT INTO google_cola (tipo, id) SELECT 'evento', id FROM docs WHERE coleccion = 'partes' AND json_extract(data, '$.fecha') >= ?" + SI_YA).bind(desde));
  if (tipos.includes('hoja')) sql.push(db.prepare("INSERT INTO google_cola (tipo, id) SELECT DISTINCT 'hoja', strftime('%Y-%m', json_extract(data, '$.ts') / 1000, 'unixepoch') FROM docs WHERE coleccion = 'fichajes' AND json_extract(data, '$.ts') >= ?" + SI_YA).bind(Date.now() - 400 * 86400e3));
  return sql;
}

// Google devuelve aquí al usuario tras dar (o negar) el permiso. Devuelve una palabra para avisar en la página.
export async function volver(env, url) {
  if (!configurado(env)) return 'sin-configurar';
  const c = await leer(env), s = sitios(env);
  const [estado, caduca] = String(c.estado || '').split('|'), dado = url.searchParams.get('state') || '';
  if (!estado || dado !== estado || Date.now() > +caduca) return 'caducado';
  await quita(env, ['estado']).run(); // vale una sola vez
  const codigo = url.searchParams.get('code');
  if (!codigo) return 'rechazado';
  let t = {};
  try {
    const r = await fetch(s.oauth + '/token', {method: 'POST', headers: FORM, body: new URLSearchParams({code: codigo, client_id: env.GOOGLE_ID, client_secret: env.GOOGLE_SECRETO, redirect_uri: url.origin + VUELTA, grant_type: 'authorization_code'})});
    t = await r.json();
  } catch { return 'fallo'; }
  if (!t.refresh_token || !t.access_token) return 'fallo';
  const dados = String(t.scope || '').split(/\s+/), permisos = Object.keys(PERMISOS).filter((k) => dados.includes(PERMISOS[k]));
  if (!permisos.length) return 'sin-permisos';
  let cuenta = '';
  try { cuenta = (await (await fetch(s.api + '/oauth2/v3/userinfo', {headers: {authorization: 'Bearer ' + t.access_token}})).json()).email || ''; } catch {}
  // Con otra cuenta, el calendario, la carpeta y los contactos de antes no sirven: se empieza de cero en la nueva.
  const otra = !!c.cuenta && !!cuenta && c.cuenta !== cuenta;
  const desde = !otra && c.desde ? c.desde : masDias(diaDe(Date.now()), -DIAS_ATRAS);
  await env.DB.batch([
    pon(env, 'refresco', await cifrar(env, t.refresh_token)),
    pon(env, 'acceso', await cifrar(env, JSON.stringify({t: t.access_token, hasta: Date.now() + (Number(t.expires_in) || 3600) * 1000}))),
    pon(env, 'cuenta', cuenta), pon(env, 'permisos', permisos.join(',')), pon(env, 'desde', desde),
    pon(env, 'cursor', new Date().toISOString()),
    quita(env, ['aviso', 'ultima', 'cerrojo', ...(otra ? ['calendario', 'grupo', 'carpetas', 'hoja', 'copia'] : [])]),
    ...(otra ? [env.DB.prepare('DELETE FROM google_sinc')] : []),
    env.DB.prepare('DELETE FROM google_cola'),
    ...todo(env, desde),
  ]);
  return 'ok';
}

export async function desconectar(env) {
  const c = await leer(env);
  const refresco = await descifrar(env, c.refresco || '');
  if (refresco) await fetch(sitios(env).oauth + '/revoke', {method: 'POST', headers: FORM, body: new URLSearchParams({token: refresco})}).catch(() => {});
  // Lo ya enviado se queda en Google y se recuerda: al volver a conectar la misma cuenta no se duplica nada.
  await env.DB.batch([quita(env, ['refresco', 'acceso', 'estado', 'cerrojo', 'aviso', 'ultima']), env.DB.prepare('DELETE FROM google_cola')]);
}

// ---------- Hablar con Google ----------
class Parar extends Error {}  // algo general (sin permiso, Google ocupado): se deja la tanda y se reintenta después
class Luego extends Error {}  // esto no cabe ya en esta pasada: se queda en la cola sin contar como fallo
const motivo = (r) => String((r.j.error && (r.j.error.message || r.j.error_description)) || (typeof r.j.error === 'string' && r.j.error) || 'respuesta ' + r.estado).slice(0, 240);
function comprobar(r, que) {
  if (r.ok) return r;
  if (r.estado === 401) throw new Parar('permiso');
  if (r.estado === 429 || r.estado >= 500 || /rateLimitExceeded|RESOURCE_EXHAUSTED/i.test(JSON.stringify(r.j.error || ''))) throw new Parar('Google está ocupado; se reintentará solo.');
  const e = new Error(que + ': ' + motivo(r)); e.estado = r.estado; throw e;
}
async function g(ctx, metodo, url, cuerpo, tipo) {
  ctx.llamadas++;
  let r;
  try {
    r = await fetch(url, {method: metodo, headers: {authorization: 'Bearer ' + ctx.token, ...(cuerpo !== undefined ? {'content-type': tipo || 'application/json'} : {})},
      body: cuerpo === undefined ? undefined : tipo ? cuerpo : JSON.stringify(cuerpo)});
  } catch { throw new Parar('No se ha podido llegar a Google; se reintentará solo.'); }
  const texto = await r.text();
  let j = {};
  try { if (texto) j = JSON.parse(texto); } catch {}
  return {ok: r.ok, estado: r.status, j: j && typeof j === 'object' ? j : {}};
}
async function acceso(env, c) {
  let a = {};
  try { a = JSON.parse(await descifrar(env, c.acceso || '') || '{}'); } catch {}
  if (a.t && a.hasta > Date.now() + 60e3) return a.t;
  const refresco = await descifrar(env, c.refresco || '');
  if (!refresco) throw new Parar('Falta el permiso de Google. Vuelve a conectar la cuenta.');
  let r, t = {};
  try {
    r = await fetch(sitios(env).oauth + '/token', {method: 'POST', headers: FORM, body: new URLSearchParams({client_id: env.GOOGLE_ID, client_secret: env.GOOGLE_SECRETO, refresh_token: refresco, grant_type: 'refresh_token'})});
    t = await r.json();
  } catch { throw new Parar('No se ha podido llegar a Google; se reintentará solo.'); }
  if (t.error === 'invalid_grant') {
    // El permiso se ha retirado desde la cuenta de Google (o ha caducado): hay que volver a conectarla.
    const aviso = 'Google ha retirado el permiso. Vuelve a conectar la cuenta.';
    await env.DB.batch([quita(env, ['refresco', 'acceso']), pon(env, 'aviso', aviso)]);
    throw new Parar(aviso);
  }
  if (!t.access_token) throw new Parar('Google no ha dado paso: ' + String(t.error_description || t.error || 'respuesta ' + (r && r.status)).slice(0, 200));
  await pon(env, 'acceso', await cifrar(env, JSON.stringify({t: t.access_token, hasta: Date.now() + (Number(t.expires_in) || 3600) * 1000}))).run();
  return t.access_token;
}
const contexto = async (env, c) => ({env, c, s: sitios(env), llamadas: 0, altas: 0, sql: [], dentro: [], fuera: [], hechas: [], fallo: '', token: await acceso(env, c)});

// Lo que la gestión crea una sola vez en Google (calendario, etiqueta, carpetas, hoja): se apunta al momento.
async function recurso(ctx, clave, crear) {
  if (ctx.c[clave]) return ctx.c[clave];
  const id = await crear();
  ctx.c[clave] = id;
  await pon(ctx.env, clave, id).run();
  return id;
}
// Si algo de eso se ha borrado en Google, se olvida y se vuelve a enviar todo lo de ese tipo.
async function olvidar(ctx, clave, tipo) {
  ctx.c[clave] = '';
  await ctx.env.DB.batch([quita(ctx.env, [clave]), ctx.env.DB.prepare('DELETE FROM google_sinc WHERE tipo = ?').bind(tipo), ...todo(ctx.env, ctx.c.desde, [tipo])]);
}
const calendario = (ctx) => recurso(ctx, 'calendario', async () =>
  comprobar(await g(ctx, 'POST', ctx.s.api + '/calendar/v3/calendars', {summary: 'Trabajos Adrover', description: AVISO, timeZone: ZONA}), 'El calendario').j.id);
const grupo = (ctx) => recurso(ctx, 'grupo', async () => {
  const r = await g(ctx, 'POST', ctx.s.personas + '/v1/contactGroups', {contactGroup: {name: 'Clientes Adrover'}});
  if (r.estado !== 409) return comprobar(r, 'La etiqueta de contactos').j.resourceName;
  // Ya había una etiqueta con ese nombre: se usa esa.
  const l = comprobar(await g(ctx, 'GET', ctx.s.personas + '/v1/contactGroups?pageSize=200'), 'La etiqueta de contactos');
  const ya = (l.j.contactGroups || []).find((x) => x.name === 'Clientes Adrover');
  if (!ya) throw new Error('La etiqueta de contactos: no se ha podido crear.');
  return ya.resourceName;
});
async function carpeta(ctx, cual) {
  const ids = ctx.carpetas ||= JSON.parse(ctx.c.carpetas || '{}');
  if (ids[cual]) return ids[cual];
  const padre = cual === 'raiz' ? null : await carpeta(ctx, 'raiz');
  const r = comprobar(await g(ctx, 'POST', ctx.s.api + '/drive/v3/files?fields=id', {name: CARPETAS[cual], mimeType: 'application/vnd.google-apps.folder', ...(padre ? {parents: [padre]} : {})}), 'La carpeta de Drive');
  ids[cual] = r.j.id;
  await pon(ctx.env, 'carpetas', JSON.stringify(ids)).run();
  return ids[cual];
}
// Hace algo dentro de una carpeta; si la han borrado en Drive, la crea de nuevo y lo repite una vez.
async function enCarpeta(ctx, cual, hacer) {
  try { return await hacer(await carpeta(ctx, cual)); } catch (e) {
    if (e.estado !== 404) throw e;
    ctx.carpetas = {}; ctx.c.carpetas = '';
    await quita(ctx.env, ['carpetas']).run();
    return hacer(await carpeta(ctx, cual));
  }
}
const hojaId = (ctx) => recurso(ctx, 'hoja', async () => {
  const r = comprobar(await g(ctx, 'POST', ctx.s.hojas + '/v4/spreadsheets?fields=spreadsheetId', {
    properties: {title: 'Horas del equipo · Jardinería Adrover', locale: 'es_ES', timeZone: ZONA},
    sheets: [{properties: {title: 'Léeme'}, data: [{rowData: [{values: [{userEnteredValue: {stringValue: 'Una pestaña por mes con las horas y las horas extra de cada persona. ' + AVISO}}]}]}]}],
  }), 'La hoja de horas');
  // Se lleva a la carpeta de la gestión; si no se puede, se queda en «Mi unidad» y funciona igual.
  try { await g(ctx, 'PATCH', `${ctx.s.api}/drive/v3/files/${r.j.spreadsheetId}?addParents=${await carpeta(ctx, 'horas')}&removeParents=root&fields=id`, {}); } catch (e) { if (e instanceof Parar) throw e; }
  return r.j.spreadsheetId;
});
async function subir(ctx, {id, nombre, carpeta: dir, tipo, contenido}) {
  if (id) return g(ctx, 'PATCH', `${ctx.s.api}/upload/drive/v3/files/${id}?uploadType=media&fields=id`, contenido, tipo);
  const lim = 'adrover' + hex(crypto.getRandomValues(new Uint8Array(8)));
  const cab = `--${lim}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({name: nombre, parents: [dir]})}\r\n--${lim}\r\nContent-Type: ${tipo}\r\n\r\n`;
  return g(ctx, 'POST', ctx.s.api + '/upload/drive/v3/files?uploadType=multipart&fields=id', new Blob([cab, contenido, `\r\n--${lim}--`]), 'multipart/related; boundary=' + lim);
}
const enDrive = (ctx, dir, nombre) => g(ctx, 'GET', `${ctx.s.api}/drive/v3/files?q=${encodeURIComponent(`'${dir}' in parents and trashed = false${nombre ? ` and name = '${nombre.replace(/[\\']/g, '\\$&')}'` : ''}`)}&fields=${encodeURIComponent('files(id,name)')}&pageSize=200&orderBy=name`);

// ---------- Partes de trabajo → calendario ----------
const corta = (v, n) => String(v || '').slice(0, n);
export function cuerpoEvento(p, cli) {
  const conHoras = HORA.test(p.inicio || '') && HORA.test(p.fin || '') && p.fin > p.inicio;
  const tareas = Array.isArray(p.tareas) ? p.tareas.filter(Boolean).join(', ') : '';
  const lugar = cli ? [cli.direccion, [cli.cp, cli.poblacion].filter(Boolean).join(' ')].filter(Boolean).join(', ') : '';
  const lineas = [p.operario && 'Equipo: ' + p.operario, tareas && 'Tareas: ' + tareas, p.descripcion && 'Trabajo: ' + p.descripcion,
    Number(p.horas) > 0 && 'Horas: ' + String(p.horas).replace('.', ',')].filter(Boolean);
  return {
    summary: corta(((cli && cli.nombre) || '(sin cliente)') + (tareas ? ' · ' + tareas : ''), 300),
    ...(lugar ? {location: corta(lugar, 300)} : {}),
    description: corta(lineas.join('\n'), 4000),
    start: conHoras ? {dateTime: `${p.fecha}T${p.inicio}:00`, timeZone: ZONA} : {date: p.fecha},
    end: conHoras ? {dateTime: `${p.fecha}T${p.fin}:00`, timeZone: ZONA} : {date: masDias(p.fecha, 1)},
  };
}
async function evento(ctx, id) {
  const p = ctx.docs.partes[id], m = ctx.sinc['evento:' + id], base = () => `${ctx.s.api}/calendar/v3/calendars/${encodeURIComponent(ctx.c.calendario)}/events`;
  if (!p) { // borrado en la gestión: la cita no se borra, se marca como anulada (en gris)
    if (!m) return;
    if (ctx.c.calendario) {
      const a = await g(ctx, 'GET', base() + '/' + m.gid);
      if (a.ok && a.j.status !== 'cancelled' && !String(a.j.summary || '').startsWith(ANULADO)) comprobar(await g(ctx, 'PATCH', base() + '/' + m.gid, {summary: corta(ANULADO + (a.j.summary || ''), 300), colorId: '8'}), 'El calendario');
      else if (!a.ok && ![404, 410].includes(a.estado)) comprobar(a, 'El calendario');
    }
    ctx.fuera.push(['evento', id]);
    return;
  }
  if (!FECHA.test(p.fecha || '') || (!m && p.fecha < ctx.c.desde)) return;
  const cuerpo = cuerpoEvento(p, ctx.docs.clientes[p.clienteId]), huella = await huellaDe(cuerpo);
  if (m && m.huella === huella) return;
  await calendario(ctx);
  // El identificador de la cita sale del parte: si una pasada se corta a medias, la siguiente no la duplica.
  let gid = m ? m.gid : 'adr' + hex(await sha(id)).slice(0, 40);
  const completo = () => ({...cuerpo, id: gid, status: 'confirmed'});
  let r = await g(ctx, m ? 'PUT' : 'POST', m ? base() + '/' + gid : base(), completo());
  if (!m && r.estado === 409) r = await g(ctx, 'PUT', base() + '/' + gid, completo());
  if ([404, 409, 410].includes(r.estado)) { // la han borrado en Google: se crea otra, con otro identificador
    gid = 'adr' + hex(await sha(id + ':' + Date.now())).slice(0, 40);
    r = await g(ctx, 'POST', base(), completo());
  }
  if (r.estado === 404) { await olvidar(ctx, 'calendario', 'evento'); throw new Error('El calendario ya no está en Google: se crea de nuevo.'); }
  comprobar(r, 'El calendario');
  ctx.dentro.push(['evento', id, gid, huella, r.j.etag || '']);
}

// ---------- Clientes → contactos ----------
// Igual que en la gestión: los móviles y fijos españoles sin prefijo salen con +34; los demás, como están.
export const telefonos = (t) => String(t || '').split(/\s*[·/,;|]\s*|\s+y\s+/).map((x) => {
  const c = x.replace(/[\s.\-()]/g, '');
  return /^[6789]\d{8}$/.test(c) ? '+34 ' + c.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3') : x.trim();
}).filter((x) => /\d/.test(x)).slice(0, 5);
export function cuerpoContacto(c, etiqueta) {
  const hayDir = [c.direccion, c.cp, c.poblacion, c.provincia].some(Boolean);
  return {
    names: [{givenName: corta(c.nombre || '(sin nombre)', 200)}],
    phoneNumbers: telefonos(c.telefono).map((value) => ({value: corta(value, 40), type: 'work'})),
    emailAddresses: c.email ? [{value: corta(c.email, 200), type: 'work'}] : [],
    addresses: hayDir ? [{type: 'work', streetAddress: corta(c.direccion, 300), postalCode: corta(c.cp, 20), city: corta(c.poblacion, 100), region: corta(c.provincia, 100)}] : [],
    biographies: c.contacto ? [{value: 'Persona de contacto: ' + corta(c.contacto, 200), contentType: 'TEXT_PLAIN'}] : [],
    memberships: [{contactGroupMembership: {contactGroupResourceName: 'contactGroups/myContacts'}}, {contactGroupMembership: {contactGroupResourceName: etiqueta}}],
  };
}
const ponSinc = (env, tipo, id, gid, huella, etag) => env.DB.prepare('INSERT INTO google_sinc (tipo, id, gid, huella, etag) VALUES (?, ?, ?, ?, ?) ON CONFLICT(tipo, id) DO UPDATE SET gid = excluded.gid, huella = excluded.huella, etag = excluded.etag').bind(tipo, id, gid, huella, etag);
async function contacto(ctx, id) {
  const c = ctx.docs.clientes[id], m = ctx.sinc['contacto:' + id], P = ctx.s.personas + '/v1/';
  if (!c) { // borrado en la gestión: el contacto se queda en Google, solo se deja de seguir
    if (m) ctx.fuera.push(['contacto', id]);
    return;
  }
  const cuerpo = cuerpoContacto(c, await grupo(ctx)), huella = await huellaDe(cuerpo);
  if (m && m.huella === huella) return;
  let gid = m ? m.gid : '', etag = '';
  if (gid) {
    const a = await g(ctx, 'GET', P + gid + '?personFields=metadata');
    if (a.estado === 404) gid = ''; // lo han borrado en Google: se crea otra vez
    else {
      comprobar(a, 'El contacto');
      etag = comprobar(await g(ctx, 'PATCH', `${P}${gid}:updateContact?updatePersonFields=${CAMPOS}`, {etag: a.j.etag, ...cuerpo}), 'El contacto').j.etag || '';
    }
  }
  if (!gid) {
    if (ctx.altas >= MAX_ALTAS) throw new Luego();
    ctx.altas++;
    const r = await g(ctx, 'POST', P + 'people:createContact', cuerpo);
    if (r.estado === 400 && /contactGroup/i.test(JSON.stringify(r.j))) { ctx.c.grupo = ''; await quita(ctx.env, ['grupo']).run(); throw new Error('La etiqueta de contactos ya no está en Google: se crea de nuevo.'); }
    const nuevo = comprobar(r, 'El contacto').j;
    gid = nuevo.resourceName;
    await ponSinc(ctx.env, 'contacto', id, gid, huella, nuevo.etag || '').run(); // al momento: si la pasada se corta, no se crea dos veces
    return;
  }
  ctx.dentro.push(['contacto', id, gid, huella, etag]);
}

// ---------- Horas del mes → hoja de cálculo ----------
// La misma cuenta que hace la gestión en «Equipo → Horas extra»: lo que pasa de la jornada en un día laborable
// y todo lo trabajado en sábado, domingo o festivo. Devuelve las filas de la pestaña de ese mes.
const CAB_MES = ['Persona', 'Horas trabajadas', 'Extra en laborables', 'Extra en sábados, domingos y festivos', 'Total extra', 'Días con un fichaje de menos', 'Validadas'];
const CAB_DIA = ['Persona', 'Día', 'Entrada y salida', 'Horas', 'Extra', 'Aviso'];
export function tablaHoras(mes, operarios, fichajes, ajustes, hoy) {
  const aj = {horasDia: 8, festivos: [], ...(ajustes || {})}, festivos = Array.isArray(aj.festivos) ? aj.festivos : [];
  const horas = (ms) => Math.round(ms / 36e3) / 100;
  // Quien tiene su horario en la ficha cuenta con el suyo (compartido/jornada.js), como en la gestión.
  const ajF = {...aj, festivos};
  const porPersona = {};
  for (const f of fichajes) if (f && f.operarioId && Number(f.ts) && diaDe(f.ts).startsWith(mes)) (porPersona[f.operarioId] ||= []).push(f);
  const personas = Object.entries(operarios).filter(([id, o]) => o.activo !== false || porPersona[id])
    .sort((a, b) => String(a[1].nombre || '').localeCompare(String(b[1].nombre || ''), 'es'));
  const resumen = [], detalle = [];
  for (const [id, o] of personas) {
    const fs = (porPersona[id] || []).sort((a, b) => a.ts - b.ts), dias = {};
    for (const f of fs) (dias[diaDe(f.ts)] ||= []).push(f);
    const r = {trabajadas: 0, lab: 0, libre: 0, incompletos: 0}, c = JORNADA.tiene(o.contrato) ? o.contrato : null, libre = (dia) => !!JORNADA.libre(dia, ajF, c);
    for (const dia of Object.keys(dias).sort()) {
      const tramos = []; let ab = null, raro = false;
      for (const f of dias[dia]) {
        if (f.tipo === 'entrada') { if (ab) { raro = true; tramos.push([ab, null]); } ab = f; }
        else if (ab) { tramos.push([ab, f]); ab = null; } else { raro = true; tramos.push([null, f]); }
      }
      if (ab) { tramos.push([ab, null]); if (dia !== hoy) raro = true; }
      const ms = tramos.reduce((a, [e, s]) => a + (e && s ? s.ts - e.ts : 0), 0);
      const extra = JORNADA.extra(ms, dia, ajF, c);
      r.trabajadas += ms; r[libre(dia) ? 'libre' : 'lab'] += extra; if (raro) r.incompletos++;
      detalle.push([o.nombre || '', dia, tramos.map(([e, s]) => (e ? horaDe(e.ts) : '?') + '–' + (s ? horaDe(s.ts) : '?')).join(', '), horas(ms), horas(extra), raro ? 'Falta un fichaje' : '']);
    }
    resumen.push([o.nombre || '', horas(r.trabajadas), horas(r.lab), horas(r.libre), horas(r.lab + r.libre), r.incompletos, fs.length ? (fs.some((f) => !f.validado) ? 'No' : 'Sí') : '']);
  }
  return {filas: [CAB_MES, ...resumen, [], ['Detalle por día'], CAB_DIA, ...detalle], conFichajes: detalle.length > 0};
}
async function hoja(ctx, mes) {
  if (!MES.test(mes)) return;
  const [a, m] = mes.split('-').map(Number), db = ctx.env.DB;
  const [base, fich] = await db.batch([
    db.prepare("SELECT coleccion, id, data FROM docs WHERE coleccion = 'operarios' OR (coleccion = 'ajustes' AND id = 'jornada')"),
    db.prepare("SELECT data FROM docs WHERE coleccion = 'fichajes' AND json_extract(data, '$.ts') >= ? AND json_extract(data, '$.ts') < ?").bind(Date.UTC(a, m - 1, 1) - 2 * 86400e3, Date.UTC(a, m, 1) + 2 * 86400e3),
  ]);
  const operarios = {}; let jornada = {};
  for (const r of base.results) { if (r.coleccion === 'operarios') operarios[r.id] = JSON.parse(r.data); else jornada = JSON.parse(r.data); }
  const t = tablaHoras(mes, operarios, fich.results.map((r) => JSON.parse(r.data)), jornada, diaDe(Date.now())), sinc = ctx.sinc['hoja:' + mes];
  if (!sinc && !t.conFichajes) return; // mes sin fichajes y sin pestaña: no hay nada que enviar
  const huella = await huellaDe(t.filas);
  if (sinc && sinc.huella === huella) return;
  const id = await hojaId(ctx), H = `${ctx.s.hojas}/v4/spreadsheets/${id}`;
  const info = await g(ctx, 'GET', H + '?fields=sheets.properties.title');
  if (info.estado === 404) { await olvidar(ctx, 'hoja', 'hoja'); throw new Error('La hoja de horas ya no está en Drive: se crea de nuevo.'); }
  comprobar(info, 'La hoja de horas');
  if (!(info.j.sheets || []).some((s) => s.properties && s.properties.title === mes)) comprobar(await g(ctx, 'POST', H + ':batchUpdate', {requests: [{addSheet: {properties: {title: mes, index: 1}}}]}), 'La hoja de horas');
  comprobar(await g(ctx, 'POST', `${H}/values/${encodeURIComponent(`'${mes}'!A1:H3000`)}:clear`, {}), 'La hoja de horas');
  comprobar(await g(ctx, 'PUT', `${H}/values/${encodeURIComponent(`'${mes}'!A1`)}?valueInputOption=RAW`, {values: t.filas}), 'La hoja de horas');
  ctx.dentro.push(['hoja', mes, id, huella, '']);
}
const HACER = {evento, contacto, hoja};

// ---------- La pasada: mirar qué ha cambiado, apuntarlo en la cola y enviar un trozo ----------
async function explorar(ctx) {
  const {env, c} = ctx, cursor = c.cursor || new Date().toISOString(), LIMITE = 400;
  const [cam, bor] = await env.DB.batch([
    env.DB.prepare(`SELECT coleccion, id, data, actualizado FROM docs WHERE actualizado > ? AND coleccion IN (${SIGUE.map((x) => `'${x}'`).join(',')}) ORDER BY actualizado LIMIT ${LIMITE}`).bind(cursor),
    env.DB.prepare("SELECT coleccion, id FROM borrados WHERE cuando > ? AND coleccion IN ('clientes', 'partes', 'fichajes', 'operarios')").bind(cursor),
  ]);
  let filas = cam.results;
  if (filas.length === LIMITE) { // hay más: se deja para la próxima pasada lo del último instante, que puede venir a medias
    const ult = filas[filas.length - 1].actualizado, antes = filas.filter((r) => r.actualizado < ult);
    if (antes.length) filas = antes;
  }
  const cola = new Map(), apunta = (tipo, id) => cola.set(tipo + ':' + id, [tipo, id]), clientes = [];
  const mes = diaDe(Date.now()).slice(0, 7), meses = () => { apunta('hoja', mes); apunta('hoja', mesAnterior(mes)); };
  for (const r of filas) {
    if (r.coleccion === 'clientes') { apunta('contacto', r.id); clientes.push(r.id); }
    else if (r.coleccion === 'partes') apunta('evento', r.id);
    else if (r.coleccion === 'fichajes') { let ts = 0; try { ts = Number(JSON.parse(r.data).ts); } catch {} if (ts) apunta('hoja', diaDe(ts).slice(0, 7)); }
    else if (r.coleccion === 'operarios' || r.id === 'jornada') meses();
  }
  for (const r of bor.results) {
    if (r.coleccion === 'clientes') apunta('contacto', r.id); else if (r.coleccion === 'partes') apunta('evento', r.id); else meses();
  }
  // El cursor no pasa de hace dos minutos: lo que se esté guardando justo ahora se vuelve a mirar en la siguiente.
  const tope = new Date(Date.now() - 120e3).toISOString(), visto = filas.length ? filas[filas.length - 1].actualizado : cursor;
  let nuevo = visto < tope ? visto : tope; if (nuevo < cursor) nuevo = cursor;
  const sql = [];
  if (nuevo !== cursor || !c.cursor) sql.push(pon(env, 'cursor', nuevo));
  if (cola.size) sql.push(env.DB.prepare(`INSERT INTO google_cola (tipo, id) ${PARES} WHERE true${SI_YA}`).bind(JSON.stringify([...cola.values()])));
  // El nombre y la dirección del cliente salen en sus citas: si cambian, se rehacen.
  if (clientes.length && tiene(c, 'calendario')) sql.push(env.DB.prepare("INSERT INTO google_cola (tipo, id) SELECT 'evento', id FROM docs WHERE coleccion = 'partes' AND json_extract(data, '$.clienteId') IN (SELECT value FROM json_each(?)) AND json_extract(data, '$.fecha') >= ?" + SI_YA).bind(JSON.stringify(clientes), c.desde));
  if (sql.length) await env.DB.batch(sql);
}
async function procesar(ctx, manual) {
  const {env} = ctx, db = env.DB;
  const cosas = (await db.prepare(`SELECT tipo, id FROM google_cola ${manual ? '' : 'WHERE intentos < ' + MAX_INTENTOS} ORDER BY rowid LIMIT ${MAX_COSAS}`).all()).results;
  if (!cosas.length) return;
  const de = (t) => JSON.stringify(cosas.filter((x) => x.tipo === t).map((x) => x.id));
  const [docs, sinc] = await db.batch([
    db.prepare("SELECT coleccion, id, data FROM docs WHERE (coleccion = 'partes' AND id IN (SELECT value FROM json_each(?1))) OR (coleccion = 'clientes' AND (id IN (SELECT value FROM json_each(?2)) OR id IN (SELECT json_extract(data, '$.clienteId') FROM docs WHERE coleccion = 'partes' AND id IN (SELECT value FROM json_each(?1)))))").bind(de('evento'), de('contacto')),
    db.prepare(`SELECT tipo, id, gid, huella FROM google_sinc WHERE (tipo, id) IN (${PARES})`).bind(JSON.stringify(cosas.map((x) => [x.tipo, x.id]))),
  ]);
  ctx.docs = {partes: {}, clientes: {}}; ctx.sinc = {};
  for (const r of docs.results) ctx.docs[r.coleccion][r.id] = JSON.parse(r.data);
  for (const r of sinc.results) ctx.sinc[r.tipo + ':' + r.id] = r;
  const puede = {evento: tiene(ctx.c, 'calendario'), contacto: tiene(ctx.c, 'contactos'), hoja: tiene(ctx.c, 'drive')};
  for (const x of cosas) {
    if (ctx.llamadas + (COSTE[x.tipo] || 0) > MAX_LLAMADAS) break;
    try {
      if (puede[x.tipo]) await HACER[x.tipo](ctx, x.id);
      ctx.hechas.push([x.tipo, x.id]);
    } catch (e) {
      if (e instanceof Parar) throw e;
      if (e instanceof Luego) continue;
      ctx.fallo = String(e.message || e).slice(0, 300);
      ctx.sql.push(db.prepare('UPDATE google_cola SET intentos = intentos + 1, error = ? WHERE tipo = ? AND id = ?').bind(ctx.fallo, x.tipo, x.id));
    }
  }
}
// Lo que deja apuntado una pasada, se haya cortado o no.
function cierre(ctx) {
  const db = ctx.env.DB, sql = ctx.sql;
  if (ctx.dentro.length) sql.push(db.prepare("INSERT INTO google_sinc (tipo, id, gid, huella, etag) SELECT json_extract(value, '$[0]'), json_extract(value, '$[1]'), json_extract(value, '$[2]'), json_extract(value, '$[3]'), json_extract(value, '$[4]') FROM json_each(?) WHERE true ON CONFLICT(tipo, id) DO UPDATE SET gid = excluded.gid, huella = excluded.huella, etag = excluded.etag").bind(JSON.stringify(ctx.dentro)));
  if (ctx.fuera.length) sql.push(db.prepare(`DELETE FROM google_sinc WHERE (tipo, id) IN (${PARES})`).bind(JSON.stringify(ctx.fuera)));
  if (ctx.hechas.length) sql.push(db.prepare(`DELETE FROM google_cola WHERE (tipo, id) IN (${PARES})`).bind(JSON.stringify(ctx.hechas)));
  return sql;
}

// Cada noche se reescriben las hojas del mes en curso y del anterior: un fichaje sin salida pasa a contar como
// «falta un fichaje» al cambiar de día, y lo que alguien haya tocado a mano en la hoja vuelve a estar como en la gestión.
export async function apuntarMeses(env) {
  if (!configurado(env)) return;
  const meses = JSON.stringify([diaDe(Date.now()).slice(0, 7), mesAnterior(diaDe(Date.now()).slice(0, 7))]);
  await env.DB.batch([
    env.DB.prepare("UPDATE google_sinc SET huella = '' WHERE tipo = 'hoja' AND id IN (SELECT value FROM json_each(?))").bind(meses),
    env.DB.prepare(`INSERT INTO google_cola (tipo, id) SELECT 'hoja', value FROM json_each(?) WHERE EXISTS (SELECT 1 FROM google WHERE clave = 'refresco')${SI_YA}`).bind(meses),
  ]);
}

// Lo que alguien haya cambiado o borrado a mano en Google se vuelve a enviar como está en la gestión. Se reconoce
// por la marca (etag) que Google da a cada cita o contacto: si no es la de lo último que envió la gestión, lo ha
// tocado otro. Las citas se miran en cada pasada automática (una sola petición); los contactos, cada noche y con
// «Sincronizar ahora». Las citas que alguien añada por su cuenta al calendario no se tocan.
async function revisarGoogle(ctx, contactos) {
  const {env, c, s} = ctx, db = env.DB, vistos = {evento: [], contacto: []}; // [gid, etag] (etag null: ya no está)
  if (c.calendario && tiene(c, 'calendario')) {
    const ahora = Date.now(), desde = new Date(Math.max(Date.parse(c.revisado) || 0, ahora - 20 * 86400e3)).toISOString();
    const r = await g(ctx, 'GET', `${s.api}/calendar/v3/calendars/${encodeURIComponent(c.calendario)}/events?showDeleted=true&maxResults=2500&updatedMin=${encodeURIComponent(desde)}&fields=${encodeURIComponent('items(id,status,etag)')}`);
    if (r.estado === 404) await olvidar(ctx, 'calendario', 'evento');
    else {
      comprobar(r, 'Revisar el calendario');
      for (const x of r.j.items || []) vistos.evento.push([x.id, x.status === 'cancelled' ? null : x.etag || '']);
      await pon(env, 'revisado', new Date(ahora - 60e3).toISOString()).run();
    }
  }
  if (contactos && c.grupo && tiene(c, 'contactos')) {
    const gr = await g(ctx, 'GET', `${s.personas}/v1/${c.grupo}?maxMembers=5000`);
    if (gr.estado === 404) { ctx.c.grupo = ''; await quita(env, ['grupo']).run(); }
    else comprobar(gr, 'Revisar los contactos');
    const miembros = new Set(gr.ok ? gr.j.memberResourceNames || [] : []);
    const sinc = (await db.prepare("SELECT gid FROM google_sinc WHERE tipo = 'contacto'").all()).results.map((x) => x.gid);
    for (const gid of sinc) if (!miembros.has(gid)) vistos.contacto.push([gid, null]); // borrado o sin la etiqueta
    const mirar = sinc.filter((gid) => miembros.has(gid));
    for (let i = 0; i < mirar.length && i < 1000; i += 200) {
      const r = comprobar(await g(ctx, 'GET', `${s.personas}/v1/people:batchGet?personFields=metadata&${mirar.slice(i, i + 200).map((x) => 'resourceNames=' + encodeURIComponent(x)).join('&')}`), 'Revisar los contactos');
      for (const x of r.j.responses || []) vistos.contacto.push([x.requestedResourceName, x.person ? x.person.etag || '' : null]);
    }
  }
  // Se vuelven a enviar (huella vacía) los que no coinciden con lo último que envió la gestión.
  const sql = [];
  for (const tipo of ['evento', 'contacto']) {
    if (!vistos[tipo].length) continue;
    const malos = `SELECT s.tipo, s.id FROM google_sinc s JOIN json_each(?2) v ON s.gid = json_extract(v.value, '$[0]') WHERE s.tipo = ?1 AND (json_extract(v.value, '$[1]') IS NULL OR json_extract(v.value, '$[1]') IS NOT s.etag)`;
    sql.push(db.prepare(`INSERT INTO google_cola (tipo, id) ${malos}${SI_YA}`).bind(tipo, JSON.stringify(vistos[tipo])),
      db.prepare(`UPDATE google_sinc SET huella = '' WHERE (tipo, id) IN (${malos})`).bind(tipo, JSON.stringify(vistos[tipo])));
  }
  if (sql.length) await db.batch(sql);
}

// Una pasada. «manual» (el botón «Sincronizar ahora») reintenta también lo que había fallado varias veces.
// «revisar»: 'calendario' (las pasadas automáticas) o 'todo' (cada noche y al pulsar «Sincronizar ahora»).
export async function sincronizar(env, {manual = false, revisar = ''} = {}) {
  if (!configurado(env)) return;
  const c = await leer(env);
  if (!c.refresco) return;
  // Una sola pasada a la vez: si coinciden dos, la segunda lo deja (lo suyo lo recoge la siguiente).
  const ahora = Date.now();
  const cer = await env.DB.prepare("INSERT INTO google (clave, valor) VALUES ('cerrojo', ?1) ON CONFLICT(clave) DO UPDATE SET valor = ?1 WHERE CAST(google.valor AS INTEGER) < ?2").bind(String(ahora), ahora - 90e3).run();
  if (!cer.meta.changes) return;
  let ctx = {env, c, sql: [], dentro: [], fuera: [], hechas: [], fallo: ''}, error = '';
  try {
    ctx = await contexto(env, c);
    if (revisar) {
      try { await revisarGoogle(ctx, revisar === 'todo'); } catch (e) { if (e instanceof Parar) throw e; ctx.fallo = String(e.message || e).slice(0, 300); }
    }
    await explorar(ctx);
    await procesar(ctx, manual);
    error = ctx.fallo;
  } catch (e) {
    if (e.message === 'permiso') ctx.sql.push(quita(env, ['acceso'])); // la llave de una hora ya no vale: la próxima pasada pide otra
    else error = String(e.message || e).slice(0, 300);
  }
  await env.DB.batch([...cierre(ctx), pon(env, 'ultima', JSON.stringify({cuando: new Date().toISOString(), error})), quita(env, ['cerrojo'])]);
}

// ---------- Drive: la copia de cada noche y los PDF ----------
async function conDrive(env, hacer) {
  if (!configurado(env)) return {error: 'sin conectar'};
  const c = await leer(env);
  if (!c.refresco || !tiene(c, 'drive')) return {error: 'sin conectar'};
  try { return await hacer(await contexto(env, c)); } catch (e) { return {error: String(e.message || e).slice(0, 300)}; }
}
export const copia = (env, fecha, texto) => conDrive(env, (ctx) => enCarpeta(ctx, 'copias', async (dir) => {
  // En Drive no se borra ninguna: se quedan todas (ocupan poco). Si se hace otra el mismo día, sustituye a la de ese día.
  const nombre = `copia-${fecha}.json`, ya = (comprobar(await enDrive(ctx, dir, nombre), 'Las copias en Drive').j.files || [])[0];
  comprobar(await subir(ctx, {id: ya && ya.id, nombre, carpeta: dir, tipo: 'application/json', contenido: texto}), 'La copia en Drive');
  await pon(env, 'copia', fecha).run();
  return {ok: true};
}));
export const pdf = (env, tipo, nombre, bytes) => conDrive(env, (ctx) => enCarpeta(ctx, tipo, async (dir) => {
  const ya = (comprobar(await enDrive(ctx, dir, nombre), 'Drive').j.files || [])[0];
  comprobar(await subir(ctx, {id: ya && ya.id, nombre, carpeta: dir, tipo: 'application/pdf', contenido: bytes}), 'El PDF en Drive');
  return {ok: true};
}));

// ---------- Lo que enseña la gestión ----------
export async function estado(env, origen) {
  const base = {configurado: configurado(env), vuelta: origen + VUELTA, conectado: false};
  if (!base.configurado) return base;
  const [conf, sinc, cola] = await env.DB.batch([
    env.DB.prepare('SELECT clave, valor FROM google'),
    env.DB.prepare('SELECT tipo, COUNT(*) AS n FROM google_sinc GROUP BY tipo'),
    env.DB.prepare(`SELECT COUNT(*) AS n, COALESCE(SUM(intentos >= ${MAX_INTENTOS}), 0) AS malos, MAX(error) AS error FROM google_cola`),
  ]);
  const c = Object.fromEntries(conf.results.map((r) => [r.clave, r.valor])), n = Object.fromEntries(sinc.results.map((r) => [r.tipo, r.n]));
  let ultima = {}, carpetas = {};
  try { ultima = JSON.parse(c.ultima || '{}'); carpetas = JSON.parse(c.carpetas || '{}'); } catch {}
  const q = cola.results[0] || {n: 0, malos: 0, error: ''};
  return {
    ...base, conectado: !!c.refresco, cuenta: c.cuenta || '', aviso: c.aviso || '', desde: c.desde || '',
    permisos: Object.fromEntries(Object.keys(PERMISOS).map((k) => [k, tiene(c, k)])),
    enviados: {evento: n.evento || 0, contacto: n.contacto || 0, hoja: n.hoja || 0},
    pendientes: q.n - q.malos, conError: q.malos, error: ultima.error || (q.malos ? q.error : '') || '', ultima: ultima.cuando || '', copia: c.copia || '',
    enlaces: {
      calendario: c.calendario ? 'https://calendar.google.com/calendar/u/0/r' : '', contactos: c.grupo ? 'https://contacts.google.com/' : '',
      carpeta: carpetas.raiz ? 'https://drive.google.com/drive/folders/' + carpetas.raiz : '', hoja: c.hoja ? 'https://docs.google.com/spreadsheets/d/' + c.hoja : '',
    },
  };
}
