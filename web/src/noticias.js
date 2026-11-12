// Vigilante de noticias: lee los feeds, filtra lo que interesa y lo guarda en KV (DATOS).

export const gn = (q, lang = "es") => lang === "es"
  ? `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=es&gl=ES&ceid=ES:es`
  : `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;
// Las mismas búsquedas en Bing News (ordenadas por fecha): desde Cloudflare, Google News a veces deja de responder
// durante días, y con varias fuentes siempre entra algo nuevo.
export const bn = (q) => `https://www.bing.com/news/search?q=${encodeURIComponent(q)}&format=rss&setlang=es-ES&cc=ES&qft=${encodeURIComponent('sortbydate="1"')}`;
export const FUENTES = {
  jardineria: [
    gn("jardinería OR paisajismo OR vivero OR jardines when:7d"),
    gn("\"picudo rojo\" OR \"plagas del jardín\" OR \"riego por goteo\" OR poda when:14d"),
    bn("jardinería"), bn("jardín plantas consejos"), bn("poda árboles jardín"),
    "https://www.jardineriaon.com/feed",
  ],
  ciencia: [
    "https://www.sciencedaily.com/rss/plants_animals/botany.xml",
    "https://www.sciencedaily.com/rss/plants_animals/agriculture_and_food.xml",
    "https://phys.org/rss-feed/biology-news/plants-animals/",
    gn("botánica OR \"Jardín Botánico\" OR (plantas científicos estudio) when:14d"),
  ],
  baleares: [
    gn("(Mallorca OR Menorca OR Ibiza OR Formentera OR Baleares) (jardín OR jardines OR jardinería OR plantas OR árboles OR arbolado OR flora OR poda OR riego OR sequía OR plaga OR \"picudo rojo\" OR xylella OR \"espacio natural\" OR \"parque natural\") when:14d"),
    gn("(Mallorca OR Menorca OR Eivissa OR Formentera OR Balears) (jardí OR jardins OR jardineria OR plantes OR arbres OR flora OR sequera OR plaga OR \"parc natural\" OR \"espai natural\") when:14d"),
    bn("Mallorca jardín"), bn("Mallorca árboles"), bn("Baleares sequía riego"), bn("Mallorca plaga xylella"), bn("Mallorca parque natural"),
  ],
};
export const FUERA = /coca[ií]na|de coca\b|marihuana|narco|ratas|ratones|\bkit\b|modelos de|oferta|descuento|amazon|lidl|aldi/i;
// Webs de ofertas y anuncios de productos que se cuelan como noticias.
export const FUENTES_FUERA = /poder ?popular/i;
// Noticias de ayuntamientos (campañas de poda, contratos, plenos…) y polémicas: no ayudan a quien busca ideas
// para su jardín. En Baleares sí interesan las normas locales (riego, césped…), pero no la política ni los contratos.
export const MUNICIPAL = /ayuntamiento|ajuntament|concello|consistorio|municipal|\bpleno\b|concejal|regidor|alcald|privatiz|licitaci|adjudica|contrato|campaña de poda|plan de poda|labores de poda|trabajos de poda|brigadas?\b|al tráfico|\btalan\b|enfada|polémic|denuncia|urbaniz|viviendas|derrumbe|linaje/i;
export const POLITICA = /privatiz|licitaci|adjudica|contrato|\bpleno\b|concejal|regidor|polémic|denuncia|urbaniz|viviendas|\baena\b|aeropuerto|restaurante|gastronom|inmobiliari/i;
// Las búsquedas de Bing no se pueden limitar a las islas como las de Google: la noticia tiene que nombrar algún sitio de Baleares.
export const BALEARES = /mallorca|menorca|ibiza|eivissa|formentera|cabrera|dragonera|balear|palma\b|tramuntana|capdepera|artà|arta\b|manacor|alc[uú]dia|pollen[cç]a|s[oó]ller|inca\b|llucmajor|calvi[aà]|felanitx|santanyi|son servera|cala (ratjada|millor|d'or)|albufera/i;
// «Planta» de energía o de tratamiento, no de jardín.
export const INDUSTRIA = /plantas? (solar|fotovolt|de (hidr|biog|tratamiento|reciclaje|baterías))/i;
export const PRODUCTO = /\bpack de \d|\b\d+([.,]\d+)?\s?(mm|cm|uds?|unidades|piezas)\b|\b\d+\s?m\b.*[–-]/i;
export const PLANTAS = /plant|tree|flower|crop|soil|seed|root|leaf|leaves|forest|botan|pollinat|\bbees?\b|garden|fung|photosynth|weed|fruit|grass|árbol|arbol|flor|semilla|cultivo|bosque|suelo|hoja|polin|abeja|jard|vegetal|xylella|hongo|palmer|vivero|agricult|agrono/i;
export const NATURA = /sequ[ií]a|sequera|riego|\breg\b|plaga|plague|picudo|morrut|xylella|oliv|almendr|ametl|pinar|pinos?\b|pins\b|parque natural|parc natural|espacio natural|espai natural|tramuntana|posidonia|medio ambiente|medi ambient|incendio forestal|incendi forestal|zona verde|zones verdes|zonas verdes|poda|tala\b|vivers?\b|viveros?\b|natural/i;
// Lo que se cuela con cualquier búsqueda y no es jardinería: deporte, famosos y sus casas, turismo, actos y premios,
// empleo, empresas y dinero, colegios, agricultura comercial, obras y avisos de ayuntamientos, plagas de las casas.
export const RUIDO = new RegExp([
  "\\b(el|del|al) mallorca\\b|\\bliga\\b|partido|\\bduelo\\b|ausencias|fichaje|entrenador|\\bgol(es)?\\b|derbi|utmb|marat[oó]n|torneo|campeonato",
  "la casa de|el refugio de|chalet|mansi[oó]n|entramos en|vivir gratis|voluntarios",
  "qu[eé] ver|imprescindibles|senderismo|\\bruta\\b|escapada|pueblo de|pueblos m[aá]s|\\bhotel|alta cocina|unesco|avistamiento|ballenas|\\bplanes\\b",
  "concierto|festival|reunir[aá] a|premios?\\b|awards|galard|\\bcharla|presenta\\b|exposici[oó]n|puertas abiertas|\\btaller\\b|inaugur|estrena\\b|homenaje|disertaci|memoria de",
  "\\bplazas\\b|empleo|busca (encargad|jardiner|operari)|factura\\b|millones|\\beuros\\b|€|se integra|ayudas|subvenci|\\bbecas?\\b|formaci[oó]n remunerada",
  "\\bceip\\b|colegio|alumn|escolar|estudiantes",
  "kg/ha|hect[aá]reas?|productores|fincas de|exporta|\\blonja\\b|ganader|hidropon",
  "cerrar[aá]|cierra parques|preemergencia|alumbrado|obras de|vecinal|\\bbarrio\\b|olvidado por|reclamos|gobierno de|\\bgovern\\b.*recib",
  "plantas? hospitalari|control de plagas|cucaracha|chinches|termitas|cannabis|marcian|\\bmarte\\b|\\bmars\\b|rotonda|\\bcursos?\\b|\\bexpone\\b|referente|\\bsetas\\b",
].join("|"), "i");
// Medios de América: sus consejos van con las estaciones al revés y con otros nombres de plantas.
export const AMERICA_WEB = /\.(ar|mx|cl|co|pe|uy|ec|bo|py|ve|cr|gt|do|hn|ni|sv|pa)$/i;
export const AMERICA = /canal ?26|\ba24\b|\bmdz\b|todo noticias|milenio|el espectador|r[ií]o negro|cronista|los andes|radio mitre|infobae|gastrolab|clar[ií]n|la naci[oó]n|p[aá]gina ?12|[aá]mbito|el universal|exc[eé]lsior|el tiempo|el comercio|la tercera|biob[ií]o|\bemol\b|mongabay|entre r[ií]os|el agrario|austral|rafaela|ruidoenlared|\bchile\b|radio polar/i;
const deAmerica = (n) => { let h = ""; try { h = new URL(n.enlace).hostname; } catch { /* sin dirección válida */ } return AMERICA_WEB.test(h) || AMERICA.test(n.fuente); };
// Webs de jardinería: no hace falta que el titular nombre el jardín, pero sí que sea un consejo y no ruido.
export const FIABLES = /jardineriaon\.com/;
// Jardinería de verdad: el titular tiene que hablar de plantas o de cuidarlas.
export const JARDIN = /jard[ií]n|plantas?\b|macetas?|huerto|\bpoda|podar|\briego|regar|c[eé]sped|\bsetos?\b|arbust|[aá]rbol|frutal|\bflor(es|ece|ecen|aci[oó]n)?\b|rosal|orqu[ií]dea|lavanda|\bolivos?\b|limonero|naranjo|palmera|cactus|suculenta|hortensia|geranio|tulipan|bulbos?\b|semillas?\b|sembrar|plantar|trasplant|\babon(o|ar)\b|compost|sustrato|pulg[oó]n|cochinilla|picudo|procesionaria|xylella|helada|bons[aá]i|helecho|hiedra|romero|albahaca|salvia|philodendron|jengibre/i;
// Y además tiene que servirle a quien cuida un jardín: consejos, guías, épocas de plantar o podar, plagas.
export const PRACTICO = /cómo|^como\b|gu[ií]a|cuidados?|cuidar|consejos?|cu[aá]ndo|por qu[eé]|trucos?|errores|razones|mejor(es)?\b|necesitan?\b|\d+ plantas|plantas? (de interior|que)\b|plantar|podar|\bpoda\b|sembrar|regar|\briego\b|abonar|trasplant|cultivar|florecer|variedades|opci[oó]n|picudo|procesionaria|xylella|cochinilla|pulg[oó]n|heladas?\b/i;
export const NO_JARDIN = /medicinal|museo|\bvecin/i;
// En la pestaña de Baleares no entran las noticias de otros sitios que solo comparten una palabra (la Albufera de Valencia).
export const OTRAS = /val[eè]ncia|catalu[ñn]|andaluc|galicia|canarias|madrid|murcia|alicante|barcelona|sevilla|m[aá]laga|asturias|arag[oó]n/i;
// Ciencia de plantas, no de animales.
export const ANIMALES = /\bbirds?\b|turtle|\bcats?\b|orangutan|whale|\bfish\b|rodent|elephant|barnacle|\bwasps?\b|zombie|fruit fl(y|ies)|insects? support|\baves\b|ballena|tortuga|elefante|orangut|abejas|\bbees?\b/i;
export const dec = (s) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&amp;/g, "&");
export const tag = (x, t) => { const m = x.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`, "i")); return m ? dec(m[1]).trim() : ""; };
export const limpia = (s) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const NOMBRES = { "jardineriaon.com": "Jardinería On", "sciencedaily.com": "ScienceDaily", "phys.org": "Phys.org" };
// Lee un feed y dice cómo ha ido (estado HTTP o error), para saber qué fuente falla.
export async function leer(url) {
  try {
    const r = await fetch(url, { headers: {
      "user-agent": "Mozilla/5.0 (compatible; JardineriaAdrover/1.0; +https://jardineriaadrover.es)", accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
      // Sin esto, Google puede contestar desde Europa con su página de consentimiento en lugar del feed.
      ...(url.includes("news.google.com") ? { cookie: "CONSENT=YES+; SOCS=CAI" } : {}),
    } });
    if (!r.ok) return { items: [], estado: r.status };
    const xml = await r.text();
    const items = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
    const google = url.includes("news.google.com");
    return { estado: items.length ? r.status : "sin noticias", items: items.slice(0, 25).map((it) => {
      let titulo = limpia(tag(it, "title"));
      let enlace = limpia(tag(it, "link"));
      // Bing da un enlace suyo que lleva la noticia en «url=».
      const b = /bing\.com\/news\/apiclick/.test(enlace) && enlace.match(/[?&]url=([^&]+)/);
      if (b) { try { enlace = decodeURIComponent(b[1]); } catch { /* se queda el de Bing */ } }
      let fuente = limpia(tag(it, "source") || tag(it, "News:Source"));
      if (google && fuente && titulo.endsWith(" - " + fuente)) titulo = titulo.slice(0, -(fuente.length + 3));
      if (!fuente) { try { const h = new URL(enlace).hostname.replace(/^www\./, ""); fuente = NOMBRES[h] || h; } catch { fuente = ""; } }
      const resumen = google ? "" : limpia(tag(it, "description")).slice(0, 260);
      const fecha = Date.parse(tag(it, "pubDate")) || Date.now();
      return { titulo, enlace, fuente, resumen, fecha, idioma: /sciencedaily|phys\.org|hl=en/.test(url) ? "en" : "es" };
    }).filter((n) => n.titulo && /^https?:\/\//.test(n.enlace)) };
  } catch (e) { return { items: [], estado: "error: " + (e && e.message || e) }; }
}
export const leerFeed = async (url) => (await leer(url)).items;
// Si una noticia merece salir en la web, según su categoría.
// Se decide por el titular (el resumen trae palabras sueltas que engañan): tiene que ser del tema de su pestaña,
// no ser ruido y, en Baleares, nombrar un sitio de las islas.
export function interesa(n, cat) {
  const t = n.titulo, txt = t + " " + n.resumen;
  if (FUERA.test(txt) || FUENTES_FUERA.test(n.fuente) || PRODUCTO.test(t) || INDUSTRIA.test(txt) || RUIDO.test(t)) return false;
  if (t.split(/\s+/).length < 4) return false; // titulares vacíos, como «AyuntamientoJaen»
  if (deAmerica(n)) return false;
  if (cat === "jardineria") return (JARDIN.test(t) || FIABLES.test(n.enlace)) && PRACTICO.test(t) && !NO_JARDIN.test(t) && !MUNICIPAL.test(txt);
  if (cat === "ciencia") return PLANTAS.test(t) && !ANIMALES.test(t) && !MUNICIPAL.test(t);
  return BALEARES.test(t) && !OTRAS.test(t) && (JARDIN.test(t) || NATURA.test(t)) && !POLITICA.test(txt);
}
// La clave cambia cuando cambia el filtro, para que la web no siga enseñando noticias que ya no pasarían.
// Mientras la nueva no tenga de todo, se parte de lo guardado con la anterior (pasado por el filtro nuevo):
// desde Cloudflare, Google News a veces no responde y la sección se quedaría vacía.
export const CLAVE = "noticias8", ANTERIOR = "noticias7";
export async function vigilar(env) {
  const prev = env.DATOS ? await env.DATOS.get(CLAVE, "json") : null;
  const falta = (d, c) => !((d && d[c]) || []).length;
  const viejo = env.DATOS && Object.keys(FUENTES).some((c) => falta(prev, c)) ? await env.DATOS.get(ANTERIOR, "json") : null;
  const out = { actualizado: Date.now(), fuentes: {} };
  const limite = Date.now() - 30 * 86400e3;
  for (const [cat, urls] of Object.entries(FUENTES)) {
    const leidas = await Promise.all(urls.map(leer)), listas = leidas.map((x) => x.items);
    // Qué ha dado cada fuente en esta vuelta (se ve en /api/noticias): así se sabe si alguna deja de responder.
    out.fuentes[cat] = urls.map((u, i) => { const x = new URL(u); return `${x.hostname.replace(/^www\./, "")}${x.searchParams.get("q") ? " «" + x.searchParams.get("q").slice(0, 40) + "»" : ""}: ${leidas[i].estado}, ${leidas[i].items.length}`; });
    const vistos = new Set();
    out[cat] = [...listas.flat(), ...((falta(prev, cat) ? viejo && viejo[cat] : prev[cat]) || [])].sort((a, b) => b.fecha - a.fecha).filter((n) => {
      if (n.fecha < limite || !interesa(n, cat)) return false;
      const k = n.titulo.toLowerCase().replace(/[^a-záéíóúñü0-9]/g, "").slice(0, 60);
      if (vistos.has(k)) return false; vistos.add(k); return true;
    }).slice(0, 45);
  }
  if (env.DATOS) await env.DATOS.put(CLAVE, JSON.stringify(out));
  return out;
}
export async function noticias(env, ctx) {
  let datos = env.DATOS ? await env.DATOS.get(CLAVE, "json") : null;
  if (!datos) datos = await vigilar(env);
  else {
    const edad = Date.now() - datos.actualizado;
    const vacia = !(datos.jardineria || []).length || !(datos.ciencia || []).length || !(datos.baleares || []).length;
    if (edad > 4 * 3600e3 || (vacia && edad > 10 * 60e3)) ctx.waitUntil(vigilar(env));
  }
  return new Response(JSON.stringify(datos), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=600" },
  });
}
