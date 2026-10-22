// Dibuja los iconos de las tres apps a partir del logo (iconos/logo-interior.svg) con su paleta de colores.
// Uso (necesita Chromium y playwright-core): node compartido/generar-pngs.mjs
// Después: crear favicon.ico desde icon-192.png (p. ej. con ImageMagick) y ejecutar node compartido/generar-iconos.mjs.
import { chromium } from 'playwright-core';
import fs from 'fs';

const dir = new URL('./iconos/', import.meta.url);
const base = fs.readFileSync(new URL('logo-interior.svg', dir), 'utf8');
// Orden de los colores en el logo: fondo, aro, hoja izquierda, hoja derecha, nervios, centro, arco.
const PALETAS = {
  web:     ['#1f3d2b', '#a9d39a', '#a9d39a', '#7fae6a', '#1f3d2b', '#f6f2ea', '#f6f2ea'], // verde
  gestion: ['#b8862f', '#f6e7c4', '#fbf4e4', '#ecd9ae', '#b8862f', '#1f3d2b', '#1f3d2b'], // dorado arena
  equipo:  ['#111111', '#c6f432', '#c6f432', '#93c21b', '#111111', '#f4f4f0', '#f4f4f0'], // lima y negro
};
const navegador = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const p = await navegador.newPage();
for (const [app, pal] of Object.entries(PALETAS)) {
  let i = 0;
  const logo = base.replace(/(fill|stroke)='#[0-9a-f]{6}'/g, (_, k) => `${k}='${pal[i++]}'`);
  // Los iconos cuadrados (iPhone y Android «maskable») llevan el fondo hasta el borde.
  const cuadrado = (vb) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"><rect x="-10" y="-10" width="70" height="70" fill="${pal[0]}"/>${logo}</svg>`;
  const redondo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${logo}</svg>`;
  fs.mkdirSync(new URL(app + '/', dir), { recursive: true });
  for (const [archivo, lado, svg] of [['apple-touch-icon.png', 180, cuadrado('3 3 42 42')], ['icon-192.png', 192, redondo], ['icon-512.png', 512, redondo], ['icon-maskable-512.png', 512, cuadrado('-4 -4 56 56')]]) {
    await p.setViewportSize({ width: lado, height: lado });
    await p.setContent(`<body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${lado}" height="${lado}" `)}</body>`);
    await p.screenshot({ path: new URL(app + '/' + archivo, dir).pathname, omitBackground: true });
  }
}
await navegador.close();
