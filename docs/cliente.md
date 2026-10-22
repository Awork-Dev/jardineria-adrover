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
3. **Gestión interna** con clave: clientes, proveedores, presupuestos con IVA del 21 %, numeración
   automática (`P-AAAA-NNN`) y PDF, partes de trabajo y resumen por meses. Permite guardar y cargar copias.
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
| Secreto | `CLAVE` en `gestionadrover` | solo en Cloudflare |

Las fotos de la web están en Google Drive; sus IDs están en `web/src/datos.js`.

## Copias de seguridad

Los datos de la gestión viven en la base D1. Desde la propia gestión, «Guardar copia» descarga un JSON
con todo; «Cargar copia» lo vuelve a subir.
