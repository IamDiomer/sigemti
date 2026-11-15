import type { Field } from "./ui";
import { componentFields, statuses, type Store } from "./model";
const f = (key: string, label: string, tab: string, required = false, type = "text"): Field => ({
  key,
  label,
  tab,
  required,
  type,
});
export function equipmentSchema(data: Store, editing: boolean): Field[] {
  return [
    { ...f("id", "Código interno", "Información general", true), readOnly: editing },
    f("code", "Código patrimonial", "Información general", true),
    f("name", "Nombre del equipo", "Información general", true),
    { ...f("type", "Tipo de equipo", "Información general", true), options: data.categories },
    f("brand", "Marca", "Información general", true),
    f("model", "Modelo", "Información general", true),
    f("serial", "Número de serie", "Información general", true),
    f("acquired", "Fecha de adquisición", "Información general", true, "date"),
    f("supplier", "Proveedor", "Información general"),
    f("notes", "Observaciones", "Información general", false, "textarea"),
    { ...f("area", "Área institucional", "Asignación", true), options: data.areas },
    f("location", "Ubicación física", "Asignación", true),
    f("owner", "Responsable asignado", "Asignación", true),
    { ...f("status", "Estado operativo", "Asignación", true), options: statuses },
    f("ip", "Dirección IP / MAC", "Asignación"),
    f("cpuMaker", "Fabricante del procesador", "Procesador y RAM"),
    f("cpu", "Modelo de procesador", "Procesador y RAM"),
    f("generation", "Generación", "Procesador y RAM"),
    f("cores", "Número de núcleos", "Procesador y RAM", false, "number"),
    f("ram", "Capacidad total de RAM", "Procesador y RAM"),
    {
      ...f("ramType", "Tipo DDR", "Procesador y RAM"),
      options: ["DDR3", "DDR4", "DDR5", "ECC", "No aplica"],
    },
    f("ramSpeed", "Velocidad de RAM", "Procesador y RAM"),
    f("ramModules", "Cantidad de módulos", "Procesador y RAM", false, "number"),
    f("ramSlots", "Ranuras disponibles", "Procesador y RAM", false, "number"),
    f("storage", "Capacidad / configuración", "Almacenamiento y placa"),
    {
      ...f("storageType", "Tipo de almacenamiento", "Almacenamiento y placa"),
      options: ["HDD", "SSD SATA", "SSD NVMe", "RAID", "No aplica"],
    },
    f("storageBrand", "Marca y modelo de almacenamiento", "Almacenamiento y placa"),
    f("storageSerial", "Serie de almacenamiento", "Almacenamiento y placa"),
    f("boardMaker", "Fabricante de placa base", "Almacenamiento y placa"),
    f("board", "Modelo de placa base", "Almacenamiento y placa"),
    f("chipset", "Chipset", "Almacenamiento y placa"),
    ...[
      ["graphics", "Tarjeta gráfica"],
      ["power", "Fuente de alimentación"],
      ["network", "Adaptador de red"],
      ["monitor", "Monitor"],
      ["keyboard", "Teclado"],
      ["mouse", "Mouse"],
    ].map(([k, l]) => f(k, l, "Otros componentes")),
    f("os", "Sistema operativo", "Software"),
    f("osVersion", "Versión", "Software"),
    {
      ...f("architecture", "Arquitectura", "Software"),
      options: ["64 bits", "32 bits", "ARM64", "No aplica"],
    },
    f("programs", "Programas principales", "Software", false, "textarea"),
    {
      ...f("license", "Estado de licencia", "Software"),
      options: [
        "Licencia institucional",
        "Licencia activa",
        "Pendiente de verificar",
        "Sin licencia",
        "Software libre",
        "No aplica",
      ],
    },
  ];
}
export function maintenanceSchema(data: Store, editing = false): Field[] {
  return [
    { ...f("id", "Código de mantenimiento", "Datos generales", true), readOnly: editing },
    {
      ...f("equipmentId", "Equipo intervenido", "Datos generales", true),
      options: data.equipment.map((e) => e.id),
    },
    {
      ...f("kind", "Tipo de mantenimiento", "Datos generales", true),
      options: data.maintenanceTypes,
    },
    f("date", "Fecha de ejecución / programación", "Datos generales", true, "date"),
    {
      ...f("technician", "Técnico responsable", "Datos generales", true),
      options: data.technicians,
    },
    {
      ...f("status", "Estado de la intervención", "Datos generales", true),
      options: ["Programado", "En proceso", "Finalizado"],
    },
    f("cost", "Costo (S/)", "Datos generales", true, "number"),
    f("next", "Próximo mantenimiento", "Datos generales", false, "date"),
    f("problem", "Problema identificado", "Diagnóstico y resultado", true),
    f("diagnosis", "Diagnóstico", "Diagnóstico y resultado", true, "textarea"),
    f("component", "Componentes intervenidos", "Diagnóstico y resultado", true),
    f("work", "Actividades realizadas / previstas", "Diagnóstico y resultado", true, "textarea"),
    {
      ...f("result", "Resultado de la intervención", "Diagnóstico y resultado", true),
      options: [
        "Pendiente",
        "Solucionado",
        "Solución parcial",
        "Requiere seguimiento",
        "Pendiente de reemplazo",
      ],
    },
    f("notes", "Observaciones", "Diagnóstico y resultado", false, "textarea"),
    f("evidence", "Referencia de evidencia / acta", "Diagnóstico y resultado"),
  ];
}
export function hardwareSchema(data: Store): Field[] {
  return [
    {
      ...f("equipmentId", "Equipo", "Intervención", true),
      options: data.equipment.map((e) => e.id),
    },
    f("date", "Fecha de cambio", "Intervención", true, "date"),
    {
      ...f("component", "Componente reemplazado", "Intervención", true),
      options: Object.keys(componentFields),
    },
    { ...f("technician", "Técnico responsable", "Intervención", true), options: data.technicians },
    f("reason", "Motivo del cambio", "Intervención", true, "textarea"),
    f("cost", "Costo del cambio (S/)", "Intervención", true, "number"),
    { ...f("upgrade", "¿Es repotenciación?", "Intervención", true), options: ["Sí", "No"] },
    f("notes", "Observaciones", "Intervención", false, "textarea"),
    f("oldBrand", "Marca y modelo anterior", "Antes y después"),
    { ...f("before", "Configuración anterior", "Antes y después"), readOnly: true },
    f("oldSerial", "Número de serie retirado", "Antes y después"),
    f("newBrand", "Marca y modelo nuevo", "Antes y después", true),
    f("after", "Nueva configuración", "Antes y después", true),
    f("newSerial", "Número de serie instalado", "Antes y después", true),
  ];
}
