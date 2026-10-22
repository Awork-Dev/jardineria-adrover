// Iconos de la empresa para el navegador y para «Añadir a pantalla de inicio» (iPhone y Android).
// Los archivos están en compartido/iconos/; tras cambiarlos, ejecutar node compartido/generar-iconos.mjs.
import { ICONOS } from './iconos-datos.js';

const bytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

// Devuelve la respuesta con el icono si la ruta es la de un icono; si no, null.
export function icono(ruta) {
  const i = ICONOS[ruta];
  return i ? new Response(bytes(i[1]), { headers: { "content-type": i[0], "cache-control": "public, max-age=604800" } }) : null;
}

// Manifiesto de la web app: nombre, colores e iconos.
export function manifiesto(nombre, corto, inicio) {
  return new Response(JSON.stringify({
    name: nombre, short_name: corto, start_url: inicio, scope: "/", display: "standalone",
    background_color: "#1f3d2b", theme_color: "#1f3d2b", lang: "es",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }), { headers: { "content-type": "application/manifest+json; charset=utf-8", "cache-control": "public, max-age=86400" } });
}

// Etiquetas para el <head> de cada página.
export const cabeceraIconos = (titulo) =>
  '<link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">' +
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/manifest.webmanifest">' +
  '<meta name="theme-color" content="#1f3d2b"><meta name="mobile-web-app-capable" content="yes">' +
  '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="' + titulo + '">';
