# SIGEMTI

Sistema de Gestión de Equipos y Mantenimiento Tecnológico Institucional. Prototipo web interactivo en español con React, Vite y Tailwind CSS.

## Iniciar

Node.js 22 y pnpm 10. Si el gestor informa que no hay una versión activa:

```powershell
nvm use 22.23.3
```

Después, desde la carpeta del proyecto:

```powershell
pnpm install
pnpm dev
```

Abre la dirección indicada por Vite, normalmente http://localhost:8443/. En Figma Make utiliza el servidor y la vista previa existentes.

## Accesos de demostración

| Perfil | Correo | Contraseña |
| --- | --- | --- |
| Administrador · Diomer Atachao | diomeradmin@udh.edu.pe | Demo2026! |
| Administradora · Milagros Gonzales | milagrosgonzales@udh.edu.pe | Demo2026! |
| Técnico de soporte · Elena Ruiz | tecnico@udh.edu.pe | Demo2026! |
| Técnico de soporte · Franklin Atencia | franklinatencia@udh.edu.pe | Demo2026! |

El selector de acceso de demostración rellena las credenciales; luego pulsa «Iniciar sesión». El administrador gestiona patrimonio, usuarios, catálogos y traslados. El técnico consulta inventario y reportes, registra mantenimientos, componentes y evidencias. Los permisos se simulan en la interfaz; no hay autenticación de servidor.

## Pantallas y funciones

- Panel con seis indicadores calculados, distribución por áreas y tipos, estado operativo, líneas de mantenimientos y evolución de repotenciaciones, actividad reciente y alertas.
- Inventario con identificación patrimonial, tipo, marca, modelo, serie, asignación, fechas, estado, responsable y último mantenimiento. Búsqueda, filtros, paginación y exportación CSV.
- Registro por pestañas: información general, asignación, procesador y RAM, almacenamiento y placa base, otros componentes y software. Valida códigos y series duplicados. Editar el área o las especificaciones de hardware desde la ficha también genera el traslado o cambio técnico correspondiente y actualiza sus relaciones.
- Ficha individual con siete pestañas, configuración técnica detallada, componentes instalados y retirados, mantenimientos, cambios de hardware, repotenciaciones, documentos y movimientos.
- Mantenimientos preventivos, correctivos, predictivos y repotenciación: registro y edición, problema, diagnóstico, actividades, resultado, componente, técnico, costo, estado y próxima fecha. Detalle con línea de tiempo y acceso a evidencias del equipo.
- Cambios de hardware: configuración anterior automática, configuración nueva, marcas, modelos, series, motivo, costo, técnico y observaciones. Actualiza la ficha y el inventario de componentes. Permite agregar, reemplazar y retirar componentes conservando su historial.
- Repotenciaciones con equipos distintos, costo acumulado, áreas beneficiadas y comparación antes/después de procesador, RAM, almacenamiento y componente modificado. No se atribuyen porcentajes de rendimiento sin mediciones.
- Áreas con conteos y estados, asignación de responsables, últimos mantenimientos y traslados con origen, destino, motivo, fecha y usuario.
- Alertas por prioridad: próximas y vencidas, fallas, reemplazos pendientes y falta de mantenimiento reciente.
- Administración: usuarios editables, matriz de permisos, alta de áreas, técnicos, categorías y tipos de mantenimiento, y configuración del nombre institucional.
- Perfil con descarga de respaldo JSON.

## Diez reportes

1. Inventario general.
2. Equipos por área.
3. Características técnicas.
4. Mantenimientos realizados (finalizados).
5. Equipos repotenciados.
6. Cambios de hardware.
7. Estado de equipos.
8. Historial individual del equipo, con ficha, mantenimientos, cambios y movimientos.
9. Costos de mantenimiento ejecutado, agrupados por equipo y tipo.
10. Mantenimientos pendientes y vencidos.

Los reportes admiten filtros por área, tipo, marca, estado, fechas y técnico cuando corresponde. El período se aplica a adquisición, intervención o programación según el reporte, indicado en pantalla. La asignación por área es la actual; el historial de traslados conserva el área anterior. La vista previa incluye institución, fecha, usuario generador y filtros. El PDF se guarda desde el diálogo de impresión del navegador con papel A4 horizontal. Excel descarga un archivo nativo .xlsx con todas las filas filtradas; también se ofrece CSV.

## Recorrido de demostración

1. Inicia como administrador y revisa los indicadores.
2. Registra una computadora completando identificación, asignación, procesador, RAM y almacenamiento. Abre su ficha desde el código en Inventario.
3. En su historial, registra un mantenimiento correctivo. Para finalizarlo selecciona un resultado distinto de «Pendiente».
4. En Cambios de hardware, reemplaza RAM. El valor anterior se carga desde la ficha; completa las nuevas especificaciones, marca/modelo y serie. Marca «Sí» en repotenciación si es una mejora.
5. Comprueba la ficha actual, los componentes instalados y reemplazados y la comparación anterior/posterior.
6. Traslada la computadora a otra área y consulta el movimiento registrado.
7. Filtra el inventario por Contabilidad. En Reportes elige Equipos por área y aplica el mismo filtro.
8. Abre la vista previa PDF y descarga Excel.
9. Cierra sesión e ingresa como técnico: no aparecerán Administración, Registrar equipo ni Editar equipo.

## Persistencia y alcance

Los datos se guardan en localStorage bajo `sigemti-v2`. Se conserva y migra el inventario previo de `sigemti-v1` sin reemplazarlo con datos de ejemplo. En un navegador sin registros se muestran veinte equipos ficticios de siete áreas, intervenciones, mejoras, un traslado y una evidencia de ejemplo. Los periféricos adicionales se incorporan una sola vez a los datos existentes; si luego se eliminan, no se vuelven a crear al recargar.

Las evidencias admiten PDF, PNG, JPEG y texto de hasta 1 MB por archivo. Se conservan en el mismo navegador; su capacidad depende del límite de localStorage. Se muestra una advertencia si se agota. El respaldo JSON incluye las evidencias. Un mantenimiento en proceso marca el equipo en mantenimiento; finalizarlo con resultado solucionado lo devuelve a operativo si no quedan intervenciones en proceso.

Es un prototipo académico local. Para uso institucional requiere servidor, base de datos, autenticación real, autorización de servidor y respaldos centralizados. Los documentos no se transmiten a un servicio externo.

## Verificación

```powershell
pnpm exec tsc --noEmit
node scripts/verify.mjs
pnpm build
```

La verificación comprueba referencias entre entidades, consistencia de componentes, cálculo de pendientes, migración del inventario y estructura y contenido del XLSX, incluyendo cadenas con caracteres especiales y prevención de fórmulas. También se probaron en navegador el registro por pestañas, actualización de RAM con historial, mantenimiento finalizado, traslado, filtros por área, permisos del técnico y descarga del XLSX.

La pantalla anterior se conserva en `App.original.tsx.bak`.


## Altas, cambios y bajas en el navegador

Las tablas incorporan acciones para editar y quitar equipos, mantenimientos, intervenciones de hardware, usuarios y catálogos. Los componentes instalados se pueden editar, reemplazar y retirar; sus registros históricos se pueden quitar. Los documentos se pueden adjuntar, renombrar y quitar. También pueden quitarse traslados, recalculando la asignación cuando corresponde.

- Quitar un equipo también quita sus componentes, mantenimientos, cambios, traslados y documentos, evitando referencias a equipos inexistentes.
- Editar o quitar hardware reconstruye la cadena anterior/posterior, la configuración de la ficha y los componentes instalados y retirados.
- Renombrar un área, técnico, categoría o tipo de mantenimiento propaga el nombre a sus registros relacionados. Para quitar un catálogo que esté en uso se solicita reasignar sus referencias a otro registro. Los técnicos vinculados a un usuario requieren resolver primero ese usuario.
- Las bajas muestran confirmación dentro de la aplicación y ofrecen Deshacer, que restaura la información y sus relaciones mientras no se hayan realizado otras modificaciones.
- Los equipos de ejemplo se agregan una sola vez: quitarlos no los vuelve a crear después de recargar.
- No puede quitarse el usuario de la sesión actual; se conserva un acceso administrativo para gestionar el prototipo.

Los indicadores, filtros, alertas, fichas y reportes se calculan desde el mismo estado de datos y reflejan las modificaciones. El almacenamiento sigue siendo exclusivamente local en este navegador. Borrar los datos del sitio elimina el inventario local; el perfil permite descargar un respaldo JSON.


## Descripción detallada del sistema

SIGEMTI es un mockup interactivo para la **Universidad de Huánuco**. Permite demostrar el control de inventario y el seguimiento técnico de los equipos desde su registro y asignación hasta sus mantenimientos, modificaciones y traslados. Las operaciones actualizan datos reales del prototipo dentro del navegador: no se limitan a cambiar el aspecto de las pantallas.

### Inicio de sesión y navegación

- Presenta el nombre completo del sistema y la institución en una pantalla de acceso minimalista, con distribución adaptable y posición fija.
- Permite ingresar con el correo de un usuario activo y la contraseña de demostración. Informa credenciales incorrectas o usuarios inactivos.
- Incluye un control para mostrar u ocultar la contraseña y un selector que completa los accesos de demostración.
- La navegación lateral reúne Panel principal, Inventario de equipos, Mantenimientos, Cambios de hardware, Repotenciados, Áreas institucionales, Reportes institucionales, Centro de alertas y Administración.
- La cabecera mantiene disponibles la búsqueda del inventario, las notificaciones y el acceso al perfil. En pantallas estrechas la navegación se adapta a un menú móvil.
- El perfil permite consultar la cuenta, descargar un respaldo JSON y cerrar sesión. El respaldo es una descarga; no existe un formulario para restaurarlo o importarlo.

### Panel principal

Los seis indicadores se calculan desde los registros actuales:

| Indicador | Qué representa |
| --- | --- |
| Total de equipos | Cantidad de registros del inventario. |
| Equipos operativos | Equipos cuyo estado actual es Operativo. |
| En mantenimiento | Equipos con ese estado, sincronizado con las intervenciones en proceso. No equivale al total de mantenimientos registrados. |
| Repotenciados | Equipos distintos que tienen cambios marcados como repotenciación. |
| Fuera de servicio | Equipos con ese estado operativo. |
| Mantenimientos pendientes | Intervenciones abiertas y próximas revisiones derivadas de la programación, con identificación de vencidas. |

El panel también muestra distribución por áreas, tipos y estado, evolución de mantenimientos y repotenciaciones, actividad reciente y alertas. El acceso rápido permite registrar equipos para administradores o mantenimientos para técnicos.

### Inventario y registro de equipos

El inventario admite computadoras de escritorio, laptops, servidores y equipos que no son computadoras. Los ejemplos incluyen impresoras, monitores, escáner, proyector, switch, UPS, cámara web y disco externo. El catálogo de categorías se puede gestionar desde Administración.

Cada equipo reúne:

- **Identificación:** identificador interno, código patrimonial, nombre, tipo, marca, modelo y número de serie.
- **Asignación:** área institucional, responsable y ubicación física.
- **Situación:** fecha de adquisición, estado operativo y observaciones.
- **Configuración técnica:** procesador, memoria RAM, almacenamiento, placa base y gráficos, según corresponda.
- **Software y red:** sistema operativo, licencia e IP.

La pantalla ofrece búsqueda, filtros por área, tipo, marca y estado, rango de adquisición, paginación, apertura de la ficha y exportación CSV. El administrador puede agregar, editar y quitar equipos.

Los formularios separan los datos en pestañas de identificación, asignación y características técnicas. Se verifican identificadores, códigos y series duplicados, fechas de adquisición futuras y campos obligatorios. Los nuevos escritorios, laptops y servidores requieren procesador, RAM y almacenamiento.

La edición de especificaciones técnicas produce el cambio de hardware relacionado. La modificación de asignación genera el movimiento correspondiente. De esta forma, la ficha actual y el historial conservan la relación entre los cambios.

### Ficha individual del equipo

La ficha centraliza siete vistas:

| Pestaña | Contenido |
| --- | --- |
| Información general | Identificación, asignación, estado y datos generales del equipo. |
| Características técnicas | Configuración de hardware, software y red registrada. |
| Componentes de hardware | Componentes instalados y retirados, con sus especificaciones y series. |
| Historial de mantenimiento | Intervenciones vinculadas al equipo y sus detalles. |
| Cambios de hardware | Modificaciones de componentes y configuración anterior/posterior. |
| Repotenciaciones | Mejoras registradas y comparación de características. |
| Documentos y evidencias | Archivos asociados al equipo, con descarga y gestión. |

Desde la ficha se puede consultar el historial relacionado y abrir el reporte individual para impresión o PDF. Los traslados conservan la trazabilidad de la asignación.

### Gestión de mantenimientos

Permite registrar, consultar, editar y quitar intervenciones preventivas, correctivas, predictivas y de repotenciación. Los tipos también forman parte de un catálogo administrable.

Cada intervención registra código, equipo, tipo, componente, fecha, técnico responsable, problema, diagnóstico, trabajo realizado, resultado, estado, costo, próxima fecha y observaciones o referencia de evidencia cuando corresponde. Los estados son **Programado**, **En proceso** y **Finalizado**.

- Los filtros permiten buscar por el equipo relacionado y acotar por fechas, técnico, tipo y estado de intervención.
- El detalle presenta la información de la intervención, su línea de tiempo y el acceso a las evidencias del equipo.
- Un mantenimiento finalizado no admite una fecha futura ni un resultado que continúe como Pendiente.
- La próxima fecha debe ser posterior a la intervención.
- Una intervención En proceso pone el equipo en mantenimiento. Al finalizarla o quitarla se recalcula el estado teniendo en cuenta las demás intervenciones y el resultado.
- La ficha patrimonial impide asignar manualmente En mantenimiento sin una intervención en proceso, o cambiar ese estado mientras siga existiendo una.
- La programación distingue registros abiertos de próximas revisiones. Una revisión futura derivada de una intervención finalizada puede aparecer como pendiente aunque no se haya creado todavía una nueva intervención.

### Hardware y componentes

Los cambios de hardware documentan equipo, fecha, componente, características anteriores y nuevas, series, marcas, motivo, técnico, costo, observaciones y si constituyen una repotenciación.

El valor anterior se obtiene de la configuración del equipo. Al guardar, el sistema actualiza sus características y los componentes relacionados. Permite agregar componentes, editar los instalados, reemplazarlos y retirarlos, conservando los registros históricos.

La fecha del cambio debe estar entre la adquisición y la fecha actual. Si la configuración cambió mientras se completaba el formulario, se solicita seleccionar nuevamente el equipo y el componente. Editar o quitar un cambio reconstruye la secuencia técnica para mantener coherentes la configuración actual y el historial anterior/posterior.

### Equipos repotenciados

Esta pantalla reúne los cambios marcados como mejoras. Presenta equipos distintos beneficiados, costos acumulados y áreas relacionadas, junto con el detalle y la comparación antes/después de procesador, RAM, almacenamiento y componente intervenido.

Una repotenciación está vinculada al historial de hardware del equipo. No constituye una copia independiente del inventario ni calcula porcentajes de rendimiento sin mediciones.

### Áreas y traslados

La consulta por áreas muestra equipos asignados, responsables, estados y últimos mantenimientos. Los administradores pueden registrar traslados indicando equipo, área de destino, responsable, ubicación, fecha y motivo; el sistema conserva el origen y el usuario que realizó la operación.

Los movimientos actualizan la asignación vigente del inventario. Al quitar un movimiento se recalcula la asignación correspondiente y la secuencia posterior. Los reportes por área reflejan la asignación actual; el historial permite consultar los destinos anteriores.

### Documentos y evidencias

Se pueden adjuntar archivos PDF, PNG, JPEG y TXT de hasta **1 MB por archivo**, asociados a un equipo. Las evidencias se pueden descargar, renombrar y quitar.

Los archivos se almacenan dentro de los datos locales del navegador y se incluyen en el respaldo JSON. No se suben a un servidor. El límite efectivo depende de la capacidad disponible de localStorage y del resto de la información guardada.

### Centro de alertas

Las alertas se generan a partir de los registros y se identifican por prioridad:

- **Alta:** mantenimiento vencido, equipo fuera de servicio o componente con resultado Pendiente de reemplazo.
- **Media:** mantenimiento próximo dentro del horizonte de siete días.
- **Baja:** ausencia de una intervención finalizada durante los últimos 180 días para los tipos considerados por la regla. La regla excluye Monitor, Impresora y Otro periférico.

Cada alerta identifica el equipo y la causa para facilitar la consulta del registro relacionado. Son avisos dentro del sistema: no se envían correos, mensajes ni notificaciones externas. Varias causas pueden producir varias alertas para el mismo equipo.

### Reportes y exportaciones

| Reporte | Información que permite presentar |
| --- | --- |
| Inventario general | Relación de equipos y sus datos patrimoniales y de asignación. |
| Equipos por área | Distribución de equipos según su área actual. |
| Características técnicas | Especificaciones detalladas de las computadoras. |
| Mantenimientos realizados | Intervenciones finalizadas y su información técnica. |
| Equipos repotenciados | Cambios de hardware marcados como mejora y sus costos. |
| Cambios de hardware | Trazabilidad de modificaciones, componente anterior y nuevo. |
| Estado de equipos | Situación operativa de los equipos registrados. |
| Historial individual | Expediente de un equipo con ficha, mantenimientos, hardware y movimientos. |
| Costos de mantenimiento | Gastos de intervenciones finalizadas, agrupados por equipo y tipo. |
| Mantenimientos pendientes | Intervenciones abiertas y próximas revisiones, incluidas las vencidas. |

La búsqueda y los filtros aplicables permiten acotar por equipo, serie o responsable, área, tipo, marca, estado, período y técnico. Los reportes de mantenimiento incluyen el tipo de intervención. El significado del período depende del informe: adquisición, intervención o programación. Se puede limpiar la selección de filtros.

Antes de exportar se muestra la cantidad de registros incluidos y una vista de datos. El catálogo de reportes permanece accesible mientras se consulta el contenido.

- **Vista previa PDF:** presenta el documento institucional completo con fecha, usuario generador y filtros.
- **Generar PDF:** abre el diálogo de impresión del navegador; para descargar el archivo se debe seleccionar Guardar como PDF. El diseño está preparado para A4 horizontal.
- **CSV:** descarga los datos tabulares filtrados.
- **Excel:** descarga un archivo nativo `.xlsx`, no un CSV renombrado.

Las exportaciones incluyen todas las filas resultantes de los filtros, no solamente la página visible de una tabla. El PDF es una impresión del navegador; no se genera mediante un servicio externo.

### Administración y permisos

La administración permite agregar, editar y quitar usuarios; configurar nombre, correo, rol y estado; y gestionar áreas, técnicos, categorías y tipos de mantenimiento. La matriz de roles describe los permisos de los dos perfiles y no es un editor de permisos personalizados.

| Operación | Administrador | Técnico de soporte |
| --- | --- | --- |
| Consultar inventario y fichas | Sí | Sí |
| Registrar y editar equipos | Sí | No |
| Gestionar traslados | Sí | No |
| Gestionar mantenimientos y componentes | Sí | Sí |
| Consultar y exportar reportes | Sí | Sí |
| Gestionar evidencias | Sí | Sí |
| Gestionar usuarios, catálogos e institución | Sí | No |

Los usuarios inactivos no pueden iniciar sesión. Se protege la cuenta de la sesión actual frente a su eliminación o cambios que le quiten el acceso administrativo. Todos los accesos usan la misma contraseña de demostración; no hay registro público, recuperación de contraseña ni autenticación real.

El nombre institucional configurado se utiliza en el login, la navegación y los reportes. Los datos guardados con el antiguo nombre Instituto Tecnológico Central se corrigen al cargar a Universidad de Huánuco sin eliminar el inventario.

### Relaciones, eliminación y deshacer

El estado compartido conecta equipos, componentes, mantenimientos, cambios de hardware, movimientos, documentos y catálogos. Una modificación se refleja en las vistas que dependen de ella sin tener que volver a cargar manualmente sus datos.

| Acción | Efecto relacionado |
| --- | --- |
| Cambiar hardware | Actualiza características, componentes, historial y reportes. |
| Registrar o actualizar mantenimiento | Recalcula estado del equipo, pendientes, indicadores y alertas. |
| Trasladar equipo | Cambia área, responsable y ubicación actuales, conservando el movimiento. |
| Renombrar catálogo | Propaga el nuevo nombre a sus referencias. |
| Quitar un catálogo utilizado | Requiere elegir un reemplazo para reasignar sus referencias. |
| Renombrar usuario vinculado | Actualiza los nombres relacionados en los registros correspondientes. |
| Quitar equipo | Elimina también sus componentes, mantenimientos, cambios, movimientos y documentos. |
| Editar o quitar cambio técnico | Reconstruye la secuencia de hardware y la configuración vigente. |

Las bajas requieren confirmación dentro de la aplicación. La opción **Deshacer** restaura el estado anterior y sus relaciones mientras no se realicen otras modificaciones. No es una papelera permanente ni un historial ilimitado de versiones. Los técnicos vinculados a usuarios requieren resolver esa vinculación antes de quitar su registro de catálogo.

## Datos locales y límites de la demostración

- El almacenamiento usa la clave `sigemti-v2` y contempla migración desde `sigemti-v1`.
- Las cuentas iniciales y los periféricos adicionales se incorporan con controles para evitar duplicados. Franklin Atencia también se agrega una sola vez a los datos existentes y al catálogo técnico.
- Los datos de ejemplo son ficticios y algunas fechas se calculan respecto al día de inicialización. Las fechas operativas emplean la zona America/Lima y los importes se presentan en soles peruanos.
- Cada navegador, perfil y dirección del sitio conserva su propio almacenamiento. `localhost`, una dirección IP local y el dominio de Vercel no comparten registros.
- Cerrar sesión no borra el inventario. Borrar los datos del sitio o perder el almacenamiento local sí puede eliminarlo; no hay sincronización entre computadoras.
- Si el almacenamiento se llena, se muestra una advertencia. El respaldo descargable permite conservar una copia de los datos, pero su restauración no está implementada en la interfaz.
- El sistema no incluye base de datos, API de negocio, control de acceso en servidor, auditoría de seguridad, correos automáticos ni servicios de almacenamiento de archivos.
- Publicarlo en Vercel permite compartir el mockup; no convierte los datos locales en una base institucional compartida.

## Compilación y despliegue en Vercel

El proyecto se puede conectar desde un repositorio de GitHub a Vercel. Los cambios enviados a la rama de producción generan nuevos despliegues cuando la integración está configurada.

| Ajuste | Valor para este proyecto |
| --- | --- |
| Framework | Vite |
| Directorio raíz | `./` |
| Node.js | 22.x |
| Instalación con npm | `npm ci` |
| Compilación | `npm run build` |
| Carpeta de salida | `dist` |
| Variables de entorno del mockup | Ninguna requerida |

El repositorio contiene archivos de bloqueo de npm y pnpm. Para seguir esta configuración de despliegue, establece explícitamente los comandos de npm en Vercel. Para desarrollo local también se puede utilizar pnpm como se indica al inicio.

No subas `node_modules`, `dist` ni archivos `.env`. Conserva **`.figma/make/site.json`**, ya que `vite.config.ts` lo importa para configurar el documento generado. El puerto 8443 corresponde al servidor de desarrollo; el sitio publicado se abre desde el enlace HTTPS de Vercel.

## Organización del código

| Archivo o carpeta | Responsabilidad |
| --- | --- |
| `src/main.tsx` | Montaje de React e importación de estilos globales. |
| `src/App.tsx` | Pantallas, sesión simulada, formularios y generación de vistas de reportes. |
| `src/model.ts` | Tipos, datos iniciales, lectura y migración local, fechas y exportaciones. |
| `src/relations.ts` | Operaciones conectadas, propagación de cambios y reconstrucción de relaciones. |
| `src/schema.ts` | Definición de campos de los formularios. |
| `src/ui.tsx` | Componentes reutilizables: tablas, diálogos, botones, formularios y gráficos. |
| `src/index.css` | Entrada de Tailwind y estilos base. |
| `src/management.css` | Estilos de pantallas, adaptación a dispositivos e impresión. |
| `scripts/verify.mjs` | Verificación de reglas de datos, relaciones y exportación. |
| `.figma/make/site.json` | Título, idioma y metadatos utilizados por la configuración de Vite. |

La documentación describe el comportamiento implementado del prototipo. Para una puesta en producción institucional se debe desarrollar la persistencia compartida y aplicar autenticación, autorización y respaldos en servidor.
