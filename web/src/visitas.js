// Estadísticas anónimas de la web: cuántas veces se abre cada página (por día, idioma y país) y qué plantas se
// buscan y no están en la guía. Sin cookies y sin guardar la dirección IP ni ningún identificador de la persona.
// Se guardan en la base D1 «jardineria-adrover-web» (web/schema.sql) y se ven en la gestión (Resumen → «La web»).

// Topes: la cuenta de Cloudflare limita las escrituras del día y las comparte con la gestión, así que la web
// nunca apunta más de esto aunque la visite un robot sin parar.
export const MAX_VISITAS_DIA = 5000, MAX_BUSQUEDAS_DIA = 300, MAX_BUSQUEDAS = 1000, DIAS_GUARDADOS = 400;
const ROBOT = /bot|crawl|spider|preview|monitor|headless|lighthouse|pingdom|curl|wget|python|scrapy|facebookexternalhit|whatsapp/i;
const noRobot = (req) => !ROBOT.test(req.headers.get("user-agent") || "");
export const diaMadrid = (t = Date.now()) => new Date(t).toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });
// Sube el tope del día; cuando se alcanza, ni esta sentencia ni la que apunta el dato escriben nada.
const TOPE = "COALESCE((SELECT n FROM topes WHERE clave = ?1), 0) < ?2";
const subirTope = (db, clave, max) => db.prepare("INSERT INTO topes (clave, n) VALUES (?1, 1) ON CONFLICT (clave) DO UPDATE SET n = n + 1 WHERE n < ?2").bind(clave, max);

// Una visita: solo cuentan las páginas que abre una persona en su navegador (los robots, las vistas previas de
// WhatsApp y los programas no envían estas cabeceras). Si la base falla, la página se sirve igual.
export async function contarVisita(env, req, idioma, ruta) {
  if (!env.VISITAS || req.headers.get("sec-fetch-dest") !== "document" || req.headers.get("sec-fetch-mode") !== "navigate" || !noRobot(req)) return;
  const dia = diaMadrid(), clave = dia + " visitas", pais = /^[A-Z]{2}$/.test(req.cf?.country || "") ? req.cf.country : "??";
  try {
    await env.VISITAS.batch([
      env.VISITAS.prepare(`INSERT INTO visitas (dia, ruta, idioma, pais, n) SELECT ?3, ?4, ?5, ?6, 1 WHERE ${TOPE} ON CONFLICT (dia, ruta, idioma, pais) DO UPDATE SET n = n + 1`)
        .bind(clave, MAX_VISITAS_DIA, dia, ruta, idioma, pais),
      subirTope(env.VISITAS, clave, MAX_VISITAS_DIA),
    ]);
  } catch (e) { /* sin estadística de esta visita */ }
}

// Lo que se escribe en el buscador se guarda solo si parece el nombre de una planta: letras, entre 3 y 40, hasta 5 palabras.
export function limpiarBusqueda(q) {
  const t = String(q || "").toLowerCase().replace(/\s+/g, " ").trim();
  return /^\p{L}[\p{L} .'’·-]{2,39}$/u.test(t) && t.split(" ").length <= 5 ? t : "";
}
// Una búsqueda sin resultado, enviada por el buscador de la propia web. «existe» dice si la guía ya tiene esa planta.
export async function apuntarBusqueda(env, req, idiomas, existe) {
  if (!env.VISITAS || req.headers.get("sec-fetch-site") !== "same-origin" || !noRobot(req)) return;
  const b = await req.json().catch(() => null), q = limpiarBusqueda(b && b.q), idioma = b && idiomas.includes(b.l) ? b.l : "";
  if (!q || !idioma || existe(q, idioma)) return;
  const dia = diaMadrid(), clave = dia + " busquedas";
  try {
    await env.VISITAS.batch([
      // Las ya apuntadas suman una vez más; las nuevas solo entran mientras la lista no esté llena.
      env.VISITAS.prepare(`INSERT INTO busquedas (q, idioma, n, ultima) SELECT ?3, ?4, 1, ?5 WHERE ${TOPE}
        AND (EXISTS (SELECT 1 FROM busquedas WHERE q = ?3) OR (SELECT count(*) FROM busquedas) < ?6)
        ON CONFLICT (q) DO UPDATE SET n = n + 1, idioma = excluded.idioma, ultima = excluded.ultima`)
        .bind(clave, MAX_BUSQUEDAS_DIA, q, idioma, dia, MAX_BUSQUEDAS),
      subirTope(env.VISITAS, clave, MAX_BUSQUEDAS_DIA),
    ]);
  } catch (e) { /* sin apuntar */ }
}
// Con el vigilante de noticias: se borran las visitas de hace más de DIAS_GUARDADOS días y los topes viejos.
export async function limpiarVisitas(env) {
  if (!env.VISITAS) return;
  const limite = diaMadrid(Date.now() - DIAS_GUARDADOS * 86400e3);
  try {
    await env.VISITAS.batch([
      env.VISITAS.prepare("DELETE FROM visitas WHERE dia < ?1").bind(limite),
      env.VISITAS.prepare("DELETE FROM topes WHERE clave < ?1").bind(diaMadrid(Date.now() - 2 * 86400e3)),
    ]);
  } catch (e) { /* se reintenta en la siguiente pasada */ }
}
