// Las visitas y las búsquedas sin resultado de la web llegan a la gestión (Resumen → «La web»).
// La web las apunta sin cookies y sin datos de quien entra; la gestión las lee y puede quitar búsquedas.
import fs from 'fs';
import { lanzar, pagina, ok, fin, entrarGestion, G, CLAVE, IMG } from './comun.mjs';
const W = process.env.WEB || 'http://localhost:8790';
console.log('La web en la gestión');
const nav = await lanzar();
// Un visitante con un navegador normal (el de las pruebas se anuncia como automático y no cuenta).
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const w = await pagina(nav, { userAgent: UA, viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, 'visitante');
const foto = fs.readFileSync(IMG('flor.jpg'));
await w.route('**/img/**', (r) => r.fulfill({ body: foto, contentType: 'image/jpeg' }));
await w.route('**/fonts/**', (r) => r.abort());
// Si la lectura coincide con una escritura de la web (en local comparten archivo), se reintenta.
const api = async () => {
  for (let i = 0; ; i++) {
    const d = await fetch(G + '/api/web', { headers: { 'X-Clave': CLAVE } }).then((r) => r.json()).catch(() => null);
    if ((d && d.dias) || i === 4) return d || { dias: [], busquedas: [] };
    await new Promise((ok) => setTimeout(ok, 300));
  }
};
const total = (d) => d.dias.reduce((a, x) => a + x.n, 0);
const antes = await api();
ok(Array.isArray(antes.dias) && Array.isArray(antes.busquedas), 'la gestión lee las estadísticas de la web');

for (const r of ['/', '/guia/olivo', '/guia/olivo', '/de/vivero', '/no-existe', '/ca/guia']) await w.goto(W + r);
await w.click('#lupa');
await Promise.all([w.waitForResponse((r) => r.url().endsWith('/api/busqueda')), w.fill('#bq', 'peonia azul')]);
// Hasta que la web termina de apuntar (lo hace después de responder)
let d = antes;
for (let i = 0; i < 40 && (total(d) < total(antes) + 5 || !d.busquedas.length); i++) { await w.waitForTimeout(250); d = await api(); }
const ruta = (r) => (d.paginas.find((x) => x.ruta === r) || {}).n || 0, idioma = (l) => (d.idiomas.find((x) => x.idioma === l) || {}).n || 0;
ok(total(d) === total(antes) + 5 && ruta('/guia/olivo') === 2 && ruta('/vivero') === 1 && !d.paginas.some((x) => x.ruta.includes('existe')) && idioma('de') === 1 && idioma('ca') === 1,
  'cinco páginas abiertas son cinco visitas, por página e idioma; la que no existe no cuenta');
ok(d.busquedas.length === 1 && d.busquedas[0].q === 'peonia azul' && d.busquedas[0].n === 1 && d.busquedas[0].idioma === 'ca' && Object.keys(d.busquedas[0]).sort().join() === 'idioma,n,q,ultima',
  'la planta buscada que no está en la guía queda apuntada, sin nada de quien la buscó');

const g = await pagina(nav, {}, 'gestión'); await entrarGestion(g);
await g.waitForSelector('#panel-web .st-kpis');
const kpis = await g.$$eval('#panel-web .kpi b', (bs) => bs.map((b) => b.textContent));
ok(kpis.join() === '5,5,5' && await g.locator('#panel-web .bfila[title="Ficha: olivo: 2 visitas"]').count() === 1 && await g.locator('#panel-web .bfila[title^="Alemán: 1 visita"]').count() === 1
  && await g.locator('#panel-web .col').count() === 30 && await g.locator('#panel-web .col:last-child[title$=": 5 visitas"]').count() === 1,
  'Resumen → «La web»: visitas de hoy, de la semana y del mes, por día, página, país e idioma (' + kpis.join() + ')');
ok((await g.textContent('#panel-web .rows')).includes('peonia azul') && (await g.textContent('#panel-web .rows')).includes('1 vez') && (await g.textContent('#panel-web .rows')).includes('en catalán'),
  'Resumen → «La web»: plantas que se buscan y no están');
await g.setViewportSize({ width: 360, height: 740 }); await g.waitForTimeout(200);
ok(await g.evaluate(() => { const e = document.documentElement, m = document.querySelector('main'); return e.scrollWidth <= e.clientWidth && m.scrollWidth <= m.clientWidth; }), 'móvil: el panel de la web no se sale de la pantalla');
await g.setViewportSize({ width: 1280, height: 900 });
await g.click('[data-act=quitar-busqueda]'); await g.waitForFunction(() => !document.querySelector('[data-act=quitar-busqueda]'));
ok(!(await api()).busquedas.length && (await g.textContent('#panel-web')).includes('Todavía nadie ha buscado'), 'una búsqueda que ya no interesa se quita de la lista');
await fin(nav);
