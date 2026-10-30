// Horas extra y estadísticas por persona, de un mes y de un año: lo que pasa de la jornada diaria en días laborables
// y todo lo trabajado en sábado, domingo o festivo. Excel y PDF para la gestoría.
import fs from 'fs';
import { lanzar, pagina, ok, fin, T, G, CLAVE, entrarGestion, nuevoOperario } from './comun.mjs';
console.log('Horas extra y estadísticas');
const nav = await lanzar();
const g = await pagina(nav, {}, 'gestión'); await entrarGestion(g);
const nombre = 'Extra ' + T; await nuevoOperario(g, nombre);
const api = (m, ruta, cuerpo) => fetch(G + ruta, { method: m, headers: { 'X-Clave': CLAVE, 'content-type': 'application/json' }, body: cuerpo && JSON.stringify(cuerpo) });
const opId = Object.entries((await (await api('GET', '/api/datos')).json()).operarios).find(([, o]) => o.nombre === nombre)[0];
// Septiembre de 2025, hora de Madrid: lunes 8 de 7 a 12 y de 12:30 a 17:30 (10 h → 2 extra), miércoles 10 festivo con 8 h
// (8 extra), jueves 11 con 6 h (0), viernes 12 solo la entrada (falta un fichaje) y sábado 13 de 8 a 11 (3 extra): 13 h extra.
const F = (dia, hora, tipo) => ({ operarioId: opId, operario: nombre, tipo, ts: Date.parse(`2025-09-${dia}T${hora}:00+02:00`) });
const lista = [F('08', '07:00', 'entrada'), F('08', '12:00', 'salida'), F('08', '12:30', 'entrada'), F('08', '17:30', 'salida'), F('10', '08:00', 'entrada'), F('10', '16:00', 'salida'),
  F('11', '08:00', 'entrada'), F('11', '14:00', 'salida'), F('12', '08:00', 'entrada'), F('13', '08:00', 'entrada'), F('13', '11:00', 'salida')];
for (const [i, f] of lista.entries()) await api('PUT', `/api/doc/fichajes/x${T}-${i}`, f);
// Un parte de 4 h en un cliente (poda y riego) y un gasto de 20,50 € ese mes
await api('PUT', `/api/doc/partes/p${T}`, { fecha: '2025-09-08', clienteId: 'cli-' + T, operarios: [opId], operario: nombre, duracion: 4, horas: 4, tareas: ['Poda', 'Riego'], inicio: '08:00', fin: '12:00' });
await api('PUT', `/api/doc/gastos/g${T}`, { operarioId: opId, operario: nombre, fecha: '2025-09-10', tipo: 'Gasolina', importe: 20.5, estado: 'pendiente', fotos: [] });
await g.reload(); await g.waitForSelector('.kpis');
await g.click('[data-view=equipo]'); await g.click('[data-act=tab-equipo][data-v=extra]');
const cambiar = (sel, v) => g.$eval(sel, (e, v) => { e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); }, v);
const fila = () => g.$eval('.tabla-x tbody', (t, n) => [...t.rows].find(r => r.cells[0].textContent.trim() === n)?.innerText.replace(/\s+/g, ' '), nombre);

// Jornada y festivos (una fecha mal escrita no se guarda)
await g.click('[data-act=jornada-ajustes]');
ok(await g.inputValue('#sheet-form [name=horasDia]') === '8', 'la jornada diaria es de 8 h si no se cambia');
await g.fill('#sheet-form [name=festivos]', '31/02/2025'); await g.click('#sheet-form .btn.primary'); await g.waitForTimeout(500);
ok(await g.isVisible('#overlay'), 'una fecha imposible no se guarda');
await g.fill('#sheet-form [name=festivos]', '10/09/2025\n25/12/2025'); await g.click('#sheet-form .btn.primary'); await g.waitForSelector('#overlay', { state: 'hidden' });

// Un mes
await cambiar('#mes-x', '2025-09'); await g.waitForTimeout(200);
const mes = await fila();
ok(mes && mes.includes('27:00 2:00 11:00 13:00'), 'mes: 27 h trabajadas, 2 extra en laborables, 11 en sábado y festivo, 13 en total (' + mes + ')');
ok(mes.includes('1 día con un fichaje de menos') && mes.includes('Sin validar'), 'mes: avisa del día con un fichaje de menos y de que no está validado');
ok((await g.textContent('.panel')).includes('2 festivos marcados en 2025'), 'dice cuántos festivos hay marcados');
const [csvMes] = await Promise.all([g.waitForEvent('download'), g.click('[data-act=csv-extra]')]);
const txtMes = fs.readFileSync(await csvMes.path(), 'utf8');
ok(csvMes.suggestedFilename() === 'horas-extra-2025-09.csv' && txtMes.includes(`${nombre};27,00;2,00;11,00;13,00;1;No`), 'Excel del mes con las horas en decimal');
const [pdfMes] = await Promise.all([g.waitForEvent('download'), g.click('[data-act=pdf-extra]')]);
ok(pdfMes.suggestedFilename() === 'horas-extra-2025-09.pdf', 'PDF del mes');

// Un año
await cambiar('#periodo-x', 'anyo'); await cambiar('#anyo-x', '2025'); await g.waitForTimeout(200);
const anyo = await fila();
ok(anyo && /– 13:00 – – – 13:00$/.test(anyo), 'año: 13 h extra en septiembre y 13 en total (' + anyo + ')');
const [csvAnyo] = await Promise.all([g.waitForEvent('download'), g.click('[data-act=csv-extra]')]);
ok(fs.readFileSync(await csvAnyo.path(), 'utf8').includes(`${nombre};0,00;0,00;0,00;0,00;0,00;0,00;0,00;0,00;13,00;0,00;0,00;0,00;13,00`), 'Excel del año, mes a mes');
const [pdfAnyo] = await Promise.all([g.waitForEvent('download'), g.click('[data-act=pdf-extra]')]);
ok(pdfAnyo.suggestedFilename() === 'horas-extra-2025.pdf', 'PDF del año');

// Del mes a los días de esa persona
await cambiar('#periodo-x', 'mes'); await g.waitForTimeout(200);
await g.click(`.tabla-x button.enlace:text-is("${nombre}")`); await g.waitForTimeout(200);
const dias = await g.textContent('.rows');
ok(await g.inputValue('#mes-j') === '2025-09' && dias.includes('+2 h 00 min extra') && dias.includes('festivo') && dias.includes('sábado') && (await g.textContent('.panel')).includes('Horas extra: 13 h 00 min'),
  'Jornada: cada día con sus horas extra y el total del mes');
const [pdfJ] = await Promise.all([g.waitForEvent('download'), g.click('[data-act=pdf-jornada]')]);
ok(pdfJ.suggestedFilename().endsWith('2025-09.pdf'), 'el PDF de la jornada se sigue descargando');

// Estadísticas del mismo mes
await g.click('[data-act=tab-equipo][data-v=extra]'); await cambiar('#mes-x', '2025-09'); await g.click('[data-act=tab-equipo][data-v=stats]'); await g.waitForTimeout(200);
const st = await fila();
ok(st && st.includes('4 27:00 6:45 13:00 4:00 1 20,50'), 'estadísticas: 4 días, 27 h, 6:45 de media, 13 h extra, 4 h en partes, 1 cliente y 20,50 € de gastos (' + st + ')');
ok(await g.$eval('.barras', (b, n) => [...b.querySelectorAll('.bfila')].some(f => f.title.startsWith(n + ': 27 h 00 min (14 h 00 min normales y 13 h 00 min extra)')), nombre), 'gráfico de horas por persona, con las extra aparte');
ok((await g.textContent('.panel')).includes('Trabajos más hechos') && await g.locator('.bfila[title^="Poda: 1 parte"]').count() === 1, 'gráfico de los trabajos más hechos según los partes');
await cambiar('#periodo-x', 'anyo'); await cambiar('#anyo-x', '2025'); await g.waitForTimeout(200);
ok(await g.locator('.bfila[title^="Sep: 27 h 00 min"]').count() === 1, 'estadísticas del año: horas del equipo mes a mes');

// En el móvil las tablas se desplazan dentro de su recuadro, sin mover la página
await g.setViewportSize({ width: 360, height: 740 }); await g.click('[data-act=tab-equipo][data-v=extra]'); await cambiar('#periodo-x', 'anyo'); await g.waitForTimeout(200);
const cabe = () => g.evaluate(() => { const d = document.documentElement, m = document.querySelector('main'); return d.scrollWidth <= d.clientWidth && m.scrollWidth <= m.clientWidth; });
ok(await cabe(), 'móvil: la tabla del año no se sale de la pantalla');
await g.click('[data-act=tab-equipo][data-v=stats]'); await g.waitForTimeout(200);
ok(await cabe() && await g.$$eval('.bval', (bs) => { const p = document.querySelector('.panel').getBoundingClientRect(); return bs.length > 0 && bs.every(b => b.getBoundingClientRect().right <= p.right); }),
  'móvil: las estadísticas no se salen de la pantalla y la cifra de cada barra cabe');
await fin(nav);
