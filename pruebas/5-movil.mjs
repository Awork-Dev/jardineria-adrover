// La gestión en un móvil pequeño: las siete secciones caben, nada se sale de lo ancho de la pantalla
// y en las fichas «Guardar» está siempre a la vista. Usa los datos que dejan las pruebas anteriores.
import { lanzar, pagina, ok, fin, entrarGestion } from './comun.mjs';
console.log('Gestión en el móvil');
const nav = await lanzar();
const p = await pagina(nav, { viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true }, 'móvil');
await entrarGestion(p);
const cabe = () => p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
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
await fin(nav);
