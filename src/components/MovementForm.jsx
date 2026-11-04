import { useState } from "react";
import api, { errorMessage } from "../lib/api";
import { useData, useToast, useAuth } from "../lib/context";
import { Field, Modal } from "./ui/Shared";
import Icon from "./ui/Icon";
export default function MovementForm({
  onClose,
  productId = "",
  initialType = "Entrada",
}) {
  const { data, refresh } = useData();
  const { user } = useAuth();
  const notify = useToast();
  const [form, setForm] = useState({
    producto_id: String(productId),
    tipo_movimiento: initialType,
    cantidad: "",
    observaciones: "",
    referencia: "",
    request_id: crypto.randomUUID(),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const product = data.productos.find((p) => p.id === Number(form.producto_id));
  const qty = Number(form.cantidad);
  const next =
    !product || form.cantidad === ""
      ? null
      : form.tipo_movimiento === "Ajuste"
        ? qty
        : product.stock + (form.tipo_movimiento === "Salida" ? -qty : qty);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/movimientos", form);
      notify("Movimiento registrado. El stock está actualizado.");
      await refresh();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }
  return (
    <Modal
      title="Registrar movimiento"
      description="Cada cambio de stock queda registrado en tu Kardex."
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form onSubmit={submit}>
        <div className="form-body">
          <div
            className="type-select"
            role="group"
            aria-label="Tipo de movimiento"
          >
            {["Entrada", "Salida", "Ajuste"].map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={form.tipo_movimiento === t}
                className={form.tipo_movimiento === t ? "selected" : ""}
                onClick={() => set("tipo_movimiento", t)}
              >
                <Icon
                  name={
                    t === "Entrada" ? "in" : t === "Salida" ? "out" : "arrows"
                  }
                  size={17}
                />
                {t}
              </button>
            ))}
          </div>
          <Field label="Producto">
            <select
              required
              value={form.producto_id}
              onChange={(e) => set("producto_id", e.target.value)}
            >
              <option value="">Selecciona un producto</option>
              {data.productos
                .filter((p) => p.activo)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} · {p.nombre}
                  </option>
                ))}
            </select>
          </Field>
          <div className="form-grid">
            <Field
              label={
                form.tipo_movimiento === "Ajuste"
                  ? "Stock real contado"
                  : "Cantidad"
              }
              hint={
                form.tipo_movimiento === "Ajuste"
                  ? "Reemplaza el stock por el conteo físico."
                  : "Usa cantidades enteras."
              }
            >
              <input
                type="number"
                min={form.tipo_movimiento === "Ajuste" ? 0 : 1}
                max="1000000000"
                step="1"
                required
                value={form.cantidad}
                onChange={(e) => set("cantidad", e.target.value)}
              />
            </Field>
            <Field label="Referencia (opcional)">
              <input
                value={form.referencia}
                maxLength={100}
                placeholder="Guía, pedido o comprobante"
                onChange={(e) => set("referencia", e.target.value)}
              />
            </Field>
          </div>
          {product && (
            <div
              className={`stock-preview ${next !== null && next < 0 ? "invalid" : ""}`}
            >
              <div>
                <span>Stock actual</span>
                <strong>
                  {product.stock} <small>{product.unidad.toLowerCase()}s</small>
                </strong>
              </div>
              <Icon name="arrow" />
              <div>
                <span>Stock resultante</span>
                <strong>
                  {next === null ? "—" : next}{" "}
                  <small>{product.unidad.toLowerCase()}s</small>
                </strong>
              </div>
            </div>
          )}
          <Field label="Motivo del movimiento">
            <textarea
              required
              rows="3"
              maxLength={500}
              placeholder="Describe por qué cambia el stock"
              value={form.observaciones}
              onChange={(e) => set("observaciones", e.target.value)}
            />
          </Field>
          <p className="form-note">
            <Icon name="shield" size={16} /> Responsable: {user.nombre}
          </p>
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
          <button
            className="button primary"
            disabled={busy || (next !== null && next < 0)}
          >
            {busy ? "Guardando…" : "Registrar movimiento"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
