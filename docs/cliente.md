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
4. **App del equipo** (equipo.jardineriaadrover.workers.dev): cada operario entra con su PIN y ficha
   entrada y salida (registro de jornada); los jefes de cuadrilla hacen además el parte de cada trabajo
   (cliente, horas, quién ha ido, tareas, detalles, fotos y avisos para la oficina). Todos pueden apuntar
   **gastos** con la foto del ticket (gasolina, material, comida, peaje o parking, otros) y mandar **fotos
   de un trabajo**. Funciona sin cobertura.
   En la gestión, la sección **Equipo** da de alta a los operarios con su PIN y muestra el registro de
   jornada de cada uno por meses, con PDF para firmar; en sus pestañas **Gastos** (marcar como pagado) y
   **Fotos**. Los partes llegan a **Partes**.
5. **Página de accesos** para el cliente.
6. **Web app:** las tres se pueden añadir a la pantalla de inicio del móvil (iPhone y Android), cada una
   con el logo en su color: la web en verde («Adrover»), la gestión en dorado («Gestión») y la app del
   equipo en lima y negro («Equipo»).

## Recursos en Cloudflare

| Recurso | Nombre | ID |
|---|---|---|
| Worker de la web | `hall` | — |
| Worker de la gestión | `gestionadrover` | — |
| KV de la web | `hall-datos` (binding `DATOS`) | `984960ce65f5450e81f433edb5354799` |
| Base D1 de la gestión | `jardineria-adrover-gestion` (binding `DB`) | `e74eb7e7-c0c6-41d0-933f-a6e5772d270e` |
| KV de copias de la gestión | `gestion-copias` (binding `COPIAS`) | `c74f881c6f0d429689e3d576bc3734cd` |
| Worker de la app del equipo | `equipo` | — |
| Tabla de intentos de acceso | `intentos` en la base D1 | bloquea 15 min tras 10 claves o PIN incorrectos |
| Tabla de sesiones del equipo | `sesiones` en la base D1 | una por móvil; deja de valer al cambiar el PIN |
| KV de fotos del equipo | `equipo-fotos` (binding `FOTOS`) | `01cf68b53236438f96b5fa6c3a0607c3` |
| Tabla de fotos subidas | `fotos_subidas` en la base D1 | quién subió cada foto (D1 lo ve al instante; KV puede tardar) |
| Tabla de borrados | `borrados` en la base D1 | para que la gestión quite de pantalla lo borrado en otro sitio |
| Secreto | `CLAVE` en `gestionadrover` | solo en Cloudflare |

Las fotos de la web están en Google Drive; sus IDs están en `web/src/datos.js`.

## Copias de seguridad

- **Automáticas:** cada noche (03:15 UTC) el Worker `gestionadrover` guarda una copia de todos los datos
  en el KV `gestion-copias`. Se conservan 60 días.
- **Desde la gestión:** «Copias de seguridad» muestra las copias por fecha para descargarlas o recuperarlas
  (recuperar vuelve a poner lo de ese día y mantiene lo creado después). «Hacer copia ahora» crea una al momento.
- **Manuales:** «Descargar copia» baja un JSON con todo; «Cargar copia» lo vuelve a subir.
- Además, Cloudflare guarda el historial de la base D1 de los últimos 30 días (Time Travel).

## Sincronización entre el equipo y la oficina

- En el móvil, todo se guarda primero en el propio teléfono y solo se borra de ahí cuando el servidor
  confirma que lo ha guardado. Reenviar lo mismo no duplica nada: cada dato lleva su identificador.
- Si el servidor rechaza algo, aparece en «No se ha podido guardar» con el motivo, para reintentarlo.
- Cada persona tiene su propia lista de pendientes en el móvil: si entra otra persona o se pulsa «Salir»,
  lo pendiente se conserva y se envía cuando esa persona vuelva a entrar.
- La hora de los fichajes se corrige con la del servidor si el reloj del móvil va mal.
- Si la oficina ha corregido un parte, el jefe ya no puede cambiarlo desde la app (se le avisa).
- La gestión se pone al día sola cada minuto (solo pide lo cambiado) y la app del equipo también.
- Probado con cortes de cobertura, respuestas perdidas, servidor caído, rechazos, dos personas en el mismo
  móvil, dos ventanas abiertas y reloj del móvil desajustado.

## Decisiones

- **Facturas:** la gestión hace presupuestos y notas, no facturas. En España, los programas de facturación deben
  cumplir el reglamento VERI*FACTU (registro encadenado y envío a Hacienda). Para facturar conviene usar un
  programa homologado y, si hace falta, importar los presupuestos aceptados.
