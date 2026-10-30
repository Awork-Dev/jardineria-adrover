// La web pública: todas las páginas en los cuatro idiomas caben en un móvil pequeño, no parten palabras,
// enseñan dónde está el vivero y cómo llegar, y el vigilante deja fuera las noticias que no interesan.
import fs from 'fs';
import { lanzar, pagina, ok, fin, IMG } from './comun.mjs';
import { interesa, vigilar, ANTERIOR } from '../web/src/noticias.js';
import { FICHAS } from '../web/src/fichas.js';
import { FOTOS_COMMONS } from '../web/src/fotos-plantas.js';
const W = process.env.WEB || 'http://localhost:8790';
console.log('Web pública');
const nav = await lanzar();
const p = await pagina(nav, { viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true }, 'web');
// Sin salir a internet: una foto de ejemplo en lugar de las de Google Drive, letra del sistema y noticias de muestra.
const foto = fs.readFileSync(IMG('flor.jpg'));
await p.route('**/img/**', (r) => r.fulfill({ body: foto, contentType: 'image/jpeg' }));
await p.route('**/fonts/**', (r) => r.abort());
const noticia = (titulo) => ({ titulo, enlace: 'https://example.com/' + encodeURIComponent(titulo), fuente: 'Prueba', resumen: '', fecha: Date.now() });
await p.route('**/api/noticias', (r) => r.fulfill({ json: { actualizado: Date.now(), jardineria: [noticia('Cómo preparar el jardín para el otoño en cinco pasos')], ciencia: [noticia('Plants talk to each other through roots')], baleares: [noticia('Mallorca recupera variedades antiguas de almendro')] } }));

const FICHAS_R = Object.values(FICHAS).map((f) => '/guia/' + f.ficha);
const RUTAS = ['/', '/servicios', '/vivero', '/guia', '/herramientas', '/noticias', '/contacto', '/legal', '/guia/fotos', ...FICHAS_R];
const malas = [];
for (const l of ['es', 'ca', 'en', 'de']) for (const r of RUTAS) {
  const ruta = (l === 'es' ? '' : '/' + l) + (r === '/' && l !== 'es' ? '' : r);
  const res = await p.goto(W + (ruta || '/'));
  const v = await p.evaluate(() => ({
    h1: document.querySelectorAll('h1').length,
    cabe: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    guion: [...document.querySelectorAll('h1, h2, h3, p, li')].some((e) => getComputedStyle(e).hyphens === 'auto'),
    mapa: !!document.querySelector('footer a[href*="google.com/maps"]'),
  }));
  const fallo = [res.status() !== 200 && 'estado ' + res.status(), v.h1 !== 1 && v.h1 + ' títulos', !v.cabe && 'se sale', v.guion && 'parte palabras', !v.mapa && 'sin dirección al pie'].filter(Boolean);
  if (fallo.length) malas.push((ruta || '/') + ': ' + fallo.join(', '));
}
ok(!malas.length, `las ${RUTAS.length * 4} páginas (con las ${FICHAS_R.length} fichas de plantas y los créditos de las fotos) cargan, caben en el móvil, no parten palabras y llevan la dirección al pie` + (malas.length ? '\n      ' + malas.join('\n      ') : ''));

await p.goto(W + '/contacto');
ok(await p.locator('.datos a[href="tel:+34971563213"]').count() === 1 && await p.locator('.datos a[href*="google.com/maps"]').count() === 1 && (await p.textContent('.datos')).includes('Capdepera'),
  'contacto: teléfono para llamar, dirección y «Cómo llegar»');
ok((await p.textContent('.datos')).includes('+34 971 563 213') && (await p.textContent('footer.pie2')).includes('+34 971 563 213') && (await p.textContent('footer.pie2')).includes('+34 626 900 428'),
  'los teléfonos se ven con el +34 (para clientes con móvil extranjero)');
await p.goto(W + '/de/vivero');
ok(await p.locator('.btn.llegar').isVisible() && (await p.textContent('.btn.llegar')).includes('Route planen'), 'vivero: botón «Cómo llegar» traducido');
await p.goto(W + '/guia');
const enlaces = await p.$$eval('.plantas a.pl', (as) => as.map((a) => new URL(a.href).pathname));
ok(enlaces.length === FICHAS_R.length && FICHAS_R.every((r) => enlaces.includes(r)), 'la guía enlaza cada planta con su ficha');
// «Ideas para…»: cada selección deja solo las plantas que valen para eso, también desde la dirección (?uso=).
const usoDe = (u) => Object.values(FICHAS).filter((f) => f.usos.includes(u)).length;
await p.click('.idea[data-uso=costa]');
const vis = () => p.$$eval('.plantas .pl:not([hidden])', (as) => as.map((a) => a.dataset.usos));
let v = await vis();
ok(v.length === usoDe('costa') && v.every((x) => x.split(' ').includes('costa')), 'ideas: «Jardines junto al mar» deja solo esas plantas');
await p.click('.idea[data-uso=costa]');
ok((await vis()).length === FICHAS_R.length, 'ideas: al pulsar otra vez se ven todas');
await p.selectOption('#ft', 'palmera');
v = await p.$$eval('.plantas .pl:not([hidden])', (as) => as.map((a) => a.dataset.tipo));
ok(v.length === Object.values(FICHAS).filter((f) => f.tipo === 'palmera').length && v.every((x) => x === 'palmera'), 'filtro por tipo de planta');
await p.goto(W + '/en/guia?uso=interior#plantas'); v = await vis();
ok(v.length === usoDe('interior') && await p.getAttribute('.idea[data-uso=interior]', 'aria-pressed') === 'true', 'ideas: la ficha enlaza con la guía ya filtrada');
ok(await p.locator('.mes[data-m="9"] .mesp a.chip').count() > 0, 'cada mes dice qué florece, qué plantar y qué podar, con enlace a la ficha');
await p.goto(W + '/contacto');
await p.fill('#fpre [name=nombre]', 'Ana'); await p.selectOption('#fpre [name=para]', { index: 1 });
const texto = await p.evaluate(() => ptxt());
ok(await p.locator('#fpre [name=para] option').count() === 4 && texto.includes('¿Para quién es? Una comunidad de vecinos'), 'presupuesto: pregunta para quién es y lo pone en el mensaje');
// Fotos de Commons: cada ficha con foto la carga desde la propia web y cita autor y licencia; hay página de créditos.
const conFoto = Object.keys(FOTOS_COMMONS);
const sinCargar = [];
for (const k of conFoto) {
  await p.goto(W + '/guia/' + k);
  const bien = await p.evaluate(async () => { const i = document.querySelector('.fimg img'); if (!i) return false; if (!i.complete) await new Promise((r) => { i.onload = i.onerror = r; }); return i.naturalWidth > 0 && !!document.querySelector('.fcred a[href*="commons.wikimedia.org"]'); });
  if (!bien) sinCargar.push(k);
}
ok(conFoto.length > 0 && !sinCargar.length, `las ${conFoto.length} fichas con foto la enseñan con su autor y licencia` + (sinCargar.length ? ': fallan ' + sinCargar.join(', ') : ''));
await p.goto(W + '/guia/fotos');
ok(await p.locator('.creditos li').count() === conFoto.length, 'la página de créditos cita todas las fotos');
// Buscador de plantas: por nombre común en cualquier idioma o científico, sin tildes; si no está, ofrece preguntar.
await p.goto(W + '/');
await p.click('#lupa');
const busca = async (q) => { await p.fill('#bq', q); await p.waitForFunction(() => document.querySelector('#bres').textContent.trim() !== ''); return p.$$eval('#bres a.bitem', (as) => as.map((a) => new URL(a.href).pathname)); };
ok((await busca('halepensis'))[0] === '/guia/pino-carrasco' && (await busca('jazmin')).includes('/guia/jazmin-estrellado') && (await busca('lavender'))[0] === '/guia/lavanda',
  'buscador: encuentra por nombre científico, sin tildes y en otros idiomas');
ok((await busca('olivo centenario')).length === 0 && await p.locator('#bres a.canal.wa').count() === 1, 'buscador: si no está en la guía, ofrece preguntar por WhatsApp');
await p.keyboard.press('Escape');
ok(await p.evaluate(() => document.getElementById('buscador').hidden), 'buscador: se cierra con Escape');
// La sección del menú en la que se está se distingue con fondo propio, arriba sobre la foto y con la cabecera clara.
await p.setViewportSize({ width: 1280, height: 800 }); await p.goto(W + '/vivero');
const fondo = () => p.$eval('header nav > a.on', (a) => getComputedStyle(a).backgroundColor);
const f1 = await fondo(); await p.evaluate(() => { scrollTo(0, 900); dispatchEvent(new Event('scroll')); }); await p.waitForTimeout(400); const f2 = await fondo();
ok(f1 !== 'rgba(0, 0, 0, 0)' && f2 !== 'rgba(0, 0, 0, 0)' && f1 !== f2, 'menú: la sección actual se ve sobre la foto y con la cabecera clara');
await p.setViewportSize({ width: 360, height: 740 });
// Calendario de la ficha en un iPhone pequeño (375 px): el nombre de cada fila no se monta sobre la primera casilla.
await p.setViewportSize({ width: 375, height: 740 });
const montados = [];
for (const r of ['/guia/algarrobo', '/ca/guia/flor-de-pascua', '/de/guia/monstera', '/en/guia/romero']) {
  await p.goto(W + r);
  if (await p.$$eval('.calg .cfila', (fs) => fs.some((f) => f.querySelector('.crot').getBoundingClientRect().right > f.querySelector('.crot + *').getBoundingClientRect().left + 0.5))) montados.push(r);
}
// La columna de nombres tiene ancho fijo en la rejilla (en el iPhone, con tabla, el nombre se montaba sobre la primera casilla).
ok(!montados.length && await p.$eval('.calg .cfila:nth-child(2) .crot', (c) => c.getBoundingClientRect().width >= 80), 'calendario: en un móvil de 375 px el nombre de la fila no pisa las casillas' + (montados.length ? ': ' + montados.join(', ') : ''));
await p.setViewportSize({ width: 360, height: 740 });
await p.goto(W + '/ca/guia/romero');
ok(await p.locator('.calg .cc.on').count() > 0 && (await p.getAttribute('.fhead a.canal.wa', 'href')).includes(encodeURIComponent('Salvia rosmarinus')),
  'ficha: calendario y botón de WhatsApp con el nombre de la planta');
await p.goto(W + '/');
const pm = await p.getAttribute('.pm-acc a.lnk', 'href');
ok(FICHAS_R.includes(pm), 'la planta del mes enlaza con su ficha');
const mapa = await (await fetch(W + '/sitemap.xml')).text();
ok(FICHAS_R.every((r) => mapa.includes('/de' + r + '<')), 'el mapa del sitio incluye las fichas en los cuatro idiomas');
await p.goto(W + '/noticias'); await p.waitForSelector('#lista a.n', { timeout: 5000 }).catch(() => {});
ok((await p.textContent('#lista')).includes('preparar el jardín'), 'la página de noticias pinta lo que da el vigilante');

const n = (titulo) => ({ titulo, resumen: '', fuente: 'Prueba' });
ok(!interesa(n('El Ayuntamiento inicia la campaña de poda del arbolado urbano'), 'jardineria')
  && !interesa(n('Marbella repite la privatización del servicio de poda y tala de árboles'), 'jardineria')
  && interesa(n('Qué son los jardines de lluvia y cómo ayudan a proteger las casas'), 'jardineria'),
  'noticias: fuera las campañas y contratos de los ayuntamientos, dentro las ideas para el jardín');
ok(interesa(n('Sant Lluís será el primer municipio de Menorca en restringir el uso de césped en todos los jardines'), 'baleares')
  && !interesa(n('SAMPOL invierte cerca de 20M€ en dos plantas solares con baterías en Mallorca'), 'baleares'),
  'noticias de Baleares: sí las normas de riego y césped, no las «plantas» solares');
// Si Google News no responde justo al cambiar el filtro, no se pierde lo que ya había guardado.
{
  const kv = new Map([[ANTERIOR, JSON.stringify({ actualizado: Date.now(), jardineria: [{ ...noticia('Ideas para un jardín mediterráneo que casi no necesita riego'), resumen: '' }, { ...noticia('El Ayuntamiento inicia la campaña de poda del arbolado urbano'), resumen: '' }], ciencia: [], baleares: [] })]]);
  const DATOS = { get: async (k) => (kv.has(k) ? JSON.parse(kv.get(k)) : null), put: async (k, v) => kv.set(k, v) };
  const fetchReal = globalThis.fetch; globalThis.fetch = async () => ({ ok: false });
  const out = await vigilar({ DATOS }); globalThis.fetch = fetchReal;
  ok(out.jardineria.length === 1 && out.jardineria[0].titulo.startsWith('Ideas para'), 'noticias: sin respuesta de Google se conserva lo guardado, ya filtrado');
}
// Si Google News deja de responder (a veces pasa desde Cloudflare), entran noticias de Bing y de webs de jardinería;
// el enlace de Bing se cambia por el de la noticia y en Baleares solo quedan las que nombran las islas.
{
  const rss = (items) => `<?xml version="1.0"?><rss><channel>${items.map(([t, l, d = '']) => `<item><title>${t}</title><link>${l}</link><description>${d}</description><pubDate>${new Date().toUTCString()}</pubDate></item>`).join('')}</channel></rss>`;
  const bing = (u) => 'http://www.bing.com/news/apiclick.aspx?ref=FexRss&amp;url=' + encodeURIComponent(u) + '&amp;mkt=es-es';
  const fetchReal = globalThis.fetch;
  globalThis.fetch = async (u) => {
    u = String(u);
    if (u.includes('news.google.com')) return new Response('', { status: 503 });
    if (u.includes('jardineriaon.com')) return new Response(rss([['Cómo cuidar la monstera en otoño sin que amarilleen sus hojas', 'https://www.jardineriaon.com/monstera-otono.html']]));
    if (u.includes('bing.com') && u.includes('Mallorca')) return new Response(rss([['Sóller recupera sus huertos de naranjos con riego eficiente', bing('https://ejemplo.es/soller'), 'Mallorca'], ['La horchata, en peligro por una plaga en Valencia', bing('https://ejemplo.es/horchata'), 'plaga en los cultivos']]));
    if (u.includes('bing.com')) return new Response(rss([['Qué plantas aguantan mejor la sequía en el jardín', bing('https://ejemplo.es/sequia')]]));
    return new Response('', { status: 503 });
  };
  const kv = new Map(); const DATOS = { get: async (k) => (kv.has(k) ? JSON.parse(kv.get(k)) : null), put: async (k, v) => kv.set(k, v) };
  const out = await vigilar({ DATOS }); globalThis.fetch = fetchReal;
  ok(out.jardineria.some((n) => n.enlace === 'https://ejemplo.es/sequia') && out.jardineria.some((n) => n.fuente === 'Jardinería On'),
    'noticias: sin Google entran las de Bing (con el enlace de la noticia) y las de webs de jardinería');
  ok(out.baleares.length === 1 && out.baleares[0].titulo.startsWith('Sóller') && out.fuentes.baleares.some((f) => f.includes('503')),
    'noticias de Baleares desde Bing: solo las que nombran las islas, y se apunta qué fuente falla');
}
await fin(nav);
