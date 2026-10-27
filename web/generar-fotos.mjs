// Busca en Wikimedia Commons una foto libre para cada planta de la guía, la descarga reducida a
// web/public/plantas/<ficha>.webp y guarda su autor y licencia en web/src/fotos-plantas.js.
// Uso: node web/generar-fotos.mjs  (después de añadir plantas a la guía; necesita Python con Pillow).
// Toma la foto principal del artículo de Wikipedia de la planta (la que eligen sus editores) y solo acepta
// licencias que permiten usarla en una web comercial citando al autor: CC0, dominio público, CC BY y CC BY-SA.
// Las plantas que ya tienen foto no se vuelven a buscar. Para cambiar una, se pone en ELEGIDAS y se borra su .webp.
// Wikimedia limita las descargas: el script va despacio a propósito (unos 12 s por foto).
import fs from 'fs';
import { execFileSync } from 'child_process';
import { PLANTAS_G } from './src/guia.js';
import { FICHAS } from './src/fichas.js';

const SALIDA = new URL('./src/fotos-plantas.js', import.meta.url);
const CARPETA = new URL('./public/plantas/', import.meta.url);
const UA = 'JardineriaAdrover/1.0 (+https://jardineriaadrover.es/contacto)';
// Fotos elegidas a mano (archivo de Commons) cuando la de Wikipedia no sirve: frutos en vez de la planta, otra especie…
const ELEGIDAS = {
  acebuche: 'File:Olea europaea var. sylvestris kz01.jpg',
  almendro: 'File:Almond tree in blossom (Israel).jpg',
  granado: 'File:Pomegranate fruit and flower (Punica granatum) – Mediterranean Symbol in Shkodër.jpg',
  geranio: 'File:Red and white horseshoe geranium in Tuntorp 1.jpg',
  calathea: 'File:Houseplant Calathea orbifolia.jpg',
  cinta: "File:Chlorophytum comosum 'Variegatum' kz01.jpg",
  pita: 'File:Agave americana Toulouse.jpg',
};
// Wikipedia no siempre tiene artículo con el nombre en latín de la guía.
const ARTICULO = {
  'Olea europaea var. sylvestris': 'Olea europaea subsp. europaea', 'Lavandula angustifolia / dentata': 'Lavandula angustifolia',
  'Pelargonium spp.': 'Pelargonium', 'Calathea spp.': 'Calathea', 'Rosa spp.': 'Garden roses', 'Citrus × limon': 'Lemon',
  'Dracaena trifasciata (Sansevieria)': 'Dracaena trifasciata',
};

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
async function pedir(url, tipo = 'json') {
  for (let i = 0; i < 6; i++) {
    const r = await fetch(url, { headers: { 'user-agent': UA } });
    if (r.ok) return tipo === 'json' ? r.json() : Buffer.from(await r.arrayBuffer());
    if (r.status !== 429 && r.status < 500) throw new Error(r.status + ' ' + url);
    await espera((+r.headers.get('retry-after') || 10) * 1000 + 5000 * i);
  }
  throw new Error('Wikimedia no responde: ' + url);
}
const api = (base, params) => pedir(base + '?' + new URLSearchParams({ format: 'json', formatversion: '2', ...params }));
const limpia = (s = '') => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, ' ').trim();
const LIBRE = /^(CC0|Public domain|PD|CC BY(-SA)? \d(\.\d)?)/i;

async function fotoDeArticulo(titulo) {
  for (const wiki of ['en', 'es']) {
    const d = await api(`https://${wiki}.wikipedia.org/w/api.php`, { action: 'query', titles: titulo, redirects: '1', prop: 'pageimages', piprop: 'name', pilicense: 'free' });
    const p = d.query && d.query.pages && d.query.pages[0];
    if (p && p.pageimage) return 'File:' + p.pageimage;
    await espera(1500);
  }
  return null;
}
async function datosDeArchivo(archivo) {
  const d = await api('https://commons.wikimedia.org/w/api.php', { action: 'query', titles: archivo, prop: 'imageinfo', iiprop: 'url|extmetadata|size', iiurlwidth: '960' });
  const p = d.query.pages[0], i = p.imageinfo && p.imageinfo[0];
  if (!i) return { rechazada: 'no existe' };
  const m = i.extmetadata || {}, licencia = limpia(m.LicenseShortName && m.LicenseShortName.value);
  if (!LIBRE.test(licencia)) return { rechazada: licencia || 'sin licencia' };
  if (i.width < 400) return { rechazada: 'demasiado pequeña' };
  return {
    archivo: p.title.replace(/^File:/, ''), descarga: (i.thumburl || i.url).split('?')[0],
    autor: limpia(m.Artist && m.Artist.value).slice(0, 80) || limpia(m.Credit && m.Credit.value).slice(0, 80) || 'Autor desconocido',
    licencia, licenciaUrl: (m.LicenseUrl && m.LicenseUrl.value) || '',
  };
}
// Reducida a 720 px de ancho como máximo y guardada en WebP (unos 40 KB): la sirve la web, sin depender de Wikimedia.
function guardar(bytes, ficha) {
  const tmp = new URL(ficha + '.tmp', CARPETA);
  fs.writeFileSync(tmp, bytes);
  const [ancho, alto] = execFileSync('python3', ['-I', '-c', `
import sys
from PIL import Image, ImageOps
im = ImageOps.exif_transpose(Image.open(sys.argv[1])).convert('RGB')
im.thumbnail((720, 720 * 3))
im.save(sys.argv[2], 'WEBP', quality=72, method=6)
print(im.size[0], im.size[1])`, tmp.pathname, new URL(ficha + '.webp', CARPETA).pathname]).toString().trim().split(' ').map(Number);
  fs.unlinkSync(tmp);
  return { ancho, alto };
}

fs.mkdirSync(CARPETA, { recursive: true });
let previas = {};
try { previas = (await import(SALIDA.href + '?' + Date.now())).FOTOS_COMMONS; } catch { /* primera vez */ }
const fotos = {};
for (const p of PLANTAS_G) {
  const ficha = FICHAS[p[0]].ficha;
  if (previas[ficha] && fs.existsSync(new URL(ficha + '.webp', CARPETA))) { fotos[ficha] = previas[ficha]; continue; }
  const archivo = ELEGIDAS[ficha] || await fotoDeArticulo(ARTICULO[p[0]] || p[0].replace(/ spp\.$/, ''));
  await espera(1500);
  const f = archivo ? await datosDeArchivo(archivo) : { rechazada: 'sin foto en Wikipedia' };
  if (f.rechazada) { console.log('✗', ficha, archivo || '', '·', f.rechazada); continue; }
  await espera(12000);
  const { descarga, ...datos } = f;
  fotos[ficha] = { ...datos, ...guardar(await pedir(descarga, 'bytes'), ficha) };
  console.log('✓', ficha, '·', f.archivo, '·', f.licencia);
  // Se guarda cada vez: si Wikimedia corta a medias, lo hecho no se pierde.
  fs.writeFileSync(SALIDA, `// Fotos de las fichas de plantas tomadas de Wikimedia Commons, con su autor y licencia (se citan en cada ficha).
// Las imágenes están en web/public/plantas/. Generado con: node web/generar-fotos.mjs.
// Las fotos propias de FOTOS_PLANTAS (datos.js) tienen preferencia.
export const FOTOS_COMMONS = ${JSON.stringify({ ...previas, ...fotos }, null, 1)};
`);
}
// Al final queda solo lo de las plantas que siguen en la guía.
fs.writeFileSync(SALIDA, `// Fotos de las fichas de plantas tomadas de Wikimedia Commons, con su autor y licencia (se citan en cada ficha).
// Las imágenes están en web/public/plantas/. Generado con: node web/generar-fotos.mjs.
// Las fotos propias de FOTOS_PLANTAS (datos.js) tienen preferencia.
export const FOTOS_COMMONS = ${JSON.stringify(fotos, null, 1)};
`);
console.log(Object.keys(fotos).length, 'de', PLANTAS_G.length, 'plantas con foto');
