## Las tres apps

Jardinería Adrover funciona con tres apps: la **web** para los clientes, la **gestión** para la oficina y la **app del equipo** para los operarios. Se abren en el navegador y se pueden poner en el móvil como una app más.

| App | Para quién | Enlace | Icono |
| --- | --- | --- | --- |
| Web | Clientes y público | [jardineriaadrover.es](https://jardineriaadrover.es) | Verde |
| Gestión | Oficina (con clave) | [gestionadrover.jardineriaadrover.workers.dev](https://gestionadrover.jardineriaadrover.workers.dev) | Dorado |
| Equipo | Operarios (con PIN) | [equipo.jardineriaadrover.workers.dev](https://equipo.jardineriaadrover.workers.dev) | Lima y negro |

**Ponerla en el móvil:** ábrela en Safari (iPhone) y pulsa **Compartir → Añadir a pantalla de inicio**; en Android, menú **⋮ → Añadir a pantalla de inicio**.

**En el móvil:** las secciones están en la barra de abajo. Las fichas se abren a pantalla completa y **Guardar** queda siempre a la vista, abajo.

## Entrar

La gestión pide la clave la primera vez y la recuerda en ese aparato hasta que pulses **Cerrar sesión**.

- **Clave incorrecta:** revisa mayúsculas y espacios. Tras 10 intentos fallidos se bloquea 15 minutos.
- **«Falta configurar la clave en Cloudflare»:** en Cloudflare, abre **gestionadrover → Configuración → Variables y secretos** y añade un **Secreto** llamado `CLAVE` con tu clave.
- **Cerrar sesión:** abajo a la izquierda (en el móvil, al final de **Inicio**).

## Resumen

El Resumen enseña cómo va el negocio: clientes, lo aceptado, lo pendiente de respuesta, las notas por cobrar y las horas del mes.

- **Hoy en el equipo:** quién está trabajando ahora y los **avisos del equipo** (plagas, averías, encargos). Pulsa **Atendido** cuando lo resuelvas: el jefe de cuadrilla lo verá en su app. Si hay gastos por pagar, sale un botón que te lleva a ellos.
- **Gráfico:** lo aceptado en los últimos 6 meses.
- **Al día:** arriba a la izquierda pone cuándo se actualizó por última vez. Se actualiza sola cada minuto; púlsalo para hacerlo al momento.
- **Datos de la empresa:** salen en los PDF. Se cambian con **Editar**, donde también van las **condiciones** del pie de los presupuestos y el **precio por hora** de mano de obra (para pasar partes a notas).
- **Datos de ejemplo:** mientras haya ejemplos sale un aviso con **Borrar ejemplos**. Pulsa dos veces y se borra todo lo marcado «(Ejemplo)»; tus datos reales no se tocan.

## Clientes y proveedores

1. Entra en **Clientes** (o **Proveedores**) y pulsa **+ Nuevo**.
2. Rellena nombre, CIF/NIF, contacto, correo, teléfono, dirección, C.P., población y provincia.
3. Pulsa **Guardar**.

- **Para hacerle una nota**, el cliente necesita **NIF/CIF, dirección, C.P. y población**.
- **Buscar:** por nombre, CIF, correo o teléfono.
- **Dictar en vez de escribir:** cada campo de texto tiene un **micrófono** a la derecha. Púlsalo, habla y el texto se escribe solo.
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
- **Corregir:** ábrelo y cambia lo que haga falta. La ficha es igual que la del jefe en la app: horario, quién ha ido y tareas, y las horas se calculan solas. Al guardar, el jefe ya no puede modificarlo desde su app.
- **Pasar a nota:** dentro del parte, **Crear nota**; o en **Partes** elige cliente y mes y pulsa **Crear nota con estos partes**. Cada parte sale como una línea de mano de obra con sus horas y el precio por hora. Los partes quedan marcados con el número de la nota para no cobrarlos dos veces.
- **PDF de un parte:** ábrelo y pulsa **Descargar PDF**. Sale con los datos del cliente, horas, tareas, fotos y un recuadro para la firma de la empresa. Los avisos para la oficina no salen.
- **Dictar un parte:** en **+ Nuevo**, pulsa **Dictar parte completo** y di por ejemplo «Hoy en casa de Pérez, con Toni y Pedro, de 8 a 13, poda de setos. Aviso: falta un aspersor». Se rellenan cliente, fecha, horario u horas, quién ha ido, tareas, trabajo y avisos (lo que digas tras «aviso», «incidencia» u «ojo»). Revisa y guarda.
- **PDF del mes de un cliente** (para adjuntar a la factura o archivar): en **Partes** elige **cliente** y **mes** y pulsa **PDF de estos partes**. Sale una tabla con todos los partes y el total de horas.

## Equipo

**Dar de alta a alguien**

1. **Equipo → Personas → + Nuevo.**
2. Nombre y puesto: **Operario** o **Jefe de cuadrilla** (solo los jefes hacen partes).
3. Apunta el **PIN** que sale y pulsa **Guardar**. Dale el PIN y el enlace de la app del equipo.

**Ficha de cada persona** (pulsa su tarjeta en **Personas**)

- **Contrato:** marca los **días que trabaja**, la **hora de entrada y de salida**, la **fecha de alta**, la categoría y el convenio. Con eso la gestión sabe sus horas al día y a la semana, y cuenta sus horas extra con **su** horario: lo que pase de su jornada en sus días y todo lo que trabaje otro día o en festivo. Si su jornada es de menos de 40 h a la semana es a **tiempo parcial**: las horas de más se llaman **horas complementarias** y necesitan un pacto por escrito (consúltalo con la gestoría).
- **Vacaciones:** los **días al año** (30 si no lo cambias) y **cómo se cuentan**: en **días naturales** (todos los del calendario, también fines de semana) o **solo sus días de trabajo**, según diga su convenio. La ley fija un mínimo de 30 días naturales al año; el convenio puede mejorarlo, no bajarlo. Si entró a mitad de año, le tocan los proporcionales.
- **Móvil:** para avisarle por WhatsApp cuando le transfieras la nómina.
- **Documentos:** elige el tipo (**Contrato, DNI / NIE, Seguridad Social, Justificante u Otro**) y pulsa **Subir documento** (PDF o foto, hasta 15 MB). Se guardan al momento, en la base de datos de la Unión Europea, y **solo se ven en la gestión**: el trabajador no los ve en su app. **Ver**, **Descargar** o **Borrar** (pulsa dos veces).
- **Si pierde el móvil o se va:** cámbiale el PIN o ponlo **De baja**. Pierde el acceso al momento; sus datos se conservan.
- **Aviso de PIN incorrectos (en el Resumen):** si alguien prueba muchos PIN en la app del equipo, sale un aviso. Tras 60 fallos en un día la entrada con PIN se bloquea sola (quien ya tenía la app abierta sigue trabajando): si ha sido un despiste, pulsa **Desbloquear**; si no sabéis quién ha sido, cambiad antes los PIN.
- **La web (en el Resumen):** visitas a jardineriaadrover.es de los últimos 30 días (por día, página, país e idioma) y las plantas que la gente busca en la web y no están en la guía, para saber qué fichas añadir. Se cuenta sin cookies y sin guardar ningún dato de quien entra.
- **Jornada:** elige persona y mes; sale cada día con entradas, salidas, total y, si las hay, las horas extra. Si tiene su horario en la ficha, salen también sus **días de trabajo sin fichar** («No fichó · sin justificar») y sus **vacaciones, bajas y permisos**. **Descargar PDF** para firmar: es el registro de jornada que pide la Inspección de Trabajo, con lo que fichó de verdad. Hay que guardarlo 4 años.
- **Horas extra:** elige un mes o un año entero y sale cada persona con sus horas trabajadas y sus horas extra. Son extra las que pasan de la jornada diaria en un día laborable y todas las de sábados, domingos y festivos. **Descargar Excel** (para la gestoría) o **Descargar PDF**. Pulsa un nombre para ver sus días.
- **Estadísticas:** de un mes o de un año, las horas trabajadas y extra del equipo, la media al día, las horas de cada persona y de cada mes (gráficos), los trabajos más hechos según los partes y, por persona, días trabajados, horas en partes, clientes y gastos.
- **Jornada y festivos** (en Horas extra): las horas de la jornada diaria y los festivos. **Apunta los festivos de cada año** (nacionales, de Baleares y locales de Capdepera): si falta uno, lo trabajado ese día no sale como extra.
- **📍 junto a cada hora:** dónde estaba al fichar; púlsalo para verlo en el mapa. **«(sin ubicación)»** si su móvil no dio permiso o no tenía señal GPS. La app solo la guarda al fichar, y así se lo dice al trabajador junto al botón.
- **Validar horas:** cuando hayas comprobado las horas del mes (por ejemplo, para pagar las horas extra), pulsa **Validar horas**. Se borra la ubicación de esos fichajes y las horas se quedan. Si no se validan, la ubicación se borra sola a los tres meses. Las copias de seguridad no guardan la ubicación.
- Antes de usar la ubicación, cada trabajador tiene que firmar el aviso que lo explica (lo exige el art. 90 de la LOPDGDD). Quien fiche con su propio móvil no está obligado a darla.
- **Vacaciones y bajas:** arriba, lo **Por revisar**: vacaciones que piden desde la app y bajas o permisos con la **foto del justificante**. Ábrelo, pon **Aceptada** o **Denegada** y, si quieres, una nota: el trabajador lo ve en su app. Debajo, los **días sin fichar ni justificar** de los últimos 30 días (pulsa uno para apuntar la ausencia) y el **saldo de vacaciones** del año de cada persona: le corresponden, disfrutadas, pedidas sin aceptar y le quedan. Con **+ Nueva** apuntas tú una ausencia. Una baja médica queda **justificada**; quién la paga (Seguridad Social o empresa) lo dicen la ley y el convenio: pásale a la gestoría los partes.
- **Nóminas:** ver la sección **Nóminas**.
- **Gastos:** cada uno con la foto del ticket. Al pagarlo, ábrelo, pon **Pagado** y, si quieres, una **nota de la oficina** (por ejemplo, «pagado con la nómina»). El operario lo ve en su app.
- **Fotos:** las de cada trabajo, por cliente y fecha. Púlsala para ampliarla.

## Nóminas

En **Equipo → Nóminas**, elige el mes.

1. **Subir nóminas (PDF):** puedes elegir varias a la vez. Si el nombre del archivo lleva el **nombre y apellido** de la persona y el **mes** (por ejemplo `NOMINA_Anabel_Garcia_202610.pdf` u «octubre 2026»), se asignan solas. Si no, quedan en **Sin asignar**: elige la persona y el mes y pulsa **Asignar**.
2. Cada trabajador ve **la suya** en su app, la abre y **firma el recibí con el dedo**. Aquí ves si está **Sin abrir**, **Vista, sin firmar** o **Firmada**. **Recibí firmado** descarga el justificante en PDF con su firma, la fecha y la huella del PDF de la nómina.
3. Cuando hagas la transferencia, pulsa **Marcar transferida**: le sale el aviso en su app. Si tiene el móvil en la ficha, sale además **Avisar por WhatsApp** con el mensaje ya escrito.

**Que lleguen solas por correo:** las nóminas que se reenvían a la dirección de nóminas de la gestión entran solas, con cada PDF asignado a su persona si su nombre sale en el archivo (o en el asunto, si solo hay un PDF). Para activarlo hay que hacer una vez lo de **«Nóminas por correo»** en `docs/cliente.md`. Después, en el correo de la empresa, crea un filtro que **reenvíe** los correos de la gestoría a esa dirección.

El recibí firmado en la app sirve como constancia de que la nómina se ha entregado; no es una firma electrónica cualificada.

## Google

El botón **Google** (junto a «Copias de seguridad») conecta la gestión con la cuenta de Google de la empresa:

- **Partes de trabajo → calendario «Trabajos Adrover»**, con el cliente, el lugar, el horario, quién va y las tareas. Al conectar se envían los de los últimos tres meses y, después, cada parte nuevo o cambiado.
- **Clientes → contactos**, con la etiqueta «Clientes Adrover»: nombre, teléfono (con +34), correo y dirección. Las notas y el NIF no se envían.
- **Copias de seguridad y PDF → Drive**, en la carpeta «Jardinería Adrover · Gestión»: la copia de cada noche y cada PDF que se descarga (presupuestos, notas, partes y horas).
- **Horas → hoja de cálculo «Horas del equipo»**, una pestaña por mes con las horas y las horas extra de cada persona. Sin la ubicación de los fichajes.

**Solo la gestión escribe en Google y nunca borra nada allí.** Si alguien cambia o borra a mano una cita, un contacto o la hoja, la gestión lo vuelve a poner como estaba (las citas, en menos de media hora; el resto, cada noche o al pulsar «Sincronizar ahora»). Si se borra un parte en la gestión, su cita se queda en el calendario marcada como «ANULADO»; si se borra un cliente, su contacto se queda en Google. Las citas que alguien añada por su cuenta al calendario no se tocan.

Las horas del equipo quedan también en Google: hay que avisar al equipo, igual que con la ubicación al fichar.

**Darla de alta (una sola vez)**

1. Entra en [Google Cloud](https://console.cloud.google.com) con la cuenta de la empresa y crea un proyecto, por ejemplo «Gestión Adrover».
2. En «APIs y servicios» → «Biblioteca», activa estas cuatro: **Google Calendar API**, **People API**, **Google Drive API** y **Google Sheets API**.
3. En «Google Auth Platform» (o «Pantalla de consentimiento de OAuth»): tipo «Externo», nombre «Gestión Jardinería Adrover» y el correo de la empresa. En «Público», pulsa **Publicar app** para que quede «En producción»: si se queda «En prueba», Google corta la conexión cada 7 días.
4. En «Clientes» → «Crear cliente», tipo **Aplicación web**. En «URI de redireccionamiento autorizados» pon `https://gestionadrover.jardineriaadrover.workers.dev/google/vuelta` (el panel «Google» de la gestión la enseña).
5. Google da un **ID de cliente** y un **secreto**. No los mandes por correo ni por chat: entra en [Cloudflare](https://dash.cloudflare.com) → Workers → gestionadrover → Configuración → Variables y secretos → Añadir, de tipo «Secreto»: `GOOGLE_ID` con el ID y `GOOGLE_SECRETO` con el secreto.
6. En la gestión, **Google** → **Conectar con Google** y entra con la cuenta de la empresa. Google avisa de que la app «no está verificada»: es normal, porque es solo para la empresa. Pulsa «Configuración avanzada» → «Ir a Gestión Jardinería Adrover», deja marcadas todas las casillas y continúa.

**Desconectar** retira el permiso. Lo ya enviado se queda en Google; al volver a conectar la misma cuenta, no se duplica nada.

## Copias de seguridad

Cada noche se guarda sola una copia de todo y se conserva 60 días.

- **Copias de seguridad:** lista por fecha para **Descargar** o **Recuperar** (vuelve a poner lo de ese día; lo creado después se mantiene). **Hacer copia ahora** antes de un cambio grande.
- **Descargar copia / Cargar copia:** baja todo a un archivo o lo vuelve a subir.

## Si algo falla

| Qué pasa | Qué hacer |
| --- | --- |
| No carga en el ordenador | Ctrl + F5 (Mac: Cmd + Mayús + R) o prueba otro navegador |
| No sale un cambio nuevo | **Forzar actualización**, junto a **Cerrar sesión** (en el móvil, en Resumen → Copias y sesión) |
| El micrófono no funciona | La primera vez, permite el micrófono cuando el navegador lo pida. Si no lo pide, usa Chrome o Safari, o el micrófono del teclado |
| No llega un parte o un gasto | Espera un minuto. Si no sale, el operario verá «Hay datos sin enviar»: que abra la app con cobertura y pulse **Sincronizar** |
| Un operario no puede entrar | Revisa su PIN en **Equipo → Personas** y que no esté **De baja** |
| El icono del móvil sale antiguo | Borra el acceso y vuelve a añadirlo |
| «No se ha guardado: mientras lo editabas…» | Otra persona o la app del equipo lo cambió a la vez. Vuelve a abrirlo, verás lo último, y repite tu cambio |

**Dónde están los datos:** en Cloudflare, en una base de datos con jurisdicción de la Unión Europea, con copia cada noche.
