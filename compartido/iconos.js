// Iconos de la empresa para el navegador y para «Añadir a pantalla de inicio» (iPhone y Android).
// Cada app tiene su color: web en verde, gestión en dorado y equipo en lima y negro.
// Los archivos están en compartido/iconos/<app>/; tras cambiarlos, ejecutar node compartido/generar-iconos.mjs.
// Cada Worker importa sus iconos (compartido/iconos-<app>.js) y los pasa a icono().

const bytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

export const COLOR = { web: "#1f3d2b", gestion: "#b8862f", equipo: "#111111" };

// Los móviles guardan los iconos por su dirección y no los vuelven a pedir aunque cambien (así la gestión
// salía con el icono verde antiguo). Al cambiar un icono, sube este número: la dirección cambia y se piden de nuevo.
export const VERSION_ICONOS = 2;
const v = (ruta) => ruta + "?v=" + VERSION_ICONOS;

// Devuelve la respuesta con el icono si la ruta es la de un icono; si no, null.
export function icono(ruta, iconos) {
  const i = iconos[ruta];
  return i ? new Response(bytes(i[1]), { headers: { "content-type": i[0], "cache-control": "public, max-age=604800" } }) : null;
}

// Manifiesto de la web app: nombre, colores e iconos.
export function manifiesto(nombre, corto, inicio, app = "web") {
  return new Response(JSON.stringify({
    name: nombre, short_name: corto, start_url: inicio, scope: "/", display: "standalone",
    background_color: COLOR[app], theme_color: COLOR[app], lang: "es",
    icons: [
      { src: v("/icon-192.png"), sizes: "192x192", type: "image/png", purpose: "any" },
      { src: v("/icon-512.png"), sizes: "512x512", type: "image/png", purpose: "any" },
      { src: v("/icon-maskable-512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }), { headers: { "content-type": "application/manifest+json; charset=utf-8", "cache-control": "public, max-age=86400" } });
}

// Etiquetas para el <head> de cada página.
export const cabeceraIconos = (titulo, app = "web") =>
  `<link rel="icon" href="${v("/favicon.ico")}" sizes="32x32"><link rel="icon" type="image/png" sizes="192x192" href="${v("/icon-192.png")}">` +
  `<link rel="apple-touch-icon" href="${v("/apple-touch-icon.png")}"><link rel="manifest" href="${v("/manifest.webmanifest")}">` +
  '<meta name="theme-color" content="' + COLOR[app] + '"><meta name="mobile-web-app-capable" content="yes">' +
  '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="' + titulo + '">';
