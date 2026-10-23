// La web pública: todas las páginas en los cuatro idiomas caben en un móvil pequeño, no parten palabras,
// enseñan dónde está el vivero y cómo llegar, y el vigilante deja fuera las noticias que no interesan.
import fs from 'fs';
import { lanzar, pagina, ok, fin, IMG } from './comun.mjs';
import { interesa, vigilar } from '../web/src/noticias.js';
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

const RUTAS = ['/', '/servicios', '/vivero', '/guia', '/herramientas', '/noticias', '/contacto', '/legal'];
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
ok(!malas.length, 'las 32 páginas cargan, caben en el móvil, no parten palabras y llevan la dirección al pie' + (malas.length ? '\n      ' + malas.join('\n      ') : ''));

await p.goto(W + '/contacto');
ok(await p.locator('.datos a[href="tel:+34971563213"]').count() === 1 && await p.locator('.datos a[href*="google.com/maps"]').count() === 1 && (await p.textContent('.datos')).includes('Capdepera'),
  'contacto: teléfono para llamar, dirección y «Cómo llegar»');
await p.goto(W + '/de/vivero');
ok(await p.locator('.btn.llegar').isVisible() && (await p.textContent('.btn.llegar')).includes('Route planen'), 'vivero: botón «Cómo llegar» traducido');
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
  const kv = new Map([['noticias4', JSON.stringify({ actualizado: Date.now(), jardineria: [{ ...noticia('Ideas para un jardín mediterráneo que casi no necesita riego'), resumen: '' }, { ...noticia('El Ayuntamiento inicia la campaña de poda del arbolado urbano'), resumen: '' }], ciencia: [], baleares: [] })]]);
  const DATOS = { get: async (k) => (kv.has(k) ? JSON.parse(kv.get(k)) : null), put: async (k, v) => kv.set(k, v) };
  const fetchReal = globalThis.fetch; globalThis.fetch = async () => ({ ok: false });
  const out = await vigilar({ DATOS }); globalThis.fetch = fetchReal;
  ok(out.jardineria.length === 1 && out.jardineria[0].titulo.startsWith('Ideas para'), 'noticias: sin respuesta de Google se conserva lo guardado, ya filtrado');
}
await fin(nav);
