// Gestión: acceso, clientes, presupuestos, notas, IVA, PDF y control de versión.
import { lanzar, pagina, ok, fin, G, CLAVE, T, entrarGestion, nuevoCliente, datos } from './comun.mjs';
console.log('Gestión');
const nav = await lanzar();
const p = await pagina(nav, {}, 'gestión');

// Acceso
await p.goto(G); await p.waitForSelector('#login:not([hidden])');
await p.fill('#login-form [name=clave]', 'mala'); await p.click('#login-form button');
await p.waitForFunction(() => document.querySelector('#login-err').textContent.length > 0);
ok((await p.textContent('#login-err')).includes('incorrecta'), 'una clave mala avisa');
await p.fill('#login-form [name=clave]', CLAVE); await p.click('#login-form button'); await p.waitForSelector('.kpis');
ok(true, 'con la clave buena entra');

// Cliente y presupuesto largo con PDF
const cli = 'Cliente prueba ' + T;
await nuevoCliente(p, cli, { cif: 'B00000000', direccion: 'Calle 1', cp: '07580', poblacion: 'Capdepera' });
await p.click('[data-view=presupuestos]'); await p.click('[data-act=new-doc]');
await p.selectOption('[name=clienteId]', { label: cli });
for (let i = 0; i < 30; i++) {
  if (i) await p.click('[data-act=addline]');
  const r = p.locator('.line-r').nth(i);
  await r.locator('[name=lc]').fill(i % 5 ? 'Mantenimiento ' + i : 'Poda de palmeras con tratamiento preventivo contra el picudo rojo y retirada de restos ' + i);
  await r.locator('[name=lq]').fill('2'); await r.locator('[name=lp]').fill('40');
}
await p.click('#sheet-form .btn.primary'); await p.waitForSelector('#overlay', { state: 'hidden' });
const pres = Object.values((await datos()).presupuestos).find(x => x.cliente && x.cliente.nombre === cli);
ok(pres && pres.lineas.length === 30 && /^P-\d{4}-\d{3}$/.test(pres.numero), 'presupuesto guardado con número y 30 líneas');
await p.fill('#q', cli); await p.click('#list .row');
const [pdf] = await Promise.all([p.waitForEvent('download'), p.click('[data-act=pdf]')]);
ok(pdf.suggestedFilename() === pres.numero + '.pdf', 'el PDF del presupuesto se descarga');

// Duplicar y pasar a nota
await p.click('[data-act=dup]');
ok((await p.textContent('#sheet-title')).startsWith('Copia de'), 'duplicar abre una copia');
await p.click('[data-act=close]'); await p.click('#list .row'); await p.click('[data-act=a-nota]');
await p.selectOption('[name=iva]', '0');
ok((await p.textContent('#totals')).includes('IVA 0 %'), 'el IVA se puede poner a 0 %');
await p.click('#sheet-form .btn.primary'); await p.waitForSelector('#overlay', { state: 'hidden' });
const nota = Object.values((await datos()).notas).find(x => x.origen === pres.numero);
ok(nota && nota.iva === 0 && nota.cliente.cif === 'B00000000' && /^N-\d{4}-\d{3}$/.test(nota.numero), 'nota creada desde el presupuesto, con IVA 0 y los datos del cliente');

// Una nota exige el cliente completo
const incompleto = 'Incompleto ' + T;
await nuevoCliente(p, incompleto);
await p.click('[data-view=notas]'); await p.click('[data-act=new-doc]');
await p.selectOption('[name=clienteId]', { label: incompleto });
await p.fill('.line-r [name=lc]', 'Trabajo'); await p.fill('.line-r [name=lp]', '10');
await p.click('#sheet-form .btn.primary'); await p.waitForTimeout(400);
ok((await p.textContent('#toast')).includes('Faltan datos del cliente'), 'una nota con el cliente incompleto se rechaza');
await p.click('[data-act=close]');

// Control de versión: si otro lo cambia mientras se edita, no se pisa
const otro = await pagina(nav, {}, 'gestión 2'); await entrarGestion(otro);
await p.click('[data-view=clientes]'); await p.fill('#q', cli); await p.click('.card');
await otro.click('[data-view=clientes]'); await otro.fill('#q', cli); await otro.click('.card');
await otro.fill('[name=telefono]', '600 111 222'); await otro.click('#sheet-form .btn.primary'); await otro.waitForSelector('#overlay', { state: 'hidden' });
await p.fill('[name=telefono]', '999 999 999'); await p.click('#sheet-form .btn.primary'); await p.waitForTimeout(800);
const c = Object.values((await datos()).clientes).find(x => x.nombre === cli);
ok(c.telefono === '600 111 222' && (await p.textContent('#toast')).includes('No se ha guardado'), 'dos ediciones a la vez: no se pisa y se avisa');

// Recargar mantiene la sesión
await p.reload(); await p.waitForSelector('.kpis', { timeout: 10000 });
ok(await p.isHidden('#login'), 'al recargar no vuelve a pedir la clave');
await fin(nav);
