// Cabeceras de seguridad de las páginas de la gestión y de la app del equipo.
// El navegador solo ejecuta los scripts de la propia app (los escritos en la página, reconocidos por su huella,
// y los archivos que sirve ella misma), solo habla con su servidor, no deja que otra web la incruste en un marco
// y recuerda que debe entrar siempre por https. Si alguien lograra colar código en un dato, no se ejecutaría.
export async function cabecerasPagina(html, { conexiones = "'self'", extra = '', permisos }) {
  const huellas = await Promise.all([...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(async ([, js]) =>
    `'sha256-${btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(js)))))}'`));
  return {
    'content-type': 'text/html;charset=utf-8',
    'content-security-policy': `default-src 'none'; script-src 'self' ${huellas.join(' ')}; style-src 'unsafe-inline'; img-src 'self' blob: data:; connect-src ${conexiones}; manifest-src 'self'; ${extra}base-uri 'none'; form-action 'self'; frame-ancestors 'none'`,
    'strict-transport-security': 'max-age=31536000',
    'permissions-policy': permisos,
    'x-content-type-options': 'nosniff', 'x-frame-options': 'DENY', 'referrer-policy': 'no-referrer',
    // Ninguna de las dos debe salir en Google.
    'x-robots-tag': 'noindex',
  };
}
