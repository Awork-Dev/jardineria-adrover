// Circuitos entre la app del equipo y la gestión: lo que hace uno lo ve el otro.
import { lanzar, pagina, ok, fin, T, IMG, movil, entrarGestion, nuevoCliente, nuevoOperario, entrarEquipo, datos, elegir } from './comun.mjs';
console.log('Circuitos entre las dos apps');
const nav = await lanzar();
const g = await pagina(nav, {}, 'gestión'); await entrarGestion(g);
const cli = 'Hermanas ' + T;
await nuevoCliente(g, cli, { cif: 'B11111111', direccion: 'Carrer Major 1', cp: '07580', poblacion: 'Capdepera' });
const jefe = 'JefeH ' + T, op = 'OpH ' + T;
const pinJ = await nuevoOperario(g, jefe, 'jefe'), pinO = await nuevoOperario(g, op);
const partes = async () => Object.entries((await datos()).partes).filter(([, p]) => p.clienteId && p.autor === jefe);

// Quién trabaja ahora
const o = await pagina(nav, movil, 'operario'); await entrarEquipo(o, pinO);
await o.click('#fichar'); await o.waitForTimeout(1000);
await g.reload(); await g.waitForSelector('.kpis');
ok((await g.textContent('.panel')).includes('Trabajando ahora') && (await g.textContent('.panel')).includes(op), 'el Resumen muestra quién está trabajando');

// Aviso del jefe → la oficina lo atiende → el jefe lo ve, y un cambio del jefe no lo deshace
const j = await pagina(nav, movil, 'jefe'); await entrarEquipo(j, pinJ);
await j.click('#nuevo-parte'); await elegir(j, '#hoja [name=clienteId]', cli);
await j.fill('#hoja [name=inicio]', '08:00'); await j.fill('#hoja [name=fin]', '10:00');
await j.check(`#quien label:has-text("${op}") input`);
await j.fill('#hoja [name=incidencias]', 'Fuga en el riego ' + T); await j.click('#hoja .btn.lima'); await j.waitForTimeout(1500);
await g.reload(); await g.waitForSelector('.kpis');
const aviso = g.locator('.row', { hasText: 'Fuga en el riego ' + T });
ok(await aviso.count() === 1, 'el aviso del jefe aparece en el Resumen');
await aviso.locator('[data-act=aviso-ok]').click(); await g.waitForTimeout(800);
ok(await g.locator('.row', { hasText: 'Fuga en el riego ' + T }).count() === 0, '«Atendido» lo quita de la lista');
await j.reload(); await j.waitForTimeout(1200);
ok((await j.textContent('#partes')).includes('ha atendido el aviso'), 'el jefe ve que la oficina atendió su aviso');
await j.click('#partes .parte'); await j.fill('#hoja [name=fin]', '10:30'); await j.click('#hoja .btn.lima'); await j.waitForTimeout(1500);
let [[, p1]] = await partes();
ok(p1.fin === '10:30' && p1.avisoAtendido, 'si el jefe cambia el parte, el «atendido» de la oficina se conserva');

// La gestión tenía el parte antiguo (el jefe acaba de cambiarlo): guardar encima se bloquea
await g.click('[data-view=partes]'); await g.click(`.rows .row:has-text("${cli}")`);
await g.fill('#sheet-form [name=descripcion]', 'Versión vieja'); await g.click('#sheet-form .btn.primary'); await g.waitForTimeout(800);
[[, p1]] = await partes();
ok((await g.textContent('#toast')).includes('No se ha guardado') && p1.fin === '10:30', 'la oficina con datos viejos no pisa el cambio del jefe');

// Con los datos al día, la oficina corrige el parte con la misma ficha que la app: las horas se recalculan igual
await g.reload(); await g.waitForSelector('.kpis');
await g.click('[data-view=partes]'); await g.click(`.rows .row:has-text("${cli}")`);
await g.fill('#sheet-form [name=inicio]', '08:00'); await g.fill('#sheet-form [name=fin]', '11:00');
await g.click('#sheet-form .btn.primary'); await g.waitForSelector('#overlay', { state: 'hidden' });
[[, p1]] = await partes();
ok(p1.duracion === 3 && p1.horas === 6 && p1.editadoOficina, 'la oficina corrige el horario: 3 h × 2 personas = 6 h');

// Partes → nota con el precio por hora, y el parte queda marcado
await g.click('[data-view=resumen]'); await g.click('[data-act=edit-empresa]');
await g.fill('#sheet-form [name=precioHora]', '30'); await g.click('#sheet-form .btn.primary'); await g.waitForSelector('#overlay', { state: 'hidden' });
await g.click('[data-view=partes]'); await elegir(g, '#pf-cli', cli); await g.waitForTimeout(300);
await g.click('[data-act=partes-nota]'); await g.waitForTimeout(300);
ok((await g.inputValue('.line-r [name=lp]')) === '30' && (await g.inputValue('.line-r [name=lq]')) === '6', 'la nota sale con 6 h a 30 €/h');
await g.click('#sheet-form .btn.primary'); await g.waitForSelector('#overlay', { state: 'hidden' });
const d = await datos(), nota = Object.values(d.notas).find(n => n.clienteId === Object.keys(d.clientes).find(k => d.clientes[k].nombre === cli));
[[, p1]] = await partes();
ok(nota && p1.nota === nota.numero, 'el parte queda marcado con el número de la nota (' + (nota && nota.numero) + ')');

// Gasto: la oficina lo paga con una nota y el operario lo ve
await o.click('#nuevo-gasto'); await o.setInputFiles('#hoja-gasto input[type=file]', IMG('ticket-gasolina.jpg')); await o.waitForSelector('#hoja-gasto .miniaturas img');
await o.fill('#hoja-gasto [name=importe]', '20'); await o.click('#hoja-gasto .btn.lima'); await o.waitForTimeout(2500);
await g.reload(); await g.waitForSelector('.kpis'); await g.click('[data-act=ir-gastos]');
await g.click(`.rows .row:has-text("${op}")`);
await g.selectOption('#sheet-form [name=estado]', 'pagado'); await g.fill('#sheet-form [name=notaOficina]', 'Pagado con la nómina');
await g.click('#sheet-form .btn.primary'); await g.waitForSelector('#overlay', { state: 'hidden' });
await o.reload(); await o.waitForTimeout(1500);
const gTxt = await o.textContent('#gastos');
ok(gTxt.includes('Pagado') && gTxt.includes('Pagado con la nómina'), 'el operario ve su gasto pagado y la nota de la oficina');
await fin(nav);
