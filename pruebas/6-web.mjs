// La web pública: todas las páginas en los cuatro idiomas caben en un móvil pequeño, no parten palabras,
// enseñan dónde está el vivero y cómo llegar, y el vigilante deja fuera las noticias que no interesan.
import fs from 'fs';
import { lanzar, pagina, ok, fin, IMG } from './comun.mjs';
import { interesa, vigilar, ANTERIOR } from '../web/src/noticias.js';
import { FICHAS } from '../web/src/fichas.js';
import { GUIAS } from '../web/src/guias.js';
import { FOTOS_COMMONS } from '../web/src/fotos-plantas.js';
import { contarVisita, apuntarBusqueda, diaMadrid, MAX_VISITAS_DIA, MAX_BUSQUEDAS } from '../web/src/visitas.js';
import { DatabaseSync } from 'node:sqlite';
const RAIZ = new URL('..', import.meta.url);
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
const GUIAS_R = GUIAS.map((g) => '/guias/' + g.slug);
const RUTAS = ['/', '/servicios', '/vivero', '/guia', '/herramientas', '/noticias', '/contacto', '/legal', '/guia/fotos', ...GUIAS_R, ...FICHAS_R];
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
ok(!malas.length, `las ${RUTAS.length * 4} páginas (con las ${FICHAS_R.length} fichas de plantas, las ${GUIAS_R.length} guías y los créditos de las fotos) cargan, caben en el móvil, no parten palabras y llevan la dirección al pie` + (malas.length ? '\n      ' + malas.join('\n      ') : ''));

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
// La lista de plantas se retrasa a propósito (móvil con mala cobertura): mientras llega no puede decir «no está en la guía».
await p.route('**/api/plantas/*', async (r) => { await new Promise((s) => setTimeout(s, 700)); await r.continue(); });
await p.goto(W + '/');
await p.click('#lupa');
await p.fill('#bq', 'halepensis');
const prisas = await p.locator('#bres .bnada').count();
const busca = async (q) => { await p.fill('#bq', q); await p.waitForFunction(() => document.querySelector('#bres a.bitem, #bres .bnada')); return p.$$eval('#bres a.bitem', (as) => as.map((a) => new URL(a.href).pathname)); };
ok((await busca('halepensis'))[0] === '/guia/pino-carrasco' && (await busca('jazmin')).includes('/guia/jazmin-estrellado') && (await busca('lavender'))[0] === '/guia/lavanda',
  'buscador: encuentra por nombre científico, sin tildes y en otros idiomas');
ok(prisas === 0, 'buscador: con la lista aún cargando no dice que la planta no está');
await p.unroute('**/api/plantas/*');
ok((await busca('olivo centenario')).length === 0 && await p.locator('#bres a.canal.wa').count() === 1, 'buscador: si no está en la guía, ofrece preguntar por WhatsApp');
await p.keyboard.press('Escape');
ok(await p.evaluate(() => document.getElementById('buscador').hidden), 'buscador: se cierra con Escape');
// Lo que se busca y no está se avisa al servidor tras una pausa al escribir; lo que sí está, no.
await p.goto(W + '/'); await p.click('#lupa');
let avisos = 0; p.on('request', (r) => { if (r.url().endsWith('/api/busqueda')) avisos++; });
await busca('olivo'); await p.waitForTimeout(1900);
const sinAviso = avisos === 0;
const [aviso] = await Promise.all([p.waitForResponse((r) => r.url().endsWith('/api/busqueda')), busca('peonia azul')]);
ok(sinAviso && aviso.status() === 204 && JSON.parse(aviso.request().postData()).q === 'peonia azul', 'buscador: avisa de la planta que se busca y no está, y no de las que sí están');
await p.keyboard.press('Escape');

// Cabeceras de seguridad: la web solo ejecuta los scripts que escribe ella, con un número distinto en cada visita.
const c1 = await fetch(W + '/'), c2 = await fetch(W + '/herramientas'), h1 = await c1.text(), h2 = await c2.text();
const n1 = (c1.headers.get('content-security-policy') || '').match(/script-src 'nonce-(\w+)';/), n2 = (c2.headers.get('content-security-policy') || '').match(/script-src 'nonce-(\w+)';/);
ok(n1 && n2 && n1[1] !== n2[1] && [[h1, n1[1]], [h2, n2[1]]].every(([h, n]) => !h.includes('<script>') && h.includes(`<script nonce="${n}">`) && !/ on[a-z]+="/.test(h)) && c1.headers.get('strict-transport-security'),
  'la web solo ejecuta sus propios scripts y no tiene código suelto en los botones');
ok(/no-transform/.test(c1.headers.get('cache-control')) && !/https?:\/\/(?!jardineriaadrover\.es)[^"']+\.(js|css)/.test(h1), 'la portada no carga scripts ni estilos de terceros');
ok((h1.match(/<a class="guia"/g) || []).length === 3 && h1.includes('#guias') && /<footer[\s\S]*<h3>/.test(h1) && !/<footer[\s\S]*<h4>/.test(h1), 'la portada enseña tres guías y el pie lleva sus títulos en orden');
// Una dirección que no existe responde «no encontrada» (404) en su idioma y Google no la guarda.
const r404 = await fetch(W + '/no-existe'), h404 = await r404.text(), d404 = await fetch(W + '/de/guia/no-existe');
ok(r404.status === 404 && h404.includes('Esta página no existe') && h404.includes('name="robots" content="noindex"') && !h404.includes('rel="canonical"')
  && d404.status === 404 && (await d404.text()).includes('Diese Seite gibt es nicht'), 'una dirección que no existe da «no encontrada» (404), en su idioma y sin entrar en Google');
const robot = await fetch(W + '/wp-login.php'), es = await fetch(W + '/es/guia', { redirect: 'manual' });
ok(robot.status === 404 && (await robot.text()).length < 100 && es.status === 301 && es.headers.get('location').endsWith('/guia'), 'lo que prueban los robots (/wp-login.php) se despacha con una línea, y /es/guia lleva a /guia');
await p.goto(W + '/ca/no-existe');
const cabe404 = await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
await p.click('.noesta button'); await p.waitForSelector('#bq', { state: 'visible' });
ok(cabe404 && await p.getAttribute('.noesta a.btn', 'href') === '/ca' && await p.$$eval('.pidiomas a', (as) => as.map((a) => new URL(a.href).pathname).join()) === '/,/ca,/en,/de',
  'la página «no encontrada» cabe en el móvil y ofrece el inicio, el buscador y los idiomas');
await p.keyboard.press('Escape');

// Al compartir una ficha por WhatsApp sale la foto de esa planta; y lleva el camino Inicio › Guía › Planta para Google.
const olivo = await (await fetch(W + '/guia/olivo')).text(), og = olivo.match(/property="og:image" content="([^"]+)"/)[1];
const fotoOg = await fetch(W + new URL(og).pathname);
const migas = JSON.parse(olivo.match(/<script type="application\/ld\+json">(\{"@context":"https:\/\/schema\.org","@type":"BreadcrumbList".*?)<\/script>/)[1]).itemListElement;
ok(og === 'https://jardineriaadrover.es/plantas/olivo.jpg' && fotoOg.status === 200 && fotoOg.headers.get('content-type') === 'image/jpeg', 'al compartir una ficha sale la foto de la planta, en JPEG');
ok(conFoto.every((f) => fs.existsSync(new URL(`web/public/plantas/${f}.jpg`, RAIZ))), 'todas las fotos de plantas tienen su copia para compartir');
ok(migas.length === 3 && migas[1].item === 'https://jardineriaadrover.es/guia' && migas[2].name === 'Olivo' && !(await (await fetch(W + '/guia')).text()).includes('BreadcrumbList'),
  'las fichas llevan el camino Inicio › Guía › Planta para Google');

// Con el dedo, los enlaces pequeños (volver, créditos, pie, idiomas) tienen altura para acertar a la primera.
await p.goto(W + '/guia/olivo');
const bajos = await p.$$eval('.volver, .flink, .fcred a, footer .pdato, footer .penl a, footer .pidiomas a, footer .pbase a', (es) => es.filter((e) => e.getBoundingClientRect().height < 40).map((e) => e.textContent.trim().slice(0, 18)));
ok(!bajos.length, 'móvil: los enlaces pequeños se pueden pulsar bien con el dedo' + (bajos.length ? ' (bajos: ' + bajos.join(', ') + ')' : ''));
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
// Guías prácticas: índice en la Guía verde, una página por guía con sus plantas, y enlaces desde las fichas.
await p.goto(W + '/guia');
const tarjetas = await p.$$eval('#guias a.guia', (as) => as.map((a) => new URL(a.href).pathname));
ok(tarjetas.join() === GUIAS_R.join() && await p.locator('.subnav a[href="#guias"]').count() === 1, 'la Guía verde enseña las guías prácticas y las enlaza desde su barra');
await p.goto(W + '/de/guias/plantar-un-seto');
const plantasG = await p.$$eval('.fpar a.pl', (as) => as.map((a) => new URL(a.href).pathname.replace('/de', '')));
ok(await p.locator('.gpasos li').count() === 5 && await p.locator('.gres li').count() === 4 && plantasG.length === 10 && plantasG.every((r) => FICHAS_R.includes(r))
  && await p.getAttribute('.gayuda a.btn', 'href') === '/de/contacto#presupuesto' && await p.locator('.fpar a.guia').count() === 3 && (await p.textContent('h1')).includes('Hecke'),
  'cada guía tiene resumen, pasos, sus plantas con ficha, presupuesto y otras guías, en su idioma');
const htmlG = await (await fetch(W + '/guias/picudo-rojo')).text();
const datosG = [...htmlG.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
ok(datosG.some((d) => d['@type'] === 'Article' && d.headline.startsWith('Picudo rojo')) && datosG.some((d) => d['@type'] === 'BreadcrumbList' && d.itemListElement[2].item.endsWith('/guias/picudo-rojo'))
  && htmlG.includes('property="og:type" content="article"'), 'las guías llevan sus datos para Google (artículo y camino)');
await p.goto(W + '/guia/palmera-canaria');
const rg = await fetch(W + '/en/guias', { redirect: 'manual' });
ok(await p.getAttribute('.fguias a', 'href') === '/guias/picudo-rojo' && rg.status === 301 && rg.headers.get('location').endsWith('/en/guia#guias') && GUIAS_R.every((r) => mapa.includes('/ca' + r + '<')),
  'las fichas enlazan con sus guías, /guias lleva al índice y el mapa del sitio las incluye');
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
// Titulares reales que se colaron: el resumen traía «jardín» o «Mallorca» y el titular iba de otra cosa.
const nn = (titulo, fuente = 'Prueba', enlace = 'https://ejemplo.es/a') => ({ titulo, resumen: 'jardín plantas Mallorca', fuente, enlace });
ok(!interesa(nn('Plaga de ausencias en el Mallorca de cara al duelo ante el Córdoba'), 'baleares')
  && !interesa(nn('Qué ver en Valldemossa: los imprescindibles del pueblo más bonito de Mallorca'), 'baleares')
  && !interesa(nn('Parc Natural Albufera Valencia otoño actividades'), 'baleares')
  && !interesa(nn('El tiempo en Madrid: heladas y sequía en los jardines'), 'baleares')
  && interesa(nn('Las reservas de agua de Baleares suben al 37 %, pero tres zonas de Mallorca siguen en alerta por sequía'), 'baleares')
  && interesa(nn('Cuando Mallorca vio caer a sus palmeras: Se cumplen 20 años de la llegada del picudo rojo'), 'baleares'),
  'noticias de Baleares: ni fútbol, ni turismo, ni otras regiones; el sitio de las islas tiene que salir en el titular');
ok(!interesa(nn('El Puerto cerrará este miércoles parques, jardines y cementerios por el temporal'), 'jardineria')
  && !interesa(nn('Entramos en la casa de una actriz: un jardín de ensueño'), 'jardineria')
  && !interesa(nn('Vivero Sujardín: 70 años dando vida a los pies de la muralla'), 'jardineria')
  && !interesa(nn('Cómo podar el rosal en agosto para que florezca', 'Los Andes', 'https://www.losandes.com.ar/x'), 'jardineria')
  && !interesa(nn('La empresa de jardinería factura 12 millones y busca jardineros', 'Jardinería On', 'https://www.jardineriaon.com/x'), 'jardineria')
  && !interesa(nn('Oleiros se consolida como referente internacional por su gestión de zonas verdes y jardines'), 'jardineria')
  && !interesa(nn('Villa de Mazo abre un curso de poda e injerto de frutales este lunes y martes: cómo apuntarse'), 'jardineria')
  && interesa(nn('Tulipanes: 5 razones para plantarlos en noviembre'), 'jardineria')
  && interesa(nn('Cómo atraer mariposas al jardín con plantas que casi no piden riego', 'Jardinería On', 'https://www.jardineriaon.com/x'), 'jardineria'),
  'noticias de jardinería: solo consejos y plagas; fuera cierres, casas de famosos, negocios y medios de América');
ok(!interesa(nn('Why the tropics lose the most birds when cities expand'), 'ciencia')
  && !interesa(nn('Pamplona coloca plantas en las rotondas de San Jorge para medir la calidad del aire'), 'ciencia')
  && interesa(nn('Scientists discover the hidden muscles trees use to straighten themselves'), 'ciencia'),
  'noticias de ciencia: de plantas, no de animales ni de ayuntamientos');
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
// Visitas y búsquedas: con una base en memoria se comprueba qué se apunta, qué no y que los topes se respetan.
{
  const sq = new DatabaseSync(':memory:'); sq.exec(fs.readFileSync(new URL('web/schema.sql', RAIZ), 'utf8'));
  const env = { VISITAS: { prepare: (sql) => ({ sql, v: [], bind(...v) { return { sql, v }; } }), batch: async (ss) => ss.map((x) => sq.prepare(x.sql).run(...x.v)) } };
  const todo = (sql) => sq.prepare(sql).all().map((f) => ({ ...f }));
  const NAVEGADOR = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
  const pide = (cab, pais = 'DE', cuerpo) => Object.assign(new Request('https://jardineriaadrover.es/x', { method: cuerpo ? 'POST' : 'GET', body: cuerpo && JSON.stringify(cuerpo), headers: cab }), { cf: { country: pais } });
  const persona = { 'user-agent': NAVEGADOR, 'sec-fetch-dest': 'document', 'sec-fetch-mode': 'navigate' };
  await contarVisita(env, pide(persona), 'de', '/guia/olivo'); await contarVisita(env, pide(persona), 'de', '/guia/olivo'); await contarVisita(env, pide(persona, 'ES'), 'es', '/');
  await contarVisita(env, pide({ ...persona, 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }), 'es', '/');
  await contarVisita(env, pide({ ...persona, 'user-agent': 'WhatsApp/2.23.20.0' }), 'es', '/');
  await contarVisita(env, pide({ 'user-agent': NAVEGADOR }), 'es', '/'); // un programa que solo imita el navegador
  const dia = diaMadrid(), vis = todo('SELECT * FROM visitas ORDER BY ruta');
  ok(vis.length === 2 && vis[0].ruta === '/' && vis[0].n === 1 && vis[0].pais === 'ES' && vis[1].n === 2 && vis[1].idioma === 'de' && vis[1].dia === dia && Object.keys(vis[0]).sort().join() === 'dia,idioma,n,pais,ruta',
    'visitas: cuentan las personas (día, página, idioma y país, nada más) y no los robots ni las vistas previas');
  sq.prepare('UPDATE topes SET n = ? WHERE clave = ?').run(MAX_VISITAS_DIA - 1, dia + ' visitas');
  await contarVisita(env, pide(persona, 'ES'), 'es', '/'); await contarVisita(env, pide(persona, 'ES'), 'es', '/'); await contarVisita(env, pide(persona, 'ES'), 'es', '/vivero');
  ok(todo("SELECT n FROM visitas WHERE ruta = '/'")[0].n === 2 && !todo("SELECT n FROM visitas WHERE ruta = '/vivero'").length && todo('SELECT n FROM topes')[0].n === MAX_VISITAS_DIA,
    'visitas: al llegar al tope del día se deja de apuntar');

  const web = { 'user-agent': NAVEGADOR, 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' }, hay = (q) => q === 'olivo';
  const busca = (q, cab = web, l = 'de') => apuntarBusqueda(env, pide(cab, 'DE', { q, l }), ['es', 'ca', 'en', 'de'], hay);
  await busca('Peonía  Azul'); await busca('peonía azul', web, 'es'); await busca('olivo'); await busca('https://spam.example/x'); await busca('ab');
  await busca('hortensia', { ...web, 'sec-fetch-site': 'cross-site' }); await busca('hortensia', web, 'fr');
  const bus = todo('SELECT * FROM busquedas');
  ok(bus.length === 1 && bus[0].q === 'peonía azul' && bus[0].n === 2 && bus[0].idioma === 'es' && bus[0].ultima === dia,
    'búsquedas: se apunta la planta que no está (una vez por nombre), no las que están, ni enlaces, ni lo que llega de otra web');
  sq.exec(`WITH RECURSIVE c(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM c WHERE i < ${MAX_BUSQUEDAS - 1}) INSERT INTO busquedas SELECT 'planta ' || i, 'es', 1, '${dia}' FROM c`);
  await busca('hortensia'); await busca('peonía azul');
  ok(todo('SELECT count(*) AS n FROM busquedas')[0].n === MAX_BUSQUEDAS && todo("SELECT n FROM busquedas WHERE q = 'peonía azul'")[0].n === 3, 'búsquedas: con la lista llena no entran nombres nuevos, pero los apuntados siguen sumando');
}
await fin(nav);
