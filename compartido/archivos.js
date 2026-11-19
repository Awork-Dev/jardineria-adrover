// Documentos del personal (contratos, DNI, Seguridad Social, nóminas, justificantes…): se guardan en la base D1,
// que está en la Unión Europea, no en el KV de las fotos (global). D1 no admite filas de más de 2 MB, así que cada
// archivo va troceado en la tabla «archivos» (en base64). Los datos de cada uno (de quién es, qué es, nombre…)
// están en la colección «documentos». No van en las copias nocturnas; D1 guarda además 30 días de historial.
export const MAX_ARCHIVO = 15 * 1024 * 1024;
const TROZO = 600 * 1024;
export const TIPOS_DOC = ['contrato', 'dni', 'ss', 'nomina', 'justificante', 'otro'];
export const MIMES_DOC = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

let lista = false;
export async function tablaArchivos(env) {
  if (lista) return;
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS archivos (id TEXT NOT NULL, parte INTEGER NOT NULL, datos TEXT NOT NULL, PRIMARY KEY (id, parte))').run();
  lista = true;
}
const aB64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
const deB64 = (t) => { const s = atob(t), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; };

export async function guardarArchivo(env, id, bytes) {
  await tablaArchivos(env);
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes), ops = [env.DB.prepare('DELETE FROM archivos WHERE id = ?').bind(id)];
  for (let i = 0, n = 0; i < u8.length; i += TROZO, n++) ops.push(env.DB.prepare('INSERT INTO archivos (id, parte, datos) VALUES (?, ?, ?)').bind(id, n, aB64(u8.subarray(i, i + TROZO))));
  // De uno en uno: cada trozo ocupa unos 800 KB y D1 limita lo que se manda en una sola petición.
  for (const op of ops) await op.run();
}
export async function leerArchivo(env, id) {
  await tablaArchivos(env);
  const {results} = await env.DB.prepare('SELECT datos FROM archivos WHERE id = ? ORDER BY parte').bind(id).all();
  if (!results.length) return null;
  const trozos = results.map((r) => deB64(r.datos)), out = new Uint8Array(trozos.reduce((a, t) => a + t.length, 0));
  let p = 0; for (const t of trozos) { out.set(t, p); p += t.length; }
  return out;
}
export async function borrarArchivo(env, id) {
  await tablaArchivos(env);
  await env.DB.prepare('DELETE FROM archivos WHERE id = ?').bind(id).run();
}
export async function huella(bytes) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map((b) => b.toString(16).padStart(2, '0')).join('');
}
export const respuestaArchivo = (bytes, d, descargar) => new Response(bytes, {headers: {
  'content-type': MIMES_DOC.includes(d.mime) ? d.mime : 'application/octet-stream', 'cache-control': 'private, no-store',
  'content-disposition': (descargar ? 'attachment' : 'inline') + "; filename*=UTF-8''" + encodeURIComponent(d.nombre || 'documento'),
  'x-content-type-options': 'nosniff', 'content-security-policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
}});

// ---------- Nóminas que llegan por correo ----------
// Se lee el correo (MIME) a mano: solo hace falta sacar los PDF adjuntos.
const decQP = (t) => t.replace(/=\r?\n/g, '').replace(/=([0-9A-F]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
function palabraMIME(t) {
  return String(t || '').replace(/=\?([^?]+)\?([BQ])\?([^?]*)\?=/gi, (_, cs, enc, txt) => {
    try {
      const bin = enc.toUpperCase() === 'B' ? atob(txt) : decQP(txt.replace(/_/g, ' '));
      return new TextDecoder(cs.toLowerCase().includes('8859') ? 'latin1' : 'utf-8').decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
    } catch { return txt; }
  }).replace(/\?=\s+=\?/g, '');
}
function cabeceras(bloque) {
  const h = {};
  for (const l of bloque.replace(/\r?\n[ \t]+/g, ' ').split(/\r?\n/)) { const m = l.match(/^([\w-]+):\s*(.*)$/); if (m) h[m[1].toLowerCase()] = m[2]; }
  return h;
}
const param = (v, k) => { const m = String(v || '').match(new RegExp(k + '\\*?=(?:"([^"]*)"|([^;\\s]*))', 'i')); return m ? palabraMIME(decodeURIComponent((m[1] ?? m[2]).replace(/^utf-8''/i, ''))) : ''; };
// Devuelve el asunto y los adjuntos PDF: [{nombre, bytes}]. «crudo» es el correo entero como texto latin1.
export function adjuntosPDF(crudo) {
  const corte = crudo.search(/\r?\n\r?\n/), cab = cabeceras(crudo.slice(0, corte));
  const out = {asunto: palabraMIME(cab.subject || ''), de: cab.from || '', pdfs: []};
  const recorrer = (h, cuerpo) => {
    const tipo = h['content-type'] || 'text/plain', limite = param(tipo, 'boundary');
    if (/^multipart\//i.test(tipo) && limite) {
      for (const parte of cuerpo.split('--' + limite).slice(1)) {
        if (parte.startsWith('--')) break;
        const p = parte.replace(/^\r?\n/, ''), c = p.search(/\r?\n\r?\n/);
        if (c < 0) continue;
        recorrer(cabeceras(p.slice(0, c)), p.slice(c).replace(/^\r?\n\r?\n/, ''));
      }
      return;
    }
    const nombre = param(h['content-disposition'], 'filename') || param(tipo, 'name');
    if (!/application\/pdf/i.test(tipo) && !/\.pdf$/i.test(nombre)) return;
    let bin = cuerpo;
    const enc = (h['content-transfer-encoding'] || '').toLowerCase();
    if (enc === 'base64') bin = atob(cuerpo.replace(/[^A-Za-z0-9+/=]/g, ''));
    else if (enc === 'quoted-printable') bin = decQP(cuerpo);
    out.pdfs.push({nombre: nombre || 'nomina.pdf', bytes: Uint8Array.from(bin, (c) => c.charCodeAt(0))});
  };
  recorrer(cab, crudo.slice(corte).replace(/^\r?\n\r?\n/, ''));
  return out;
}
// Quita acentos y mayúsculas para comparar nombres.
export const normal = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_CA = ['gener', 'febrer', 'marc', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'];
// Mes de la nómina a partir del nombre del archivo o del asunto: «2026-10», «10/2026», «202610», «octubre 2026»…
export function mesDe(texto, hoy = new Date()) {
  const t = normal(texto).replace(/ /g, ' ');
  let m = t.match(/\b(20\d\d)\s?(0[1-9]|1[0-2])\b/) || null;
  if (m) return m[1] + '-' + m[2];
  m = t.match(/\b(0?[1-9]|1[0-2])\s(20\d\d)\b/);
  if (m) return m[2] + '-' + String(m[1]).padStart(2, '0');
  for (const lista of [MESES, MESES_CA]) for (let i = 0; i < 12; i++) {
    const r = t.match(new RegExp('\\b' + lista[i] + '\\b(?:\\s(?:de\\s)?(20\\d\\d))?'));
    if (r) {
      // Sin año: el de ese mes más reciente que no esté en el futuro.
      const y = r[1] ? +r[1] : (i <= hoy.getMonth() ? hoy.getFullYear() : hoy.getFullYear() - 1);
      return y + '-' + String(i + 1).padStart(2, '0');
    }
  }
  return '';
}
// A quién es: la persona cuyo nombre (y, si lo hay, primer apellido) sale en el texto. Si encajan varias, nadie.
export function quienEs(texto, operarios) {
  const t = ' ' + normal(texto) + ' ';
  const cand = Object.entries(operarios).filter(([, o]) => {
    const ps = normal(o.nombre).split(' ').filter((p) => p.length > 1);
    return ps.length && ps.slice(0, Math.min(2, ps.length)).every((p) => t.includes(' ' + p + ' '));
  });
  return cand.length === 1 ? cand[0][0] : '';
}
