// Utilidades comunes de las pruebas. Las apps deben estar en marcha (lo hace pruebas/correr.sh).
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

export const G = process.env.GESTION || 'http://localhost:8788';
export const E = process.env.EQUIPO || 'http://localhost:8789';
export const CLAVE = process.env.CLAVE || 'prueba123';
export const T = Date.now() % 100000; // sufijo para que cada pasada cree nombres distintos
export const IMG = (n) => path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'ejemplos', 'imagenes', n);

let fallos = 0;
export const errores = [];
export function ok(cond, texto) { console.log((cond ? '  ✓ ' : '  ✗ FALLO: ') + texto); if (!cond) fallos++; }
export async function fin(navegador) {
  if (errores.length) { console.log('  ✗ Errores de JavaScript:', errores); fallos++; }
  await navegador.close();
  process.exit(fallos ? 1 : 0);
}
export const lanzar = () => chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
export async function pagina(nav, opciones = {}, nombre = 'página') {
  const ctx = await nav.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true, timezoneId: 'Europe/Madrid', ...opciones });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errores.push(nombre + ': ' + e.message));
  return p;
}
export const movil = { viewport: { width: 390, height: 844 }, hasTouch: true };

// Gestión: entrar con la clave
export async function entrarGestion(p) {
  await p.goto(G); await p.waitForSelector('#login:not([hidden])');
  await p.fill('#login-form [name=clave]', CLAVE); await p.click('#login-form button'); await p.waitForSelector('.kpis');
}
// Datos tal como los ve la gestión (para comprobar lo que hay en el servidor)
export async function datos() {
  return (await fetch(G + '/api/datos', { headers: { 'X-Clave': CLAVE } })).json();
}
export async function nuevoCliente(p, nombre, extra = {}) {
  await p.click('[data-view=clientes]'); await p.click('[data-act=new-clientes]');
  await p.fill('[name=nombre]', nombre);
  for (const [k, v] of Object.entries(extra)) await p.fill(`#sheet-form [name=${k}]`, v);
  await p.click('#sheet-form .btn.primary'); await p.waitForSelector('#overlay', { state: 'hidden' });
}
export async function nuevoOperario(p, nombre, rol = 'operario') {
  await p.click('[data-view=equipo]'); await p.click('[data-act=tab-equipo][data-v=personas]');
  await p.click('[data-act=new-operario]'); await p.fill('[name=nombre]', nombre); await p.selectOption('[name=rol]', rol);
  const pin = await p.inputValue('[name=pin]');
  await p.click('#sheet-form .btn.primary'); await p.waitForSelector('#overlay', { state: 'hidden' });
  return pin;
}
// App del equipo: entrar con el PIN
export async function entrarEquipo(p, pin) {
  await p.goto(E); await p.waitForSelector('#acceso:not([hidden])');
  for (const d of pin) await p.click(`[data-n="${d}"]`);
  await p.waitForSelector('#app:not([hidden])'); await p.waitForTimeout(600);
}
// Elige en un desplegable la opción cuyo texto empieza por «texto» (en la app la opción lleva también el lugar)
export async function elegir(p, selector, texto) {
  const v = await p.$eval(selector, (s, t) => { const o = [...s.options].find(x => x.text.startsWith(t)); return o ? o.value : ''; }, texto);
  await p.selectOption(selector, v);
}
