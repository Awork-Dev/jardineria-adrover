// Jornada pactada de cada trabajador (ficha → «Contrato») y saldo de vacaciones.
// La usan la gestión (horas extra, registro de jornada, vacaciones), la app del equipo (avisos y saldo) y la hoja
// de horas de Google. Va como texto (String.raw) para las páginas, igual que compartido/voz.js: al publicar, el
// empaquetador añade a las funciones ayudas (__name) que no existen en el navegador. En el servidor se usa el mismo
// texto convertido en módulo (jornada-servidor.js lo genera al vuelo: ver abajo).
//
// contrato = {dias: [1, 3, 5] (0 = domingo … 6 = sábado), entrada: '09:30', salida: '13:30', alta: '2025-03-01',
//             convenio, categoria, vacaciones: 30, computo: 'naturales' | 'laborables'}
// ajustes  = {horasDia: 8, festivos: ['2026-12-25', …]} (Equipo → Horas extra → «Jornada y festivos»)
function crear() {
  const J = {};
  const min = (h) => /^([01]\d|2[0-3]):[0-5]\d$/.test(h || '') ? +h.slice(0, 2) * 60 + +h.slice(3) : null;
  const dos = (n) => String(n).padStart(2, '0');
  const iso = (d) => d.getUTCFullYear() + '-' + dos(d.getUTCMonth() + 1) + '-' + dos(d.getUTCDate());
  const fecha = (s) => new Date(s + 'T12:00:00Z');
  J.diaSemana = (dia) => fecha(dia).getUTCDay();
  J.NOMBRES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  J.CORTOS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  // Horas de un día de contrato (de la hora de entrada a la de salida).
  J.horasDia = (c) => { const e = min(c && c.entrada), s = min(c && c.salida); return e !== null && s !== null && s > e ? (s - e) / 60 : 0; };
  J.tiene = (c) => !!(c && Array.isArray(c.dias) && c.dias.length && J.horasDia(c) > 0);
  J.horasSemana = (c) => J.tiene(c) ? J.horasDia(c) * c.dias.length : 0;
  J.textoDias = (c) => J.tiene(c) ? [1, 2, 3, 4, 5, 6, 0].filter((d) => c.dias.includes(d)).map((d) => J.NOMBRES[d]).join(', ') : '';
  J.texto = (c) => J.tiene(c) ? J.textoDias(c) + ' de ' + c.entrada + ' a ' + c.salida : '';
  const fest = (aj) => Array.isArray(aj && aj.festivos) ? aj.festivos : [];
  // Por qué un día no es de trabajo ('' si lo es). Sin contrato: sábados, domingos y festivos.
  J.libre = (dia, aj, c) => {
    const s = J.diaSemana(dia), f = fest(aj).includes(dia);
    if (!J.tiene(c)) return s === 0 ? 'domingo' : s === 6 ? 'sábado' : f ? 'festivo' : '';
    if (f) return 'festivo';
    return c.dias.includes(s) ? '' : s === 0 ? 'domingo' : s === 6 ? 'sábado' : 'fuera de su horario';
  };
  // Horas extra de un día: lo que pasa de su jornada en un día de trabajo y todo lo trabajado en un día libre.
  J.extra = (ms, dia, aj, c) => {
    if (J.libre(dia, aj, c)) return ms;
    const h = J.tiene(c) ? J.horasDia(c) : Number(aj && aj.horasDia) || 0;
    return Math.max(0, ms - h * 3600e3);
  };
  J.cada = (desde, hasta, f) => { for (let d = fecha(desde); iso(d) <= hasta; d.setUTCDate(d.getUTCDate() + 1)) f(iso(d)); };
  J.diasEntre = (desde, hasta) => Math.round((fecha(hasta) - fecha(desde)) / 864e5) + 1;
  // Días de trabajo según el contrato entre dos fechas (sin festivos y desde el alta).
  J.diasDeTrabajo = (desde, hasta, aj, c) => {
    const out = [];
    if (!J.tiene(c)) return out;
    J.cada(c.alta && c.alta > desde ? c.alta : desde, hasta, (d) => { if (!J.libre(d, aj, c)) out.push(d); });
    return out;
  };
  // Lo que cuenta una ausencia: en días naturales, todos los del periodo; en laborables, solo sus días de trabajo.
  J.cuenta = (desde, hasta, aj, c) => (c && c.computo === 'laborables') ? J.diasDeTrabajo(desde, hasta, aj, c).length : J.diasEntre(desde, hasta);
  // Vacaciones de un año: las del contrato (30 días naturales si no pone otra cosa), proporcionales si entró ese año.
  // Las ausencias denegadas no cuentan; las pendientes se dan aparte.
  J.vacaciones = (anyo, c, ausencias, aj) => {
    const a = String(anyo), ini = a + '-01-01', fin = a + '-12-31';
    const base = c && Number(c.vacaciones) > 0 ? Number(c.vacaciones) : 30;
    const desde = c && c.alta && c.alta > ini ? c.alta : ini;
    const derecho = desde > fin ? 0 : Math.round(base * J.diasEntre(desde, fin) / J.diasEntre(ini, fin) * 10) / 10;
    let usadas = 0, pedidas = 0;
    for (const x of ausencias || []) {
      if (x.tipo !== 'vacaciones' || x.estado === 'denegada' || !x.desde || !x.hasta) continue;
      const d = x.desde < ini ? ini : x.desde, h = x.hasta > fin ? fin : x.hasta;
      if (d > h) continue;
      const n = J.cuenta(d, h, aj, c);
      if (x.estado === 'aceptada') usadas += n; else pedidas += n;
    }
    return {derecho, usadas, pedidas, quedan: Math.round((derecho - usadas) * 10) / 10, unidad: c && c.computo === 'laborables' ? 'laborables' : 'naturales'};
  };
  // Ausencia (no denegada) que cubre un día.
  J.ausenciaDe = (dia, ausencias) => (ausencias || []).find((x) => x.estado !== 'denegada' && x.desde <= dia && dia <= x.hasta);
  return J;
}
export const JORNADA = crear();
export const jornadaJS = () => `var __name = window.__name || ((f) => f); const JORNADA = (${crear.toString()})();`;
