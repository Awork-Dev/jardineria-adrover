// La gestión en un móvil pequeño: las siete secciones caben, nada se sale de lo ancho de la pantalla
// y en las fichas «Guardar» está siempre a la vista. Usa los datos que dejan las pruebas anteriores.
import { lanzar, pagina, ok, fin, entrarGestion } from './comun.mjs';
console.log('Gestión en el móvil');
const nav = await lanzar();
const p = await pagina(nav, { viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true }, 'móvil');
await entrarGestion(p);
const cabe = () => p.evaluate(() => { const d = document.documentElement, m = document.querySelector('main'); return d.scrollWidth <= d.clientWidth && m.scrollWidth <= m.clientWidth; });
const ficha = () => p.evaluate(() => {
  const s = document.querySelector('#overlay .sheet'), r = s.getBoundingClientRect();
  const g = document.querySelector('#sheet-form .btn.primary').getBoundingClientRect();
  const enfocado = document.activeElement && document.activeElement.matches('input, select, textarea');
  return { cabe: r.left >= 0 && r.right <= innerWidth && s.scrollWidth <= s.clientWidth, guardar: g.top >= 0 && g.bottom <= innerHeight, enfocado };
});

ok(await p.$$eval('.side nav button', bs => bs.length === 7 && bs.every(b => { const r = b.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.height >= 44; })),
  'las siete secciones caben en la barra de abajo');
const salen = [];
for (const v of ['resumen', 'clientes', 'proveedores', 'presupuestos', 'notas', 'partes', 'equipo']) {
  await p.click(`[data-view=${v}]`); await p.waitForTimeout(150);
  if (!await cabe()) salen.push(v);
}
ok(!salen.length, 'ninguna sección se sale de lo ancho de la pantalla' + (salen.length ? ' (se salen: ' + salen.join(', ') + ')' : ''));

// La barra de abajo no se mueve: la página no se desplaza, solo el contenido (en el iPhone se descolocaba).
await p.click('[data-view=resumen]');
const quieta = await p.evaluate(async () => {
  const m = document.querySelector('main'), nav = document.querySelector('.side');
  const antes = nav.getBoundingClientRect().bottom;
  m.scrollTop = m.scrollHeight; window.scrollTo(0, 99999); await new Promise((r) => setTimeout(r, 100));
  const r = nav.getBoundingClientRect();
  return m.scrollTop > 0 && scrollY === 0 && Math.abs(r.bottom - innerHeight) < 1 && r.bottom === antes;
});
ok(quieta, 'al desplazar, solo se mueve el contenido y la barra de abajo se queda en su sitio');
await p.click('[data-view=clientes]');
ok(await p.evaluate(() => document.querySelector('main').scrollTop === 0), 'al cambiar de sección se empieza arriba');

await p.click('[data-view=presupuestos]'); await p.click('#list .row');
let f = await ficha();
ok(f.cabe && f.guardar, 'presupuesto: la ficha cabe y «Guardar» se ve sin bajar');
ok(!f.enfocado, 'al abrir una ficha no salta el teclado');
ok(await p.$eval('.line-r [name=lc]', e => e.getBoundingClientRect().width >= 200), 'el concepto de cada línea tiene sitio para escribir');
await p.click('#overlay .sheet-head [data-act=close]');

await p.click('[data-view=partes]'); await p.click('.rows .row');
f = await ficha();
ok(f.cabe && f.guardar, 'parte: la ficha cabe y «Guardar» se ve sin bajar');
await p.click('#overlay .sheet-head [data-act=close]');

await p.click('.ay-btn');
ok(await p.$$eval('.ay-indice a', as => { const t = as.map(a => a.getBoundingClientRect()); return t.length > 1 && t[1].left - t[0].right < 20; }), 'el índice de la ayuda sale seguido, no repartido');
// Icono dorado al añadirla a la pantalla de inicio: la dirección lleva versión para que el móvil no use uno viejo guardado.
const G = process.env.GESTION || 'http://localhost:8788';
const ico = await p.getAttribute('link[rel=apple-touch-icon]', 'href'), man = await p.getAttribute('link[rel=manifest]', 'href');
const m = await (await fetch(G + man)).json(), r = await fetch(G + ico);
ok(/[?]v=\d+$/.test(ico) && r.ok && r.headers.get('content-type') === 'image/png' && m.theme_color === '#b8862f' && m.icons.every((i) => /[?]v=\d+$/.test(i.src)),
  'icono de la pantalla de inicio: dorado y con versión en la dirección');
await fin(nav);
