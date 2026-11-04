import { useState } from "react";
import { Navigate } from "react-router-dom";
import api, { errorMessage } from "../lib/api";
import { useData, useAuth, useToast, initials } from "../lib/context";
import Icon from "../components/ui/Icon";
import {
  Badge,
  Confirm,
  Empty,
  Field,
  Modal,
  PageHeader,
  Pager,
  Search,
} from "../components/ui/Shared";
const config = {
  categorias: {
    title: "Categorías",
    single: "categoría",
    description: "Un catálogo organizado comienza con buenas categorías.",
    label: "nombre",
    icon: "folder",
  },
  proveedores: {
    title: "Proveedores",
    single: "proveedor",
    description: "Las personas y empresas que mantienen tu almacén en marcha.",
    label: "razon_social",
    icon: "truck",
  },
  usuarios: {
    title: "Usuarios",
    single: "usuario",
    description: "Un equipo conectado, con los permisos que necesita.",
    label: "nombre",
    icon: "users",
  },
};
function EntityForm({ kind, row, onClose }) {
  const conf = config[kind];
  const { refresh } = useData();
  const notify = useToast();
  const [form, setForm] = useState(
    row ||
      (kind === "categorias"
        ? { nombre: "", descripcion: "" }
        : kind === "proveedores"
          ? {
              razon_social: "",
              contacto: "",
              telefono: "",
              email: "",
              ruc: "",
              direccion: "",
            }
          : {
              nombre: "",
              email: "",
              password: "",
              rol: "Almacenero",
              activo: true,
            }),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const input = (
    label,
    key,
    required = false,
    type = "text",
    maxLength = 150,
  ) => (
    <Field label={label}>
      <input
        required={required}
        type={type}
        maxLength={maxLength}
        value={form[key] || ""}
        onChange={(e) => set(key, e.target.value)}
        autoComplete={type === "password" ? "new-password" : undefined}
        minLength={type === "password" ? 8 : undefined}
      />
    </Field>
  );
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api[row ? "put" : "post"](
        `/${kind}${row ? "/" + row.id : ""}`,
        form,
      );
      notify("Cambios guardados.");
      await refresh();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }
  return (
    <Modal
      title={`${row ? "Editar" : kind === "categorias" ? "Nueva" : "Nuevo"} ${conf.single}`}
      description={conf.description}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form onSubmit={submit}>
        <div className="form-body">
          {kind === "categorias" ? (
            <>
              {input("Nombre de la categoría", "nombre", true, "text", 100)}
              <Field label="Descripción (opcional)">
                <textarea
                  rows="4"
                  maxLength={2000}
                  value={form.descripcion || ""}
                  onChange={(e) => set("descripcion", e.target.value)}
                />
              </Field>
            </>
          ) : kind === "proveedores" ? (
            <>
              {input("Razón social", "razon_social", true)}
              <div className="form-grid">
                {input("Nombre del contacto", "contacto", false, "text", 100)}
                {input("Teléfono", "telefono", false, "tel", 30)}
                {input("Correo electrónico", "email", false, "email", 254)}
                <Field label="RUC (opcional)">
                  <input
                    inputMode="numeric"
                    pattern="[0-9]{11}"
                    maxLength={11}
                    value={form.ruc || ""}
                    onChange={(e) => set("ruc", e.target.value)}
                  />
                </Field>
              </div>
              {input("Dirección", "direccion", false, "text", 250)}
            </>
          ) : (
            <>
              {input("Nombre completo", "nombre", true, "text", 100)}
              {input("Correo electrónico", "email", true, "email", 254)}
              {input(
                row
                  ? "Nueva contraseña (dejar vacía para conservar)"
                  : "Contraseña",
                "password",
                !row,
                "password",
                72,
              )}
              <Field label="Rol de acceso">
                <select
                  value={form.rol}
                  onChange={(e) => set("rol", e.target.value)}
                >
                  {["Administrador", "Almacenero", "Supervisor"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <small>
                  {form.rol === "Administrador"
                    ? "Gestiona todo el sistema y los usuarios."
                    : form.rol === "Almacenero"
                      ? "Gestiona productos y registra movimientos."
                      : "Consulta el inventario y los reportes."}
                </small>
              </Field>
              {row && (
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.activo}
                    onChange={(e) => set("activo", e.target.checked)}
                  />
                  <span>Cuenta activa</span>
                </label>
              )}
            </>
          )}
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
        </div>
        <div className="form-footer">
          <button
            type="button"
            className="button secondary"
            disabled={busy}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button className="button primary" disabled={busy}>
            {busy ? "Guardando…" : "Guardar " + conf.single}
          </button>
        </div>
      </form>
    </Modal>
  );
}
export default function Entities({ kind }) {
  const { data, refresh } = useData();
  const { user } = useAuth();
  const notify = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState(null);
  const [remove, setRemove] = useState(null);
  const [stateFilter, setStateFilter] = useState("todos");
  const conf = config[kind];
  if (kind === "usuarios" && user.rol !== "Administrador")
    return <Navigate to="/" replace />;
  const rows = data[kind].filter(
    (r) =>
      Object.values(r)
        .filter((v) => typeof v === "string")
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (kind !== "usuarios" ||
        stateFilter === "todos" ||
        (stateFilter === "activos" ? r.activo : !r.activo)),
  );
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / 8)));
  const canEdit = user.rol === "Administrador";
  return (
    <>
      <PageHeader title={conf.title} description={conf.description}>
        {canEdit && (
          <button className="button primary" onClick={() => setEdit({})}>
            <Icon name="plus" size={18} />
            {kind === "categorias" ? "Nueva" : "Nuevo"} {conf.single}
          </button>
        )}
      </PageHeader>
      <div className="entity-summary">
        <strong>{data[kind].length}</strong>
        <span>{conf.title.toLowerCase()} en tu almacén</span>
        {kind === "usuarios" && (
          <Badge kind="positive">
            {data.usuarios.filter((u) => u.activo).length} activos
          </Badge>
        )}
      </div>
      <div className="table-toolbar">
        <Search
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder={`Buscar ${conf.title.toLowerCase()}…`}
        />
        {kind === "usuarios" && (
          <select
            aria-label="Filtrar estado de usuarios"
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        )}
      </div>
      {!rows.length ? (
        <Empty
          title="Sin resultados"
          description={`No hay ${conf.title.toLowerCase()} que coincidan con esta búsqueda.`}
        />
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  {kind === "proveedores"
                    ? "Proveedor"
                    : kind === "usuarios"
                      ? "Persona"
                      : "Categoría"}
                </th>
                {kind === "categorias" ? (
                  <>
                    <th>Descripción</th>
                    <th className="numeric">Productos</th>
                  </>
                ) : kind === "proveedores" ? (
                  <>
                    <th>Contacto</th>
                    <th>Teléfono</th>
                    <th>Correo electrónico</th>
                    <th className="numeric">Productos</th>
                  </>
                ) : (
                  <>
                    <th>Correo electrónico</th>
                    <th>Rol</th>
                    <th>Estado</th>
                  </>
                )}
                {canEdit && <th className="actions-heading">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {rows.slice((currentPage - 1) * 8, currentPage * 8).map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="product-identity">
                      {kind === "usuarios" ? (
                        <span className="avatar">{initials(r.nombre)}</span>
                      ) : (
                        <span className="entity-symbol">
                          <Icon name={conf.icon} />
                        </span>
                      )}
                      <div>
                        <strong>{r[conf.label]}</strong>
                        <small>
                          {kind === "proveedores"
                            ? r.ruc
                              ? `RUC ${r.ruc}`
                              : r.direccion || "Sin dirección"
                            : kind === "usuarios"
                              ? `USR-${String(r.id).padStart(3, "0")}`
                              : `CAT-${String(r.id).padStart(3, "0")}`}
                        </small>
                      </div>
                    </div>
                  </td>
                  {kind === "categorias" ? (
                    <>
                      <td className="muted description-cell">
                        {r.descripcion || "—"}
                      </td>
                      <td className="numeric">{r.total_productos}</td>
                    </>
                  ) : kind === "proveedores" ? (
                    <>
                      <td>{r.contacto || "—"}</td>
                      <td className="muted nowrap">{r.telefono || "—"}</td>
                      <td className="muted">{r.email || "—"}</td>
                      <td className="numeric">{r.total_productos}</td>
                    </>
                  ) : (
                    <>
                      <td className="muted">{r.email}</td>
                      <td>
                        <span className="role-label">{r.rol}</span>
                      </td>
                      <td>
                        <Badge kind={r.activo ? "positive" : "neutral"}>
                          {r.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                    </>
                  )}
                  {canEdit && (
                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-button"
                          title="Editar"
                          aria-label={`Editar ${r[conf.label]}`}
                          onClick={() => setEdit(r)}
                        >
                          <Icon name="edit" size={18} />
                        </button>
                        {kind !== "usuarios" && (
                          <button
                            className="icon-button danger-text"
                            title="Eliminar"
                            aria-label={`Eliminar ${r[conf.label]}`}
                            onClick={() => setRemove(r)}
                          >
                            <Icon name="trash" size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={currentPage} total={rows.length} onChange={setPage} />
      {kind === "usuarios" && (
        <div className="table-hint">
          <Icon name="shield" size={16} /> Las cuentas inactivas pierden el
          acceso. Su historial de movimientos se conserva.
        </div>
      )}
      {edit && (
        <EntityForm
          kind={kind}
          row={edit.id ? edit : null}
          onClose={() => setEdit(null)}
        />
      )}{" "}
      {remove && (
        <Confirm
          title={`Eliminar ${conf.single}`}
          description={`Se eliminará «${remove[conf.label]}». Solo es posible si no tiene productos asociados.`}
          onClose={() => setRemove(null)}
          onConfirm={async () => {
            try {
              await api.delete(`/${kind}/${remove.id}`);
              await refresh();
              setRemove(null);
              notify("Registro eliminado.");
            } catch (e) {
              throw new Error(errorMessage(e), { cause: e });
            }
          }}
        />
      )}
    </>
  );
}
