// Dictado por voz que comparten la gestión y la app del equipo: un micrófono en cada campo de texto y
// «Dictar parte completo», que saca de una frase el cliente, la fecha, el horario u horas, quién ha ido, las tareas,
// el trabajo y los avisos. Usa el reconocimiento de voz del navegador (Chrome y Safari), en español.
// Se inyecta en las dos páginas como <script> (marca /*VOZ*/) y deja un objeto global VOZ.
// Cada página pone VOZ.aviso = su función de avisos (toast).
// Va como texto (String.raw) y no como función: al publicar, el empaquetador añade a las funciones ayudas
// (__name) que no existen en el navegador.
export const vozJS = () => `const VOZ = (${CODIGO})();`;

const CODIGO = String.raw`function () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const MIC_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/></svg>';
  const NO_SR = 'Este navegador no deja dictar desde la página. Ábrela en Chrome o Safari, o usa el micrófono del teclado.';
  const V = {SR, MIC_SVG, aviso: (m) => console.warn(m)};
  let rec = null, recBtn = null;
  const avisar = (m, mal) => V.aviso(m, mal);

  // Pone un botón de micrófono a la derecha de cada campo de texto de «root».
  V.addMics = (root) => {
    if (!root) return;
    root.querySelectorAll('input[type=text],input:not([type]),input[type=email],input[type=tel],input[type=search],textarea').forEach((inp) => {
      if (inp.parentElement.classList.contains('mw') || inp.closest('.dict') || inp.hidden || /decimal|numeric/.test(inp.inputMode)) return;
      const w = document.createElement('span');
      w.className = 'mw' + (inp.tagName === 'TEXTAREA' ? ' ta' : '') + (inp.classList.contains('search') ? ' s' : '');
      inp.replaceWith(w);
      w.append(inp);
      w.insertAdjacentHTML('beforeend', '<button type="button" class="mic" data-mic aria-label="Dictar por voz" title="Dictar por voz">' + MIC_SVG + '</button>');
    });
  };
  const error = (ev) => {
    const m = ev.error === 'not-allowed' || ev.error === 'service-not-allowed'
      ? 'El micrófono no tiene permiso. Actívalo para esta página en el navegador, o usa el micrófono del teclado.'
      : ev.error === 'no-speech' ? 'No te he oído. Pulsa y prueba otra vez.'
      : ev.error === 'network' ? 'El dictado necesita conexión a internet. Sin cobertura, usa el micrófono del teclado.'
      : ev.error === 'aborted' ? '' : 'Error del micrófono (' + ev.error + ').';
    if (m) avisar(m, true);
  };
  V.stop = () => { if (rec) { rec._ab = true; try { rec.abort(); } catch (e) {} } rec = null; if (recBtn) recBtn.classList.remove('rec'); recBtn = null; };
  const nuevo = (btn, continuo) => {
    const r = new SR();
    r.lang = 'es-ES'; r.interimResults = true; r.continuous = continuo; r.maxAlternatives = 1;
    r.onerror = error;
    rec = r; recBtn = btn; btn.classList.add('rec');
    return r;
  };
  const arrancar = (r) => { try { r.start(); } catch (e) { V.stop(); avisar('No se pudo activar el micrófono.', true); } };

  // Micrófono de un campo: lo dictado se añade al final de lo que ya hubiera.
  V.toggleMic = (btn) => {
    if (!SR) return avisar(NO_SR, true);
    const same = recBtn === btn;
    if (rec) { try { rec.stop(); } catch (e) {} if (same) return; V.stop(); }
    const input = btn.parentElement.querySelector('input,textarea');
    if (!input) return;
    const base = input.value.trim() ? input.value.replace(/\s*$/, ' ') : '';
    const r = nuevo(btn, false);
    r.onresult = (ev) => {
      let t = '';
      for (const res of ev.results) t += res[0].transcript;
      if (input.type === 'email') t = t.replace(/\s*arroba\s*/gi, '@').replace(/\s*punto\s*/gi, '.').replace(/\s+/g, '').toLowerCase();
      else if (input.type === 'tel') t = t.replace(/[^\d+ ]/g, '');
      else if (!base && t) t = t.charAt(0).toUpperCase() + t.slice(1);
      input.value = base + t;
      input.dispatchEvent(new Event('input', {bubbles: true}));
    };
    r.onend = () => { btn.classList.remove('rec'); if (rec === r) { rec = null; recBtn = null; } };
    arrancar(r);
  };

  // Dictado largo: escucha hasta que se vuelve a pulsar (o hasta un silencio) y entrega el texto a «alAcabar».
  V.dictar = (btn, txt, alAcabar) => {
    if (!SR) return avisar(NO_SR, true);
    if (rec && recBtn === btn) { try { rec.stop(); } catch (e) {} return; }
    V.stop();
    const lab = btn.querySelector('span'), texto0 = lab ? lab.textContent : '';
    let last = '';
    const r = nuevo(btn, true);
    r.onresult = (ev) => {
      let f = '', i = '';
      for (const res of ev.results) { if (res.isFinal) f += res[0].transcript + ' '; else i += res[0].transcript; }
      last = (f + i).trim();
      if (txt) txt.textContent = last || 'Te escucho…';
    };
    r.onend = () => {
      btn.classList.remove('rec'); if (lab) lab.textContent = texto0;
      const ab = r._ab;
      if (rec === r) { rec = null; recBtn = null; }
      if (!ab && last) alAcabar(last);
    };
    if (lab) lab.textContent = 'Parar y rellenar';
    if (txt) txt.textContent = 'Te escucho… pulsa otra vez cuando acabes.';
    arrancar(r);
  };

  // De la frase dictada saca los datos del parte. «datos»: {clientes: [[id, nombre]], operarios: [[id, nombre]], tareas: [...]}.
  // Lo que no se reconoce como dato queda como trabajo realizado.
  const NUMS = {un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12};
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const escRe = (s) => s.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&');
  const CSTOP = new Set(['del', 'las', 'los', 'comunidad', 'propietarios', 'calle', 'slu', 'sociedad', 'limitada']);
  const TAREAS_VOZ = {
    'Corte de césped': /\b(cesped|segar|siega|segado)\b/, 'Poda': /\bpod(a|ar|ado|amos|ando)\b/,
    'Desbroce': /\bdesbro(ce|zar|zado|zamos|zando)\b/, 'Riego': /\b(riego|regar|regado|regamos)\b/,
    'Plantación': /\bplant(acion|ar|ado|amos|ando)\b/, 'Limpieza': /\blimpi(eza|ar|ado|amos|ando)\b/,
    'Retirada de restos': /\b(restos|retirada|retirar|retirado|recogida de ramas)\b/, 'Tratamiento': /\b(tratamiento|tratar|tratado|fumig\w*|sulfat\w*|fitosanitario\w*)\b/,
  };
  V.parse = (raw, datos) => {
    const t = String(raw).normalize('NFC').trim(), n = norm(t), cuts = [], out = {};
    const back = (start, re) => { const m = n.slice(0, start).match(re); return m ? start - m[0].length : start; };
    const NW = Object.keys(NUMS).join('|');
    const valor = (x) => NUMS[x] ?? parseFloat(String(x).replace(',', '.'));
    let m;
    // Avisos para la oficina: desde «aviso», «incidencia» u «ojo» hasta el final.
    let fin0 = n.length;
    if ((m = n.match(/\b(avisos?|avisar a la oficina|avisar|incidencias?|ojo|para la oficina)\b[\s:,]*/))) {
      const a = t.slice(m.index + m[0].length).replace(/^(que|de que)\s+/i, '').trim();
      out.incidencias = a ? a.charAt(0).toUpperCase() + a.slice(1) : '';
      cuts.push([m.index, t.length]); fin0 = m.index;
    }
    const nn = n.slice(0, fin0);
    // Horario: «de 8 a 13», «desde las 8:30 hasta las 2», «de ocho y media a una»
    const H = '(\\d{1,2}|' + NW + ')(?:[:.h]\\s?(\\d{2})|\\s+y\\s+(media|cuarto))?';
    if ((m = nn.match(new RegExp('\\b(?:de|desde)\\s+(?:las?\\s+)?' + H + '\\s+(?:a|hasta)\\s+(?:las?\\s+)?' + H + '(?:\\s+(?:horas|h))?\\b')))) {
      const hm = (h, mm, fr) => [valor(h), mm ? +mm : fr === 'media' ? 30 : fr === 'cuarto' ? 15 : 0];
      let [h1, m1] = hm(m[1], m[2], m[3]), [h2, m2] = hm(m[4], m[5], m[6]);
      if (h1 < 6) h1 += 12;
      if (h2 * 60 + m2 <= h1 * 60 + m1 && h2 < 12) h2 += 12;
      if (h1 < 24 && h2 < 24 && m1 < 60 && m2 < 60 && h2 * 60 + m2 > h1 * 60 + m1) {
        const f = (h, mm) => String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
        out.inicio = f(h1, m1); out.fin = f(h2, m2);
        cuts.push([back(m.index, /(?:\b(?:hemos estado|estuvimos|trabajando|horario)\s+)+$/), m.index + m[0].length]);
      }
    }
    // Horas en total (solo si no hay horario)
    if (!out.inicio) {
      if ((m = nn.match(new RegExp('\\b(\\d+(?:[.,]\\d+)?|' + NW + ')\\s+horas?(?:\\s+y\\s+(media|cuarto|tres cuartos))?\\b')))) {
        let h = valor(m[1]);
        if (m[2]) h += m[2] === 'media' ? 0.5 : m[2] === 'cuarto' ? 0.25 : 0.75;
        out.horas = h;
        cuts.push([back(m.index, /(?:\b(?:durante|unas|son|de|en total)\s+)+$/), m.index + m[0].length]);
      } else if ((m = nn.match(/\bhora y media\b/))) {
        out.horas = 1.5; cuts.push([back(m.index, /(?:\b(?:durante|una)\s+)+$/), m.index + m[0].length]);
      } else if ((m = nn.match(/\bmedia hora\b/))) {
        out.horas = 0.5; cuts.push([back(m.index, /(?:\bdurante\s+)+$/), m.index + m[0].length]);
      }
    }
    // Fecha
    if ((m = nn.match(/\b(anteayer|antes de ayer)\b/))) { out.dias = -2; cuts.push([m.index, m.index + m[0].length]); }
    else if ((m = nn.match(/\bayer\b/))) { out.dias = -1; cuts.push([m.index, m.index + m[0].length]); }
    else if ((m = nn.match(/\bhoy\b/))) { out.dias = 0; cuts.push([m.index, m.index + m[0].length]); }
    // Quién ha ido: por nombre completo o por el nombre de pila.
    out.operarios = [];
    for (const [k, nombre] of datos.operarios || []) {
      const full = norm(nombre).trim(), first = full.split(/\s+/)[0];
      if (!full) continue;
      const r = new RegExp('\\b' + escRe(full) + '\\b').exec(nn) || (first.length >= 3 ? new RegExp('\\b' + escRe(first) + '\\b').exec(nn) : null);
      if (r) { out.operarios.push(k); cuts.push([back(r.index, /(?:\b(?:con|y|e|operarios?|operarias?|hemos ido|ha ido|han ido|fuimos)\s+|,\s*)+$/), r.index + r[0].length]); }
    }
    // Cliente: el que más palabras de su nombre tenga en la frase.
    let best = null;
    for (const [id, nombre] of datos.clientes || []) {
      const toks = norm(nombre).split(/[^a-z0-9]+/).filter((w) => w.length >= 3 && !CSTOP.has(w));
      if (!toks.length) continue;
      const hits = [];
      toks.forEach((w) => { const r = new RegExp('\\b' + escRe(w) + '\\b').exec(nn); if (r) hits.push([r.index, r.index + w.length]); });
      if (!hits.length) continue;
      const score = hits.length / toks.length + hits.length * 0.01;
      if (!best || score > best.score) best = {id, score, hits};
    }
    if (best) {
      out.clienteId = best.id;
      const s0 = Math.min(...best.hits.map((h) => h[0])), e0 = Math.max(...best.hits.map((h) => h[1]));
      (e0 - s0 < 40 ? [[s0, e0]] : best.hits).forEach(([s, e]) => cuts.push([back(s, /(?:\b(?:en casa de|en casa del|en casa|en|el|la|los|las|para|de|del|al|a|cliente|con)\s+)+$/), e]));
    }
    // Tareas: se marcan, pero se quedan en el texto.
    out.tareas = (datos.tareas || []).filter((x) => TAREAS_VOZ[x] && TAREAS_VOZ[x].test(nn));
    // Lo que queda es el trabajo realizado.
    cuts.sort((a, b) => a[0] - b[0]);
    let d = '', pos = 0;
    for (const [s, e] of cuts) { if (s > pos) d += t.slice(pos, s) + ' '; pos = Math.max(pos, e); }
    d += t.slice(pos);
    d = d.replace(/\s+([,.;:])/g, '$1').replace(/([,.;:])(\s*[,.;:])+/g, '$1').replace(/\s{2,}/g, ' ')
      .replace(/^[\s,.;:]+|[\s,.;:]+$/g, '').replace(/^(y|e)\s+/i, '');
    out.descripcion = d ? d.charAt(0).toUpperCase() + d.slice(1) : '';
    if (out.dias !== undefined) { const f = new Date(); f.setDate(f.getDate() + out.dias); out.fecha = f.getFullYear() + '-' + String(f.getMonth() + 1).padStart(2, '0') + '-' + String(f.getDate()).padStart(2, '0'); }
    return out;
  };
  // Añade un texto al final de un campo, separado por un punto.
  V.anadir = (el, txt) => { if (el && txt) el.value = el.value.trim() ? el.value.trim().replace(/[.\s]*$/, '') + '. ' + txt : txt; };
  return V;
}`;
