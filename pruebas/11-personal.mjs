// Personal: contrato en la ficha (días y horario), documentos privados, horas extra con su horario, días sin fichar,
// bajas con foto del parte, vacaciones con su saldo, nóminas (subidas o por correo), firma del recibí y alarmas.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { lanzar, pagina, ok, fin, T, IMG, movil, entrarGestion, entrarEquipo, datos, E, G, CLAVE } from './comun.mjs';
console.log('Personal: contrato, documentos, vacaciones, bajas y nóminas');
const nav = await lanzar();
const g = await pagina(nav, {}, 'gestión'); await entrarGestion(g);
const api = (m, ruta, cuerpo) => fetch(G + ruta, { method: m, headers: { 'X-Clave': CLAVE, 'content-type': 'application/json' }, body: cuerpo && JSON.stringify(cuerpo) });
const dos = (n) => String(n).padStart(2, '0');
const iso = (d) => d.getFullYear() + '-' + dos(d.getMonth() + 1) + '-' + dos(d.getDate());
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'personal-'));
const pdf = (nombre, texto) => { const p = path.join(tmp, nombre); fs.writeFileSync(p, '%PDF-1.4\n% ' + texto + '\n%%EOF\n'); return p; };

// 1. Alta con contrato: lunes, miércoles y viernes de 9:30 a 13:30, desde el 1 de septiembre de 2025.
const nombre = 'Anabel Prueba' + T;
await g.click('[data-view=equipo]'); await g.click('[data-act=tab-equipo][data-v=personas]'); await g.click('[data-act=new-operario]');
await g.fill('#sheet-form [name=nombre]', nombre);
const pin = await g.inputValue('#sheet-form [name=pin]');
for (const d of ['1', '3', '5']) await g.check(`#sheet-form [name=dias][value="${d}"]`, { force: true });
await g.fill('#sheet-form [name=entrada]', '09:30'); await g.fill('#sheet-form [name=salida]', '09:00');
await g.fill('#sheet-form [name=alta]', '2025-09-01'); await g.fill('#sheet-form [name=categoria]', 'Limpieza');
await g.fill('#sheet-form [name=telefono]', '600 111 222');
await g.click('#sheet-form .btn.primary'); await g.waitForTimeout(400);
ok(await g.isVisible('#overlay') && (await g.textContent('#toast')).includes('hora de entrada'), 'no deja guardar un horario con la salida antes de la entrada');
await g.fill('#sheet-form [name=salida]', '13:30'); await g.click('#sheet-form .btn.primary'); await g.waitForSelector('#overlay', { state: 'hidden' });
let D = await datos();
const [opId, op] = Object.entries(D.operarios).find(([, o]) => o.nombre === nombre);
ok(op.pin === pin && JSON.stringify(op.contrato.dias) === '[1,3,5]' && op.contrato.entrada === '09:30' && op.contrato.salida === '13:30' && op.contrato.vacaciones === 30 && op.contrato.computo === 'naturales',
  'la ficha guarda los días, el horario, el alta y 30 días naturales de vacaciones por defecto');
ok((await g.textContent('.cards')).includes('lunes, miércoles, viernes de 09:30 a 13:30'), 'la tarjeta de la persona enseña su horario');

// 2. Documentos privados: se suben desde la ficha y solo los ve la gestión.
await g.click(`[data-act=edit-operario][data-id="${opId}"]`);
ok((await g.textContent('#resumen-contrato')).includes('4 h 00 min al día, 12 h a la semana') && (await g.textContent('#resumen-contrato')).includes('horas complementarias'),
  'la ficha resume la jornada (4 h al día, 12 a la semana) y avisa de que es a tiempo parcial');
await g.selectOption('#tipo-doc', 'dni');
await g.setInputFiles('#archivo-doc', pdf('DNI anabel.pdf', 'dni de prueba'));
await g.waitForSelector('.docs-lista .doc-fila');
D = await datos();
const [dniId, dni] = Object.entries(D.documentos).find(([, d]) => d.operarioId === opId && d.tipo === 'dni') || [];
const bajado = dniId && await (await fetch(G + '/api/archivos/' + dniId, { headers: { 'X-Clave': CLAVE } })).text();
ok(dni && dni.nombre === 'DNI anabel.pdf' && bajado.includes('dni de prueba'), 'el DNI se guarda y se descarga tal cual');
ok((await fetch(G + '/api/archivos/' + dniId)).status === 401, 'sin la clave de la gestión no se puede descargar');
ok((await g.textContent('.docs-lista')).includes('DNI / NIE'), 'la ficha lista el documento');
await g.click('#sheet-form [data-act=close]');

// 3. Horas extra con su horario: martes 16 con 2 h (todo extra, no es su día) y lunes 15 con 5 h (1 h extra). Septiembre de 2025.
const F = (dia, hora, tipo, i) => api('PUT', `/api/doc/fichajes/an${T}-${i}`, { operarioId: opId, operario: nombre, tipo, ts: Date.parse(`2025-09-${dia}T${hora}:00+02:00`) });
await F('16', '10:00', 'entrada', 1); await F('16', '12:00', 'salida', 2); await F('15', '09:30', 'entrada', 3); await F('15', '14:30', 'salida', 4);
await g.reload(); await g.waitForSelector('.kpis');
await g.click('[data-view=equipo]'); await g.click('[data-act=tab-equipo][data-v=extra]');
await g.$eval('#mes-x', (e) => { e.value = '2025-09'; e.dispatchEvent(new Event('change', { bubbles: true })); }); await g.waitForTimeout(200);
const filaX = await g.$eval('.tabla-x tbody', (t, n) => [...t.rows].find((r) => r.cells[0].textContent.trim() === n)?.innerText.replace(/\s+/g, ' '), nombre);
ok(filaX && filaX.includes('7:00 1:00 2:00 3:00'), 'horas extra con su horario: 7 h trabajadas, 1 extra en su día y 2 en un día que no le toca (' + filaX + ')');

// 4. Registro de jornada: sus días de trabajo sin fichar salen como «No fichó · sin justificar».
await g.click(`.tabla-x button.enlace:text-is("${nombre}")`); await g.waitForTimeout(200);
const reg = await g.textContent('.rows');
// 13 lunes, miércoles y viernes en septiembre de 2025, menos el 15 (fichado) y el 10 si otra prueba lo marcó festivo.
const sinFichar = 12 - (((await datos()).ajustes.jornada || {}).festivos || []).filter((f) => ['2025-09-01', '2025-09-03', '2025-09-05', '2025-09-08', '2025-09-10', '2025-09-12', '2025-09-17', '2025-09-19', '2025-09-22', '2025-09-24', '2025-09-26', '2025-09-29'].includes(f)).length;
ok(reg.includes('fuera de su horario') && reg.includes('+1 h 00 min extra') && (reg.match(/No fichó · sin justificar/g) || []).length === sinFichar,
  'septiembre: el martes sale «fuera de su horario», el lunes 15 con 1 h extra y los otros ' + sinFichar + ' días de su horario como no fichados');
const [pdfJ] = await Promise.all([g.waitForEvent('download'), g.click('[data-act=pdf-jornada]')]);
ok(pdfJ.suggestedFilename().endsWith('2025-09.pdf'), 'el PDF del registro se descarga (con su horario y los días sin fichar)');

// 5. En su móvil: días sin fichar, justificar con foto del parte, pedir vacaciones y alarmas.
const m = await pagina(nav, movil, 'anabel'); await entrarEquipo(m, pin); await m.waitForTimeout(800);
ok(await m.isVisible('#faltas') && await m.locator('[data-justificar]').count() > 0, 'la app le avisa de los días de su horario que no fichó');
ok(await m.isVisible('#saldo') && (await m.textContent('#saldo')).includes('30') && (await m.textContent('#saldo')).includes('días de vacaciones te quedan'), 've sus días de vacaciones (30 este año)');
const href = await m.getAttribute('#alarmas', 'href');
const ics = await (await fetch(E + href)).text();
ok(href.includes('dias=1,3,5') && ics.includes('RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR') && ics.includes('T093000') && ics.includes('T133000') && ics.includes('BEGIN:VALARM'),
  'botón de alarmas: un calendario con avisos a las 9:30 y a las 13:30 los lunes, miércoles y viernes');
const diaFalta = await m.getAttribute('[data-justificar]', 'data-justificar');
await m.click('[data-justificar]');
ok(await m.inputValue('#hoja-aus [name=desde]') === diaFalta && await m.isChecked('#hoja-aus input[value=baja]'), '«Justificar» abre la baja con ese día');
await m.click('#hoja-aus .btn.lima'); await m.waitForTimeout(300);
ok(!(await m.isHidden('#hoja-aus')) && (await m.textContent('#toast')).includes('parte médico'), 'una baja sin la foto del parte no se envía');
await m.setInputFiles('#hoja-aus [data-fotos] input[type=file]', IMG('ticket-material.jpg'));
await m.waitForSelector('#hoja-aus .miniaturas img');
await m.fill('#hoja-aus [name=nota]', 'Gripe');
await m.click('#hoja-aus .btn.lima'); await m.waitForTimeout(2500);
D = await datos();
const baja = Object.entries(D.ausencias).find(([, x]) => x.operarioId === opId && x.tipo === 'baja');
ok(baja && baja[1].desde === diaFalta && baja[1].estado === 'pendiente' && baja[1].fotos.length === 1 && baja[1].nota === 'Gripe', 'la baja llega a la oficina con la foto, pendiente de revisar');
ok(!(await m.locator(`[data-justificar="${diaFalta}"]`).count()), 'ese día deja de salir como no fichado');
const hoy = new Date(), lunes = new Date(hoy.getFullYear(), 11, 1);
while (lunes.getDay() !== 1) lunes.setDate(lunes.getDate() + 1);
const domingo = new Date(lunes); domingo.setDate(lunes.getDate() + 6);
await m.click('#pedir-vac'); await m.fill('#hoja-aus [name=desde]', iso(lunes)); await m.fill('#hoja-aus [name=hasta]', iso(domingo));
await m.$eval('#hoja-aus [name=hasta]', (e) => e.dispatchEvent(new Event('change', { bubbles: true })));
ok((await m.textContent('#aus-cuenta')).includes('7 días naturales'), 'al pedir vacaciones le dice cuántos días cuentan (una semana: 7 naturales)');
await m.click('#hoja-aus .btn.lima'); await m.waitForTimeout(1500);
ok((await m.textContent('#ausencias')).includes('La oficina la está revisando'), 've sus vacaciones pendientes de aceptar');

// 6. En la gestión: revisar y aceptar; el saldo baja.
await g.click('[data-act=sincronizar]'); await g.waitForTimeout(800);
await g.click('[data-view=equipo]'); await g.click('[data-act=tab-equipo][data-v=ausencias]');
ok((await g.textContent('.tabs')).includes('Vacaciones y bajas (2)') && (await g.textContent('.panel')).includes('Por revisar (2)'), 'la gestión enseña las dos ausencias por revisar');
const vacId = Object.entries((await datos()).ausencias).find(([, x]) => x.operarioId === opId && x.tipo === 'vacaciones')[0];
await g.click(`[data-act=edit-ausencia][data-id="${vacId}"]`);
await g.selectOption('#sheet-form [name=estado]', 'aceptada'); await g.fill('#sheet-form [name=notaOficina]', 'Felices vacaciones');
await g.click('#sheet-form .btn.primary'); await g.waitForSelector('#overlay', { state: 'hidden' });
await g.click(`[data-act=edit-ausencia][data-id="${baja[0]}"]`);
ok(await g.locator('#sheet-form .galeria img').count() === 1, 'en la baja se ve la foto del parte');
await g.selectOption('#sheet-form [name=estado]', 'aceptada'); await g.click('#sheet-form .btn.primary'); await g.waitForSelector('#overlay', { state: 'hidden' });
const anyo = String(hoy.getFullYear());
await g.$eval('#anyo-a', (e, a) => { e.value = a; e.dispatchEvent(new Event('change', { bubbles: true })); }, anyo); await g.waitForTimeout(200);
const saldo = await g.$eval('.tabla-x tbody', (t, n) => [...t.rows].find((r) => r.cells[0].textContent.trim().startsWith(n))?.innerText.replace(/\s+/g, ' '), nombre);
ok(saldo && /^\S+ \S+ 30 naturales 7 – 23 1$/.test(saldo), 'saldo del año: le corresponden 30, ha disfrutado 7, le quedan 23 y 1 día de baja (' + saldo + ')');
await m.click('#sincronizar'); await m.waitForTimeout(1200);
ok((await m.textContent('#saldo')).includes('23') && (await m.textContent('#ausencias')).includes('Felices vacaciones'), 'en su móvil: le quedan 23 días y ve la nota de la oficina');

// 7. Nóminas: subida con el nombre en el archivo (se asigna sola), aviso de transferencia y firma con el dedo.
await g.click('[data-act=tab-equipo][data-v=nominas]');
await g.$eval('#mes-n', (e) => { e.value = '2026-10'; e.dispatchEvent(new Event('change', { bubbles: true })); }); await g.waitForTimeout(200);
await g.setInputFiles('#archivo-nom', [pdf(`NOMINA_${nombre.replace(' ', '_')}_202610.pdf`, 'nomina octubre'), pdf('sin-nombre.pdf', 'otra')]);
await g.waitForFunction(() => document.querySelector('#toast').textContent.includes('subidas'));
D = await datos();
const [nomId, nom] = Object.entries(D.documentos).find(([, d]) => d.tipo === 'nomina' && d.operarioId === opId) || [];
ok(nom && nom.mes === '2026-10', 'la nómina con su nombre y «202610» en el archivo se asigna sola a ella y a octubre de 2026');
ok((await g.textContent('main')).includes('Sin asignar') && Object.values(D.documentos).some((d) => d.nombre === 'sin-nombre.pdf' && !d.operarioId), 'la que no lleva nombre queda «Sin asignar»');
await g.click(`[data-act=nomina-transferida][data-id="${nomId}"]`); await g.waitForTimeout(500);
ok(await g.locator('a[href^="https://wa.me/34600111222"]').count() === 1, 'al marcarla transferida sale «Avisar por WhatsApp» con su móvil');
await m.click('#sincronizar'); await m.waitForTimeout(1200);
ok((await m.textContent('#aviso-nomina')).includes('Te hemos transferido la nómina de octubre de 2026'), 'en su móvil le sale el aviso de la transferencia');
ok((await fetch(E + '/api/nominas/' + dniId, { headers: { authorization: 'Bearer ' + await m.evaluate(() => JSON.parse(localStorage.getItem('token'))) } })).status === 404, 'desde la app no se puede abrir el DNI (solo sus nóminas)');
await m.click(`[data-firmar="${nomId}"]`); await m.waitForSelector('#hoja-firma:not([hidden])');
await m.click('#firma-ok'); await m.waitForTimeout(300);
ok((await m.textContent('#toast')).includes('Firma dentro'), 'sin firmar no deja enviar');
const caja = await m.$('#firma'), b = await caja.boundingBox();
await m.mouse.move(b.x + 30, b.y + 120); await m.mouse.down();
for (let i = 1; i <= 12; i++) await m.mouse.move(b.x + 30 + i * 20, b.y + 120 + Math.sin(i) * 40);
await m.mouse.up();
await m.click('#firma-ok'); await m.waitForTimeout(1500);
D = await datos();
const firmada = D.documentos[nomId];
ok(!!firmada.firma && /^data:image\/png;base64,/.test(firmada.firma.img) && /^[0-9a-f]{64}$/.test(firmada.firma.huella) && firmada.firma.nombre === nombre && firmada.visto > 0, 'el recibí queda firmado con la imagen de la firma, la huella del PDF y la hora');
ok((await m.textContent('#nominas')).includes('Recibí firmado'), 'en su móvil pone «Recibí firmado»');
await g.click('[data-act=sincronizar]'); await g.waitForTimeout(800);
ok((await g.textContent('main')).includes('Firmada'), 'la gestión ve la nómina firmada');
const [rec] = await Promise.all([g.waitForEvent('download'), g.click(`[data-act=recibi-pdf][data-id="${nomId}"]`)]);
ok(rec.suggestedFilename().startsWith('recibi-nomina-2026-10'), 'se descarga el recibí firmado en PDF');

// 8. Nóminas por correo: el PDF adjunto se guarda y se asigna por el nombre del archivo.
const b64 = Buffer.from('%PDF-1.4\n% nomina por correo\n%%EOF\n').toString('base64');
const correo = ['From: Gestoria <nominas@gestoria.test>', 'To: nominas@jardineriaadrover.es', 'Date: ' + new Date().toUTCString(), 'Message-ID: <' + T + '@gestoria.test>', 'Subject: =?utf-8?B?' + Buffer.from('Nóminas noviembre 2026').toString('base64') + '?=',
  'MIME-Version: 1.0', 'Content-Type: multipart/mixed; boundary="XYZ"', '', '--XYZ', 'Content-Type: text/plain; charset=utf-8', '', 'Adjuntamos las nóminas.', '--XYZ',
  `Content-Type: application/pdf; name="Nomina ${nombre} noviembre 2026.pdf"`, 'Content-Transfer-Encoding: base64', `Content-Disposition: attachment; filename="Nomina ${nombre} noviembre 2026.pdf"`, '',
  b64, '--XYZ--', ''].join('\r\n');
const r = await fetch(G + '/cdn-cgi/handler/email?from=nominas@gestoria.test&to=nominas@jardineriaadrover.es', { method: 'POST', body: correo });
await g.waitForTimeout(500);
const porCorreo = Object.values((await datos()).documentos).find((d) => d.origen === 'correo' && d.operarioId === opId);
ok(r.ok && porCorreo && porCorreo.mes === '2026-11' && porCorreo.tipo === 'nomina', 'la nómina que llega por correo se guarda, asignada a ella y a noviembre de 2026');

await fin(nav);
