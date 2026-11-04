import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { errorMessage } from "../lib/api";
import {
  useData,
  useAuth,
  useToast,
  money,
  stockStatus,
  downloadCSV,
} from "../lib/context";
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
import MovementForm from "../components/MovementForm";
function ProductForm({ product, onClose }) {
  const { data, refresh } = useData();
  const notify = useToast();
  const [form, setForm] = useState(
    product
      ? { ...product }
      : {
          nombre: "",
          sku: "",
          precio: "",
          costo: "",
          stock: "0",
          stock_minimo: "5",
          categoria_id: "",
          proveedor_id: "",
          unidad: "Unidad",
          descripcion: "",
          activo: true,
        },
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = { ...form };
      delete body.categoria;
      delete body.proveedor;
      if (product) delete body.stock;
      await api[product ? "put" : "post"](
        "/productos" + (product ? "/" + product.id : ""),
        body,
      );
      notify(product ? "Producto actualizado." : "Producto creado.");
      await refresh();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }
  return (
    <Modal
      title={product ? "Editar producto" : "Nuevo producto"}
      description="Organiza el catálogo con la información de cada artículo."
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form onSubmit={submit}>
        <div className="form-body">
          <Field label="Nombre del producto">
            <input
              autoFocus
              required
              maxLength={150}
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              placeholder="Ej. Teclado mecánico"
            />
          </Field>
          <div className="form-grid">
            <Field label="Código SKU">
              <input
                required
                maxLength={50}
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                placeholder="Ej. TEC-016"
              />
            </Field>
            <Field label="Unidad de medida">
              <select
                value={form.unidad}
                onChange={(e) => set("unidad", e.target.value)}
              >
                {[
                  "Unidad",
                  "Caja",
                  "Paquete",
                  "Metro",
                  "Kilogramo",
                  "Litro",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Categoría">
              <select
                required
                value={form.categoria_id}
                onChange={(e) => set("categoria_id", e.target.value)}
              >
                <option value="">Seleccionar categoría</option>
                {data.categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Proveedor">
              <select
                required
                value={form.proveedor_id}
                onChange={(e) => set("proveedor_id", e.target.value)}
              >
                <option value="">Seleccionar proveedor</option>
                {data.proveedores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.razon_social}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Precio de venta (S/)">
              <input
                required
                type="number"
                min="0"
                max="9999999999.99"
                step="0.01"
                value={form.precio}
                onChange={(e) => set("precio", e.target.value)}
              />
            </Field>
            <Field label="Costo unitario (S/)">
              <input
                required
                type="number"
                min="0"
                max="9999999999.99"
                step="0.01"
                value={form.costo}
                onChange={(e) => set("costo", e.target.value)}
              />
            </Field>
            {!product && (
              <Field
                label="Stock inicial"
                hint="Se registra una entrada en Kardex."
              >
                <input
                  required
                  type="number"
                  min="0"
                  max="1000000000"
                  step="1"
                  value={form.stock}
                  onChange={(e) => set("stock", e.target.value)}
                />
              </Field>
            )}
            <Field
              label="Stock mínimo"
              hint="Recibirás una alerta al llegar a este nivel."
            >
              <input
                required
                type="number"
                min="0"
                max="1000000000"
                step="1"
                value={form.stock_minimo}
                onChange={(e) => set("stock_minimo", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Descripción (opcional)">
            <textarea
              rows="2"
              maxLength={2000}
              value={form.descripcion || ""}
              onChange={(e) => set("descripcion", e.target.value)}
            />
          </Field>
          {product && (
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => set("activo", e.target.checked)}
              />
              <span>Producto activo en el inventario</span>
            </label>
          )}
          {product && (
            <p className="form-note">
              Para cambiar el stock, registra una entrada, salida o ajuste en
              Kardex.
            </p>
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
            {busy
              ? "Guardando…"
              : product
                ? "Guardar cambios"
                : "Crear producto"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
export default function Products() {
  const { data, refresh } = useData();
  const { user } = useAuth();
  const notify = useToast();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [tab, setTab] = useState(
    params.get("estado") === "bajo" ? "bajo" : "activos",
  );
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState(null);
  const [remove, setRemove] = useState(null);
  const [movement, setMovement] = useState(null);
  const [sort, setSort] = useState("nombre");
  const canEdit = user.rol !== "Supervisor";
  const filtered = useMemo(
    () =>
      data.productos
        .filter(
          (p) =>
            (tab === "todos" || (tab === "inactivos" ? !p.activo : p.activo)) &&
            (tab !== "bajo" || p.stock <= p.stock_minimo) &&
            (!category || p.categoria_id === Number(category)) &&
            `${p.nombre} ${p.sku} ${p.categoria.nombre}`
              .toLowerCase()
              .includes(search.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "stock"
            ? a.stock - b.stock
            : sort === "precio"
              ? Number(b.precio) - Number(a.precio)
              : a.nombre.localeCompare(b.nombre, "es"),
        ),
    [data.productos, tab, category, search, sort],
  );
  const updateFilter = (setter, value) => {
    setter(value);
    setPage(1);
  };
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / 8)),
  );
  const exportRows = () => {
    downloadCSV(
      "inventra-productos.csv",
      [
        "SKU",
        "Producto",
        "Categoría",
        "Proveedor",
        "Precio PEN",
        "Costo PEN",
        "Stock",
        "Stock mínimo",
        "Estado",
      ],
      filtered.map((p) => [
        p.sku,
        p.nombre,
        p.categoria.nombre,
        p.proveedor.razon_social,
        p.precio,
        p.costo,
        p.stock,
        p.stock_minimo,
        stockStatus(p)[1],
      ]),
    );
    notify("Catálogo exportado.");
  };
  return (
    <>
      <PageHeader
        title="Productos"
        description="Cada artículo, en el lugar correcto."
      >
        <button className="button secondary" onClick={exportRows}>
          <Icon name="download" size={17} /> Exportar
        </button>
        {canEdit && (
          <button className="button primary" onClick={() => setEdit({})}>
            <Icon name="plus" size={18} /> Nuevo producto
          </button>
        )}
      </PageHeader>
      <div className="tabs" role="group" aria-label="Estado de productos">
        {[
          ["activos", "Activos"],
          ["bajo", "Stock bajo"],
          ["inactivos", "Inactivos"],
          ["todos", "Todos"],
        ].map(([key, label]) => (
          <button
            aria-pressed={tab === key}
            key={key}
            className={tab === key ? "selected" : ""}
            onClick={() => {
              updateFilter(setTab, key);
              setParams(key === "bajo" ? { estado: "bajo" } : {});
            }}
          >
            {label}
            {key === "bajo" && <span>{data.dashboard.bajo_stock.length}</span>}
          </button>
        ))}
      </div>
      <div className="table-toolbar">
        <Search
          value={search}
          onChange={(v) => updateFilter(setSearch, v)}
          placeholder="Buscar por nombre o SKU…"
        />
        <div className="toolbar-filters">
          <select
            aria-label="Filtrar por categoría"
            value={category}
            onChange={(e) => updateFilter(setCategory, e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {data.categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <select
            aria-label="Ordenar productos"
            value={sort}
            onChange={(e) => updateFilter(setSort, e.target.value)}
          >
            <option value="nombre">Nombre A–Z</option>
            <option value="stock">Menor stock</option>
            <option value="precio">Mayor precio</option>
          </select>
        </div>
      </div>
      {!filtered.length ? (
        <Empty
          title={
            search || category
              ? "No encontramos coincidencias"
              : "Sin productos en esta vista"
          }
          description={
            search || category
              ? "Prueba otro nombre, SKU o categoría."
              : "Crea un producto o selecciona otro estado."
          }
        />
      ) : (
        <div className="table-scroll">
          <table className="data-table product-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th className="numeric">Precio</th>
                <th className="numeric">Stock</th>
                <th>Estado</th>
                {canEdit && <th className="actions-heading">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtered
                .slice((currentPage - 1) * 8, currentPage * 8)
                .map((p) => {
                  const status = stockStatus(p);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="product-identity">
                          <span className="product-symbol">
                            <Icon name="box" size={23} />
                          </span>
                          <div>
                            <strong>{p.nombre}</strong>
                            <small className="sku">
                              {p.sku} <span>· {p.proveedor.razon_social}</span>
                            </small>
                          </div>
                        </div>
                      </td>
                      <td className="muted">{p.categoria.nombre}</td>
                      <td className="numeric">{money(p.precio)}</td>
                      <td
                        className={`numeric stock-number ${p.stock <= p.stock_minimo && p.activo ? "attention" : ""}`}
                      >
                        <strong>{p.stock}</strong>
                        <small>Mín. {p.stock_minimo}</small>
                      </td>
                      <td>
                        <Badge kind={status[0]}>{status[1]}</Badge>
                      </td>
                      {canEdit && (
                        <td>
                          <div className="row-actions">
                            {p.activo && (
                              <button
                                className="icon-button"
                                title="Registrar movimiento"
                                aria-label={`Registrar movimiento de ${p.nombre}`}
                                onClick={() => setMovement(p)}
                              >
                                <Icon name="arrows" size={18} />
                              </button>
                            )}
                            <button
                              className="icon-button"
                              aria-label={`Editar ${p.nombre}`}
                              title="Editar producto"
                              onClick={() => setEdit(p)}
                            >
                              <Icon name="edit" size={17} />
                            </button>
                            {user.rol === "Administrador" && (
                              <button
                                className="icon-button danger-text"
                                aria-label={`Eliminar ${p.nombre}`}
                                title="Eliminar producto"
                                onClick={() => setRemove(p)}
                              >
                                <Icon name="trash" size={17} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={currentPage} total={filtered.length} onChange={setPage} />
      <div className="table-hint">
        <Icon name="shield" size={15} /> El stock cambia a través de movimientos
        para conservar la trazabilidad.
      </div>
      {edit && (
        <ProductForm
          product={edit.id ? edit : null}
          onClose={() => setEdit(null)}
        />
      )}{" "}
      {movement && (
        <MovementForm
          productId={movement.id}
          onClose={() => setMovement(null)}
        />
      )}{" "}
      {remove && (
        <Confirm
          title="Eliminar producto"
          description={`Se eliminará «${remove.nombre}» si no tiene movimientos. Los productos con historial pueden desactivarse desde Editar.`}
          onClose={() => setRemove(null)}
          onConfirm={async () => {
            try {
              await api.delete("/productos/" + remove.id);
              await refresh();
              setRemove(null);
              notify("Producto eliminado.");
            } catch (e) {
              throw new Error(errorMessage(e), { cause: e });
            }
          }}
        />
      )}
    </>
  );
}
