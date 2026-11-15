import {
  componentFields,
  uid,
  today,
  type Store,
  type Change,
  type Component,
  type Equipment,
  type Maintenance,
} from "./model";
export type CatalogKey = "areas" | "technicians" | "categories" | "maintenanceTypes";
export type RecordKind =
  | "equipment"
  | "maintenance"
  | "changes"
  | "components"
  | "movements"
  | "documents"
  | "users"
  | CatalogKey;
const sortChanges = (a: Change, b: Change) => a.date.localeCompare(b.date);
export function renamePerson(s: Store, from: string, to: string): Store {
  if (from === to) return s;
  return {
    ...s,
    technicians: [...new Set(s.technicians.map((n) => (n === from ? to : n)))],
    equipment: s.equipment.map((e) => ({ ...e, owner: e.owner === from ? to : e.owner })),
    maintenance: s.maintenance.map((m) => ({
      ...m,
      technician: m.technician === from ? to : m.technician,
    })),
    changes: s.changes.map((c) => ({
      ...c,
      technician: c.technician === from ? to : c.technician,
    })),
    movements: s.movements.map((m) => ({
      ...m,
      user: m.user === from ? to : m.user,
      owner: m.owner === from ? to : m.owner,
    })),
  };
}
export function renameCatalog(s: Store, key: CatalogKey, from: string, to: string): Store {
  if (s[key].some((n) => n !== from && n.toLowerCase() === to.toLowerCase()))
    throw Error("Ese nombre ya existe en el catálogo.");
  let result = { ...s, [key]: s[key].map((n) => (n === from ? to : n)) };
  if (key === "areas")
    result = {
      ...result,
      equipment: s.equipment.map((e) => ({ ...e, area: e.area === from ? to : e.area })),
      movements: s.movements.map((m) => ({
        ...m,
        from: m.from === from ? to : m.from,
        to: m.to === from ? to : m.to,
      })),
    };
  if (key === "categories")
    result = {
      ...result,
      equipment: s.equipment.map((e) => ({ ...e, type: e.type === from ? to : e.type })),
    };
  if (key === "maintenanceTypes")
    result = {
      ...result,
      maintenance: s.maintenance.map((m) => ({ ...m, kind: m.kind === from ? to : m.kind })),
    };
  if (key === "technicians")
    result = {
      ...renamePerson(result, from, to),
      users: s.users.map((u) => ({ ...u, name: u.name === from ? to : u.name })),
    };
  return result;
}
export function catalogUsage(s: Store, key: CatalogKey, name: string): number {
  if (key === "areas")
    return (
      s.equipment.filter((e) => e.area === name).length +
      s.movements.filter((m) => m.from === name || m.to === name).length
    );
  if (key === "categories") return s.equipment.filter((e) => e.type === name).length;
  if (key === "maintenanceTypes") return s.maintenance.filter((m) => m.kind === name).length;
  return (
    s.maintenance.filter((m) => m.technician === name).length +
    s.changes.filter((m) => m.technician === name).length +
    s.users.filter((u) => u.name === name).length
  );
}
// Replay one component's chain after an edit or deletion. Rebuild its installed/retired inventory too.
export function rebuildHardware(
  s: Store,
  equipmentId: string,
  component: string,
  baseline: string,
  baselineSerial = "",
  baselineBrand = "",
): Store {
  const eq = s.equipment.find((e) => e.id === equipmentId),
    field = componentFields[component];
  if (!eq || !field) return s;
  const chain = s.changes
    .filter((c) => c.equipmentId === equipmentId && c.component === component)
    .sort(sortChanges);
  let value = baseline,
    serial = baselineSerial,
    brand = baselineBrand;
  const rewritten = new Map<string, Change>();
  const inventory: Component[] = [];
  if (value && value !== "No aplica")
    inventory.push({
      id: `BASE-${equipmentId}-${field}`,
      equipmentId,
      type: component,
      brand: brand || "Sin registro",
      model: value,
      specs: value,
      serial: serial || "Sin serie",
      installed: eq.acquired,
      status: "Instalado",
    });
  for (const c of chain) {
    const record = { ...c, before: value, oldSerial: serial, oldBrand: brand };
    rewritten.set(c.id, record);
    const previous = inventory[inventory.length - 1];
    if (previous?.status === "Instalado") {
      previous.status = c.after ? "Reemplazado" : "Retirado";
      previous.removed = c.date;
    }
    if (c.after)
      inventory.push({
        id: `CMP-${c.id}`,
        equipmentId,
        type: component,
        brand: c.newBrand || "Sin registro",
        model: c.after,
        specs: c.after,
        serial: c.newSerial || "Sin serie",
        installed: c.date,
        status: "Instalado",
      });
    value = c.after;
    serial = c.newSerial;
    brand = c.newBrand || "";
  }
  return {
    ...s,
    equipment: s.equipment.map((e) =>
      e.id === equipmentId
        ? {
            ...e,
            [field]: value,
            ...(field === "storage" ? { storageSerial: serial, storageBrand: brand } : {}),
          }
        : e,
    ),
    changes: s.changes.map((c) => rewritten.get(c.id) || c),
    components: [
      ...s.components.filter((c) => c.equipmentId !== equipmentId || c.type !== component),
      ...inventory,
    ],
  };
}
export function saveChange(s: Store, record: Change): Store {
  if (record.technician && !s.technicians.includes(record.technician))
    s = { ...s, technicians: [...s.technicians, record.technician] };
  const old = s.changes.find((c) => c.id === record.id);
  if (old && (old.equipmentId !== record.equipmentId || old.component !== record.component))
    throw Error(
      "El equipo y el tipo identifican este historial. Crea otro cambio para intervenir otro componente.",
    );
  const chain = s.changes
    .filter((c) => c.equipmentId === record.equipmentId && c.component === record.component)
    .sort(sortChanges);
  const first = chain[0];
  const baseline = first?.before ?? record.before,
    serial = first?.oldSerial ?? record.oldSerial,
    brand = first?.oldBrand ?? record.oldBrand;
  return rebuildHardware(
    {
      ...s,
      changes: old
        ? s.changes.map((c) => (c.id === record.id ? record : c))
        : [...s.changes, record],
    },
    record.equipmentId,
    record.component,
    baseline,
    serial,
    brand,
  );
}
export function updateEquipment(s: Store, item: Equipment, actor: string): Store {
  const old = s.equipment.find((e) => e.id === item.id);
  if (!old) return { ...s, equipment: [...s.equipment, item] };
  let next = { ...s, equipment: s.equipment.map((e) => (e.id === item.id ? item : e)) };
  if (old.area !== item.area)
    next = {
      ...next,
      movements: [
        ...next.movements,
        {
          id: uid(),
          equipmentId: item.id,
          date: today(),
          from: old.area,
          to: item.area,
          owner: item.owner,
          reason: "Cambio de asignación desde la ficha del equipo",
          user: actor,
          previousOwner: old.owner,
          previousLocation: old.location,
          location: item.location,
        },
      ],
    };
  for (const [component, field] of Object.entries(componentFields))
    if ((old[field] || "") !== (item[field] || "")) {
      const installed = s.components.find(
        (c) => c.equipmentId === item.id && c.type === component && c.status === "Instalado",
      );
      next = saveChange(next, {
        id: uid(),
        equipmentId: item.id,
        date: today(),
        component,
        before: old[field] || "",
        after: item[field] || "",
        oldSerial: installed?.serial || "",
        newSerial: field === "storage" ? item.storageSerial || "" : "",
        oldBrand: installed?.brand || "",
        newBrand: field === "storage" ? item.storageBrand || item.brand : item.brand,
        reason: "Actualización desde la ficha técnica",
        technician: actor,
        cost: 0,
        upgrade: false,
        action: "Edición de ficha",
      });
    }
  return next;
}
export function syncMaintenance(s: Store, ids: string[]): Store {
  return {
    ...s,
    equipment: s.equipment.map((e) => {
      if (!ids.includes(e.id)) return e;
      const list = s.maintenance.filter((m) => m.equipmentId === e.id);
      const active = list.some((m) => m.status === "En proceso");
      const last = list
        .filter((m) => m.status === "Finalizado")
        .sort((a, b) => b.date.localeCompare(a.date))[0];
      const previous = e.maintenanceStatusBase || e.status;
      const base = previous === "En mantenimiento" ? "Operativo" : previous;
      return {
        ...e,
        maintenanceStatusBase: base,
        status: active ? "En mantenimiento" : last?.result === "Solucionado" ? "Operativo" : base,
      };
    }),
  };
}
// Repair statuses left behind by older versions without changing unrelated equipment states.
export function repairMaintenance(s: Store): Store {
  return syncMaintenance(
    s,
    s.equipment
      .filter(
        (e) =>
          e.status === "En mantenimiento" ||
          s.maintenance.some((m) => m.equipmentId === e.id && m.status === "En proceso"),
      )
      .map((e) => e.id),
  );
}
export function saveMaintenanceRecord(s: Store, item: Maintenance): Store {
  const original = s.maintenance.find((m) => m.id === item.id);
  return syncMaintenance(
    {
      ...s,
      maintenance: original
        ? s.maintenance.map((m) => (m.id === item.id ? item : m))
        : [...s.maintenance, item],
    },
    [item.equipmentId, ...(original ? [original.equipmentId] : [])],
  );
}
export function removeRecord(s: Store, kind: RecordKind, id: string, replacement = ""): Store {
  if (["areas", "technicians", "categories", "maintenanceTypes"].includes(kind)) {
    const key = kind as CatalogKey;
    if (catalogUsage(s, key, id) && !replacement)
      throw Error("Este registro tiene relaciones. Selecciona un reemplazo para reasignarlas.");
    if (key === "technicians" && s.users.some((u) => u.name === id))
      throw Error(
        "Este técnico tiene un usuario asociado. Quita primero el usuario o cambia su nombre desde Usuarios.",
      );
    if (replacement && (!s[key].includes(replacement) || replacement === id))
      throw Error("Selecciona un reemplazo válido.");
    // Reassign uses without merging or duplicating the catalog entries.
    const withoutDestination = replacement
      ? { ...s, [key]: s[key].filter((n) => n !== replacement) }
      : s;
    const reassigned = replacement ? renameCatalog(withoutDestination, key, id, replacement) : s;
    return {
      ...reassigned,
      [key]: reassigned[key]
        .filter((n) => n !== id && n !== replacement)
        .concat(replacement ? [replacement] : []),
    };
  }
  if (kind === "equipment")
    return {
      ...s,
      equipment: s.equipment.filter((e) => e.id !== id),
      maintenance: s.maintenance.filter((m) => m.equipmentId !== id),
      changes: s.changes.filter((c) => c.equipmentId !== id),
      components: s.components.filter((c) => c.equipmentId !== id),
      movements: s.movements.filter((m) => m.equipmentId !== id),
      documents: s.documents.filter((d) => d.equipmentId !== id),
    };
  if (kind === "changes") {
    const c = s.changes.find((c) => c.id === id);
    if (!c) return s;
    const first = s.changes
      .filter((x) => x.equipmentId === c.equipmentId && x.component === c.component)
      .sort(sortChanges)[0];
    return rebuildHardware(
      { ...s, changes: s.changes.filter((x) => x.id !== id) },
      c.equipmentId,
      c.component,
      first.before,
      first.oldSerial,
      first.oldBrand,
    );
  }
  if (kind === "components") {
    const c = s.components.find((c) => c.id === id);
    if (!c) return s;
    if (c.status === "Instalado") {
      return saveChange(s, {
        id: uid(),
        equipmentId: c.equipmentId,
        date: today(),
        component: c.type,
        before: c.specs,
        after: "",
        oldSerial: c.serial,
        newSerial: "",
        reason: "Retiro del componente desde el inventario",
        technician: "Gestión del inventario",
        cost: 0,
        upgrade: false,
        action: "Retiro",
      });
    }
    return { ...s, components: s.components.filter((x) => x.id !== id) };
  }
  if (kind === "maintenance") {
    const original = s.maintenance.find((m) => m.id === id);
    return syncMaintenance(
      {
        ...s,
        maintenance: s.maintenance.filter((m) => m.id !== id),
        documents: s.documents.filter((d) => d.maintenanceId !== id),
      },
      original ? [original.equipmentId] : [],
    );
  }
  if (kind === "movements") {
    const removed = s.movements.find((m) => m.id === id);
    if (!removed) return s;
    const chain = s.movements
      .filter((m) => m.equipmentId === removed.equipmentId)
      .sort((a, b) => a.date.localeCompare(b.date));
    const index = chain.findIndex((m) => m.id === id),
      next = chain[index + 1];
    const movements = s.movements
      .filter((m) => m.id !== id)
      .map((m) =>
        next?.id === m.id
          ? {
              ...m,
              from: removed.from,
              previousOwner: removed.previousOwner || m.previousOwner,
              previousLocation: removed.previousLocation || m.previousLocation,
            }
          : m,
      );
    return {
      ...s,
      movements,
      equipment: next
        ? s.equipment
        : s.equipment.map((e) =>
            e.id === removed.equipmentId
              ? {
                  ...e,
                  area: removed.from,
                  owner: removed.previousOwner || e.owner,
                  location: removed.previousLocation || e.location,
                }
              : e,
          ),
    };
  }
  if (kind === "users") return { ...s, users: s.users.filter((x) => x.id !== id) };
  if (kind === "documents") return { ...s, documents: s.documents.filter((x) => x.id !== id) };
  return s;
}
