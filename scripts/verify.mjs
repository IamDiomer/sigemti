import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
const source = fs.readFileSync(new URL("../src/model.ts", import.meta.url), "utf8");
const code = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
const model = await import("data:text/javascript;base64," + Buffer.from(code).toString("base64"));
const { seed, componentFields, excelBytes, pending, lastMaintenance } = model;
assert.equal(seed.equipment.length, 12);
assert.equal(new Set(seed.equipment.map((e) => e.id)).size, seed.equipment.length);
for (const list of [
  seed.components,
  seed.maintenance,
  seed.changes,
  seed.movements,
  seed.documents,
]) {
  for (const record of list)
    assert(
      seed.equipment.some((e) => e.id === record.equipmentId),
      `Orphan record ${record.id}`,
    );
}
for (const component of seed.components.filter((c) => c.status === "Instalado")) {
  const eq = seed.equipment.find((e) => e.id === component.equipmentId);
  assert.equal(
    component.specs,
    eq[componentFields[component.type]],
    `Component differs from technical sheet: ${component.id}`,
  );
}
assert.equal(
  lastMaintenance(seed, "PC-CON-014"),
  seed.maintenance.find((m) => m.id === "MNT-2026-0108").date,
);
assert(pending(seed).some((m) => m.equipmentId === "LAP-GER-003"));
assert(!pending(seed).some((m) => m.id === "MNT-2026-0108"));
const bytes = Buffer.from(
  excelBytes(
    ["Equipo", "Detalle", "Costo"],
    [
      ["PC-001", "RAM & <SSD>", 145.5],
      ["=1+1", "Áreas / Núñez", 0],
    ],
  ),
);
let offset = 0;
const parts = new Map();
while (bytes.readUInt32LE(offset) === 0x04034b50) {
  const length = bytes.readUInt32LE(offset + 18),
    nameLength = bytes.readUInt16LE(offset + 26),
    extra = bytes.readUInt16LE(offset + 28);
  const name = bytes.subarray(offset + 30, offset + 30 + nameLength).toString();
  const start = offset + 30 + nameLength + extra;
  parts.set(name, bytes.subarray(start, start + length).toString());
  offset = start + length;
}
assert.equal(bytes.readUInt32LE(offset), 0x02014b50);
assert.equal(parts.size, 5);
assert(parts.has("[Content_Types].xml"));
const sheet = parts.get("xl/worksheets/sheet1.xml");
assert(sheet.includes("RAM &amp; &lt;SSD&gt;"));
assert(sheet.includes('t="n"><v>145.5</v>'));
assert(sheet.includes('t="inlineStr"><is><t xml:space="preserve">=1+1</t>'));
assert(!sheet.includes("<f>"));
assert.equal(bytes.readUInt32LE(bytes.length - 22), 0x06054b50);
const migrationBase = { version: 1, equipment: [seed.equipment[0]], maintenance: [], changes: [] };
globalThis.localStorage = {
  getItem: (key) => (key === "sigemti-v1" ? JSON.stringify(migrationBase) : null),
};
const migrated = model.readStore();
assert.equal(migrated.version, 2);
assert.equal(migrated.equipment.length, 9);
assert.equal(migrated.equipment[0].id, "PC-ADM-001");
assert(migrated.components.every((c) => c.equipmentId === "PC-ADM-001"));
assert.equal(model.addPeripheralRecords(migrated).equipment.length, 9);
assert(migrated.equipment.some((e) => e.type === "UPS"));
assert(migrated.equipment.some((e) => e.type === "Switch de red"));
console.log("PASS: referencias, coherencia de componentes, fechas, migración y exportación XLSX.");

// Verify relational mutations against the same model module used by the application.
const modelUrl = "data:text/javascript;base64," + Buffer.from(code).toString("base64");
const relationSource = fs.readFileSync(new URL("../src/relations.ts", import.meta.url), "utf8");
const relationCode = ts
  .transpileModule(relationSource, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  })
  .outputText.replace('from "./model"', `from ${JSON.stringify(modelUrl)}`);
const relations = await import(
  "data:text/javascript;base64," + Buffer.from(relationCode).toString("base64")
);
const { renameCatalog, removeRecord, updateEquipment, saveChange, saveMaintenanceRecord } =
  relations;
const base = structuredClone(seed);
const changedArea = renameCatalog(base, "areas", "Administración", "Dirección administrativa");
assert.equal(
  changedArea.equipment.find((e) => e.id === "PC-ADM-001").area,
  "Dirección administrativa",
);
assert.equal(changedArea.movements[0].from, "Dirección administrativa");
const moved = updateEquipment(
  base,
  { ...base.equipment[0], area: "Contabilidad", owner: "Nueva responsable", ram: "32 GB DDR4" },
  "Administrador demo",
);
assert.equal(moved.equipment[0].ram, "32 GB DDR4");
assert(
  moved.components.some(
    (c) =>
      c.equipmentId === "PC-ADM-001" &&
      c.type === "Memoria RAM" &&
      c.status === "Instalado" &&
      c.specs === "32 GB DDR4",
  ),
);
assert(moved.changes.some((c) => c.before === "16 GB DDR4" && c.after === "32 GB DDR4"));
assert.equal(moved.movements.at(-1).from, "Administración");
assert.equal(moved.movements.at(-1).to, "Contabilidad");
const rolledBack = removeRecord(moved, "changes", moved.changes.at(-1).id);
assert.equal(rolledBack.equipment[0].ram, "16 GB DDR4");
const deleteEarly = removeRecord(moved, "changes", "CAM-2026-0098");
assert.equal(deleteEarly.equipment[0].ram, "32 GB DDR4");
assert.equal(deleteEarly.changes.find((c) => c.id === moved.changes.at(-1).id).before, "4 GB DDR4");
const editedChange = saveChange(moved, { ...moved.changes.at(-1), after: "64 GB DDR4", cost: 300 });
assert.equal(editedChange.equipment[0].ram, "64 GB DDR4");
const undoneMove = removeRecord(moved, "movements", moved.movements.at(-1).id);
assert.equal(undoneMove.equipment[0].area, "Administración");
assert.equal(undoneMove.equipment[0].owner, base.equipment[0].owner);
const maintenanceRecord = {
  id: "TEST-MNT",
  equipmentId: "PC-ADM-001",
  kind: "Correctivo",
  date: model.today(),
  technician: "Elena Ruiz",
  status: "En proceso",
  component: "RAM",
  diagnosis: "Prueba",
  work: "Prueba",
  next: "",
  cost: 0,
  result: "Pendiente",
};
const inProgress = saveMaintenanceRecord(base, maintenanceRecord);
assert.equal(inProgress.equipment[0].status, "En mantenimiento");
const completed = saveMaintenanceRecord(inProgress, {
  ...maintenanceRecord,
  status: "Finalizado",
  result: "Solucionado",
});
assert.equal(completed.equipment[0].status, "Operativo");
assert.equal(removeRecord(inProgress, "maintenance", "TEST-MNT").equipment[0].status, "Operativo");
const removed = removeRecord(moved, "equipment", "PC-ADM-001");
for (const list of [
  removed.equipment,
  ...["maintenance", "components", "changes", "movements", "documents"].map((k) => removed[k]),
])
  assert(!list.some((x) => (x.equipmentId || x.id) === "PC-ADM-001"));
const loaded = model.addPeripheralRecords(structuredClone(seed));
const withoutPrinter = removeRecord(loaded, "equipment", "IMP-CON-003");
assert(!model.addPeripheralRecords(withoutPrinter).equipment.some((e) => e.id === "IMP-CON-003"));
assert.throws(() => removeRecord(base, "areas", "Contabilidad"), /reemplazo/);
const reassigned = removeRecord(base, "areas", "Contabilidad", "Gerencia");
assert(!reassigned.areas.includes("Contabilidad"));
assert(!reassigned.equipment.some((e) => e.area === "Contabilidad"));
assert(reassigned.movements.every((m) => m.from !== "Contabilidad" && m.to !== "Contabilidad"));
const renamedTech = renameCatalog(base, "technicians", "Elena Ruiz", "Elena Ruiz Salas");
assert(renamedTech.users.some((u) => u.name === "Elena Ruiz Salas"));
assert(renamedTech.maintenance.every((m) => m.technician !== "Elena Ruiz"));
console.log(
  "PASS: edición vinculada, renombrado, reasignación, eliminación en cascada, reversión técnica, estados y persistencia de bajas.",
);

const staleEmpty = {
  ...structuredClone(seed),
  maintenance: [],
  equipment: seed.equipment.map((e) => ({
    ...e,
    status: e.id === "PC-ADM-001" ? "En mantenimiento" : "Operativo",
    maintenanceStatusBase: "En mantenimiento",
  })),
};
const repairedEmpty = relations.repairMaintenance(staleEmpty);
assert.equal(repairedEmpty.equipment.filter((e) => e.status === "En mantenimiento").length, 0);
assert.equal(pending(repairedEmpty).length, 0);
const existingActive = relations.repairMaintenance(structuredClone(seed));
assert.equal(
  existingActive.equipment.filter((e) => e.status === "En mantenimiento").length,
  new Set(seed.maintenance.filter((m) => m.status === "En proceso").map((m) => m.equipmentId)).size,
);
const staleDeleted = {
  ...inProgress,
  equipment: inProgress.equipment.map((e) => ({ ...e, maintenanceStatusBase: "En mantenimiento" })),
};
assert.equal(
  removeRecord(staleDeleted, "maintenance", "TEST-MNT").equipment[0].status,
  "Operativo",
);
console.log(
  "PASS: cero mantenimientos implica cero equipos en mantenimiento; reparación de estados antiguos y baja de la última intervención.",
);

const legacyUsers = {
  ...structuredClone(seed),
  users: [
    {
      id: "USR-001",
      name: "Javier Mendoza",
      email: "admin@sigemti.edu.pe",
      role: "Administrador",
      active: "Activo",
    },
    {
      id: "USR-002",
      name: "Elena Ruiz",
      email: "tecnico@sigemti.edu.pe",
      role: "Técnico de soporte",
      active: "Activo",
    },
  ],
  movements: [
    {
      id: "legacy",
      equipmentId: "PC-ADM-001",
      date: model.today(),
      from: "Gerencia",
      to: "Administración",
      owner: "Carlos Ramos",
      reason: "Prueba",
      user: "Javier Mendoza",
    },
  ],
};
const admins = model.configureAdministrators(legacyUsers);
assert.deepEqual(
  admins.users
    .filter((u) => u.role === "Administrador")
    .map((u) => u.name)
    .sort(),
  ["Diomer Atachao", "Milagros Gonzales"],
);
assert.equal(new Set(admins.users.map((u) => u.id)).size, admins.users.length);
assert(admins.users.some((u) => u.name === "Elena Ruiz" && u.role === "Técnico de soporte"));
assert.equal(admins.movements[0].user, "Diomer Atachao");
assert.equal(model.configureAdministrators(admins).users.length, admins.users.length);
console.log(
  "PASS: dos administradores, migración sin perder el técnico ni duplicar usuarios, e historial vinculado.",
);
