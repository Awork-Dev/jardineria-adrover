// App del equipo: PIN, fichar, parte del jefe con foto, gasto con ticket, fotos del trabajo y ayuda.
import fs from 'fs';
import { lanzar, pagina, ok, fin, T, IMG, movil, entrarGestion, nuevoCliente, nuevoOperario, entrarEquipo, datos, elegir, E, G, CLAVE } from './comun.mjs';
console.log('App del equipo');
const nav = await lanzar();
const g = await pagina(nav, {}, 'gestión'); await entrarGestion(g);
const cli = 'Finca equipo ' + T;
await nuevoCliente(g, cli, { direccion: 'Camí de sa Mola 3', poblacion: 'Capdepera' });
const jefe = 'Jefe ' + T, op = 'Operario ' + T;
const pinJ = await nuevoOperario(g, jefe, 'jefe'), pinO = await nuevoOperario(g, op);

// PIN (el móvil del operario da permiso de ubicación y está en una finca de Capdepera)
const POS = { latitude: 39.704123, longitude: 3.435017, accuracy: 15 };
const o = await pagina(nav, { ...movil, permissions: ['geolocation'], geolocation: POS }, 'operario');
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
ok(fich.every(f => f.lat === 39.70412 && f.lon === 3.43502 && f.precision === 15), 'cada fichaje lleva la ubicación del momento');
ok((await o.textContent('#hoy')).split('📍').length === 3 && (await o.textContent('.aviso-ubic')).includes('Solo al fichar'), 'la app enseña 📍 junto a cada hora y avisa de que guarda la ubicación');
// Sin cobertura: la ubicación se junta al fichaje pendiente (un solo dato) y llega con él.
await o.context().setOffline(true); await o.click('#fichar'); await o.waitForTimeout(600);
ok((await o.textContent('#cola')).includes('1 dato.'), 'sin cobertura, fichaje y ubicación esperan juntos');
await o.context().setOffline(false); await o.evaluate(() => dispatchEvent(new Event('online'))); await o.waitForTimeout(1500);
const fich3 = Object.values((await datos()).fichajes).filter(f => f.operario === op);
ok(fich3.length === 3 && fich3.every(f => f.lat === 39.70412), 'al volver la cobertura llega con su ubicación');
// Si el móvil no da permiso, se ficha igual y la oficina ve por qué no hay ubicación.
const d = await pagina(nav, movil, 'sin permiso');
await d.addInitScript(() => { navigator.geolocation.getCurrentPosition = (bien, mal) => setTimeout(() => mal({ code: 1, message: 'denegada' }), 50); });
await entrarEquipo(d, pinJ); await d.click('#fichar'); await d.waitForTimeout(1200);
const fj = Object.values((await datos()).fichajes).filter(f => f.operario === jefe);
ok(fj.length === 1 && fj[0].sinUbicacion === 'denegada' && fj[0].lat === undefined, 'sin permiso de ubicación se ficha igual y se apunta el motivo');
ok((await d.textContent('#hoy')).includes('sin ubicación'), 'el trabajador ve que ese fichaje va sin ubicación');
await d.context().close();
// En la gestión: 📍 con enlace al mapa en el registro de jornada y en «Trabajando ahora».
await g.reload(); await g.waitForSelector('.kpis');
ok(await g.$$eval('.panel a.ubic', (as, n) => as.some(a => a.href.includes('39.70412,3.43502') && a.closest('p').textContent.includes(n)), op), 'Resumen: «Trabajando ahora» con enlace al mapa');
await g.click('[data-view=equipo]'); await g.click('[data-act=tab-equipo][data-v=jornada]');
await g.selectOption('#op-j', { label: op }); await g.waitForTimeout(200);
ok(await g.$$eval('.rows a.ubic', as => as.length === 3 && as.every(a => a.href.endsWith('query=39.70412,3.43502') && a.target === '_blank')), 'Jornada: cada hora con su enlace al mapa');
await g.selectOption('#op-j', { label: jefe }); await g.waitForTimeout(200);
ok((await g.textContent('.rows')).includes('(sin ubicación)'), 'Jornada: se ve cuándo se fichó sin ubicación');
// Validar las horas del mes: se borra la ubicación y las horas se quedan.
await g.selectOption('#op-j', { label: op }); await g.waitForTimeout(200);
await g.click('[data-act=validar-jornada]'); await g.click('[data-act=validar-jornada]'); await g.waitForTimeout(1500);
const val = Object.entries((await datos()).fichajes).filter(([, f]) => f.operario === op).map(([id, f]) => ({ ...f, id }));
ok(val.length === 3 && val.every(f => f.validado && f.lat === undefined && f.lon === undefined && f.precision === undefined && f.ts), 'al validar las horas se borra la ubicación y las horas se quedan');
ok((await g.textContent('.panel')).includes('Horas validadas') && !(await g.$('.rows a.ubic')) && !(await g.$('[data-act=validar-jornada]')), 'la gestión enseña las horas validadas, ya sin mapa');
// Una ubicación que llega tarde (móvil sin cobertura) no vuelve a aparecer en un fichaje ya validado.
await o.evaluate((f) => fetch('/api/fichar', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + JSON.parse(localStorage.getItem('token')) },
  body: JSON.stringify({ id: f.id, tipo: f.tipo, ts: f.ts, lat: 39.7, lon: 3.4, precision: 9 }) }), val[0]);
ok((await datos()).fichajes[val[0].id].lat === undefined, 'una ubicación que llega después de validar no se guarda');
// Copias de seguridad sin ubicación, y sin validar se borra sola a los tres meses.
const api = (m, ruta, cuerpo) => fetch(G + ruta, { method: m, headers: { 'X-Clave': CLAVE, 'content-type': 'application/json' }, body: cuerpo && JSON.stringify(cuerpo) });
const opId = val[0].operarioId, DIA = 86400e3;
for (const [id, dias] of [['viejo-' + T, 100], ['reciente-' + T, 10]])
  await api('PUT', '/api/doc/fichajes/' + id, { operarioId: opId, operario: op, tipo: 'entrada', ts: Date.now() - dias * DIA, lat: 39.7, lon: 3.43, precision: 20 });
const { fecha } = await (await api('POST', '/api/copias')).json();
const copia = await (await api('GET', '/api/copias/' + fecha)).json();
ok(Object.keys(copia.fichajes).length >= 6 && Object.values(copia.fichajes).every(f => f.ts && f.lat === undefined && f.sinUbicacion === undefined), 'las copias de seguridad guardan los fichajes sin la ubicación');
await fetch(G + '/cdn-cgi/local/scheduled'); await g.waitForTimeout(1500);
const tras = (await datos()).fichajes;
ok(tras['viejo-' + T].lat === undefined && tras['viejo-' + T].ts && tras['reciente-' + T].lat === 39.7, 'sin validar, la ubicación se borra sola a los tres meses (la reciente se queda)');
await g.reload(); await g.waitForSelector('.kpis');
const [bajada] = await Promise.all([g.waitForEvent('download'), g.locator('[data-act=export]').first().click()]);
const manual = JSON.parse(fs.readFileSync(await bajada.path(), 'utf8'));
ok(manual.fichajes['reciente-' + T] && Object.values(manual.fichajes).every(f => f.lat === undefined), '«Descargar copia» tampoco lleva la ubicación');

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
