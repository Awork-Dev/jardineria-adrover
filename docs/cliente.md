# Ficha del proyecto · Jardinería Adrover

## Cliente

- **Empresa:** Zones Verdes S.L. (nombre comercial: Jardinería Adrover)
- **CIF:** B07566193
- **Dirección:** Ctra. Son Servera-Capdepera, km 11,600 · 07580 Capdepera (Illes Balears)
- **Teléfonos:** 971 563 213 · 654 788 002 · 626 900 428 (WhatsApp y SMS: 626 900 428)
- **Correo:** jardineriaadrover@gmail.com

## Qué se ha entregado

1. **Web pública** en cuatro idiomas (castellano, catalán, inglés y alemán): inicio, servicios, vivero,
   guía verde (plantas, calendario, doctor de plantas, xerojardinería), herramientas, noticias, contacto
   con presupuesto, aviso legal y mapa del sitio. Cambia de colores y avisos según la temporada.
2. **Vigilante de noticias:** cada 3 horas busca noticias de jardinería y plantas y las guarda
   para la sección de noticias.
3. **Gestión interna** con clave: clientes, proveedores, presupuestos (`P-AAAA-NNN`) y notas (`N-AAAA-NNN`)
   con IVA a elegir (21, 10, 4 o 0 %) y PDF, partes de trabajo y resumen por meses. Una nota se puede crear desde un presupuesto
   con un botón; su PDF lleva el título «NOTA» y la frase «Este documento no es una factura».
   Para guardar una nota, el cliente debe tener NIF/CIF, dirección, código postal y población. Cada presupuesto
   y nota guarda una copia de los datos del cliente de ese momento, así el PDF no cambia si luego se edita la ficha.
4. **Página de accesos** para el cliente.
5. **Web app:** la web y la gestión se pueden añadir a la pantalla de inicio del móvil (iPhone y Android)
   con el icono de la empresa. En el iPhone se llaman «Adrover» y «Gestión».

## Recursos en Cloudflare

| Recurso | Nombre | ID |
|---|---|---|
| Worker de la web | `hall` | — |
| Worker de la gestión | `gestionadrover` | — |
| KV de la web | `hall-datos` (binding `DATOS`) | `984960ce65f5450e81f433edb5354799` |
| Base D1 de la gestión | `jardineria-adrover-gestion` (binding `DB`) | `e74eb7e7-c0c6-41d0-933f-a6e5772d270e` |
| KV de copias de la gestión | `gestion-copias` (binding `COPIAS`) | `c74f881c6f0d429689e3d576bc3734cd` |
| Tabla de intentos de acceso | `intentos` en la base D1 | bloquea 15 min tras 10 claves incorrectas |
| Secreto | `CLAVE` en `gestionadrover` | solo en Cloudflare |

Las fotos de la web están en Google Drive; sus IDs están en `web/src/datos.js`.

## Copias de seguridad

- **Automáticas:** cada noche (03:15 UTC) el Worker `gestionadrover` guarda una copia de todos los datos
  en el KV `gestion-copias`. Se conservan 60 días.
- **Desde la gestión:** «Copias de seguridad» muestra las copias por fecha para descargarlas o recuperarlas
  (recuperar vuelve a poner lo de ese día y mantiene lo creado después). «Hacer copia ahora» crea una al momento.
- **Manuales:** «Descargar copia» baja un JSON con todo; «Cargar copia» lo vuelve a subir.
- Además, Cloudflare guarda el historial de la base D1 de los últimos 30 días (Time Travel).

## Decisiones

- **Facturas:** la gestión hace presupuestos y notas, no facturas. En España, los programas de facturación deben
  cumplir el reglamento VERI*FACTU (registro encadenado y envío a Hacienda). Para facturar conviene usar un
  programa homologado y, si hace falta, importar los presupuestos aceptados.
