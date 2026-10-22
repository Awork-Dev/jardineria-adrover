## Las tres apps

Jardinería Adrover funciona con tres apps: la **web** para los clientes, la **gestión** para la oficina y la **app del equipo** para los operarios. Se abren en el navegador y se pueden poner en el móvil como una app más.

| App | Para quién | Enlace | Icono |
| --- | --- | --- | --- |
| Web | Clientes y público | [jardineriaadrover.es](https://jardineriaadrover.es) | Verde |
| Gestión | Oficina (con clave) | [gestionadrover.jardineriaadrover.workers.dev](https://gestionadrover.jardineriaadrover.workers.dev) | Dorado |
| Equipo | Operarios (con PIN) | [equipo.jardineriaadrover.workers.dev](https://equipo.jardineriaadrover.workers.dev) | Lima y negro |

**Ponerla en el móvil:** ábrela en Safari (iPhone) y pulsa **Compartir → Añadir a pantalla de inicio**; en Android, menú **⋮ → Añadir a pantalla de inicio**.

## Entrar

La gestión pide la clave la primera vez y la recuerda en ese aparato hasta que pulses **Cerrar sesión**.

- **Clave incorrecta:** revisa mayúsculas y espacios. Tras 10 intentos fallidos se bloquea 15 minutos.
- **«Falta configurar la clave en Cloudflare»:** en Cloudflare, abre **gestionadrover → Configuración → Variables y secretos** y añade un **Secreto** llamado `CLAVE` con tu clave.
- **Cerrar sesión:** abajo a la izquierda (en el móvil, al final de **Inicio**).

## Resumen

El Resumen enseña cómo va el negocio: clientes, lo aceptado, lo pendiente de respuesta, las notas por cobrar y las horas del mes.

- **Gráfico:** lo aceptado en los últimos 6 meses.
- **Datos de la empresa:** salen en los PDF. Se cambian con **Editar**, donde también van las **condiciones** del pie de los presupuestos.
- **Datos de ejemplo:** mientras haya ejemplos sale un aviso con **Borrar ejemplos**. Pulsa dos veces y se borra todo lo marcado «(Ejemplo)»; tus datos reales no se tocan.

## Clientes y proveedores

1. Entra en **Clientes** (o **Proveedores**) y pulsa **+ Nuevo**.
2. Rellena nombre, CIF/NIF, contacto, correo, teléfono, dirección, C.P., población y provincia.
3. Pulsa **Guardar**.

- **Para hacerle una nota**, el cliente necesita **NIF/CIF, dirección, C.P. y población**.
- **Buscar:** por nombre, CIF, correo o teléfono.
- **Borrar:** abre la ficha y pulsa **Eliminar** dos veces. Si tiene documentos, avisa antes.

## Presupuestos

1. **Presupuestos → + Nuevo.**
2. Elige **cliente**, **fecha**, **estado** e **IVA** (21, 10, 4 o 0 %).
3. Añade las **líneas**: concepto, cantidad y precio sin IVA. El total se calcula solo.
4. Escribe **observaciones** si hace falta y pulsa **Guardar**. El número (P-2026-001…) se pone solo.

| Botón | Qué hace |
| --- | --- |
| Descargar PDF | En el ordenador lo descarga; en el móvil abre **Compartir** (WhatsApp, correo…). Al compartirlo, un Borrador pasa a Enviado |
| Duplicar | Crea uno nuevo con las mismas líneas |
| Crear nota | Crea una nota con las mismas líneas, enlazada al presupuesto |

- **Estados:** Borrador → Enviado → Aceptado o Rechazado. El Resumen suma lo aceptado.
- **IVA 0 %:** pon el motivo de la exención en Observaciones.
- **El PDF sale con lo guardado:** pulsa **Guardar** antes de descargarlo.

## Notas

La nota funciona como una factura pero **no lo es**: deja constancia de un trabajo y de su cobro. Para facturar hay que usar un programa homologado (VERI*FACTU).

- **Crear:** **Notas → + Nuevo**, o desde un presupuesto con **Crear nota**.
- **Número:** solo y en orden por año: N-2026-001, N-2026-002…
- **Cliente:** necesita NIF/CIF, dirección, C.P. y población. Sus datos se guardan con la nota.
- **Estados:** Pendiente de cobro → Cobrada (o Anulada).
- **PDF:** título «NOTA» y al final «Este documento no es una factura».

## Partes

Los hacen los jefes de cuadrilla desde el móvil y llegan solos, como mucho en un minuto.

- Traen cliente, horas, quién ha ido, tareas, detalles, fotos y **avisos para la oficina** (en amarillo).
- **Horas por persona:** 2 personas durante 2,5 h cuentan 5 h.
- **Corregir:** ábrelo, cambia y **Guardar**. Desde entonces el jefe ya no puede modificarlo desde su app.
- **PDF de un parte:** ábrelo y pulsa **Descargar PDF**. Sale con los datos del cliente, horas, tareas, fotos y un recuadro para la firma de la empresa. Los avisos para la oficina no salen.
- **PDF del mes de un cliente** (para adjuntar a la factura o archivar): en **Partes** elige **cliente** y **mes** y pulsa **PDF de estos partes**. Sale una tabla con todos los partes y el total de horas.

## Equipo

**Dar de alta a alguien**

1. **Equipo → Personas → + Nuevo.**
2. Nombre y puesto: **Operario** o **Jefe de cuadrilla** (solo los jefes hacen partes).
3. Apunta el **PIN** que sale y pulsa **Guardar**. Dale el PIN y el enlace de la app del equipo.

- **Si pierde el móvil o se va:** cámbiale el PIN o ponlo **De baja**. Pierde el acceso al momento; sus datos se conservan.
- **Jornada:** elige persona y mes; sale cada día con entradas, salidas y total. **Descargar PDF** para firmar. Hay que guardarlo 4 años.
- **Gastos:** cada uno con la foto del ticket. Al pagarlo, ábrelo, pon **Pagado** y **Guardar**.
- **Fotos:** las de cada trabajo, por cliente y fecha. Púlsala para ampliarla.

## Copias de seguridad

Cada noche se guarda sola una copia de todo y se conserva 60 días.

- **Copias de seguridad:** lista por fecha para **Descargar** o **Recuperar** (vuelve a poner lo de ese día; lo creado después se mantiene). **Hacer copia ahora** antes de un cambio grande.
- **Descargar copia / Cargar copia:** baja todo a un archivo o lo vuelve a subir.

## Si algo falla

| Qué pasa | Qué hacer |
| --- | --- |
| No carga en el ordenador | Ctrl + F5 (Mac: Cmd + Mayús + R) o prueba otro navegador |
| No llega un parte o un gasto | Espera un minuto. Si no sale, el operario verá «Hay datos sin enviar»: que abra la app con cobertura y pulse **Sincronizar** |
| Un operario no puede entrar | Revisa su PIN en **Equipo → Personas** y que no esté **De baja** |
| El icono del móvil sale antiguo | Borra el acceso y vuelve a añadirlo |

**Dónde están los datos:** en Cloudflare, en una base de datos con jurisdicción de la Unión Europea, con copia cada noche.
