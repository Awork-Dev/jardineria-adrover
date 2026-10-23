// Vigilante de noticias: lee los feeds, filtra lo que interesa y lo guarda en KV (DATOS).

export const gn = (q, lang = "es") => lang === "es"
  ? `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=es&gl=ES&ceid=ES:es`
  : `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;
export const FUENTES = {
  jardineria: [
    gn("jardinería OR paisajismo OR vivero OR jardines when:7d"),
    gn("\"picudo rojo\" OR \"plagas del jardín\" OR \"riego por goteo\" OR poda when:14d"),
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
  ],
};
export const FUERA = /coca[ií]na|de coca\b|marihuana|narco|ratas|ratones|\bkit\b|modelos de|oferta|descuento|amazon|lidl|aldi/i;
// Webs de ofertas y anuncios de productos que se cuelan como noticias.
export const FUENTES_FUERA = /poder ?popular/i;
// Noticias de ayuntamientos (campañas de poda, contratos, plenos…) y polémicas: no ayudan a quien busca ideas
// para su jardín. En Baleares sí interesan las normas locales (riego, césped…), pero no la política ni los contratos.
export const MUNICIPAL = /ayuntamiento|ajuntament|concello|consistorio|municipal|\bpleno\b|concejal|regidor|alcald|privatiz|licitaci|adjudica|contrato|campaña de poda|plan de poda|labores de poda|trabajos de poda|brigadas?\b|al tráfico|\btalan\b|enfada|polémic|denuncia|urbaniz|viviendas|derrumbe|linaje/i;
export const POLITICA = /privatiz|licitaci|adjudica|contrato|\bpleno\b|concejal|regidor|polémic|denuncia|urbaniz|viviendas|\baena\b|aeropuerto/i;
// «Planta» de energía o de tratamiento, no de jardín.
export const INDUSTRIA = /plantas? (solar|fotovolt|de (hidr|biog|tratamiento|reciclaje|baterías))/i;
export const PRODUCTO = /\bpack de \d|\b\d+([.,]\d+)?\s?(mm|cm|uds?|unidades|piezas)\b|\b\d+\s?m\b.*[–-]/i;
export const PLANTAS = /plant|tree|flower|crop|soil|seed|root|leaf|leaves|forest|botan|pollinat|\bbees?\b|garden|fung|photosynth|weed|fruit|grass|árbol|arbol|flor|semilla|cultivo|bosque|suelo|hoja|polin|abeja|jard|vegetal|xylella|hongo|palmer|vivero|agricult|agrono/i;
export const NATURA = /sequ[ií]a|sequera|riego|\breg\b|plaga|plague|picudo|morrut|xylella|oliv|almendr|ametl|pinar|pinos?\b|pins\b|parque natural|parc natural|espacio natural|espai natural|tramuntana|posidonia|medio ambiente|medi ambient|incendio forestal|incendi forestal|zona verde|zones verdes|zonas verdes|poda|tala\b|vivers?\b|viveros?\b|natural/i;
export const dec = (s) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&amp;/g, "&");
export const tag = (x, t) => { const m = x.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`, "i")); return m ? dec(m[1]).trim() : ""; };
export const limpia = (s) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
export async function leerFeed(url) {
  try {
    const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (JardineriaAdrover news bot)" } });
    if (!r.ok) return [];
    const xml = await r.text();
    const items = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
    const google = url.includes("news.google.com");
    return items.slice(0, 25).map((it) => {
      let titulo = limpia(tag(it, "title"));
      let fuente = limpia(tag(it, "source"));
      if (google && fuente && titulo.endsWith(" - " + fuente)) titulo = titulo.slice(0, -(fuente.length + 3));
      if (!fuente) fuente = url.includes("sciencedaily") ? "ScienceDaily" : url.includes("phys.org") ? "Phys.org" : "";
      const resumen = google ? "" : limpia(tag(it, "description")).slice(0, 260);
      const fecha = Date.parse(tag(it, "pubDate")) || Date.now();
      return { titulo, enlace: limpia(tag(it, "link")), fuente, resumen, fecha, idioma: url.includes("hl=es") ? "es" : "en" };
    }).filter((n) => n.titulo && /^https?:\/\//.test(n.enlace));
  } catch { return []; }
}
// Si una noticia merece salir en la web, según su categoría.
export function interesa(n, cat) {
  const txt = n.titulo + " " + n.resumen;
  if (FUERA.test(txt) || FUENTES_FUERA.test(n.fuente) || PRODUCTO.test(n.titulo) || INDUSTRIA.test(txt)) return false;
  if (n.titulo.split(/\s+/).length < 4) return false; // titulares vacíos, como «AyuntamientoJaen»
  if (cat === "jardineria" && (MUNICIPAL.test(txt) || !(PLANTAS.test(n.titulo) || NATURA.test(n.titulo)))) return false;
  if (cat === "ciencia" && !PLANTAS.test(txt)) return false;
  if (cat === "baleares" && (POLITICA.test(txt) || (!PLANTAS.test(txt) && !NATURA.test(txt)))) return false;
  return true;
}
// La clave cambia cuando cambia el filtro, para que la web no siga enseñando noticias que ya no pasarían.
// Mientras la nueva no tenga de todo, se parte de lo guardado con la anterior (pasado por el filtro nuevo):
// desde Cloudflare, Google News a veces no responde y la sección se quedaría vacía.
const CLAVE = "noticias5", ANTERIOR = "noticias4";
export async function vigilar(env) {
  const prev = env.DATOS ? await env.DATOS.get(CLAVE, "json") : null;
  const falta = (d, c) => !((d && d[c]) || []).length;
  const viejo = env.DATOS && Object.keys(FUENTES).some((c) => falta(prev, c)) ? await env.DATOS.get(ANTERIOR, "json") : null;
  const out = { actualizado: Date.now() };
  const limite = Date.now() - 30 * 86400e3;
  for (const [cat, urls] of Object.entries(FUENTES)) {
    const listas = await Promise.all(urls.map(leerFeed));
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
