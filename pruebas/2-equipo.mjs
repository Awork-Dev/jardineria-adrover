// App del equipo: PIN, fichar, parte del jefe con foto, gasto con ticket, fotos del trabajo y ayuda.
import { lanzar, pagina, ok, fin, T, IMG, movil, entrarGestion, nuevoCliente, nuevoOperario, entrarEquipo, datos, elegir, E } from './comun.mjs';
console.log('App del equipo');
const nav = await lanzar();
const g = await pagina(nav, {}, 'gestión'); await entrarGestion(g);
const cli = 'Finca equipo ' + T;
await nuevoCliente(g, cli, { direccion: 'Camí de sa Mola 3', poblacion: 'Capdepera' });
const jefe = 'Jefe ' + T, op = 'Operario ' + T;
const pinJ = await nuevoOperario(g, jefe, 'jefe'), pinO = await nuevoOperario(g, op);

// PIN
const o = await pagina(nav, movil, 'operario');
await o.goto(E); await o.waitForSelector('#acceso:not([hidden])');
await o.click('#acceso .ay-btn'); ok(await o.isVisible('#ayuda'), 'la ayuda se abre antes de entrar'); await o.click('#ayuda .btn.lima');
for (const d of '0000') await o.click(`[data-n="${d}"]`);
await o.waitForFunction(() => document.querySelector('#pin-error').textContent);
ok((await o.textContent('#pin-error')).includes('incorrecto'), 'un PIN malo avisa');
for (const d of pinO) await o.click(`[data-n="${d}"]`); await o.waitForSelector('#app:not([hidden])');
ok(!(await o.isVisible('#partes-card')), 'un operario no ve los partes');

// Fichar
await o.click('#fichar'); await o.waitForTimeout(800);
ok((await o.textContent('#estado span')).startsWith('Trabajando'), 'fichar la entrada');
await o.click('#fichar'); await o.waitForTimeout(800);
const fich = Object.values((await datos()).fichajes).filter(f => f.operario === op);
ok(fich.length === 2 && fich.some(f => f.tipo === 'salida'), 'entrada y salida llegan a la oficina');

// Gasto con ticket y fotos del trabajo
await o.click('#nuevo-gasto'); await o.setInputFiles('#hoja-gasto input[type=file]', IMG('ticket-gasolina.jpg'));
await o.waitForSelector('#hoja-gasto .miniaturas img');
await o.fill('#hoja-gasto [name=importe]', '45,30'); await o.click('#hoja-gasto .btn.lima'); await o.waitForTimeout(2500);
const gasto = Object.values((await datos()).gastos).find(x => x.operario === op);
ok(gasto && gasto.importe === 45.3 && gasto.fotos.length === 1 && gasto.estado === 'pendiente', 'gasto con su ticket en la oficina');
await o.click('#nuevas-fotos'); await elegir(o, '#hoja-fotos [name=clienteId]', cli);
ok(await o.isVisible('#hoja-fotos .llegar'), 'enlace «Cómo llegar» al elegir el cliente');
await o.setInputFiles('#hoja-fotos input[type=file]', [IMG('poda.jpg'), IMG('mant.jpg')]);
await o.waitForFunction(() => document.querySelectorAll('#hoja-fotos .miniaturas img').length === 2);
await o.click('#hoja-fotos .btn.lima'); await o.waitForTimeout(3000);
ok(Object.values((await datos()).fotos).some(x => x.operario === op && x.fotos.length === 2), 'fotos del trabajo en la oficina');

// Parte del jefe con foto
const j = await pagina(nav, movil, 'jefe'); await entrarEquipo(j, pinJ);
ok(await j.isVisible('#partes-card'), 'el jefe ve los partes');
await j.click('#nuevo-parte'); await elegir(j, '#hoja [name=clienteId]', cli);
await j.fill('#hoja [name=inicio]', '08:00'); await j.fill('#hoja [name=fin]', '10:30');
await j.check(`#quien label:has-text("${op}") input`); await j.check('#tareas label:has-text("Poda") input');
await j.fill('#hoja [name=incidencias]', 'Picudo en la palmera ' + T);
await j.setInputFiles('#hoja input[type=file]', IMG('poda.jpg')); await j.waitForSelector('#hoja .miniaturas img');
await j.click('#hoja .btn.lima'); await j.waitForTimeout(3000);
const parte = Object.values((await datos()).partes).find(x => x.autor === jefe);
ok(parte && parte.horas === 5 && parte.duracion === 2.5 && parte.fotos.length === 1 && parte.tareas.includes('Poda'), 'parte con 2 personas × 2,5 h = 5 h y su foto');
await fin(nav);
