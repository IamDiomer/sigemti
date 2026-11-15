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

Los datos se guardan en localStorage bajo `sigemti-v2`. Se conserva y migra el inventario previo de `sigemti-v1` sin reemplazarlo con datos de ejemplo. En un navegador sin registros se muestran veinte equipos ficticios de siete áreas, intervenciones, mejoras, un traslado y una evidencia de ejemplo. Por eso un navegador con la versión anterior puede mostrar menos equipos.

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

