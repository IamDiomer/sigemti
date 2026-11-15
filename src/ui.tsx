import { useEffect, useRef, useState, type ReactNode, type FormEvent } from "react";
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    inventory: (
      <>
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8m-4-4v4" />
      </>
    ),
    maintenance: <path d="m14 6 4-4a5 5 0 0 1-6 7l-7 9a2 2 0 0 0 3 3l8-9a5 5 0 0 0 6-7l-4 4z" />,
    hardware: (
      <>
        <rect x="6" y="6" width="12" height="12" rx="2" />
        <path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4" />
        <rect x="9" y="9" width="6" height="6" />
      </>
    ),
    upgrades: <path d="m13 2-9 12h7l-1 8 10-13h-7z" />,
    areas: (
      <>
        <path d="M4 21V4l8-2 8 2v17M2 21h20M9 21v-4h6v4M8 7h2m4 0h2M8 12h2m4 0h2" />
      </>
    ),
    reports: (
      <>
        <path d="M4 20V10m6 10V4m6 16v-7m5 7H2" />
      </>
    ),
    alerts: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    admin: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="m12 2 2 3 4-1 1 4 3 2-2 4 1 4-4 1-3 3-3-2-4 1-1-4-3-2 2-4-1-4 4-1z" />
      </>
    ),
    search: (
      <>
        <circle cx="10" cy="10" r="6.5" />
        <path d="m15 15 6 6" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    download: (
      <>
        <path d="M12 3v12m-4-4 4 4 4-4M4 19v3h16v-3" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    edit: (
      <>
        <path d="m4 16-1 5 5-1L20 8l-4-4zM14 6l4 4" />
      </>
    ),
    check: <path d="m5 12 4 4L20 5" />,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    file: (
      <>
        <path d="M5 2h9l5 5v15H5zM14 2v6h5M8 13h8m-8 4h8" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 22v-3a8 8 0 0 1 16 0v3" />
      </>
    ),
    logout: (
      <>
        <path d="M9 3H4v18h5M9 12h13m-5-5 5 5-5 5" />
      </>
    ),
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
    close: <path d="m5 5 14 14M19 5 5 19" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 3" />
      </>
    ),
    shield: (
      <>
        <path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.file}
    </svg>
  );
}
export function Badge({ children }: { children: ReactNode }) {
  const text = String(children);
  return (
    <span
      className={`s-badge ${/Operativo|Finalizado|Activo|Solucionado|Instalado|Baja/.test(text) ? "green" : /Fuera|Alta|Vencido|Inactivo/.test(text) ? "red" : /proceso|Programado|Media|mantenimiento|Pendiente/.test(text) ? "amber" : "blue"}`}
    >
      <i />
      {children}
    </span>
  );
}
export function Button({
  children,
  onClick,
  primary = false,
  icon,
  disabled = false,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  primary?: boolean;
  icon?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      className={`s-button ${primary ? "primary" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <Icon name={icon} size={16} />} {children}
    </button>
  );
}
export function Tabs({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="s-tabs" role="tablist">
      {items.map((t) => (
        <button
          type="button"
          role="tab"
          aria-selected={t === value}
          className={t === value ? "selected" : ""}
          key={t}
          onClick={() => onChange(t)}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
export function Table({
  headers,
  rows,
  pageSize = 6,
}: {
  headers: string[];
  rows: ReactNode[][];
  pageSize?: number;
}) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const p = Math.min(page, pages);
  return (
    <>
      <div className="s-table-scroll">
        <table className="s-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice((p - 1) * pageSize, p * pageSize).map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="s-empty">
            <Icon name="search" size={30} />
            <b>No se encontraron registros</b>
            <p>Prueba con otros filtros o registra nueva información.</p>
          </div>
        )}
      </div>
      <div className="s-pagination">
        <span>
          {rows.length ? `${(p - 1) * pageSize + 1}–${Math.min(p * pageSize, rows.length)}` : "0"}{" "}
          de {rows.length} registros
        </span>
        <div>
          <button disabled={p === 1} onClick={() => setPage(p - 1)} aria-label="Página anterior">
            ‹
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1)
            .filter((n) => Math.abs(n - p) < 3 || n === 1 || n === pages)
            .map((n) => (
              <button className={n === p ? "active" : ""} key={n} onClick={() => setPage(n)}>
                {n}
              </button>
            ))}
          <button
            disabled={p === pages}
            onClick={() => setPage(p + 1)}
            aria-label="Página siguiente"
          >
            ›
          </button>
        </div>
      </div>
    </>
  );
}
export function Dialog({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    ref.current?.focus();
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab") {
        const nodes = ref.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),input:not(:disabled),select,textarea,a[href],[tabindex="0"]',
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first || document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", handle);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handle);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <div className="s-overlay">
      <div
        ref={ref}
        tabIndex={-1}
        className={`s-dialog ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <header>
          <div>
            <small>SIGEMTI · GESTIÓN INSTITUCIONAL</small>
            <h2 id="dialog-title">{title}</h2>
          </div>
          <button className="s-icon-button" aria-label="Cerrar ventana" onClick={onClose}>
            <Icon name="close" />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
export type Field = {
  key: string;
  label: string;
  tab?: string;
  options?: string[];
  type?: string;
  required?: boolean;
  readOnly?: boolean;
  span?: boolean;
};
export function RecordForm({
  fields,
  initial,
  onSave,
  onCancel,
  submitLabel = "Guardar registro",
  onValue,
}: {
  fields: Field[];
  initial: Record<string, string>;
  onSave: (v: Record<string, string>) => string | void;
  onCancel: () => void;
  submitLabel?: string;
  onValue?: (key: string, value: string, values: Record<string, string>) => Record<string, string>;
}) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      Object.entries(initial).map(([k, v]) => [
        k,
        fields.find((f) => f.key === k)?.type === "number" && v && !Number.isFinite(Number(v))
          ? ""
          : v,
      ]),
    ),
  );
  const tabs = Array.from(new Set(fields.map((f) => f.tab || "Datos del registro")));
  const [tab, setTab] = useState(tabs[0]);
  const [error, setError] = useState("");
  function save(e: FormEvent) {
    e.preventDefault();
    const missingOption = fields.find(
      (f) => f.options && values[f.key] && !f.options.includes(values[f.key]),
    );
    if (missingOption) {
      setTab(missingOption.tab || tabs[0]);
      setError(`Selecciona una opción vigente para «${missingOption.label}».`);
      return;
    }
    const invalid = fields.find((f) => f.required && !values[f.key]?.trim());
    if (invalid) {
      setTab(invalid.tab || tabs[0]);
      setError(`Complete el campo «${invalid.label}».`);
      return;
    }
    const emailField = fields.find(
      (f) =>
        f.type === "email" && values[f.key] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[f.key]),
    );
    if (emailField) {
      setError("Ingrese un correo electrónico válido.");
      return;
    }
    if (
      fields.some(
        (f) =>
          f.type === "number" &&
          values[f.key] &&
          (Number(values[f.key]) < 0 || !Number.isFinite(Number(values[f.key]))),
      )
    ) {
      setError("Ingrese cantidades numéricas válidas, mayores o iguales a cero.");
      return;
    }
    const message = onSave(
      Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()])),
    );
    if (message) setError(message);
  }
  return (
    <form noValidate onSubmit={save}>
      {tabs.length > 1 && <Tabs items={tabs} value={tab} onChange={setTab} />}
      <div className="s-dialog-body">
        {error && (
          <div className="s-error" role="alert">
            {error}
          </div>
        )}
        <p className="s-form-help">
          Los campos con * son obligatorios.{" "}
          {tabs.length > 1 ? "Completa las secciones antes de guardar." : ""}
        </p>
        <div className="s-form-grid">
          {fields
            .filter((f) => (f.tab || tabs[0]) === tab)
            .map((f) => (
              <label key={f.key} className={f.span ? "span-2" : ""}>
                <span>
                  {f.label}
                  {f.required && " *"}
                </span>
                {f.options ? (
                  <select
                    disabled={f.readOnly}
                    value={values[f.key] || ""}
                    onChange={(e) =>
                      setValues(
                        (v) =>
                          onValue?.(f.key, e.target.value, v) || { ...v, [f.key]: e.target.value },
                      )
                    }
                  >
                    <option value="">Seleccionar…</option>
                    {f.options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea
                    rows={3}
                    value={values[f.key] || ""}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  />
                ) : (
                  <input
                    type={f.type || "text"}
                    min={f.type === "number" ? 0 : undefined}
                    step={f.type === "number" ? "0.01" : undefined}
                    readOnly={f.readOnly}
                    value={values[f.key] || ""}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  />
                )}
              </label>
            ))}
        </div>
      </div>
      <footer>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button primary type="submit" icon="check">
          {submitLabel}
        </Button>
      </footer>
    </form>
  );
}
export function BarChart({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="s-bars">
      {items.map((i) => (
        <div key={i.label}>
          <span>{i.label}</span>
          <i>
            <b style={{ width: `${(i.value / max) * 100}%` }} />
          </i>
          <strong>{i.value}</strong>
        </div>
      ))}
    </div>
  );
}
export function LineChart({
  series,
  labels,
}: {
  series: { name: string; values: number[]; color: string }[];
  labels: string[];
}) {
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  return (
    <div className="s-line">
      <svg
        viewBox="0 0 560 160"
        role="img"
        aria-label={series.map((s) => `${s.name}: ${s.values.join(", ")}`).join("; ")}
      >
        {[15, 55, 95, 135].map((y) => (
          <line key={y} x1="20" x2="540" y1={y} y2={y} stroke="#edf1f6" />
        ))}
        {series.map((s) => (
          <g key={s.name}>
            <polyline
              points={s.values
                .map(
                  (v, i) =>
                    `${20 + (i * 520) / Math.max(1, s.values.length - 1)},${135 - (v / max) * 115}`,
                )
                .join(" ")}
              fill="none"
              stroke={s.color}
              strokeWidth="3"
            />
            {s.values.map((v, i) => (
              <circle
                key={i}
                cx={20 + (i * 520) / Math.max(1, s.values.length - 1)}
                cy={135 - (v / max) * 115}
                r="4"
                fill={s.color}
              >
                <title>
                  {labels[i]}: {s.name} {v}
                </title>
              </circle>
            ))}
          </g>
        ))}
      </svg>
      <div className="s-months">
        {labels.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>
      <div className="s-chart-key">
        {series.map((s) => (
          <span key={s.name}>
            <i style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
export function Stat({
  label,
  value,
  icon,
  tone = "blue",
  detail,
}: {
  label: string;
  value: ReactNode;
  icon: string;
  tone?: string;
  detail?: string;
}) {
  return (
    <div className="s-stat">
      <span className={`s-stat-icon ${tone}`}>
        <Icon name={icon} />
      </span>
      <span>
        {label}
        <strong>{value}</strong>
        <small>{detail || "Inventario institucional"}</small>
      </span>
    </div>
  );
}
