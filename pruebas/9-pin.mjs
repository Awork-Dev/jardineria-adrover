// Protección del PIN de la app del equipo: además del bloqueo por conexión, hay un tope de PIN incorrectos para
// todas las conexiones juntas; al alcanzarlo se bloquea la entrada con PIN, la gestión lo avisa y puede desbloquearla.
// Va la última: deja conexiones bloqueadas un rato.
import { lanzar, pagina, ok, fin, T, entrarGestion, nuevoOperario, datos, E, G, CLAVE } from './comun.mjs';
import { PIN_TODAS } from '../compartido/constantes.js';
console.log('Protección del PIN');
const nav = await lanzar();
const g = await pagina(nav, {}, 'gestión'); await entrarGestion(g);
const pin = await nuevoOperario(g, 'Pin ' + T);
const estado = () => fetch(G + '/api/pin', { headers: { 'X-Clave': CLAVE } }).then((r) => r.json());
// Cada intento, desde una conexión distinta (en Cloudflare la dirección la pone la red y no se puede falsear).
const entrar = (p, ip) => fetch(E + '/api/entrar', { method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': ip }, body: JSON.stringify({ pin: p }) });
const usados = new Set(Object.values((await datos()).operarios).map((o) => o.pin));
let malo = '0000'; while (usados.has(malo)) malo = String(+malo + 1).padStart(4, '0');
ok(!(await g.isVisible('#aviso-pin')), 'con pocos PIN incorrectos la gestión no avisa');
const antes = (await estado()).fallos;
for (let i = antes; i < PIN_TODAS.max - 1; i++) await entrar(malo, '10.9.' + (i >> 8) + '.' + (i & 255));
const casi = await estado(), aun = await entrar(pin, '10.8.0.1');
ok(casi.fallos === PIN_TODAS.max - 1 && !casi.bloqueado && aun.ok, 'por debajo del tope se sigue entrando con el PIN bueno');
await entrar(malo, '10.9.9.9');
const tope = await estado(), cerrado = await entrar(pin, '10.8.0.2');
ok(tope.bloqueado && cerrado.status === 429 && (await cerrado.json()).error.includes('bloqueada'), 'al llegar al tope, la entrada con PIN queda bloqueada aunque se pruebe desde otra conexión');
await g.reload(); await g.waitForSelector('#aviso-pin:not([hidden])');
ok((await g.textContent('#aviso-pin')).includes('está bloqueada') && (await g.textContent('#aviso-pin')).includes(String(PIN_TODAS.max)), 'la gestión avisa en el Resumen de los intentos y del bloqueo');
await g.click('[data-act=pin-desbloquear]'); await g.waitForSelector('#aviso-pin[hidden]', { state: 'attached' });
const abierto = await entrar(pin, '10.8.0.3');
ok(abierto.ok && !(await estado()).bloqueado, 'la oficina la desbloquea y el PIN bueno vuelve a entrar');
await fin(nav);
