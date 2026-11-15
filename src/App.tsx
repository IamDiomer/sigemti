import { useEffect, useState, type ReactNode, type FormEvent } from "react";
import {
  Badge,
  BarChart,
  Button,
  Dialog,
  Icon,
  LineChart,
  RecordForm,
  Stat,
  Table,
  Tabs,
} from "./ui";
import {
  componentFields,
  date,
  exportCSV,
  exportExcel,
  fileDownload,
  lastMaintenance,
  money,
  pending,
  readStore,
  relativeDay,
  statuses,
  today,
  uid,
  type Change,
  type Component,
  type Equipment,
  type Maintenance,
  type Store,
  type User,
} from "./model";
import { equipmentSchema, hardwareSchema, maintenanceSchema } from "./schema";
import "./management.css";
import {
  catalogUsage,
  renameCatalog,
  renamePerson,
  removeRecord,
  repairMaintenance,
  saveChange,
  saveMaintenanceRecord,
  updateEquipment,
  type RecordKind,
  type CatalogKey,
} from "./relations";
const pages = [
  { key: "dashboard", label: "Panel principal", icon: "dashboard", section: "GENERAL" },
  { key: "inventory", label: "Inventario de equipos", icon: "inventory" },
  { key: "maintenance", label: "Mantenimientos", icon: "maintenance", section: "GESTIÓN TÉCNICA" },
  { key: "hardware", label: "Cambios de hardware", icon: "hardware" },
  { key: "upgrades", label: "Repotenciados", icon: "upgrades" },
  { key: "areas", label: "Áreas institucionales", icon: "areas" },
  { key: "reports", label: "Reportes institucionales", icon: "reports", section: "ANÁLISIS" },
  { key: "alerts", label: "Centro de alertas", icon: "alerts" },
  { key: "admin", label: "Administración", icon: "admin", section: "SISTEMA" },
];
const reportNames = [
  "Inventario general",
  "Equipos por área",
  "Características técnicas",
  "Mantenimientos realizados",
  "Equipos repotenciados",
  "Cambios de hardware",
  "Estado de equipos",
  "Historial individual del equipo",
  "Costos de mantenimiento",
  "Mantenimientos pendientes",
];
const detailTabs = [
  "Información general",
  "Características técnicas",
  "Componentes de hardware",
  "Historial de mantenimiento",
  "Cambios de hardware",
  "Repotenciaciones",
  "Documentos y evidencias",
];
const eqHeaders = [
  "Código patrimonial / interno",
  "Equipo",
  "Tipo / marca",
  "Modelo / serie",
  "Área / responsable",
  "Estado",
  "Adquisición",
  "Último mant.",
  "Acciones",
];
const maintenanceHeaders = [
  "Código / equipo",
  "Tipo / componente",
  "Fecha",
  "Técnico",
  "Diagnóstico",
  "Estado",
  "Costo",
  "Acciones",
];
function Logo() {
  return (
    <div className="s-logo">
      <span>
        <Icon name="hardware" size={25} />
      </span>
      <div>
        SIGEMTI<small>Gestión tecnológica institucional</small>
      </div>
    </div>
  );
}
function Login({ data, onLogin }: { data: Store; onLogin: (u: User) => void }) {
  const [email, setEmail] = useState(
      data.users.find((u) => u.role === "Administrador" && u.active === "Activo")?.email || "",
    ),
    [password, setPassword] = useState("Demo2026!"),
    [error, setError] = useState(""),
    [show, setShow] = useState(false);
  function submit(e: FormEvent) {
    e.preventDefault();
    const user = data.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.active === "Activo",
    );
    if (!user || password !== "Demo2026!") {
      setError("Usuario inactivo o credenciales incorrectas. Utiliza un acceso de demostración.");
      return;
    }
    onLogin(user);
  }
  return (
    <div className="s-login">
      <div className="s-login-form">
        <form onSubmit={submit}>
          <header className="s-login-brand">
            <span className="s-login-symbol"><Icon name="hardware" size={26} /></span>
            <h1>SIGEMTI</h1>
            <p>Sistema de Gestión de Equipos y Mantenimiento Tecnológico Institucional</p>
            <span className="s-login-institution">{data.institution}</span>
          </header>
          <h2>Iniciar sesión</h2>
          <p>Accede a tu espacio de gestión institucional.</p>
          {error && (
            <div role="alert" className="s-error">
              {error}
            </div>
          )}
          <label>
            Usuario o correo electrónico
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Contraseña
            <div className="s-password">
              <input
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <Icon name="eye" size={18} />
              </button>
            </div>
          </label>
          <Button primary type="submit" icon="arrow">
            Iniciar sesión
          </Button>
          <div className="s-demo">
            <label htmlFor="demo-user">Acceso de demostración</label>
            <select id="demo-user" value={data.users.some((u) => u.active === "Activo" && u.email === email) ? email : ""} onChange={(e) => {
              if (!e.target.value) return;
              setEmail(e.target.value);
              setPassword("Demo2026!");
              setError("");
            }}>
              <option value="" disabled>Selecciona una cuenta</option>
              {data.users.filter((u) => u.active === "Activo").map((u) => (
                <option key={u.id} value={u.email}>{u.name} · {u.role}</option>
              ))}
            </select>
            <small>Contraseña de demostración: Demo2026!</small>
          </div>
          <p className="s-login-note">
            <Icon name="shield" size={14} /> Acceso simulado con permisos por perfil.
          </p>
        </form>
        <small>
          © {new Date().getFullYear()} SIGEMTI · {data.institution}
        </small>
      </div>
    </div>
  );
}
function Info({ items }: { items: [string, ReactNode][] }) {
  return (
    <div className="s-info">
      {items.map(([l, v]) => (
        <div key={l}>
          <small>{l}</small>
          <b>{v || "Sin registrar"}</b>
        </div>
      ))}
    </div>
  );
}
export default function App() {
  const [deleting, setDeleting] = useState<{ kind: RecordKind; id: string; label: string } | null>(
    null,
  );
  const [undo, setUndo] = useState<{ before: Store; after: Store } | null>(null);
  const [data, setData] = useState<Store>(() => repairMaintenance(readStore())),
    [user, setUser] = useState<User | null>(null),
    [page, setPage] = useState("dashboard"),
    [selected, setSelected] = useState(""),
    [detailTab, setDetailTab] = useState(detailTabs[0]),
    [mobile, setMobile] = useState(false),
    [query, setQuery] = useState(""),
    [area, setArea] = useState(""),
    [type, setType] = useState(""),
    [brand, setBrand] = useState(""),
    [status, setStatus] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [tech, setTech] = useState(""),
    [kind, setKind] = useState(""),
    [interventionStatus, setInterventionStatus] = useState(""),
    [report, setReport] = useState(reportNames[1]),
    [reportEquipment, setReportEquipment] = useState(""),
    [preview, setPreview] = useState(false),
    [modal, setModal] = useState(""),
    [editId, setEditId] = useState(""),
    [maintenanceId, setMaintenanceId] = useState(""),
    [compareId, setCompareId] = useState(""),
    [notice, setNotice] = useState(""),
    [adminTab, setAdminTab] = useState("Usuarios"),
    [alertPriority, setAlertPriority] = useState("");
  const admin = user?.role === "Administrador";
  useEffect(() => {
    try {
      localStorage.setItem("sigemti-v2", JSON.stringify(data));
    } catch {
      setNotice(
        "No se pudieron guardar los datos. Descarga un respaldo y reduce las evidencias adjuntas.",
      );
    }
  }, [data]);
  const current = data.equipment.find((e) => e.id === selected);
  const device = (id: string) => data.equipment.find((e) => e.id === id);
  const upgraded = new Set(data.changes.filter((c) => c.upgrade).map((c) => c.equipmentId));
  const pendingItems = pending(data);
  function resetFilters() {
    setQuery("");
    setArea("");
    setType("");
    setBrand("");
    setStatus("");
    setFrom("");
    setTo("");
    setTech("");
    setKind("");
    setInterventionStatus("");
  }
  function go(p: string) {
    setPage(p);
    resetFilters();
    setMobile(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function showEquipment(id: string, tab = detailTabs[0]) {
    setSelected(id);
    setDetailTab(tab);
    setPage("detail");
  }
  function open(m: string, id = "") {
    setEditId(id);
    setModal(m);
  }
  function done(message = "Registro guardado correctamente.") {
    setModal("");
    setNotice(message);
  }
  const catalogKey = (
    {
      "Áreas institucionales": "areas",
      Técnicos: "technicians",
      Categorías: "categories",
      "Tipos de mantenimiento": "maintenanceTypes",
    } as Record<string, CatalogKey>
  )[adminTab];
  function deleteButton(kind: RecordKind, id: string, label: string) {
    return (
      <Button icon="close" onClick={() => setDeleting({ kind, id, label })}>
        Quitar
      </Button>
    );
  }
  function confirmDelete(v: Record<string, string>): string | void {
    if (!deleting) return;
    if (deleting.kind === "users" && deleting.id === user?.id)
      return "No puedes quitar la sesión con la que estás trabajando. Ingresa con otro administrador.";
    try {
      const next = removeRecord(data, deleting.kind, deleting.id, v.replacement);
      setUndo({ before: data, after: next });
      setData(next);
      setDeleting(null);
      setNotice("Registro quitado. Sus relaciones se actualizaron. Puedes deshacer esta acción.");
      if (deleting.kind === "equipment" && selected === deleting.id) {
        setSelected("");
        setPage("inventory");
      }
      setMaintenanceId("");
      setCompareId("");
    } catch (e) {
      return (e as Error).message;
    }
  }
  const inRange = (d: string) => (!from || d >= from) && (!to || d <= to);
  const rangeInvalid = !!(from && to && from > to);
  const filtered = data.equipment.filter(
    (e) =>
      (!area || e.area === area) &&
      (!type || e.type === type) &&
      (!brand || e.brand === brand) &&
      (!status || e.status === status) &&
      Object.values(e).join(" ").toLowerCase().includes(query.toLowerCase()),
  );
  const visible =
    page === "inventory" || page === "areas"
      ? filtered.filter((e) => inRange(e.acquired))
      : filtered;
  const maintenance = data.maintenance.filter(
    (m) =>
      filtered.some((e) => e.id === m.equipmentId) &&
      inRange(m.date) &&
      (!tech || m.technician === tech) &&
      (!kind || m.kind === kind) &&
      (!interventionStatus || m.status === interventionStatus),
  );
  const changes = data.changes.filter(
    (c) =>
      filtered.some((e) => e.id === c.equipmentId) &&
      inRange(c.date) &&
      (!tech || c.technician === tech),
  );
  const alertItems: [string, string, string, string][] = [
    ...pendingItems
      .filter((m) => m.due <= relativeDay(7))
      .map(
        (m) =>
          [
            m.due < today() ? "Alta" : "Media",
            m.due < today() ? "Mantenimiento vencido" : "Mantenimiento próximo",
            m.equipmentId,
            `${m.source} · ${date(m.due)} · ${m.technician}`,
          ] as [string, string, string, string],
      ),
    ...data.equipment
      .filter((e) => e.status === "Fuera de servicio")
      .map(
        (e) =>
          ["Alta", "Equipo con falla registrada", e.id, `${e.area} · ${e.status}`] as [
            string,
            string,
            string,
            string,
          ],
      ),
    ...data.maintenance
      .filter((m) => m.result === "Pendiente de reemplazo")
      .map(
        (m) =>
          [
            "Alta",
            "Componente pendiente de reemplazo",
            m.equipmentId,
            m.component + " · " + m.diagnosis,
          ] as [string, string, string, string],
      ),
    ...data.equipment
      .filter(
        (e) =>
          !["Monitor", "Impresora", "Otro periférico"].includes(e.type) &&
          (!lastMaintenance(data, e.id) || lastMaintenance(data, e.id) < relativeDay(-180)),
      )
      .map(
        (e) =>
          [
            "Baja",
            "Sin mantenimiento reciente",
            e.id,
            `${e.area} · Sin intervención finalizada en los últimos 180 días`,
          ] as [string, string, string, string],
      ),
  ];
  const filters = (dateFilter = true, technical = false) => (
    <div className="s-filters">
      <label className="s-search">
        <Icon name="search" size={17} />
        <input
          aria-label="Buscar en registros"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por equipo, serie o responsable…"
        />
      </label>
      <select aria-label="Filtrar por área" value={area} onChange={(e) => setArea(e.target.value)}>
        <option value="">Todas las áreas</option>
        {data.areas.map((a) => (
          <option key={a}>{a}</option>
        ))}
      </select>
      <select aria-label="Filtrar por tipo" value={type} onChange={(e) => setType(e.target.value)}>
        <option value="">Todos los tipos</option>
        {data.categories.map((a) => (
          <option key={a}>{a}</option>
        ))}
      </select>
      <select
        aria-label="Filtrar por marca"
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
      >
        <option value="">Todas las marcas</option>
        {Array.from(new Set(data.equipment.map((e) => e.brand))).map((a) => (
          <option key={a}>{a}</option>
        ))}
      </select>
      <select
        aria-label="Filtrar por estado"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">Todos los estados</option>
        {statuses.map((a) => (
          <option key={a}>{a}</option>
        ))}
      </select>
      {dateFilter && (
        <>
          <label>
            Desde
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label>
            Hasta
            <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
          </label>
        </>
      )}
      {technical && (
        <select
          aria-label="Filtrar por técnico"
          value={tech}
          onChange={(e) => setTech(e.target.value)}
        >
          <option value="">Todos los técnicos</option>
          {data.technicians.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      )}
      <button className="s-text-button" onClick={resetFilters}>
        Limpiar filtros
      </button>
      {rangeInvalid && (
        <p className="s-error" role="alert">
          El inicio del período debe ser anterior al final.
        </p>
      )}
    </div>
  );
  function eqRows(items: Equipment[]): ReactNode[][] {
    return items.map((e) => [
      <>
        <b className="s-code">{e.code}</b>
        <button className="s-link" onClick={() => showEquipment(e.id)}>
          {e.id}
        </button>
      </>,
      <button className="s-device" onClick={() => showEquipment(e.id)}>
        <span>
          <Icon name="inventory" />
        </span>
        <b>{e.name}</b>
      </button>,
      <>
        {e.type}
        <small>{e.brand}</small>
      </>,
      <>
        {e.model}
        <small>{e.serial}</small>
      </>,
      <>
        {e.area}
        <small>{e.owner}</small>
      </>,
      <Badge>{e.status}</Badge>,
      date(e.acquired),
      date(lastMaintenance(data, e.id)),
      <div className="s-row-actions">
        <button title="Ver ficha técnica" onClick={() => showEquipment(e.id)}>
          <Icon name="eye" size={16} />
        </button>
        {admin && (
          <button title="Editar equipo" onClick={() => open("equipment", e.id)}>
            <Icon name="edit" size={16} />
          </button>
        )}
        {admin && (
          <button
            title="Quitar equipo"
            onClick={() => setDeleting({ kind: "equipment", id: e.id, label: e.id })}
          >
            <Icon name="close" size={16} />
          </button>
        )}
        <button title="Consultar historial" onClick={() => showEquipment(e.id, detailTabs[3])}>
          <Icon name="clock" size={16} />
        </button>
        <button
          title="Registrar mantenimiento"
          onClick={() => {
            setSelected(e.id);
            open("maintenance");
          }}
        >
          <Icon name="maintenance" size={16} />
        </button>
      </div>,
    ]);
  }
  function maintenanceRows(items: Maintenance[]): ReactNode[][] {
    return items.map((m) => [
      <>
        <button className="s-link" onClick={() => setMaintenanceId(m.id)}>
          {m.id}
        </button>
        <small>{m.equipmentId}</small>
      </>,
      <>
        {m.kind}
        <small>{m.component}</small>
      </>,
      date(m.date),
      m.technician,
      m.diagnosis,
      <Badge>{m.status}</Badge>,
      money(m.cost),
      <div className="s-row-actions">
        <button title="Ver intervención" onClick={() => setMaintenanceId(m.id)}>
          <Icon name="eye" size={16} />
        </button>
        <button title="Editar intervención" onClick={() => open("maintenance", m.id)}>
          <Icon name="edit" size={16} />
        </button>
        {deleteButton("maintenance", m.id, m.id)}
      </div>,
    ]);
  }
  function changeRows(items: Change[]): ReactNode[][] {
    return items.map((c) => [
      <button className="s-link" onClick={() => showEquipment(c.equipmentId, detailTabs[4])}>
        {c.equipmentId}
        <small>{device(c.equipmentId)?.area}</small>
      </button>,
      date(c.date),
      c.component,
      <span className="s-old">{c.before || "Sin componente"}</span>,
      <span className="s-new">{c.after || "Retirado"}</span>,
      c.reason,
      c.technician,
      money(c.cost),
      <div className="s-row-actions">
        <Button onClick={() => setCompareId(c.id)} icon="eye">
          Comparar
        </Button>
        <Button icon="edit" onClick={() => open("hardwareEdit", c.id)}>
          Editar
        </Button>
        {deleteButton("changes", c.id, c.id)}
      </div>,
    ]);
  }
  const changeHeaders = [
    "Equipo / área",
    "Fecha",
    "Componente",
    "Configuración anterior",
    "Configuración nueva",
    "Motivo",
    "Técnico",
    "Costo",
    "Detalle",
  ];
  function saveEquipment(v: Record<string, string>): string | void {
    if (!admin) return "El perfil técnico no puede modificar datos patrimoniales.";
    const activeMaintenance = data.maintenance.some(
      (m) => m.equipmentId === editId && m.status === "En proceso",
    );
    if (v.status === "En mantenimiento" && !activeMaintenance)
      return "Para marcar el equipo en mantenimiento, registra primero una intervención en proceso.";
    if (activeMaintenance && v.status !== "En mantenimiento")
      return "Este equipo tiene un mantenimiento en proceso. Finaliza o actualiza esa intervención antes de cambiar su estado.";
    if (v.acquired > today()) return "La adquisición no puede ser futura.";
    if (
      data.equipment.some(
        (e) =>
          e.id !== editId &&
          ["id", "code", "serial"].some((k) => e[k].toLowerCase() === v[k].toLowerCase()),
      )
    )
      return "Ya existe un equipo con ese código o número de serie.";
    const original = device(editId);
    const item = { ...original, ...v } as Equipment;
    if (
      !original &&
      ["Escritorio", "Laptop", "Servidor"].includes(v.type) &&
      (!v.cpu || !v.ram || !v.storage)
    )
      return "Completa procesador, RAM y almacenamiento en las pestañas técnicas.";
    const comps: Component[] = original
      ? []
      : Object.entries(componentFields)
          .filter(([, k]) => v[k])
          .map(([t, k]) => ({
            id: uid(),
            equipmentId: v.id,
            type: t,
            brand: v.brand,
            model: v[k],
            serial: k === "storage" ? v.storageSerial || "Sin serie" : "Sin serie",
            specs: v[k],
            installed: v.acquired,
            status: "Instalado",
          }));
    setData((d) =>
      original
        ? updateEquipment(d, item, user!.name)
        : {
            ...d,
            equipment: original
              ? d.equipment.map((e) => (e.id === editId ? item : e))
              : [...d.equipment, item],
            components: [...d.components, ...comps],
          },
    );
    done();
  }
  function saveMaintenance(v: Record<string, string>): string | void {
    if (v.status === "Finalizado" && v.date > today())
      return "Un mantenimiento finalizado no puede tener fecha futura.";
    if (v.status === "Finalizado" && v.result === "Pendiente")
      return "Selecciona el resultado de la intervención finalizada.";
    if (v.next && v.next <= v.date) return "La próxima fecha debe ser posterior a la intervención.";
    if (data.maintenance.some((m) => m.id === v.id && m.id !== editId))
      return "Ese código de mantenimiento ya existe.";
    const item = { ...v, cost: Number(v.cost) } as Maintenance;
    setData(saveMaintenanceRecord(data, item));
    done();
  }
  function saveHardware(v: Record<string, string>): string | void {
    const target = device(v.equipmentId),
      field = componentFields[v.component];
    if (!target || !field) return "Selecciona un equipo y componente válidos.";
    const editing = modal === "hardwareEdit";
    if (!editing && (target[field] || "") !== v.before)
      return "La ficha cambió. Selecciona nuevamente el equipo y componente.";
    if (v.date > today() || v.date < target.acquired)
      return "La fecha debe estar entre la adquisición del equipo y hoy.";
    const record = {
      ...v,
      id: editing ? editId : `CAM-${uid().slice(0, 8).toUpperCase()}`,
      cost: Number(v.cost),
      upgrade: v.upgrade === "Sí",
      action: v.after ? "Reemplazo" : "Retiro",
    } as Change;
    try {
      setData(saveChange(data, record));
      done("Cambio guardado. Ficha, componentes, historial y reportes actualizados.");
    } catch (e) {
      return (e as Error).message;
    }
  }
  function saveMovement(v: Record<string, string>): string | void {
    if (!admin) return "Solo el administrador puede trasladar equipos.";
    const target = device(v.equipmentId);
    if (!target) return "Selecciona el equipo.";
    if (v.date > today()) return "La fecha del traslado no puede ser futura.";
    if (target.area === v.to) return "Selecciona un área de destino diferente.";
    setData((d) => ({
      ...d,
      equipment: d.equipment.map((e) =>
        e.id === target.id ? { ...e, area: v.to, owner: v.owner, location: v.location } : e,
      ),
      movements: [
        ...d.movements,
        {
          id: uid(),
          equipmentId: target.id,
          date: v.date,
          from: target.area,
          to: v.to,
          owner: v.owner,
          previousOwner: target.owner,
          previousLocation: target.location,
          location: v.location,
          reason: v.reason,
          user: user!.name,
        },
      ],
    }));
    done("Traslado registrado con el área de origen y destino.");
  }
  function saveComponent(v: Record<string, string>): string | void {
    const target = device(v.equipmentId),
      field = componentFields[v.type];
    if (!target || !field) return "Selecciona un equipo y tipo válidos.";
    if (v.installed > today() || v.installed < target.acquired)
      return "La instalación debe estar entre la adquisición y hoy.";
    if (modal === "componentEdit") {
      const original = data.components.find((c) => c.id === editId);
      if (!original || original.status !== "Instalado")
        return "Selecciona un componente instalado.";
      if (v.equipmentId !== original.equipmentId || v.type !== original.type)
        return "Para cambiar de equipo o tipo, registra otro componente.";
      setData(
        saveChange(data, {
          id: uid(),
          equipmentId: target.id,
          date: today(),
          component: v.type,
          before: target[field] || "",
          after: v.specs,
          oldSerial: original.serial,
          newSerial: v.serial,
          oldBrand: original.brand + " " + original.model,
          newBrand: v.brand + " " + v.model,
          reason: "Edición del componente instalado",
          technician: user!.name,
          cost: 0,
          upgrade: false,
          action: "Edición de componente",
        }),
      );
      done();
      return;
    }
    if (
      data.components.some(
        (c) => c.equipmentId === target.id && c.type === v.type && c.status === "Instalado",
      )
    )
      return "Este tipo de componente ya está instalado. Utiliza «Reemplazar» para conservar la trazabilidad.";
    const change: Change = {
      id: uid(),
      equipmentId: target.id,
      date: v.installed,
      component: v.type,
      before: target[field] || "",
      after: v.specs,
      oldSerial: "",
      newSerial: v.serial,
      newBrand: v.brand + " " + v.model,
      reason: "Instalación de componente adicional",
      technician: user!.name,
      cost: 0,
      upgrade: false,
      action: "Instalación",
    };
    setData(saveChange(data, change));
    done();
  }
  function retireComponent(v: Record<string, string>) {
    const c = data.components.find((c) => c.id === editId);
    if (!c) return "Componente no encontrado.";
    if (v.date > today() || v.date < c.installed)
      return "El retiro debe estar entre la instalación y hoy.";
    const field = componentFields[c.type],
      target = device(c.equipmentId);
    const record: Change = {
      id: uid(),
      equipmentId: c.equipmentId,
      date: v.date,
      component: c.type,
      before: target?.[field] || c.specs,
      after: "",
      oldSerial: c.serial,
      newSerial: "",
      reason: v.reason,
      technician: user!.name,
      cost: 0,
      upgrade: false,
      action: "Retiro",
    };
    setData(saveChange(data, record));
    done("Componente retirado; el historial se conserva.");
  }
  const eqReportHeaders = [
    "Código patrimonial",
    "Código interno",
    "Nombre",
    "Tipo",
    "Marca",
    "Modelo",
    "Serie",
    "Área actual",
    "Responsable",
    "Estado",
    "Adquisición",
    "Procesador",
    "RAM",
    "Almacenamiento",
    "Sistema operativo",
    "Último mantenimiento",
    "Ubicación física",
    "Proveedor",
    "Placa base",
    "Tarjeta gráfica",
    "Licencia",
    "IP / MAC",
    "Observaciones",
  ];
  const eqReportRows = (list: Equipment[]) =>
    list.map((e) => [
      e.code,
      e.id,
      e.name,
      e.type,
      e.brand,
      e.model,
      e.serial,
      e.area,
      e.owner,
      e.status,
      e.acquired,
      e.cpu,
      e.ram,
      e.storage,
      e.os,
      lastMaintenance(data, e.id),
      e.location,
      e.supplier,
      e.board,
      e.graphics,
      e.license,
      e.ip,
      e.notes,
    ]);
  let reportHeaders = eqReportHeaders,
    reportRows: unknown[][] = eqReportRows(filtered.filter((e) => inRange(e.acquired)));
  if (report === reportNames[1]) {
    reportHeaders = [
      "Área",
      "Código",
      "Equipo",
      "Responsable",
      "Tipo",
      "Estado",
      "Último mantenimiento",
    ];
    reportRows = filtered
      .filter((e) => inRange(e.acquired))
      .sort((a, b) => a.area.localeCompare(b.area))
      .map((e) => [e.area, e.id, e.name, e.owner, e.type, e.status, lastMaintenance(data, e.id)]);
  }
  if (report === reportNames[2]) {
    reportHeaders = [
      "Equipo",
      "Área",
      "CPU fabricante",
      "CPU modelo",
      "Generación",
      "Núcleos",
      "RAM",
      "DDR",
      "Velocidad",
      "Módulos",
      "Ranuras libres",
      "Almacenamiento",
      "Tipo disco",
      "Marca disco",
      "Serie disco",
      "Placa",
      "Chipset",
      "GPU",
      "Fuente",
      "Red",
      "Monitor",
      "Teclado",
      "Mouse",
      "SO",
      "Versión",
      "Arquitectura",
      "Programas",
      "Licencia",
    ];
    reportRows = filtered
      .filter((e) => inRange(e.acquired))
      .map((e) => [
        e.id,
        e.area,
        e.cpuMaker,
        e.cpu,
        e.generation,
        e.cores,
        e.ram,
        e.ramType,
        e.ramSpeed,
        e.ramModules,
        e.ramSlots,
        e.storage,
        e.storageType,
        e.storageBrand,
        e.storageSerial,
        e.board,
        e.chipset,
        e.graphics,
        e.power,
        e.network,
        e.monitor,
        e.keyboard,
        e.mouse,
        e.os,
        e.osVersion,
        e.architecture,
        e.programs,
        e.license,
      ]);
  }
  if (report === reportNames[3]) {
    reportHeaders = [
      "Código",
      "Equipo",
      "Área actual",
      "Tipo",
      "Fecha",
      "Técnico",
      "Problema",
      "Diagnóstico",
      "Actividades",
      "Componentes",
      "Resultado",
      "Costo",
    ];
    reportRows = maintenance
      .filter((m) => m.status === "Finalizado")
      .map((m) => [
        m.id,
        m.equipmentId,
        device(m.equipmentId)?.area,
        m.kind,
        m.date,
        m.technician,
        m.problem,
        m.diagnosis,
        m.work,
        m.component,
        m.result,
        m.cost,
      ]);
  }
  if (report === reportNames[4] || report === reportNames[5]) {
    reportHeaders = [
      "Equipo",
      "Área actual",
      "Fecha",
      "Componente",
      "Antes",
      "Después",
      "Marca anterior",
      "Marca nueva",
      "Serie anterior",
      "Serie nueva",
      "Motivo",
      "Técnico",
      "Costo",
      "Acción",
    ];
    reportRows = changes
      .filter((c) => report !== reportNames[4] || c.upgrade)
      .map((c) => [
        c.equipmentId,
        device(c.equipmentId)?.area,
        c.date,
        c.component,
        c.before,
        c.after,
        c.oldBrand,
        c.newBrand,
        c.oldSerial,
        c.newSerial,
        c.reason,
        c.technician,
        c.cost,
        c.action || "Reemplazo",
      ]);
  }
  if (report === reportNames[6]) {
    reportHeaders = ["Equipo", "Tipo", "Área", "Responsable", "Estado"];
    reportRows = filtered
      .filter((e) => inRange(e.acquired))
      .map((e) => [e.id, e.type, e.area, e.owner, e.status]);
  }
  if (report === reportNames[7]) {
    const eq = filtered.find((e) => e.id === reportEquipment) || filtered[0];
    reportHeaders = ["Sección", "Fecha", "Equipo", "Concepto", "Detalle", "Responsable", "Costo"];
    reportRows = eq
      ? [
          ...Object.entries(eq).map(([k, v]) => [
            "Ficha técnica",
            eq.acquired,
            eq.id,
            equipmentSchema(data, false).find((f) => f.key === k)?.label || "Información adicional",
            v,
            eq.owner,
            "",
          ]),
          ...data.maintenance
            .filter(
              (m) => m.equipmentId === eq.id && inRange(m.date) && (!tech || m.technician === tech),
            )
            .map((m) => [
              "Mantenimiento",
              m.date,
              eq.id,
              m.kind,
              m.diagnosis + " · " + m.work,
              m.technician,
              m.cost,
            ]),
          ...data.changes
            .filter(
              (c) => c.equipmentId === eq.id && inRange(c.date) && (!tech || c.technician === tech),
            )
            .map((c) => [
              c.upgrade ? "Repotenciación" : "Hardware",
              c.date,
              eq.id,
              c.component,
              `${c.before} → ${c.after}`,
              c.technician,
              c.cost,
            ]),
          ...data.movements
            .filter((m) => m.equipmentId === eq.id && inRange(m.date))
            .map((m) => ["Traslado", m.date, eq.id, m.from + " → " + m.to, m.reason, m.user, ""]),
        ]
      : [];
  }
  if (report === reportNames[8]) {
    reportHeaders = [
      "Equipo",
      "Área actual",
      "Tipo de mantenimiento",
      "Intervenciones",
      "Costo total (S/)",
    ];
    const grouped = new Map<string, { id: string; kind: string; count: number; cost: number }>();
    maintenance
      .filter((m) => m.status === "Finalizado")
      .forEach((m) => {
        const key = m.equipmentId + "|" + m.kind;
        const g = grouped.get(key) || { id: m.equipmentId, kind: m.kind, count: 0, cost: 0 };
        g.count++;
        g.cost += m.cost;
        grouped.set(key, g);
      });
    reportRows = [...grouped.values()].map((g) => [
      g.id,
      device(g.id)?.area,
      g.kind,
      g.count,
      g.cost,
    ]);
  }
  if (report === reportNames[9]) {
    reportHeaders = [
      "Equipo",
      "Área actual",
      "Tipo",
      "Fecha prevista",
      "Técnico",
      "Estado",
      "Situación",
    ];
    reportRows = pendingItems
      .filter(
        (m) =>
          filtered.some((e) => e.id === m.equipmentId) &&
          inRange(m.due) &&
          (!tech || m.technician === tech) &&
          (!kind || m.kind === kind),
      )
      .map((m) => [
        m.equipmentId,
        device(m.equipmentId)?.area,
        m.kind,
        m.due,
        m.technician,
        m.status,
        m.due < today() ? "Vencido" : "Próximo",
      ]);
  }
  const reportMeta = `Área: ${area || "Todas"} · Tipo: ${type || "Todos"} · Estado: ${status || "Todos"} · Período: ${date(from)} a ${date(to)} · Técnico: ${tech || "Todos"}`;
  const activeReport = (
    <div className="s-report-paper">
      <div className="s-report-heading">
        <Logo />
        <div>
          <b>{data.institution}</b>
          <small>Oficina de Tecnologías de la Información</small>
        </div>
      </div>
      <span className="s-eyebrow">REPORTE INSTITUCIONAL</span>
      <h2>{report}</h2>
      <p>
        Fecha de emisión: {date(today())} · Generado por: {user?.name}
      </p>
      <p>{reportMeta}</p>
      <div className="s-report-summary">
        <span>
          <b>{reportRows.length}</b> registros
        </span>
        <span>
          <b>{data.institution}</b> institución
        </span>
        <span>Áreas según asignación actual</span>
      </div>
      <div className="s-table-scroll">
        <table className="s-table">
          <thead>
            <tr>
              {reportHeaders.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportRows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j}>{String(c ?? "—")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!reportRows.length && (
          <p className="s-empty">Sin registros para los filtros seleccionados.</p>
        )}
      </div>
      <footer>SIGEMTI · Documento de demostración · {user?.role}</footer>
    </div>
  );
  if (!user)
    return (
      <Login
        data={data}
        onLogin={(u) => {
          setUser(u);
          setNotice("");
          go("dashboard");
        }}
      />
    );
  const title =
    page === "detail"
      ? "Ficha técnica del equipo"
      : pages.find((p) => p.key === page)?.label || "SIGEMTI";
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today() + "T12:00:00");
    d.setDate(1);
    d.setMonth(d.getMonth() - 5 + i);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("es-PE", { month: "short" }),
    };
  });
  return (
    <div className={`s-app ${preview ? "printing-preview" : ""}`}>
      <aside className={`s-sidebar ${mobile ? "open" : ""}`}>
        <Logo />
        <div className="s-workspace">
          <span>IT</span>
          <div>
            {data.institution}
            <small>Espacio institucional</small>
          </div>
        </div>
        <nav>
          {pages
            .filter((p) => admin || p.key !== "admin")
            .map((p) => (
              <div key={p.key}>
                {p.section && <span className="s-nav-section">{p.section}</span>}
                <button
                  onClick={() => go(p.key)}
                  className={
                    page === p.key || (page === "detail" && p.key === "inventory") ? "active" : ""
                  }
                >
                  <Icon name={p.icon} size={19} />
                  <span>{p.label}</span>
                  {p.key === "alerts" && <b>{alertItems.length}</b>}
                </button>
              </div>
            ))}
        </nav>
        <div className="s-sidebar-bottom">
          <span className="s-demo-note">
            <i /> Prototipo · almacenamiento local
          </span>
          <div>
            <span className="s-avatar">
              {user.name
                .split(" ")
                .slice(0, 2)
                .map((s) => s[0])
                .join("")}
            </span>
            <span>
              <b>{user.name}</b>
              <small>{user.role}</small>
            </span>
            <button
              title="Cerrar sesión"
              onClick={() => {
                setUser(null);
                setModal("");
              }}
            >
              <Icon name="logout" size={17} />
            </button>
          </div>
        </div>
      </aside>
      {mobile && <div className="s-sidebar-shade" onClick={() => setMobile(false)} />}
      <div className="s-main">
        <header className="s-topbar">
          <button
            className="s-icon-button s-mobile-menu"
            aria-label="Abrir menú"
            onClick={() => setMobile(!mobile)}
          >
            <Icon name="menu" />
          </button>
          <form
            className="s-global-search"
            onSubmit={(e) => {
              e.preventDefault();
              setPage("inventory");
              setArea("");
              setType("");
              setBrand("");
              setStatus("");
              setFrom("");
              setTo("");
            }}
          >
            <Icon name="search" size={18} />
            <input
              aria-label="Búsqueda global de equipos"
              placeholder="Buscar en el inventario…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="s-search-submit"
              aria-label="Buscar equipos"
              title="Buscar equipos"
            >
              <Icon name="arrow" size={18} />
            </button>
          </form>
          <div className="s-top-actions">
            <span className="s-environment">DEMO INSTITUCIONAL</span>
            <button
              className="s-notification"
              title="Ver notificaciones"
              onClick={() => go("alerts")}
            >
              <Icon name="alerts" />
              {alertItems.length > 0 && <i>{alertItems.length > 99 ? "99+" : alertItems.length}</i>}
            </button>
            <span className="s-top-divider" />
            <button className="s-profile" onClick={() => open("profile")}>
              <span className="s-avatar">
                {user.name
                  .split(" ")
                  .slice(0, 2)
                  .map((s) => s[0])
                  .join("")}
              </span>
              <span>
                <b>{user.name}</b>
                <small>{user.role}</small>
              </span>
              <span className="s-profile-chevron" aria-hidden="true">
                ⌄
              </span>
            </button>
          </div>
        </header>
        <main>
          <div className="s-page-heading">
            <div>
              <div className="s-breadcrumb">
                SIGEMTI <span>/</span> {title}
              </div>
              <h1>{title}</h1>
              <p>
                {page === "dashboard"
                  ? "Una visión completa de los activos tecnológicos de tu institución."
                  : "Información conectada para el control y seguimiento institucional."}
              </p>
            </div>
            <span className="s-date">
              <Icon name="clock" size={15} />
              {new Date(today() + "T12:00:00").toLocaleDateString("es-PE", {
                weekday: "long",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          {notice && (
            <div className="s-notice" role="status">
              <Icon name="check" size={17} />
              {notice}
              <button aria-label="Cerrar mensaje" onClick={() => setNotice("")}>
                <Icon name="close" size={15} />
              </button>
            </div>
          )}
          {undo && data === undo.after && (
            <div className="s-notice">
              <span>Puedes recuperar el registro quitado y sus relaciones.</span>
              <Button
                onClick={() => {
                  setData(undo.before);
                  setUndo(null);
                  setNotice("Eliminación deshecha. Se restauraron los datos relacionados.");
                }}
              >
                Deshacer
              </Button>
            </div>
          )}
          {page === "dashboard" && (
            <>
              <div className="s-welcome">
                <div>
                  <span className="s-eyebrow">TU CENTRO DE CONTROL TECNOLÓGICO</span>
                  <h2>Todo lo que necesitas, bajo control.</h2>
                  <p>Administra tus equipos y acompaña cada etapa de su vida útil.</p>
                </div>
                <Button
                  primary
                  icon={admin ? "plus" : "maintenance"}
                  onClick={() => open(admin ? "equipment" : "maintenance")}
                >
                  {admin ? "Registrar equipo" : "Registrar mantenimiento"}
                </Button>
              </div>
              <div className="s-stats">
                {[
                  ["Total de equipos", data.equipment.length, "inventory", "blue"],
                  [
                    "Equipos operativos",
                    data.equipment.filter((e) => e.status === "Operativo").length,
                    "check",
                    "green",
                  ],
                  [
                    "En mantenimiento",
                    data.equipment.filter((e) => e.status === "En mantenimiento").length,
                    "maintenance",
                    "amber",
                  ],
                  ["Repotenciados", upgraded.size, "upgrades", "purple"],
                  [
                    "Fuera de servicio",
                    data.equipment.filter((e) => e.status === "Fuera de servicio").length,
                    "inventory",
                    "red",
                  ],
                  ["Mant. pendientes", pendingItems.length, "clock", "orange"],
                ].map(([label, value, icon, tone]) => (
                  <Stat
                    key={label}
                    label={String(label)}
                    value={value}
                    icon={String(icon)}
                    tone={String(tone)}
                    detail={
                      label === "Mant. pendientes"
                        ? `${pendingItems.filter((m) => m.due < today()).length} vencidos`
                        : "Según registros actuales"
                    }
                  />
                ))}
              </div>
              <div className="s-dashboard-grid">
                <section className="s-panel">
                  <div className="s-panel-head">
                    <div>
                      <h2>Equipos por área institucional</h2>
                      <p>Distribución del inventario actual</p>
                    </div>
                    <button onClick={() => go("areas")} className="s-link">
                      Ver áreas →
                    </button>
                  </div>
                  <BarChart
                    items={data.areas.map((a) => ({
                      label: a,
                      value: data.equipment.filter((e) => e.area === a).length,
                    }))}
                  />
                </section>
                <section className="s-panel">
                  <div className="s-panel-head">
                    <div>
                      <h2>Estado operativo</h2>
                      <p>Situación actual de los equipos</p>
                    </div>
                    <Icon name="dashboard" />
                  </div>
                  <div className="s-donut-layout">
                    <div
                      className="s-donut"
                      style={{
                        background: `conic-gradient(#20a57a 0 ${(data.equipment.filter((e) => e.status === "Operativo").length / Math.max(1, data.equipment.length)) * 100}%, #f3af3c 0 ${(data.equipment.filter((e) => e.status !== "Fuera de servicio").length / Math.max(1, data.equipment.length)) * 100}%,#ed6b75 0 100%)`,
                      }}
                    >
                      <span>
                        <b>{data.equipment.length}</b>
                        <small>Equipos</small>
                      </span>
                    </div>
                    <div className="s-legend">
                      {statuses.map((s, i) => (
                        <span key={s}>
                          <i style={{ background: ["#20a57a", "#f3af3c", "#ed6b75"][i] }} />
                          {s}
                          <b>{data.equipment.filter((e) => e.status === s).length}</b>
                        </span>
                      ))}
                    </div>
                  </div>
                </section>
                <section className="s-panel">
                  <div className="s-panel-head">
                    <div>
                      <h2>Mantenimientos por mes</h2>
                      <p>Intervenciones finalizadas · últimos seis meses</p>
                    </div>
                    <Icon name="reports" />
                  </div>
                  <LineChart
                    labels={months.map((m) => m.label)}
                    series={data.maintenanceTypes.slice(0, 2).map((kind, i) => ({
                      name: kind,
                      color: ["#246bfd", "#f3af3c"][i],
                      values: months.map(
                        (m) =>
                          data.maintenance.filter(
                            (v) =>
                              v.kind === kind &&
                              v.status === "Finalizado" &&
                              v.date.startsWith(m.key),
                          ).length,
                      ),
                    }))}
                  />
                </section>
                <section className="s-panel">
                  <div className="s-panel-head">
                    <div>
                      <h2>Equipos por tipo</h2>
                      <p>Composición del parque tecnológico</p>
                    </div>
                  </div>
                  <BarChart
                    items={data.categories.map((t) => ({
                      label: t,
                      value: data.equipment.filter((e) => e.type === t).length,
                    }))}
                  />
                </section>
                <section className="s-panel">
                  <div className="s-panel-head">
                    <div>
                      <h2>Evolución de repotenciaciones</h2>
                      <p>Equipos distintos con mejoras por mes</p>
                    </div>
                    <Badge>{`${upgraded.size} equipos`}</Badge>
                  </div>
                  <LineChart
                    labels={months.map((m) => m.label)}
                    series={[
                      {
                        name: "Equipos repotenciados",
                        color: "#8757de",
                        values: months.map(
                          (m) =>
                            new Set(
                              data.changes
                                .filter((c) => c.upgrade && c.date.startsWith(m.key))
                                .map((c) => c.equipmentId),
                            ).size,
                        ),
                      },
                    ]}
                  />
                </section>
                <section className="s-panel">
                  <div className="s-panel-head">
                    <div>
                      <h2>Alertas prioritarias</h2>
                      <p>Equipos que requieren seguimiento</p>
                    </div>
                    <button className="s-link" onClick={() => go("alerts")}>
                      Ver todas →
                    </button>
                  </div>
                  {alertItems.slice(0, 3).map((a, i) => (
                    <button
                      className="s-alert-mini"
                      key={i}
                      onClick={() => showEquipment(a[2], detailTabs[3])}
                    >
                      <span className={`s-alert-symbol ${a[0] === "Alta" ? "red" : "amber"}`}>
                        <Icon name="alerts" size={19} />
                      </span>
                      <div>
                        <b>{a[1]}</b>
                        <small>
                          {a[2]} · {a[3]}
                        </small>
                      </div>
                      <Icon name="arrow" size={16} />
                    </button>
                  ))}
                </section>
              </div>
              <section className="s-panel">
                <div className="s-panel-head">
                  <div>
                    <h2>Últimos mantenimientos</h2>
                    <p>Intervenciones recientes del equipo técnico</p>
                  </div>
                  <button className="s-link" onClick={() => go("maintenance")}>
                    Ver todos →
                  </button>
                </div>
                <Table
                  headers={maintenanceHeaders}
                  rows={maintenanceRows(
                    [...data.maintenance]
                      .filter((m) => m.date <= today())
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .slice(0, 5),
                  )}
                />
              </section>
            </>
          )}
          {(page === "inventory" || page === "areas") && (
            <>
              {page === "areas" && (
                <div className="s-area-cards">
                  {data.areas.map((a) => {
                    const list = data.equipment.filter((e) => e.area === a);
                    return (
                      <button
                        key={a}
                        className={area === a ? "active" : ""}
                        onClick={() => setArea(area === a ? "" : a)}
                      >
                        <span>
                          <Icon name="areas" />
                        </span>
                        <div>
                          <b>{a}</b>
                          <small>{list.length} equipos asignados</small>
                        </div>
                        <strong>{list.length}</strong>
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="s-toolbar">
                <div>
                  <h2>
                    {page === "areas"
                      ? area || "Todas las áreas institucionales"
                      : "Registro de activos tecnológicos"}
                  </h2>
                  <p>{visible.length} equipos encontrados · Fechas de adquisición</p>
                </div>
                <div>
                  <Button
                    icon="download"
                    onClick={() => exportCSV("Inventario", eqReportHeaders, eqReportRows(visible))}
                  >
                    Exportar inventario
                  </Button>
                  {admin && (
                    <>
                      <Button icon="areas" onClick={() => open("movement")}>
                        Trasladar equipo
                      </Button>
                      <Button primary icon="plus" onClick={() => open("equipment")}>
                        Registrar equipo
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {page === "areas" && area && (
                <div className="s-stats compact">
                  {statuses.map((s, i) => (
                    <Stat
                      key={s}
                      label={s}
                      value={visible.filter((e) => e.status === s).length}
                      icon="inventory"
                      tone={["green", "amber", "red"][i]}
                    />
                  ))}
                </div>
              )}
              <section className="s-panel no-pad">
                {filters()}
                <Table headers={eqHeaders} rows={rangeInvalid ? [] : eqRows(visible)} />
              </section>
              {page === "areas" && (
                <section className="s-panel">
                  <div className="s-panel-head">
                    <div>
                      <h2>Historial de traslados</h2>
                      <p>Se conserva el origen, destino y responsable de cada movimiento</p>
                    </div>
                  </div>
                  <Table
                    headers={[
                      "Equipo",
                      "Fecha",
                      "Origen",
                      "Destino",
                      "Responsable",
                      "Motivo",
                      "Registrado por",
                      "Acciones",
                    ]}
                    rows={data.movements
                      .filter((m) => !area || m.from === area || m.to === area)
                      .map((m) => [
                        m.equipmentId,
                        date(m.date),
                        m.from,
                        m.to,
                        m.owner,
                        m.reason,
                        m.user,
                        admin
                          ? deleteButton("movements", m.id, `${m.equipmentId} · ${date(m.date)}`)
                          : "Consulta",
                      ])}
                  />
                </section>
              )}
            </>
          )}
          {page === "detail" && current && (
            <>
              <button className="s-back" onClick={() => go("inventory")}>
                ← Volver al inventario
              </button>
              <div className="s-equipment-hero">
                <span className="s-device-large">
                  <Icon name="inventory" size={38} />
                </span>
                <div>
                  <div className="s-inline">
                    <span className="s-code">{current.id}</span>
                    <Badge>{current.status}</Badge>
                    {upgraded.has(current.id) && <Badge>Repotenciado</Badge>}
                  </div>
                  <h2>{current.name}</h2>
                  <p>
                    {current.brand} {current.model} · {current.area}
                  </p>
                  <div className="s-hero-meta">
                    <span>
                      Responsable: <b>{current.owner}</b>
                    </span>
                    <span>
                      Último mantenimiento: <b>{date(lastMaintenance(data, current.id))}</b>
                    </span>
                  </div>
                </div>
                <div className="s-hero-actions">
                  {admin && (
                    <Button icon="edit" onClick={() => open("equipment", current.id)}>
                      Editar
                    </Button>
                  )}
                  <Button
                    primary
                    icon="file"
                    onClick={() => {
                      setReport(reportNames[7]);
                      setReportEquipment(current.id);
                      resetFilters();
                      setPreview(true);
                    }}
                  >
                    Generar ficha técnica en PDF
                  </Button>
                </div>
              </div>
              <Tabs items={detailTabs} value={detailTab} onChange={setDetailTab} />
              {detailTab === detailTabs[0] && (
                <>
                  <div className="s-two-cols">
                    <section className="s-panel">
                      <h2>Identificación patrimonial</h2>
                      <Info
                        items={[
                          ["Código patrimonial", current.code],
                          ["Código interno", current.id],
                          ["Número de serie", current.serial],
                          ["Tipo de equipo", current.type],
                          ["Fecha de adquisición", date(current.acquired)],
                          ["Proveedor", current.supplier],
                        ]}
                      />
                    </section>
                    <section className="s-panel">
                      <h2>Asignación y ubicación</h2>
                      <Info
                        items={[
                          ["Área institucional", current.area],
                          ["Ubicación física", current.location],
                          ["Responsable", current.owner],
                          ["Estado", <Badge>{current.status}</Badge>],
                          ["Dirección IP / MAC", current.ip],
                        ]}
                      />
                      {admin && (
                        <Button icon="areas" onClick={() => open("movement")}>
                          Trasladar a otra área
                        </Button>
                      )}
                    </section>
                  </div>
                  <section className="s-panel">
                    <h2>Observaciones</h2>
                    <p>{current.notes || "Sin observaciones."}</p>
                  </section>
                  <section className="s-panel">
                    <h2>Movimientos entre áreas</h2>
                    <Table
                      headers={["Fecha", "Origen", "Destino", "Responsable", "Motivo", "Acciones"]}
                      rows={data.movements
                        .filter((m) => m.equipmentId === current.id)
                        .map((m) => [
                          date(m.date),
                          m.from,
                          m.to,
                          m.owner,
                          m.reason,
                          admin
                            ? deleteButton("movements", m.id, `${m.equipmentId} · ${date(m.date)}`)
                            : "Consulta",
                        ])}
                    />
                  </section>
                </>
              )}
              {detailTab === detailTabs[1] && (
                <div className="s-tech-grid">
                  {[
                    [
                      "Procesador",
                      "hardware",
                      current.cpu,
                      [
                        ["Fabricante", current.cpuMaker],
                        ["Generación", current.generation],
                        ["Núcleos", current.cores],
                      ],
                    ],
                    [
                      "Memoria RAM",
                      "hardware",
                      current.ram,
                      [
                        ["Tipo", current.ramType],
                        ["Velocidad", current.ramSpeed],
                        ["Módulos", current.ramModules],
                        ["Ranuras libres", current.ramSlots],
                      ],
                    ],
                    [
                      "Almacenamiento",
                      "file",
                      current.storage,
                      [
                        ["Tipo", current.storageType],
                        ["Marca y modelo", current.storageBrand],
                        ["Serie", current.storageSerial],
                      ],
                    ],
                    [
                      "Placa base",
                      "hardware",
                      current.board,
                      [
                        ["Fabricante", current.boardMaker],
                        ["Chipset", current.chipset],
                        ["Fuente", current.power],
                      ],
                    ],
                    [
                      "Gráficos y periféricos",
                      "inventory",
                      current.graphics,
                      [
                        ["Adaptador de red", current.network],
                        ["Monitor", current.monitor],
                        ["Teclado", current.keyboard],
                        ["Mouse", current.mouse],
                      ],
                    ],
                    [
                      "Software",
                      "shield",
                      current.os,
                      [
                        ["Versión", current.osVersion],
                        ["Arquitectura", current.architecture],
                        ["Programas", current.programs],
                        ["Licencia", current.license],
                      ],
                    ],
                  ].map(([label, icon, value, items]) => (
                    <section className="s-panel s-tech-card" key={String(label)}>
                      <div className="s-tech-title">
                        <span>
                          <Icon name={String(icon)} />
                        </span>
                        <div>
                          <small>{String(label)}</small>
                          <h3>{String(value || "Sin registrar")}</h3>
                        </div>
                      </div>
                      <Info items={items as [string, ReactNode][]} />
                    </section>
                  ))}
                </div>
              )}
              {detailTab === detailTabs[2] && (
                <section className="s-panel">
                  <div className="s-panel-head">
                    <div>
                      <h2>Inventario de componentes</h2>
                      <p>Componentes actuales y retirados, diferenciados por estado</p>
                    </div>
                    <Button primary icon="plus" onClick={() => open("component")}>
                      Agregar componente
                    </Button>
                  </div>
                  <Table
                    headers={[
                      "Identificador",
                      "Tipo",
                      "Marca / modelo",
                      "Serie",
                      "Especificaciones",
                      "Instalación",
                      "Estado / retiro",
                      "Acciones",
                    ]}
                    rows={data.components
                      .filter((c) => c.equipmentId === current.id)
                      .map((c) => [
                        c.id,
                        c.type,
                        <>
                          {c.brand}
                          <small>{c.model}</small>
                        </>,
                        c.serial,
                        c.specs,
                        date(c.installed),
                        <>
                          <Badge>{c.status}</Badge>
                          <small>{c.removed && date(c.removed)}</small>
                        </>,
                        c.status === "Instalado" ? (
                          <div className="s-row-actions">
                            <Button icon="hardware" onClick={() => open("hardware", c.id)}>
                              Reemplazar
                            </Button>
                            <Button onClick={() => open("retire", c.id)}>Retirar</Button>
                            <Button icon="edit" onClick={() => open("componentEdit", c.id)}>
                              Editar
                            </Button>
                          </div>
                        ) : (
                          deleteButton("components", c.id, `${c.type} · ${c.serial}`)
                        ),
                      ])}
                  />
                </section>
              )}
              {detailTab === detailTabs[3] && (
                <section className="s-panel">
                  <div className="s-panel-head">
                    <div>
                      <h2>Historial de mantenimiento</h2>
                      <p>Todas las intervenciones de {current.id}</p>
                    </div>
                    <Button primary icon="plus" onClick={() => open("maintenance")}>
                      Registrar mantenimiento
                    </Button>
                  </div>
                  <Table
                    headers={maintenanceHeaders}
                    rows={maintenanceRows(
                      data.maintenance.filter((m) => m.equipmentId === current.id),
                    )}
                  />
                </section>
              )}
              {(detailTab === detailTabs[4] || detailTab === detailTabs[5]) && (
                <section className="s-panel">
                  <div className="s-panel-head">
                    <div>
                      <h2>{detailTab}</h2>
                      <p>Configuración actual y anteriores con trazabilidad de cada intervención</p>
                    </div>
                    <Button primary icon="plus" onClick={() => open("hardware")}>
                      Registrar cambio
                    </Button>
                  </div>
                  <Table
                    headers={changeHeaders}
                    rows={changeRows(
                      data.changes.filter(
                        (c) =>
                          c.equipmentId === current.id &&
                          (detailTab !== detailTabs[5] || c.upgrade),
                      ),
                    )}
                  />
                </section>
              )}
              {detailTab === detailTabs[6] && (
                <section className="s-panel">
                  <div className="s-panel-head">
                    <div>
                      <h2>Documentos y evidencias</h2>
                      <p>
                        Actas, fichas y fotografías · PDF, PNG, JPEG o texto · máximo 1 MB por
                        archivo
                      </p>
                    </div>
                    <label className="s-button primary s-file-button">
                      <Icon name="plus" size={16} /> Adjuntar documento
                      <input
                        type="file"
                        accept="application/pdf,image/png,image/jpeg,text/plain"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 1024 * 1024) {
                            setNotice("El archivo supera el límite de 1 MB.");
                            return;
                          }
                          if (
                            !["application/pdf", "image/png", "image/jpeg", "text/plain"].includes(
                              file.type,
                            )
                          ) {
                            setNotice("Selecciona un PDF, PNG, JPEG o archivo de texto.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = () => {
                            setData((d) => ({
                              ...d,
                              documents: [
                                ...d.documents,
                                {
                                  id: uid(),
                                  equipmentId: current.id,
                                  name: file.name,
                                  date: today(),
                                  url: String(reader.result),
                                  type: file.type,
                                },
                              ],
                            }));
                            setNotice("Documento adjuntado al expediente local.");
                          };
                          reader.readAsDataURL(file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                  <Table
                    headers={["Documento", "Fecha", "Formato", "Acciones"]}
                    rows={data.documents
                      .filter((d) => d.equipmentId === current.id)
                      .map((d) => [
                        d.name,
                        date(d.date),
                        d.type,
                        <div className="s-row-actions">
                          <a className="s-link" href={d.url} download={d.name}>
                            Descargar documento
                          </a>
                          <Button icon="edit" onClick={() => open("documentEdit", d.id)}>
                            Renombrar
                          </Button>
                          {deleteButton("documents", d.id, d.name)}
                        </div>,
                      ])}
                  />
                  <div className="s-note">
                    <Icon name="file" /> Las evidencias se guardan en este navegador y se incluyen
                    en el respaldo JSON.
                  </div>
                </section>
              )}
            </>
          )}
          {page === "maintenance" && (
            <>
              <div className="s-stats compact">
                <Stat
                  label="Programados"
                  value={data.maintenance.filter((m) => m.status === "Programado").length}
                  icon="clock"
                />
                <Stat
                  label="En proceso"
                  value={data.maintenance.filter((m) => m.status === "En proceso").length}
                  icon="maintenance"
                  tone="amber"
                />
                <Stat
                  label="Finalizados"
                  value={data.maintenance.filter((m) => m.status === "Finalizado").length}
                  icon="check"
                  tone="green"
                />
                <Stat
                  label="Costo ejecutado"
                  value={money(
                    data.maintenance
                      .filter((m) => m.status === "Finalizado")
                      .reduce((s, m) => s + m.cost, 0),
                  )}
                  icon="reports"
                  tone="purple"
                />
              </div>
              <div className="s-toolbar">
                <Tabs
                  items={["Todos", "Programado", "En proceso", "Finalizado"]}
                  value={interventionStatus || "Todos"}
                  onChange={(v) => setInterventionStatus(v === "Todos" ? "" : v)}
                />
                <Button primary icon="plus" onClick={() => open("maintenance")}>
                  Registrar mantenimiento
                </Button>
              </div>
              <section className="s-panel no-pad">
                {filters(true, true)}
                <div className="s-filter-extra">
                  <p role="status">
                    Mostrando {rangeInvalid ? 0 : maintenance.length} de {data.maintenance.length}{" "}
                    mantenimientos registrados.
                  </p>
                  {maintenance.length === 0 && data.maintenance.length > 0 && (
                    <p>
                      Hay registros ocultos por los filtros. Usa «Limpiar filtros» o selecciona
                      «Todos».
                    </p>
                  )}
                  <label>
                    Tipo de mantenimiento
                    <select value={kind} onChange={(e) => setKind(e.target.value)}>
                      <option value="">Todos los tipos</option>
                      {data.maintenanceTypes.map((k) => (
                        <option key={k}>{k}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <Table
                  headers={maintenanceHeaders}
                  rows={rangeInvalid ? [] : maintenanceRows(maintenance)}
                />
              </section>
            </>
          )}
          {(page === "hardware" || page === "upgrades") && (
            <>
              {page === "upgrades" && (
                <div className="s-stats compact">
                  <Stat
                    label="Equipos repotenciados"
                    value={upgraded.size}
                    icon="upgrades"
                    tone="purple"
                  />
                  <Stat
                    label="Inversión en mejoras"
                    value={money(
                      data.changes.filter((c) => c.upgrade).reduce((s, c) => s + c.cost, 0),
                    )}
                    icon="reports"
                  />
                  <Stat
                    label="Áreas beneficiadas"
                    value={
                      new Set(data.equipment.filter((e) => upgraded.has(e.id)).map((e) => e.area))
                        .size
                    }
                    icon="areas"
                    tone="green"
                  />
                  <Stat
                    label="Mejoras registradas"
                    value={data.changes.filter((c) => c.upgrade).length}
                    icon="hardware"
                    tone="amber"
                  />
                </div>
              )}
              <div className="s-toolbar">
                <div>
                  <h2>
                    {page === "upgrades"
                      ? "Mejoras tecnológicas con historial completo"
                      : "Trazabilidad de componentes informáticos"}
                  </h2>
                  <p>La configuración anterior se conserva en cada intervención.</p>
                </div>
                <Button primary icon="plus" onClick={() => open("hardware")}>
                  Registrar cambio
                </Button>
              </div>
              {page === "hardware" && changes[0] && (
                <Comparison
                  change={changes[0]}
                  history={data.changes}
                  equipment={device(changes[0].equipmentId)}
                  onDetail={() => setCompareId(changes[0].id)}
                />
              )}
              <section className="s-panel no-pad">
                {filters(true, true)}
                <Table
                  headers={
                    page === "upgrades"
                      ? [
                          "Equipo / área",
                          "Fecha",
                          "Componente mejorado",
                          "Antes",
                          "Después de intervención",
                          "Técnico",
                          "Costo",
                          "Estado actual",
                          "Detalle",
                        ]
                      : changeHeaders
                  }
                  rows={
                    rangeInvalid
                      ? []
                      : page === "upgrades"
                        ? changes
                            .filter((c) => c.upgrade)
                            .map((c) => [
                              <button
                                className="s-link"
                                onClick={() => showEquipment(c.equipmentId, detailTabs[5])}
                              >
                                {c.equipmentId}
                                <small>{device(c.equipmentId)?.area}</small>
                              </button>,
                              date(c.date),
                              c.component,
                              c.before,
                              c.after,
                              c.technician,
                              money(c.cost),
                              <Badge>{device(c.equipmentId)?.status}</Badge>,
                              <div className="s-row-actions">
                                <Button onClick={() => setCompareId(c.id)} icon="eye">
                                  Comparar
                                </Button>
                                <Button icon="edit" onClick={() => open("hardwareEdit", c.id)}>
                                  Editar
                                </Button>
                                {deleteButton("changes", c.id, c.id)}
                              </div>,
                            ])
                        : changeRows(changes)
                  }
                />
              </section>
            </>
          )}
          {page === "reports" && (
            <div className="s-reports-layout">
              <aside className="s-report-menu">
                <h3>CATÁLOGO DE REPORTES</h3>
                {reportNames.map((r, i) => (
                  <button
                    className={r === report ? "active" : ""}
                    key={r}
                    onClick={() => {
                      setReport(r);
                      setFrom("");
                      setTo("");
                    }}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <b>{r}</b>
                      <small>
                        {
                          [
                            "Patrimonio institucional",
                            "Distribución por unidades",
                            "Configuración de computadoras",
                            "Intervenciones finalizadas",
                            "Mejoras y costos",
                            "Trazabilidad de componentes",
                            "Situación operativa",
                            "Expediente completo",
                            "Gastos ejecutados",
                            "Programación y vencimientos",
                          ][i]
                        }
                      </small>
                    </div>
                    <Icon name="arrow" size={14} />
                  </button>
                ))}
              </aside>
              <section className="s-panel">
                <div className="s-report-builder">
                  <span className="s-section-icon">
                    <Icon name="reports" size={25} />
                  </span>
                  <div>
                    <span className="s-eyebrow">GENERADOR DE INFORMES</span>
                    <h2>{report}</h2>
                    <p>Configura los filtros y revisa la información antes de exportarla.</p>
                  </div>
                </div>
                <h3 className="s-step">
                  <span>1</span> Define el alcance del reporte
                </h3>
                <p className="s-form-help">
                  {[
                    reportNames[3],
                    reportNames[4],
                    reportNames[5],
                    reportNames[8],
                    reportNames[9],
                  ].includes(report)
                    ? "Fechas de intervención o programación, según el reporte."
                    : report === reportNames[7]
                      ? "El período se aplica al historial; la ficha muestra su configuración actual."
                      : "El rango de fechas corresponde a la adquisición del equipo."}
                </p>
                {filters(
                  true,
                  [
                    reportNames[3],
                    reportNames[4],
                    reportNames[5],
                    reportNames[7],
                    reportNames[8],
                    reportNames[9],
                  ].includes(report),
                )}
                {[reportNames[3], reportNames[8], reportNames[9]].includes(report) && (
                  <label className="s-report-select">
                    Tipo de mantenimiento
                    <select value={kind} onChange={(e) => setKind(e.target.value)}>
                      <option value="">Todos</option>
                      {data.maintenanceTypes.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                )}
                {report === reportNames[7] && (
                  <label className="s-report-select">
                    Equipo del expediente
                    <select
                      value={
                        filtered.some((e) => e.id === reportEquipment)
                          ? reportEquipment
                          : filtered[0]?.id || ""
                      }
                      onChange={(e) => setReportEquipment(e.target.value)}
                    >
                      {filtered.map((e) => (
                        <option key={e.id}>{e.id}</option>
                      ))}
                    </select>
                  </label>
                )}
                <h3 className="s-step">
                  <span>2</span> Revisa y genera el informe
                </h3>
                <div className="s-report-summary">
                  <span>
                    <b>{rangeInvalid ? 0 : reportRows.length}</b> registros incluidos
                  </span>
                  <span>
                    <b>{area || "Todas las áreas"}</b> ámbito institucional
                  </span>
                  <span>
                    <b>{date(today())}</b> fecha de emisión
                  </span>
                </div>
                <div className="s-report-actions">
                  <Button icon="eye" disabled={rangeInvalid} onClick={() => setPreview(true)}>
                    Vista previa PDF
                  </Button>
                  <Button
                    icon="download"
                    disabled={rangeInvalid}
                    onClick={() => exportCSV(report, reportHeaders, reportRows)}
                  >
                    CSV
                  </Button>
                  <Button
                    icon="download"
                    disabled={rangeInvalid}
                    onClick={() => exportExcel(report, reportHeaders, reportRows)}
                  >
                    Exportar a Excel
                  </Button>
                  <Button
                    primary
                    icon="file"
                    disabled={rangeInvalid}
                    onClick={() => setPreview(true)}
                  >
                    Generar PDF
                  </Button>
                </div>
                <div className="s-note">
                  <Icon name="file" />
                  <span>
                    El PDF se guarda desde el diálogo de impresión. Excel se descarga en formato
                    .xlsx, con todos los registros filtrados.
                  </span>
                </div>
                <div className="s-preview-inline">
                  <div className="s-panel-head">
                    <h3>Vista de datos</h3>
                    <Badge>{`${rangeInvalid ? 0 : reportRows.length} registros`}</Badge>
                  </div>
                  <Table
                    headers={reportHeaders}
                    rows={rangeInvalid ? [] : reportRows.map((r) => r.map((c) => String(c ?? "—")))}
                  />
                </div>
              </section>
            </div>
          )}
          {page === "alerts" && (
            <>
              <div className="s-toolbar">
                <div>
                  <h2>Seguimiento y prioridades</h2>
                  <p>Alertas calculadas a partir de intervenciones y estado de equipos.</p>
                </div>
                <select
                  aria-label="Filtrar prioridad"
                  value={alertPriority}
                  onChange={(e) => setAlertPriority(e.target.value)}
                >
                  <option value="">Todas las prioridades</option>
                  {["Alta", "Media", "Baja"].map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div className="s-alert-list">
                {alertItems
                  .filter((a) => !alertPriority || a[0] === alertPriority)
                  .map((a, i) => (
                    <section className="s-panel s-alert-card" key={i}>
                      <span
                        className={`s-alert-symbol ${a[0] === "Alta" ? "red" : a[0] === "Media" ? "amber" : "blue"}`}
                      >
                        <Icon name="alerts" size={24} />
                      </span>
                      <div>
                        <div className="s-inline">
                          <h3>{a[1]}</h3>
                          <Badge>{a[0]}</Badge>
                        </div>
                        <p>
                          {a[2]} · {a[3]}
                        </p>
                        <small>
                          {device(a[2])?.area} · Responsable: {device(a[2])?.owner}
                        </small>
                      </div>
                      <Button onClick={() => showEquipment(a[2], detailTabs[3])}>Ver equipo</Button>
                    </section>
                  ))}
              </div>
              {!alertItems.filter((a) => !alertPriority || a[0] === alertPriority).length && (
                <section className="s-panel s-empty">No hay alertas con esta prioridad.</section>
              )}
            </>
          )}
          {page === "admin" && admin && (
            <>
              <Tabs
                items={[
                  "Usuarios",
                  "Roles y permisos",
                  "Áreas institucionales",
                  "Técnicos",
                  "Categorías",
                  "Tipos de mantenimiento",
                  "Configuración",
                ]}
                value={adminTab}
                onChange={setAdminTab}
              />
              <section className="s-panel">
                <div className="s-panel-head">
                  <div>
                    <h2>{adminTab}</h2>
                    <p>Configuración del prototipo institucional</p>
                  </div>
                  {adminTab !== "Roles y permisos" && adminTab !== "Configuración" && (
                    <Button
                      primary
                      icon="plus"
                      onClick={() => open(adminTab === "Usuarios" ? "user" : "catalog")}
                    >
                      Agregar {adminTab === "Usuarios" ? "usuario" : "registro"}
                    </Button>
                  )}
                </div>
                {adminTab === "Usuarios" ? (
                  <>
                    <Table
                      headers={["Usuario", "Correo", "Rol", "Estado", "Acciones"]}
                      rows={data.users.map((u) => [
                        u.name,
                        u.email,
                        u.role,
                        <Badge>{u.active}</Badge>,
                        <div className="s-row-actions">
                          <Button onClick={() => open("user", u.id)} icon="edit">
                            Editar
                          </Button>
                          {deleteButton("users", u.id, u.name)}
                        </div>,
                      ])}
                    />
                    <p className="s-form-help">
                      Todos los usuarios de demostración utilizan la contraseña Demo2026!.
                    </p>
                  </>
                ) : adminTab === "Roles y permisos" ? (
                  <Table
                    headers={["Permiso", "Administrador", "Técnico de soporte"]}
                    rows={[
                      ["Consultar inventario y fichas", "✓", "✓"],
                      ["Registrar / editar equipos", "✓", "Sin acceso"],
                      ["Trasladar equipos", "✓", "Sin acceso"],
                      ["Mantenimientos y componentes", "✓", "✓"],
                      ["Reportes y evidencias", "✓", "✓"],
                      ["Usuarios, catálogos y configuración", "✓", "Sin acceso"],
                    ]}
                  />
                ) : adminTab === "Configuración" ? (
                  <RecordForm
                    fields={[
                      { key: "institution", label: "Nombre de la institución", required: true },
                    ]}
                    initial={{ institution: data.institution }}
                    onCancel={() => go("dashboard")}
                    onSave={(v) => {
                      setData((d) => ({ ...d, institution: v.institution }));
                      setNotice("Configuración institucional actualizada.");
                    }}
                  />
                ) : (
                  <Table
                    headers={["Nombre", "Uso en el sistema", "Acciones"]}
                    rows={(adminTab === "Áreas institucionales"
                      ? data.areas
                      : adminTab === "Técnicos"
                        ? data.technicians
                        : adminTab === "Categorías"
                          ? data.categories
                          : data.maintenanceTypes
                    ).map((s) => [
                      s,
                      `${catalogUsage(data, catalogKey, s)} relaciones`,
                      <div className="s-row-actions">
                        <Button icon="edit" onClick={() => open("catalog", s)}>
                          Editar
                        </Button>
                        {deleteButton(catalogKey, s, s)}
                      </div>,
                    ])}
                  />
                )}
              </section>
            </>
          )}
        </main>
        <footer className="s-footer">
          <span>
            SIGEMTI · Sistema de Gestión de Equipos y Mantenimiento Tecnológico Institucional
          </span>
          <span>Prototipo de demostración · Datos locales</span>
        </footer>
      </div>
      {deleting && (
        <Dialog title="Quitar registro" onClose={() => setDeleting(null)}>
          <div className="s-dialog-body">
            <h3>{deleting.label}</h3>
            <p>
              {deleting.kind === "equipment"
                ? "Se quitarán el equipo y sus mantenimientos, componentes, cambios, traslados y documentos relacionados."
                : deleting.kind === "changes"
                  ? "Se recalcularán la configuración actual y la secuencia de componentes sin esta intervención."
                  : deleting.kind === "movements"
                    ? "Se ajustará la secuencia de traslados y, si corresponde, el área actual del equipo."
                    : "La información se quitará solo de los datos guardados en este navegador."}
            </p>
            <div className="s-note">
              Podrás deshacer esta acción mientras no realices otros cambios.
            </div>
          </div>
          <RecordForm
            fields={
              ["areas", "technicians", "categories", "maintenanceTypes"].includes(deleting.kind) &&
              catalogUsage(data, deleting.kind as CatalogKey, deleting.id) > 0
                ? [
                    {
                      key: "replacement",
                      label: "Reasignar registros relacionados a",
                      options: data[deleting.kind as CatalogKey].filter((n) => n !== deleting.id),
                      required: true,
                    },
                  ]
                : []
            }
            initial={{}}
            onSave={confirmDelete}
            onCancel={() => setDeleting(null)}
            submitLabel="Quitar registro"
          />
        </Dialog>
      )}
      {modal && (
        <Dialog
          title={
            (
              {
                equipment: editId ? "Editar equipo" : "Registrar nuevo equipo",
                maintenance: editId ? "Editar mantenimiento" : "Registrar mantenimiento",
                hardware: "Registrar cambio de hardware",
                hardwareEdit: "Editar cambio de hardware",
                movement: "Trasladar equipo",
                component: "Agregar componente",
                componentEdit: "Editar componente instalado",
                documentEdit: "Renombrar documento",
                retire: "Retirar componente",
                user: editId ? "Editar usuario" : "Agregar usuario",
                catalog: editId ? "Editar registro del catálogo" : "Agregar registro al catálogo",
                profile: "Mi perfil",
              } as Record<string, string>
            )[modal] || "Registro"
          }
          wide={!["retire", "catalog", "profile", "user"].includes(modal)}
          onClose={() => setModal("")}
        >
          {modal === "equipment" && (
            <RecordForm
              fields={equipmentSchema(data, !!editId)}
              initial={
                editId
                  ? { ...device(editId)! }
                  : {
                      id: "",
                      code: "",
                      name: "",
                      type: data.categories.includes("Escritorio")
                        ? "Escritorio"
                        : data.categories[0] || "",
                      status: "Operativo",
                      acquired: today(),
                      area: data.areas[0],
                      license: "Pendiente de verificar",
                    }
              }
              onCancel={() => setModal("")}
              onSave={saveEquipment}
            />
          )}
          {modal === "maintenance" && (
            <RecordForm
              fields={maintenanceSchema(data, !!editId)}
              initial={
                editId
                  ? Object.fromEntries(
                      Object.entries(data.maintenance.find((m) => m.id === editId)!).map(
                        ([k, v]) => [k, String(v)],
                      ),
                    )
                  : {
                      id: `MNT-${new Date().getFullYear()}-${uid().slice(0, 5).toUpperCase()}`,
                      equipmentId: current?.id || data.equipment[0]?.id || "",
                      date: today(),
                      cost: "0",
                      kind: data.maintenanceTypes.includes("Correctivo")
                        ? "Correctivo"
                        : data.maintenanceTypes[0] || "",
                      status: "Programado",
                      technician: admin ? data.technicians[0] : user.name,
                      result: "Pendiente",
                    }
              }
              onCancel={() => setModal("")}
              onSave={saveMaintenance}
            />
          )}
          {(modal === "hardware" || modal === "hardwareEdit") && (
            <RecordForm
              fields={hardwareSchema(data).map((f) =>
                modal === "hardwareEdit" && ["equipmentId", "component"].includes(f.key)
                  ? { ...f, readOnly: true }
                  : modal === "hardwareEdit" &&
                      !data.changes.find((c) => c.id === editId)?.after &&
                      ["after", "newBrand", "newSerial"].includes(f.key)
                    ? { ...f, required: false }
                    : f,
              )}
              initial={((): Record<string, string> => {
                if (modal === "hardwareEdit") {
                  const record = data.changes.find((c) => c.id === editId)!;
                  return {
                    ...Object.fromEntries(Object.entries(record).map(([k, v]) => [k, String(v)])),
                    upgrade: record.upgrade ? "Sí" : "No",
                  };
                }
                const c = data.components.find((c) => c.id === editId),
                  eq = c ? device(c.equipmentId) : current || data.equipment[0];
                const component = c?.type || "Memoria RAM";
                return {
                  equipmentId: eq?.id || "",
                  date: today(),
                  component,
                  technician: admin ? data.technicians[0] : user.name,
                  cost: "0",
                  upgrade: page === "upgrades" ? "Sí" : "No",
                  before: eq?.[componentFields[component]] || "",
                  oldSerial: c?.serial || "",
                  oldBrand: c ? c.brand + " " + c.model : "",
                };
              })()}
              onValue={(key, value, v) => {
                const next = { ...v, [key]: value };
                if (modal !== "hardwareEdit" && (key === "component" || key === "equipmentId")) {
                  const eq = device(next.equipmentId),
                    c = data.components.find(
                      (c) =>
                        c.equipmentId === next.equipmentId &&
                        c.type === next.component &&
                        c.status === "Instalado",
                    );
                  next.before = eq?.[componentFields[next.component]] || "";
                  next.oldSerial = c?.serial || "";
                  next.oldBrand = c ? c.brand + " " + c.model : "";
                }
                return next;
              }}
              onCancel={() => setModal("")}
              onSave={saveHardware}
            />
          )}
          {modal === "movement" && (
            <RecordForm
              fields={[
                {
                  key: "equipmentId",
                  label: "Equipo",
                  options: data.equipment.map((e) => e.id),
                  required: true,
                },
                { key: "to", label: "Área de destino", options: data.areas, required: true },
                { key: "date", label: "Fecha del traslado", type: "date", required: true },
                { key: "owner", label: "Nuevo responsable", required: true },
                { key: "location", label: "Nueva ubicación física", required: true },
                { key: "reason", label: "Motivo del traslado", type: "textarea", required: true },
              ]}
              initial={{
                equipmentId: current?.id || data.equipment[0]?.id || "",
                date: today(),
                owner: current?.owner || "",
                location: current?.location || "",
              }}
              onCancel={() => setModal("")}
              onSave={saveMovement}
            />
          )}
          {(modal === "component" || modal === "componentEdit") && (
            <RecordForm
              fields={[
                {
                  key: "equipmentId",
                  label: "Equipo",
                  options: data.equipment.map((e) => e.id),
                  required: true,
                  readOnly: modal === "componentEdit",
                },
                {
                  key: "type",
                  label: "Tipo de componente",
                  options: Object.keys(componentFields),
                  required: true,
                  readOnly: modal === "componentEdit",
                },
                ...[
                  ["brand", "Marca"],
                  ["model", "Modelo"],
                  ["serial", "Número de serie"],
                  ["specs", "Especificaciones"],
                ].map(([key, label]) => ({ key, label, required: true })),
                { key: "installed", label: "Fecha de instalación", type: "date", required: true },
              ]}
              initial={
                modal === "componentEdit"
                  ? { ...data.components.find((c) => c.id === editId)! }
                  : {
                      equipmentId: current?.id || data.equipment[0]?.id || "",
                      installed: today(),
                    }
              }
              onCancel={() => setModal("")}
              onSave={saveComponent}
            />
          )}
          {modal === "retire" && (
            <>
              <div className="s-dialog-body">
                <div className="s-note">
                  El componente se conservará como retirado en el historial. La ficha dejará de
                  mostrarlo como instalado.
                </div>
              </div>
              <RecordForm
                fields={[
                  { key: "date", label: "Fecha de retiro", type: "date", required: true },
                  { key: "reason", label: "Motivo del retiro", type: "textarea", required: true },
                ]}
                initial={{ date: today() }}
                onCancel={() => setModal("")}
                onSave={retireComponent}
              />
            </>
          )}
          {modal === "user" && (
            <RecordForm
              fields={[
                { key: "name", label: "Nombre completo", required: true },
                { key: "email", label: "Correo electrónico", type: "email", required: true },
                {
                  key: "role",
                  label: "Rol",
                  options: ["Administrador", "Técnico de soporte"],
                  required: true,
                },
                { key: "active", label: "Estado", options: ["Activo", "Inactivo"], required: true },
              ]}
              initial={
                editId
                  ? { ...data.users.find((u) => u.id === editId)! }
                  : { role: "Técnico de soporte", active: "Activo" }
              }
              onCancel={() => setModal("")}
              onSave={(v) => {
                if (
                  data.users.some(
                    (u) => u.id !== editId && u.email.toLowerCase() === v.email.toLowerCase(),
                  )
                )
                  return "Este correo ya existe.";
                if (editId === user.id && (v.active !== "Activo" || v.role !== "Administrador"))
                  return "Conserva activo tu perfil administrador para poder gestionar esta demostración.";
                const u = { ...v, id: editId || uid() } as User;
                const previous = data.users.find((x) => x.id === editId);
                if (
                  data.users.some(
                    (x) => x.id !== editId && x.name.toLowerCase() === u.name.toLowerCase(),
                  )
                )
                  return "Ya existe un usuario con ese nombre. Usa un nombre completo diferente.";
                setData((d) => {
                  const linked = previous ? renamePerson(d, previous.name, u.name) : d;
                  return {
                    ...linked,
                    users: editId
                      ? linked.users.map((x) => (x.id === editId ? u : x))
                      : [...linked.users, u],
                    technicians:
                      u.role === "Técnico de soporte" && !linked.technicians.includes(u.name)
                        ? [...linked.technicians, u.name]
                        : linked.technicians,
                  };
                });
                if (editId === user.id) setUser(u);
                done();
              }}
            />
          )}
          {modal === "catalog" && (
            <RecordForm
              fields={[{ key: "name", label: `Nombre · ${adminTab}`, required: true }]}
              initial={{ name: editId }}
              onCancel={() => setModal("")}
              onSave={(v) => {
                const key = (
                  {
                    "Áreas institucionales": "areas",
                    Técnicos: "technicians",
                    Categorías: "categories",
                    "Tipos de mantenimiento": "maintenanceTypes",
                  } as Record<string, "areas" | "technicians" | "categories" | "maintenanceTypes">
                )[adminTab];
                if (!key) return "Selecciona un catálogo.";
                if (data[key].some((n) => n !== editId && n.toLowerCase() === v.name.toLowerCase()))
                  return "Ese registro ya existe.";
                try {
                  setData(
                    editId
                      ? renameCatalog(data, key, editId, v.name)
                      : { ...data, [key]: [...data[key], v.name] },
                  );
                } catch (e) {
                  return (e as Error).message;
                }
                done();
              }}
            />
          )}
          {modal === "documentEdit" && (
            <RecordForm
              fields={[{ key: "name", label: "Nombre del archivo", required: true }]}
              initial={{ name: data.documents.find((d) => d.id === editId)?.name || "" }}
              onCancel={() => setModal("")}
              onSave={(v) => {
                setData((d) => ({
                  ...d,
                  documents: d.documents.map((x) => (x.id === editId ? { ...x, name: v.name } : x)),
                }));
                done();
              }}
            />
          )}
          {modal === "profile" && (
            <div className="s-dialog-body">
              <Info
                items={[
                  ["Nombre", user.name],
                  ["Correo", user.email],
                  ["Rol", user.role],
                  ["Tipo de acceso", "Demostración local"],
                ]}
              />
              <div className="s-note">
                Los permisos se simulan en esta interfaz. No constituyen autenticación de servidor.
              </div>
              <div className="s-profile-actions">
                <Button
                  icon="download"
                  onClick={() =>
                    fileDownload(
                      "sigemti-respaldo.json",
                      JSON.stringify(data, null, 2),
                      "application/json",
                    )
                  }
                >
                  Descargar respaldo
                </Button>
                <Button
                  icon="logout"
                  onClick={() => {
                    setModal("");
                    setUser(null);
                  }}
                >
                  Cerrar sesión
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      )}
      {maintenanceId &&
        (() => {
          const m = data.maintenance.find((m) => m.id === maintenanceId);
          if (!m) return null;
          return (
            <Dialog
              title={`Detalle de mantenimiento · ${m.id}`}
              wide
              onClose={() => setMaintenanceId("")}
            >
              <div className="s-dialog-body">
                <div className="s-inline">
                  <Badge>{m.status}</Badge>
                  <Badge>{m.kind}</Badge>
                  <button
                    className="s-link"
                    onClick={() => {
                      setMaintenanceId("");
                      showEquipment(m.equipmentId, detailTabs[3]);
                    }}
                  >
                    Ver ficha de {m.equipmentId} →
                  </button>
                </div>
                <Info
                  items={[
                    ["Fecha", date(m.date)],
                    ["Técnico", m.technician],
                    ["Problema identificado", m.problem],
                    ["Diagnóstico", m.diagnosis],
                    ["Componentes", m.component],
                    ["Actividades", m.work],
                    ["Resultado", m.result],
                    ["Costo", money(m.cost)],
                    ["Próxima revisión", date(m.next)],
                    ["Observaciones", m.notes],
                    ["Referencia de evidencia", m.evidence],
                  ]}
                />
                <Button
                  icon="file"
                  onClick={() => {
                    setMaintenanceId("");
                    showEquipment(m.equipmentId, detailTabs[6]);
                  }}
                >
                  Ver / adjuntar evidencias del equipo
                </Button>
                <h3 className="s-subtitle">Línea de tiempo del equipo</h3>
                <div className="s-timeline">
                  {data.maintenance
                    .filter((x) => x.equipmentId === m.equipmentId)
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((x) => (
                      <article key={x.id}>
                        <span>{date(x.date)}</span>
                        <i />
                        <div>
                          <div className="s-inline">
                            <b>{x.kind}</b>
                            <Badge>{x.status}</Badge>
                          </div>
                          <small>
                            {x.id} · {x.technician}
                          </small>
                          <p>{x.work}</p>
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            </Dialog>
          );
        })()}
      {compareId &&
        (() => {
          const c = data.changes.find((c) => c.id === compareId);
          return c ? (
            <Dialog title="Comparación de la intervención" wide onClose={() => setCompareId("")}>
              <div className="s-dialog-body">
                <Comparison change={c} equipment={device(c.equipmentId)} history={data.changes} />
                <Info
                  items={[
                    ["Marca / modelo anterior", c.oldBrand],
                    ["Serie anterior", c.oldSerial],
                    ["Marca / modelo nuevo", c.newBrand],
                    ["Serie instalada", c.newSerial],
                    ["Observaciones", c.notes],
                  ]}
                />
                <div className="s-note">
                  La columna «Después» describe esta intervención. La ficha del equipo muestra la
                  configuración vigente, que puede incluir cambios posteriores.
                </div>
              </div>
            </Dialog>
          ) : null;
        })()}
      {preview && (
        <Dialog title="Vista previa del reporte PDF" wide onClose={() => setPreview(false)}>
          <div className="s-preview-tools">
            <span>{reportRows.length} registros · Papel A4 horizontal</span>
            <div>
              <Button onClick={() => setPreview(false)}>Cerrar</Button>
              <Button primary icon="download" onClick={() => window.print()}>
                Imprimir / guardar PDF
              </Button>
            </div>
          </div>
          <div className="s-preview-canvas">{activeReport}</div>
        </Dialog>
      )}
    </div>
  );
}
function Comparison({
  change: c,
  equipment: e,
  onDetail,
  history = [],
}: {
  change: Change;
  equipment?: Equipment;
  onDetail?: () => void;
  history?: Change[];
}) {
  const chronology = history
    .filter((x) => x.equipmentId === c.equipmentId)
    .sort((a, b) => a.date.localeCompare(b.date));
  const after = { ...e };
  const index = chronology.findIndex((x) => x.id === c.id);
  if (index >= 0)
    for (const later of chronology.slice(index + 1).reverse())
      after[componentFields[later.component]] = later.before;
  after[componentFields[c.component]] = c.after;
  const before = { ...after, [componentFields[c.component]]: c.before };
  const snapshotFields = Array.from(
    new Set(["cpu", "ram", "storage", componentFields[c.component]]),
  );
  const names: Record<string, string> = {
    cpu: "Procesador",
    ram: "RAM",
    storage: "Almacenamiento",
    ...Object.fromEntries(Object.entries(componentFields).map(([label, key]) => [key, label])),
  };
  return (
    <section className="s-panel s-comparison">
      <div className="s-panel-head">
        <div>
          <span className="s-eyebrow">{c.id}</span>
          <h2>
            {c.component} · {c.equipmentId}
          </h2>
          <p>
            {e?.name} · {e?.area} · {date(c.date)}
          </p>
        </div>
        <Badge>{c.upgrade ? "Mejora tecnológica" : "Cambio de hardware"}</Badge>
      </div>
      <div className="s-before-after">
        <div>
          <span>ANTES DE LA INTERVENCIÓN</span>
          <h3>{c.before || "Sin componente"}</h3>
          <p>{c.oldBrand || "Configuración anterior"}</p>
          <small>Serie: {c.oldSerial || "Sin registro"}</small>
          {c.upgrade && (
            <Info
              items={snapshotFields.map((key) => [names[key], before[key] || "Sin componente"])}
            />
          )}
        </div>
        <span className="s-swap">
          <Icon name="arrow" size={24} />
        </span>
        <div>
          <span>DESPUÉS DE LA INTERVENCIÓN</span>
          <h3>{c.after || "Componente retirado"}</h3>
          <p>{c.newBrand || "Configuración instalada"}</p>
          <small>Serie: {c.newSerial || "No aplica"}</small>
          {c.upgrade && (
            <Info
              items={snapshotFields.map((key) => [names[key], after[key] || "Sin componente"])}
            />
          )}
        </div>
      </div>
      <div className="s-comparison-foot">
        <div>
          <small>Motivo</small>
          <b>{c.reason}</b>
        </div>
        <div>
          <small>Técnico responsable</small>
          <b>{c.technician}</b>
        </div>
        <div>
          <small>Costo</small>
          <b>{money(c.cost)}</b>
        </div>
        {onDetail && (
          <button className="s-link" onClick={onDetail}>
            Ver detalle →
          </button>
        )}
      </div>
      {c.upgrade && (
        <div className="s-improvement">
          <Icon name="upgrades" size={16} /> Mejora tecnológica registrada: {c.component}. No se
          atribuyen porcentajes de rendimiento sin mediciones.
        </div>
      )}
    </section>
  );
}
