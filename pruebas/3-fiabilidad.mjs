// Fiabilidad de la sincronización: cortes de red, respuestas perdidas, servidor caído, rechazos,
// dos personas en el mismo móvil, dos ventanas, reloj del móvil desajustado y correcciones de la oficina.
import { lanzar, pagina, ok, fin, T, IMG, movil, entrarGestion, nuevoCliente, nuevoOperario, entrarEquipo, datos, elegir } from './comun.mjs';
console.log('Fiabilidad de la sincronización');
const nav = await lanzar();
const g = await pagina(nav, {}, 'gestión'); await entrarGestion(g);
const cli = 'Fiabilidad ' + T; await nuevoCliente(g, cli);
const ana = 'Ana ' + T, bea = 'Bea ' + T, jefe = 'JefeF ' + T;
const pin = {[ana]: await nuevoOperario(g, ana), [bea]: await nuevoOperario(g, bea), [jefe]: await nuevoOperario(g, jefe, 'jefe')};
const fichajes = async (n) => Object.values((await datos()).fichajes || {}).filter(f => f.operario === n).length;
const salir = async (p) => { p.once('dialog', d => d.accept()); await p.click('#salir'); await p.waitForSelector('#acceso:not([hidden])'); };

const ctx = await nav.newContext(movil); const m = await ctx.newPage();
await entrarEquipo(m, pin[ana]);
// A. Corte de red al enviar
await m.route('**/api/fichar', r => r.abort('internetdisconnected'));
await m.click('#fichar'); await m.waitForTimeout(800);
ok(await m.isVisible('#cola') && await fichajes(ana) === 0, 'A. sin red el fichaje queda guardado en el móvil');
await m.unroute('**/api/fichar'); await m.click('#sincronizar'); await m.waitForTimeout(1200);
ok(!(await m.isVisible('#cola')) && await fichajes(ana) === 1, 'A. al volver la red se envía');
// B. Respuesta perdida y reenvío
let primera = true;
await m.route('**/api/fichar', async r => { if (primera) { primera = false; await r.fetch(); return r.abort('connectionreset'); } return r.continue(); });
await m.click('#fichar'); await m.waitForTimeout(800); await m.click('#sincronizar'); await m.waitForTimeout(1200); await m.unroute('**/api/fichar');
ok(await fichajes(ana) === 2, 'B. respuesta perdida: al reenviar no se duplica');
// C. Servidor caído
let caidas = 2;
await m.route('**/api/fichar', r => caidas-- > 0 ? r.fulfill({ status: 500, body: '{}' }) : r.continue());
await m.click('#fichar'); await m.waitForTimeout(600); await m.click('#sincronizar'); await m.waitForTimeout(600);
ok(await m.isVisible('#cola') && !(await m.isVisible('#fallidos')), 'C. servidor caído: sigue pendiente, no se descarta');
await m.click('#sincronizar'); await m.waitForTimeout(1000); await m.unroute('**/api/fichar');
ok(await fichajes(ana) === 3, 'C. cuando el servidor vuelve, se guarda');
// D. Rechazo visible y reintento
let rechazo = true;
await m.route('**/api/gastos', r => { if (rechazo) { rechazo = false; return r.fulfill({ status: 400, contentType: 'application/json', body: '{"error":"Prueba de rechazo"}' }); } return r.continue(); });
await m.click('#nuevo-gasto'); await m.setInputFiles('#hoja-gasto input[type=file]', IMG('ticket-material.jpg')); await m.waitForSelector('#hoja-gasto .miniaturas img');
await m.fill('#hoja-gasto [name=importe]', '12,5'); await m.click('#hoja-gasto .btn.lima'); await m.waitForTimeout(2000);
ok(await m.isVisible('#fallidos') && (await m.textContent('#fallidos')).includes('Prueba de rechazo'), 'D. un rechazo se ve con su motivo y no se tira');
await m.click('#reintentar'); await m.waitForTimeout(2000); await m.unroute('**/api/gastos');
ok(!(await m.isVisible('#fallidos')) && Object.values((await datos()).gastos || {}).some(x => x.operario === ana && x.importe === 12.5), 'D. al reintentar llega con su foto');
// E. Dos personas en el mismo móvil
await ctx.setOffline(true); await m.click('#fichar'); await m.waitForTimeout(400); await salir(m);
await ctx.setOffline(false); await entrarEquipo(m, pin[bea]);
ok(!(await m.isVisible('#cola')) && await fichajes(ana) === 3 && await fichajes(bea) === 0, 'E. entra Bea: lo pendiente de Ana se aparta');
await m.click('#fichar'); await m.waitForTimeout(1000); await salir(m); await entrarEquipo(m, pin[ana]); await m.waitForTimeout(1500);
ok(await fichajes(ana) === 4 && await fichajes(bea) === 1, 'E. vuelve Ana: lo suyo se envía a su nombre');
// F. Dos ventanas sin cobertura
const m2 = await ctx.newPage(); await m2.goto(m.url()); await m2.waitForSelector('#app:not([hidden])');
await ctx.setOffline(true);
await m.click('#fichar'); await m.waitForTimeout(300); await m2.click('#fichar'); await m2.waitForTimeout(300); await m.click('#fichar'); await m.waitForTimeout(300);
await ctx.setOffline(false); await m.evaluate(() => dispatchEvent(new Event('online'))); await m2.evaluate(() => dispatchEvent(new Event('online'))); await m.waitForTimeout(2500);
ok(await fichajes(ana) === 7, 'F. dos ventanas: los 3 fichajes llegan, ninguno perdido ni duplicado');
await m2.close();
// G. Reloj del móvil 2 h adelantado
const rc = await nav.newContext(movil); await rc.addInitScript(() => { const real = Date.now; Date.now = () => real() + 2 * 3600e3; });
const r = await rc.newPage(); await entrarEquipo(r, pin[bea]); await r.waitForTimeout(800);
const antes = Date.now(); await r.click('#fichar'); await r.waitForTimeout(1200);
const ult = Object.values((await datos()).fichajes).filter(f => f.operario === bea).sort((a, b) => b.ts - a.ts)[0];
ok(ult && Math.abs(ult.ts - antes) < 60e3, 'G. con el reloj del móvil adelantado, el fichaje lleva la hora real');
// H. Corrección de la oficina frente a un cambio del jefe
const j = await pagina(nav, movil, 'jefe'); await entrarEquipo(j, pin[jefe]);
await j.click('#nuevo-parte'); await elegir(j, '#hoja [name=clienteId]', cli); await j.fill('#hoja [name=inicio]', '08:00'); await j.fill('#hoja [name=fin]', '09:00');
await j.click('#hoja .btn.lima'); await j.waitForTimeout(1500);
await g.reload(); await g.waitForSelector('.kpis'); await g.click('[data-view=partes]'); await g.click(`.rows .row:has-text("${cli}")`);
await g.fill('#sheet-form [name=descripcion]', 'Corregido por la oficina'); await g.click('#sheet-form .btn.primary'); await g.waitForSelector('#overlay', { state: 'hidden' });
await j.reload(); await j.waitForTimeout(1200); await j.click('#partes .parte'); await j.waitForTimeout(300);
ok((await j.textContent('#toast')).includes('revisado'), 'H. el jefe no puede abrir un parte ya revisado por la oficina');
const parte = Object.values((await datos()).partes).find(p => p.autor === jefe);
ok(parte.descripcion === 'Corregido por la oficina' && parte.editadoOficina, 'H. la corrección de la oficina se mantiene');
await fin(nav);
