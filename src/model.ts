export type Equipment = {
  id: string;
  code: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  serial: string;
  area: string;
  owner: string;
  location: string;
  acquired: string;
  status: string;
  cpu: string;
  ram: string;
  storage: string;
  board: string;
  graphics: string;
  os: string;
  license: string;
  ip: string;
  notes: string;
  [key: string]: string;
};
export type Maintenance = {
  id: string;
  equipmentId: string;
  kind: string;
  date: string;
  technician: string;
  status: string;
  component: string;
  diagnosis: string;
  work: string;
  next: string;
  cost: number;
  problem?: string;
  result?: string;
  notes?: string;
  evidence?: string;
};
export type Change = {
  id: string;
  equipmentId: string;
  date: string;
  component: string;
  before: string;
  after: string;
  oldSerial: string;
  newSerial: string;
  reason: string;
  technician: string;
  cost: number;
  upgrade: boolean;
  oldBrand?: string;
  newBrand?: string;
  notes?: string;
  action?: string;
};
export type Component = {
  id: string;
  equipmentId: string;
  type: string;
  brand: string;
  model: string;
  serial: string;
  specs: string;
  installed: string;
  status: string;
  removed?: string;
};
export type Movement = {
  id: string;
  equipmentId: string;
  date: string;
  from: string;
  to: string;
  owner: string;
  reason: string;
  user: string;
  previousOwner?: string;
  previousLocation?: string;
  location?: string;
};
export type Evidence = {
  id: string;
  equipmentId: string;
  name: string;
  date: string;
  url: string;
  type: string;
  maintenanceId?: string;
};
export type User = { id: string; name: string; email: string; role: string; active: string };
export type Store = {
  version: 2;
  equipment: Equipment[];
  maintenance: Maintenance[];
  changes: Change[];
  components: Component[];
  movements: Movement[];
  documents: Evidence[];
  areas: string[];
  technicians: string[];
  categories: string[];
  maintenanceTypes: string[];
  users: User[];
  institution: string;
  peripheralsAdded?: boolean;
  administratorsConfigured?: boolean;
};
export const statuses = ["Operativo", "En mantenimiento", "Fuera de servicio"];
export const componentFields: Record<string, string> = {
  Procesador: "cpu",
  "Memoria RAM": "ram",
  Almacenamiento: "storage",
  "Placa base": "board",
  "Tarjeta gráfica": "graphics",
  "Fuente de alimentación": "power",
  "Adaptador de red": "network",
  Monitor: "monitor",
  Teclado: "keyboard",
  Mouse: "mouse",
};
export const uid = () => {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const date = (v: string) =>
  v ? new Date(v + "T12:00:00").toLocaleDateString("es-PE") : "—";
export const money = (n: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n);
export function relativeDay(days: number) {
  const d = new Date(today() + "T12:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const initialAreas = [
  "Administración",
  "Contabilidad",
  "Recursos Humanos",
  "Logística",
  "Tesorería",
  "Informática",
  "Gerencia",
];
export const baseTechnical = {
  supplier: "Computación Institucional S.A.C.",
  cpuMaker: "Intel",
  generation: "10.ª generación",
  cores: "6",
  ramType: "DDR4",
  ramSpeed: "2666 MHz",
  ramModules: "2",
  ramSlots: "2",
  storageType: "SSD SATA",
  storageBrand: "Kingston A400",
  storageSerial: "KS-001",
  boardMaker: "Dell",
  chipset: "Intel Q470",
  power: "Fuente original 260 W",
  network: "Intel Gigabit Ethernet",
  monitor: "Dell P2422H · 24 pulgadas",
  keyboard: "Logitech K120",
  mouse: "Logitech B100",
  osVersion: "24H2",
  architecture: "64 bits",
  programs: "Microsoft 365; Microsoft Edge; 7-Zip",
};
const initialEquipment: Equipment[] = [
  [
    "PC-ADM-001",
    "Estación administrativa",
    "Escritorio",
    "Lenovo",
    "ThinkCentre M720",
    "Administración",
    "Carlos Ramos",
    "Operativo",
    "Intel Core i5-8500",
    "16 GB DDR4",
    "SSD NVMe 500 GB",
  ],
  [
    "PC-CON-014",
    "Estación de contabilidad",
    "Escritorio",
    "Dell",
    "OptiPlex 7090",
    "Contabilidad",
    "María Ortega",
    "Operativo",
    "Intel Core i7-10700",
    "8 GB DDR4",
    "SSD SATA 256 GB",
  ],
  [
    "LAP-GER-003",
    "Laptop de gerencia",
    "Laptop",
    "HP",
    "EliteBook 840 G8",
    "Gerencia",
    "Ana Salazar",
    "Operativo",
    "Intel Core i5-1135G7",
    "16 GB DDR4",
    "SSD NVMe 512 GB",
  ],
  [
    "IMP-RH-002",
    "Impresora de personal",
    "Impresora",
    "Epson",
    "WorkForce Pro WF-C5790",
    "Recursos Humanos",
    "Lucía Vega",
    "En mantenimiento",
    "No aplica",
    "No aplica",
    "No aplica",
  ],
  [
    "SRV-INF-002",
    "Servidor de aplicaciones",
    "Servidor",
    "Dell",
    "PowerEdge R550",
    "Informática",
    "David Núñez",
    "Operativo",
    "Intel Xeon Silver 4310",
    "64 GB ECC",
    "RAID 1 · 2 TB",
  ],
  [
    "PC-TES-007",
    "Estación de tesorería",
    "Escritorio",
    "HP",
    "ProDesk 400 G5",
    "Tesorería",
    "Pedro León",
    "Fuera de servicio",
    "Intel Core i5-9500",
    "8 GB DDR4",
    "HDD 500 GB",
  ],
  [
    "MON-LOG-011",
    "Monitor de logística",
    "Monitor",
    "LG",
    "24MP400",
    "Logística",
    "Jorge Pineda",
    "Operativo",
    "No aplica",
    "No aplica",
    "No aplica",
  ],
  [
    "PC-CON-015",
    "Estación de presupuestos",
    "Escritorio",
    "Dell",
    "OptiPlex 5080",
    "Contabilidad",
    "Rosa Huamán",
    "Operativo",
    "Intel Core i5-10500",
    "16 GB DDR4",
    "SSD NVMe 512 GB",
  ],
  [
    "LAP-INF-004",
    "Laptop de soporte",
    "Laptop",
    "Lenovo",
    "ThinkPad E14",
    "Informática",
    "Elena Ruiz",
    "Operativo",
    "Intel Core i5-1235U",
    "16 GB DDR4",
    "SSD NVMe 1 TB",
  ],
  [
    "PC-LOG-003",
    "Estación de almacén",
    "Escritorio",
    "HP",
    "ProDesk 600",
    "Logística",
    "Jorge Pineda",
    "En mantenimiento",
    "Intel Core i5-8500",
    "8 GB DDR4",
    "HDD 1 TB",
  ],
  [
    "PC-RH-005",
    "Gestión de nóminas",
    "Escritorio",
    "Dell",
    "OptiPlex 5070",
    "Recursos Humanos",
    "Lucía Vega",
    "Operativo",
    "Intel Core i5-9500",
    "8 GB DDR4",
    "SSD 256 GB",
  ],
  [
    "LAP-ADM-002",
    "Laptop de coordinación",
    "Laptop",
    "HP",
    "ProBook 450 G8",
    "Administración",
    "Carlos Ramos",
    "Operativo",
    "Intel Core i5-1135G7",
    "8 GB DDR4",
    "SSD 512 GB",
  ],
].map((r, i) => ({
  ...baseTechnical,
  id: r[0],
  code: `PAT-2023-${String(i + 1).padStart(4, "0")}`,
  name: r[1],
  type: r[2],
  brand: r[3],
  model: r[4],
  serial: `${r[3].slice(0, 3).toUpperCase()}-2023-${7040 + i}`,
  area: r[5],
  owner: r[6],
  status: r[7],
  cpu: r[8],
  ram: r[9],
  storage: r[10],
  board: r[3] + " placa OEM",
  graphics: "Gráficos integrados",
  os: ["Impresora", "Monitor"].includes(r[2])
    ? "No aplica"
    : r[2] === "Servidor"
      ? "Ubuntu Server 24.04 LTS"
      : "Windows 11 Pro",
  license: "Licencia institucional",
  ip: `192.168.10.${20 + i}`,
  location: `Sede central · ${r[5]}`,
  acquired: `2023-${String((i % 8) + 1).padStart(2, "0")}-12`,
  notes: "Datos ficticios para demostración académica.",
}));
function initialComponents(equipment: Equipment[]): Component[] {
  return equipment.flatMap((e) =>
    ["cpu", "ram", "storage"]
      .filter((k) => e[k] && e[k] !== "No aplica")
      .map((k, i) => ({
        id: `CMP-${e.id}-${i}`,
        equipmentId: e.id,
        type: { cpu: "Procesador", ram: "Memoria RAM", storage: "Almacenamiento" }[k]!,
        brand: k === "cpu" ? "Intel" : k === "ram" ? "Kingston" : "Kingston",
        model: e[k],
        serial: `${e.id}-${k}-01`,
        specs: e[k],
        installed: e.acquired,
        status: "Instalado",
      })),
  );
}
export const seed: Store = {
  version: 2,
  equipment: initialEquipment,
  components: initialComponents(initialEquipment),
  movements: [],
  documents: [],
  areas: initialAreas,
  technicians: ["David Núñez", "Elena Ruiz"],
  categories: ["Escritorio", "Laptop", "Servidor", "Impresora", "Monitor", "Otro periférico"],
  maintenanceTypes: ["Preventivo", "Correctivo", "Predictivo", "Repotenciación"],
  institution: "UNIVERSIDAD DE HUÁNUCO",
  users: [
    {
      id: "USR-001",
      name: "Diomer Atachao",
      email: "diomeradmin@udh.edu.pe",
      role: "Administrador",
      active: "Activo",
    },
    {
      id: "USR-002",
      name: "Milagros Gonzales",
      email: "milagrosgonzales@udh.edu.pe",
      role: "Administrador",
      active: "Activo",
    },

    {
      id: "USR-003",
      name: "Elena Ruiz",
      email: "tecnico@udh.edu.pe",
      role: "Técnico de soporte",
      active: "Activo",
    },
  ],
  maintenance: [
    {
      id: "MNT-2026-0112",
      equipmentId: "IMP-RH-002",
      kind: "Correctivo",
      date: relativeDay(-3),
      technician: "Elena Ruiz",
      status: "En proceso",
      component: "Unidad de impresión",
      problem: "Atascos recurrentes",
      diagnosis: "Rodillos de alimentación desgastados",
      work: "Limpieza y diagnóstico de rodillos",
      result: "Pendiente de reemplazo",
      next: "",
      cost: 120,
    },
    {
      id: "MNT-2026-0108",
      equipmentId: "PC-CON-014",
      kind: "Preventivo",
      date: relativeDay(-5),
      technician: "David Núñez",
      status: "Finalizado",
      component: "Equipo completo",
      problem: "Revisión periódica",
      diagnosis: "Polvo en ventiladores",
      work: "Limpieza interna, cambio de pasta térmica y pruebas",
      result: "Solucionado",
      next: relativeDay(175),
      cost: 85,
    },
    {
      id: "MNT-2026-0101",
      equipmentId: "SRV-INF-002",
      kind: "Predictivo",
      date: relativeDay(-12),
      technician: "David Núñez",
      status: "Finalizado",
      component: "Discos RAID",
      diagnosis: "SMART sin errores",
      work: "Verificación de redundancia y estado SMART",
      result: "Solucionado",
      next: relativeDay(78),
      cost: 150,
    },
    {
      id: "MNT-2026-0120",
      equipmentId: "LAP-GER-003",
      kind: "Preventivo",
      date: relativeDay(4),
      technician: "Elena Ruiz",
      status: "Programado",
      component: "Equipo completo",
      diagnosis: "Revisión semestral programada",
      work: "Limpieza y actualización previstas",
      result: "Pendiente",
      next: "",
      cost: 0,
    },
    {
      id: "MNT-2026-0090",
      equipmentId: "PC-TES-007",
      kind: "Correctivo",
      date: relativeDay(-7),
      technician: "David Núñez",
      status: "Programado",
      component: "Fuente de alimentación",
      diagnosis: "No enciende",
      work: "Evaluación de fuente y placa base",
      result: "Pendiente de reemplazo",
      next: "",
      cost: 0,
    },
    ...[1, 2, 3, 4, 5].flatMap((i) =>
      ["Preventivo", "Correctivo"].map((kind, j) => ({
        id: `MNT-2026-00${i}${j}`,
        equipmentId: j ? "PC-LOG-003" : "PC-CON-015",
        kind,
        date: relativeDay(-i * 30),
        technician: j ? "Elena Ruiz" : "David Núñez",
        status: "Finalizado",
        component: "Equipo completo",
        diagnosis: j ? "Reinicio inesperado" : "Revisión programada",
        work: j ? "Ajuste de conectores y pruebas" : "Limpieza y revisión de ventilación",
        result: "Solucionado",
        next: "",
        cost: j ? 100 : 75,
      })),
    ),
  ],
  changes: [
    {
      id: "CAM-2026-0098",
      equipmentId: "PC-ADM-001",
      date: relativeDay(-9),
      component: "Memoria RAM",
      before: "4 GB DDR4",
      after: "16 GB DDR4",
      oldSerial: "RAM-ADM-004",
      newSerial: "PC-ADM-001-ram-01",
      oldBrand: "Kingston ValueRAM 4 GB",
      newBrand: "Kingston Fury 16 GB",
      reason: "Mejorar la ejecución de aplicaciones administrativas",
      technician: "Elena Ruiz",
      cost: 240,
      upgrade: true,
    },
    {
      id: "CAM-2026-0099",
      equipmentId: "PC-ADM-001",
      date: relativeDay(-9),
      component: "Almacenamiento",
      before: "HDD 500 GB",
      after: "SSD NVMe 500 GB",
      oldSerial: "HDD-ADM-01",
      newSerial: "PC-ADM-001-storage-01",
      reason: "Reducir tiempos de acceso y sustituir disco degradado",
      technician: "Elena Ruiz",
      cost: 210,
      upgrade: true,
    },
    {
      id: "CAM-2026-0080",
      equipmentId: "PC-CON-015",
      date: relativeDay(-45),
      component: "Memoria RAM",
      before: "8 GB DDR4",
      after: "16 GB DDR4",
      oldSerial: "RAM-CON-008",
      newSerial: "PC-CON-015-ram-01",
      reason: "Mayor capacidad para hojas de cálculo",
      technician: "David Núñez",
      cost: 190,
      upgrade: true,
    },
  ],
};
// Add retired components from the same demonstration changes, so current and historical inventories agree.
seed.components.push(
  ...seed.changes.map((c) => ({
    id: `OLD-${c.id}`,
    equipmentId: c.equipmentId,
    type: c.component,
    brand: "Componente original",
    model: c.before,
    serial: c.oldSerial,
    specs: c.before,
    installed: "2023-01-12",
    removed: c.date,
    status: "Reemplazado",
  })),
);
seed.movements.push({
  id: "MOV-DEMO-001",
  equipmentId: "PC-CON-015",
  date: relativeDay(-60),
  from: "Administración",
  to: "Contabilidad",
  owner: "Rosa Huamán",
  reason: "Reasignación para elaboración de presupuestos",
  user: "Diomer Atachao",
});
seed.documents.push({
  id: "DOC-DEMO-001",
  equipmentId: "PC-ADM-001",
  name: "Acta de repotenciación DEMO.txt",
  date: relativeDay(-9),
  type: "text/plain",
  url:
    "data:text/plain;charset=utf-8," +
    encodeURIComponent(
      "SIGEMTI · EVIDENCIA DE DEMOSTRACIÓN\nEquipo: PC-ADM-001\nRAM: 4 GB a 16 GB DDR4\nAlmacenamiento: HDD 500 GB a SSD NVMe 500 GB\nTécnico: Elena Ruiz\nDocumento ficticio para presentación académica.",
    ),
});
seed.equipment.forEach((e) => {
  const computer = ["Escritorio", "Laptop", "Servidor"].includes(e.type);
  e.storageType = e.storage.includes("NVMe")
    ? "SSD NVMe"
    : e.storage.includes("HDD")
      ? "HDD"
      : e.type === "Servidor"
        ? "RAID"
        : computer
          ? "SSD SATA"
          : "No aplica";
  e.cores = e.cpu.includes("10700")
    ? "8"
    : e.cpu.includes("1135")
      ? "4"
      : e.cpu.includes("Xeon")
        ? "12"
        : e.cpu.includes("1235")
          ? "10"
          : computer
            ? "6"
            : "";
  e.generation = e.cpu.includes("8500")
    ? "8.ª generación"
    : e.cpu.includes("9500")
      ? "9.ª generación"
      : e.cpu.includes("1135")
        ? "11.ª generación"
        : e.cpu.includes("1235")
          ? "12.ª generación"
          : e.type === "Servidor"
            ? "Xeon Scalable 3.ª generación"
            : computer
              ? "10.ª generación"
              : "No aplica";
  e.boardMaker = e.brand;
  if (!computer) {
    for (const field of [
      "cpuMaker",
      "ramType",
      "ramSpeed",
      "ramModules",
      "ramSlots",
      "storageBrand",
      "storageSerial",
      "boardMaker",
      "board",
      "chipset",
      "graphics",
      "power",
      "network",
      "monitor",
      "keyboard",
      "mouse",
      "osVersion",
      "architecture",
      "programs",
    ]) {
      e[field] = "No aplica";
    }
  }
});
const peripheralRecords: Equipment[] = [
  [
    "IMP-CON-003",
    "Impresora de Contabilidad",
    "Impresora",
    "HP",
    "LaserJet Pro M404dn",
    "HP-M404-DEMO-003",
    "Contabilidad",
    "María Ortega",
    "Impresora láser monocromática, dúplex automático, Ethernet y USB.",
  ],
  [
    "MON-ADM-006",
    "Monitor de Administración",
    "Monitor",
    "Dell",
    "P2422H",
    "DELL-P24-DEMO-006",
    "Administración",
    "Carlos Ramos",
    "Pantalla IPS de 23,8 pulgadas, Full HD, HDMI y DisplayPort.",
  ],
  [
    "ESC-RH-001",
    "Escáner de expedientes",
    "Escáner",
    "Epson",
    "WorkForce DS-530 II",
    "EPS-DS530-DEMO-001",
    "Recursos Humanos",
    "Lucía Vega",
    "Escáner documental dúplex, alimentador automático y conexión USB.",
  ],
  [
    "PRO-GER-001",
    "Proyector de sala de reuniones",
    "Proyector",
    "Epson",
    "PowerLite E20",
    "EPS-E20-DEMO-001",
    "Gerencia",
    "Ana Salazar",
    "Proyector 3LCD, resolución XGA, conexión HDMI y VGA.",
  ],
  [
    "SW-INF-001",
    "Switch de comunicaciones",
    "Switch de red",
    "TP-Link",
    "TL-SG1024D",
    "TPL-SG24-DEMO-001",
    "Informática",
    "David Núñez",
    "24 puertos Gigabit Ethernet, montaje en rack y conexión RJ45.",
  ],
  [
    "UPS-TES-001",
    "UPS de Tesorería",
    "UPS",
    "APC",
    "Back-UPS BX1200MI",
    "APC-BX12-DEMO-001",
    "Tesorería",
    "Pedro León",
    "Sistema de alimentación ininterrumpida de 1200 VA, regulación automática de voltaje y batería de respaldo.",
  ],
  [
    "CAM-GER-001",
    "Cámara para videoconferencias",
    "Cámara web",
    "Logitech",
    "C920 HD Pro",
    "LOG-C920-DEMO-001",
    "Gerencia",
    "Ana Salazar",
    "Cámara web Full HD 1080p, micrófonos integrados y conexión USB.",
  ],
  [
    "DIS-LOG-001",
    "Disco externo de respaldo",
    "Almacenamiento externo",
    "Western Digital",
    "Elements Portable 2 TB",
    "WD-EL2-DEMO-001",
    "Logística",
    "Jorge Pineda",
    "Disco duro externo de 2 TB, interfaz USB 3.0, destinado a copias de respaldo.",
  ],
].map((r, i) => ({
  id: r[0],
  code: `PAT-2026-P${String(i + 1).padStart(3, "0")}`,
  name: r[1],
  type: r[2],
  brand: r[3],
  model: r[4],
  serial: r[5],
  area: r[6],
  owner: r[7],
  status: "Operativo",
  location: `Sede central · ${r[6]}`,
  acquired: "2026-10-15",
  supplier: "Proveedor institucional de demostración",
  notes: `${r[8]} Registro ficticio para demostración.`,
  cpu: "No aplica",
  ram: "No aplica",
  storage: r[2] === "Almacenamiento externo" ? "HDD externo 2 TB" : "No aplica",
  board: "No aplica",
  graphics: "No aplica",
  os: "No aplica",
  license: "No aplica",
  ip: "No asignada",
}));

// Add the requested records to both fresh and previously saved inventories, without replacing edits.
export function addPeripheralRecords(store: Store): Store {
  if (store.peripheralsAdded) return store;
  const existing = new Set(
    store.equipment.flatMap((e) => [e.id, e.code, e.serial].map((v) => v.toLowerCase())),
  );
  const additions = peripheralRecords.filter(
    (e) => ![e.id, e.code, e.serial].some((v) => existing.has(v.toLowerCase())),
  );
  const equipment = [...store.equipment, ...additions.map((e) => ({ ...e }))];
  return {
    ...store,
    peripheralsAdded: true,
    equipment,
    categories: [...new Set([...store.categories, ...additions.map((e) => e.type)])],
    areas: [...new Set([...store.areas, ...additions.map((e) => e.area)])],
  };
}

export function configureAdministrators(store: Store): Store {
  if (store.administratorsConfigured) return store;
  const administrators = seed.users.filter((u) => u.role === "Administrador");
  const users = store.users.map((u) => ({ ...u }));
  const renamed = new Map<string, string>();
  for (const desired of administrators) {
    let index = users.findIndex(
      (u) =>
        u.name.toLowerCase() === desired.name.toLowerCase() ||
        u.email.toLowerCase() === desired.email.toLowerCase(),
    );
    if (index < 0 && desired.name === "Diomer Atachao")
      index = users.findIndex(
        (u) => u.name === "Javier Mendoza" || u.email === "admin@sigemti.edu.pe",
      );
    if (index >= 0) {
      const old = users[index];
      if (old.name !== desired.name) renamed.set(old.name, desired.name);
      users[index] = { ...old, ...desired, id: old.id };
    } else
      users.push({ ...desired, id: users.some((u) => u.id === desired.id) ? uid() : desired.id });
  }
  const targetEmails = new Set(administrators.map((u) => u.email));
  return {
    ...store,
    administratorsConfigured: true,
    users: users.map((u) =>
      u.role === "Administrador" && !targetEmails.has(u.email)
        ? { ...u, role: "Técnico de soporte" }
        : u,
    ),
    equipment: store.equipment.map((e) => ({ ...e, owner: renamed.get(e.owner) || e.owner })),
    maintenance: store.maintenance.map((m) => ({
      ...m,
      technician: renamed.get(m.technician) || m.technician,
    })),
    changes: store.changes.map((c) => ({
      ...c,
      technician: renamed.get(c.technician) || c.technician,
    })),
    movements: store.movements.map((m) => ({
      ...m,
      user: renamed.get(m.user) || m.user,
      owner: renamed.get(m.owner) || m.owner,
    })),
    technicians: [...new Set(store.technicians.map((n) => renamed.get(n) || n))],
  };
}

export function readStore(): Store {
  try {
    const v = JSON.parse(localStorage.getItem("sigemti-v2") || "null");
    if (v?.version === 2 && Array.isArray(v.equipment) && Array.isArray(v.components))
      return configureAdministrators(addPeripheralRecords(v));
    const old = JSON.parse(localStorage.getItem("sigemti-v1") || "null");
    if (old?.version === 1 && Array.isArray(old.equipment)) {
      const eq = old.equipment.map((e: Equipment) => ({ ...baseTechnical, ...e }));
      return configureAdministrators(
        addPeripheralRecords({
          ...seed,
          equipment: eq,
          maintenance: old.maintenance,
          changes: old.changes,
          components: initialComponents(eq),
          documents: [],
          movements: [],
        }),
      );
    }
  } catch {}
  return configureAdministrators(addPeripheralRecords(structuredClone(seed)));
}
export function lastMaintenance(data: Store, id: string) {
  return (
    data.maintenance
      .filter((m) => m.equipmentId === id && m.status === "Finalizado")
      .map((m) => m.date)
      .sort()
      .pop() || ""
  );
}
export function pending(data: Store) {
  return data.maintenance.flatMap((m) => {
    if (m.status !== "Finalizado") return [{ ...m, due: m.date, source: "Intervención pendiente" }];
    if (
      m.next &&
      !data.maintenance.some((n) => n.equipmentId === m.equipmentId && n.date >= m.next)
    )
      return [
        {
          ...m,
          id: `NEXT-${m.id}`,
          status: "Por programar",
          due: m.next,
          source: "Próxima revisión",
        },
      ];
    return [];
  });
}
export function fileDownload(name: string, contents: BlobPart, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function exportCSV(title: string, headers: string[], rows: unknown[][]) {
  const cell = (v: unknown) =>
    `"${String(v ?? "")
      .replace(/^[=+@\-]/, "'$&")
      .replace(/"/g, '""')}"`;
  fileDownload(
    title + ".csv",
    "\uFEFF" + [headers, ...rows].map((r) => r.map(cell).join(";")).join("\r\n"),
    "text/csv;charset=utf-8",
  );
}

// A small uncompressed ZIP writer for native .xlsx exports; strings remain inline cells, never formulas.
export function excelBytes(headers: string[], rows: unknown[][]): Uint8Array {
  const escape = (v: unknown) =>
    String(v ?? "")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const column = (n: number): string => {
    let label = "";
    for (n++; n > 0; n = Math.floor((n - 1) / 26))
      label = String.fromCharCode(65 + ((n - 1) % 26)) + label;
    return label;
  };
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="${headers.length}" width="23" customWidth="1"/></cols><sheetData>${[headers, ...rows].map((r, i) => `<row r="${i + 1}">${r.map((c, j) => `<c r="${column(j)}${i + 1}" ${typeof c === "number" && Number.isFinite(c) ? `t="n"><v>${c}</v>` : `t="inlineStr"><is><t xml:space="preserve">${escape(c)}</t></is>`}</c>`).join("")}</row>`).join("")}</sheetData><autoFilter ref="A1:${column(headers.length - 1)}${rows.length + 1}"/></worksheet>`;
  const files: Record<string, string> = {
    "[Content_Types].xml":
      '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    "_rels/.rels":
      '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    "xl/workbook.xml":
      '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Reporte institucional" sheetId="1" r:id="rId1"/></sheets></workbook>',
    "xl/_rels/workbook.xml.rels":
      '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    "xl/worksheets/sheet1.xml": sheet,
  };
  const encoder = new TextEncoder();
  const blocks: Uint8Array[] = [];
  const entries: Uint8Array[] = [];
  let offset = 0;
  const crc32 = (bytes: Uint8Array) => {
    let crc = 0xffffffff;
    for (const b of bytes) {
      crc ^= b;
      for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    return (crc ^ 0xffffffff) >>> 0;
  };
  for (const [path, contents] of Object.entries(files)) {
    const name = encoder.encode(path),
      body = encoder.encode(contents),
      crc = crc32(body);
    const local = new Uint8Array(30 + name.length),
      lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true);
    lv.setUint16(12, 0x21, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, body.length, true);
    lv.setUint32(22, body.length, true);
    lv.setUint16(26, name.length, true);
    local.set(name, 30);
    blocks.push(local, body);
    const central = new Uint8Array(46 + name.length),
      cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(14, 0x21, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, body.length, true);
    cv.setUint32(24, body.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, offset, true);
    central.set(name, 46);
    entries.push(central);
    offset += local.length + body.length;
  }
  const centralSize = entries.reduce((sum, b) => sum + b.length, 0),
    end = new Uint8Array(22),
    ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  const all = [...blocks, ...entries, end],
    output = new Uint8Array(all.reduce((sum, b) => sum + b.length, 0));
  let pos = 0;
  for (const block of all) {
    output.set(block, pos);
    pos += block.length;
  }
  return output;
}
export function exportExcel(title: string, headers: string[], rows: unknown[][]) {
  fileDownload(
    title + ".xlsx",
    excelBytes(headers, rows).buffer as ArrayBuffer,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
}
