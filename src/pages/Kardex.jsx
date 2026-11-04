import { useMemo, useState } from "react";
import api, { errorMessage } from "../lib/api";
import {
  useAuth,
  useData,
  useToast,
  date,
  time,
  downloadCSV,
  count,
} from "../lib/context";
import {
  Badge,
  Empty,
  Field,
  Modal,
  PageHeader,
  Pager,
  Search,
} from "../components/ui/Shared";
import MovementForm from "../components/MovementForm";
import Icon from "../components/ui/Icon";
export function MovementBadge({ movement }) {
  return (
    <Badge
      kind={
        movement.anulado
          ? "neutral"
          : movement.tipo_movimiento === "Entrada"
            ? "positive"
            : movement.tipo_movimiento === "Salida"
              ? "neutral"
              : "warning"
      }
    >
      {movement.anulado
        ? "Anulado"
        : movement.revierte_id
          ? "Reversión"
          : movement.tipo_movimiento}
    </Badge>
  );
}
export default function Kardex() {
  const { data, refresh } = useData();
  const { user } = useAuth();
  const notify = useToast();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("todos");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [create, setCreate] = useState(false);
  const [detail, setDetail] = useState(null);
  const [reverse, setReverse] = useState(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const filtered = useMemo(
    () =>
      data.movimientos.filter((m) => {
        const d = new Date(m.fecha_hora).toLocaleDateString("en-CA", {
          timeZone: "America/Lima",
        });
        return (
          (type === "todos" ||
            (type === "anulados" ? m.anulado : m.tipo_movimiento === type)) &&
          (!from || d >= from) &&
          (!to || d <= to) &&
          `${m.producto.nombre} ${m.producto.sku} ${m.usuario.nombre} ${m.observaciones} ${m.referencia || ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
        );
      }),
    [data.movimientos, type, from, to, search],
  );
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / 8)),
  );
  const update = (setter, value) => {
    setter(value);
    setPage(1);
  };
  const exportRows = () => {
    downloadCSV(
      "inventra-kardex.csv",
      [
        "ID",
        "Fecha Lima",
        "Hora Lima",
        "SKU",
        "Producto",
        "Tipo",
        "Cantidad neta",
        "Stock anterior",
        "Stock resultante",
        "Responsable",
        "Referencia",
        "Observaciones",
        "Anulado",
      ],
      filtered.map((m) => [
        m.id,
        date(m.fecha_hora),
        time(m.fecha_hora),
        m.producto.sku,
        m.producto.nombre,
        m.tipo_movimiento,
        m.cantidad,
        m.stock_anterior,
        m.stock_resultante,
        m.usuario.nombre,
        m.referencia,
        m.observaciones,
        m.anulado ? "Sí" : "No",
      ]),
    );
    notify("Kardex exportado.");
  };
  return (
    <>
      <PageHeader
        title="Kardex"
        description="La historia de tu inventario, movimiento a movimiento."
      >
        <button className="button secondary" onClick={exportRows}>
          <Icon name="download" size={17} /> Exportar
        </button>
        {user.rol !== "Supervisor" && (
          <button className="button primary" onClick={() => setCreate(true)}>
            <Icon name="plus" size={18} /> Registrar movimiento
          </button>
        )}
      </PageHeader>
      <div className="tabs" role="group" aria-label="Tipo de movimiento">
        {[
          ["todos", "Todos"],
          ["Entrada", "Entradas"],
          ["Salida", "Salidas"],
          ["Ajuste", "Ajustes"],
          ["anulados", "Anulados"],
        ].map(([key, label]) => (
          <button
            aria-pressed={type === key}
            className={type === key ? "selected" : ""}
            onClick={() => update(setType, key)}
            key={key}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="table-toolbar">
        <Search
          value={search}
          onChange={(v) => update(setSearch, v)}
          placeholder="Buscar producto, usuario o referencia…"
        />
        <div className="date-filters">
          <label>
            Desde
            <input
              aria-label="Fecha desde"
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => update(setFrom, e.target.value)}
            />
          </label>
          <label>
            Hasta
            <input
              aria-label="Fecha hasta"
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => update(setTo, e.target.value)}
            />
          </label>
          {(from || to) && (
            <button
              className="icon-button"
              aria-label="Limpiar fechas"
              onClick={() => {
                setFrom("");
                setTo("");
                setPage(1);
              }}
            >
              <Icon name="close" size={17} />
            </button>
          )}
        </div>
      </div>
      {!filtered.length ? (
        <Empty
          title="Sin movimientos en esta vista"
          description="Ajusta los filtros o registra una operación para comenzar."
        />
      ) : (
        <div className="table-scroll">
          <table className="data-table kardex-table">
            <thead>
              <tr>
                <th>Fecha / hora</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th className="numeric">Cantidad</th>
                <th className="numeric">Stock final</th>
                <th>Responsable</th>
                <th className="actions-heading">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {filtered
                .slice((currentPage - 1) * 8, currentPage * 8)
                .map((m) => (
                  <tr key={m.id}>
                    <td className="nowrap">
                      <span>{date(m.fecha_hora)}</span>
                      <small>
                        {time(m.fecha_hora)} · MOV-
                        {String(m.id).padStart(4, "0")}
                      </small>
                    </td>
                    <td>
                      <strong>{m.producto.nombre}</strong>
                      <small className="sku">{m.producto.sku}</small>
                    </td>
                    <td>
                      <MovementBadge movement={m} />
                    </td>
                    <td
                      className={`numeric ${m.cantidad > 0 && !m.anulado ? "positive-text" : ""}`}
                    >
                      {m.cantidad > 0 ? "+" : "−"}
                      {count(Math.abs(m.cantidad))}
                    </td>
                    <td className="numeric">{count(m.stock_resultante)}</td>
                    <td className="muted">{m.usuario.nombre}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-button"
                          title="Ver detalle"
                          aria-label={`Ver movimiento ${m.id}`}
                          onClick={() => setDetail(m)}
                        >
                          <Icon name="eye" size={18} />
                        </button>
                        {user.rol === "Administrador" &&
                          !m.anulado &&
                          !m.revierte_id && (
                            <button
                              className="icon-button"
                              title="Anular movimiento"
                              aria-label={`Anular movimiento ${m.id}`}
                              onClick={() => {
                                setReverse(m);
                                setReason("");
                                setError("");
                              }}
                            >
                              <Icon name="undo" size={17} />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={currentPage} total={filtered.length} onChange={setPage} />
      <p className="table-hint">
        <Icon name="lock" size={15} /> El historial es permanente. Las
        anulaciones crean un movimiento de reversión.
      </p>
      {create && <MovementForm onClose={() => setCreate(false)} />}{" "}
      {detail && (
        <Modal
          title={`Movimiento MOV-${String(detail.id).padStart(4, "0")}`}
          description={`${date(detail.fecha_hora)} · ${time(detail.fecha_hora)} (Lima)`}
          onClose={() => setDetail(null)}
        >
          <div className="form-body">
            <MovementBadge movement={detail} />
            <h3>{detail.producto.nombre}</h3>
            <dl className="details">
              <dt>SKU</dt>
              <dd>{detail.producto.sku}</dd>
              <dt>Cantidad neta</dt>
              <dd>
                {detail.cantidad > 0 ? "+" : ""}
                {detail.cantidad}
              </dd>
              <dt>Stock anterior</dt>
              <dd>{detail.stock_anterior}</dd>
              <dt>Stock resultante</dt>
              <dd>{detail.stock_resultante}</dd>
              <dt>Responsable</dt>
              <dd>{detail.usuario.nombre}</dd>
              <dt>Referencia</dt>
              <dd>{detail.referencia || "—"}</dd>
              <dt>Motivo</dt>
              <dd>{detail.observaciones}</dd>
            </dl>
          </div>
          <div className="form-footer">
            <button
              className="button secondary"
              onClick={() => setDetail(null)}
            >
              Cerrar
            </button>
          </div>
        </Modal>
      )}{" "}
      {reverse && (
        <Modal
          title="Anular movimiento"
          description={`Se revertirá el cambio de ${reverse.cantidad} unidades de «${reverse.producto.nombre}». El registro original se conserva.`}
          onClose={() => {
            if (!busy) setReverse(null);
          }}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                await api.post(`/movimientos/${reverse.id}/anular`, {
                  observaciones: reason,
                });
                await refresh();
                setReverse(null);
                notify("Movimiento anulado y stock actualizado.");
              } catch (err) {
                setError(errorMessage(err));
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="form-body">
              <Field label="Motivo de anulación">
                <textarea
                  required
                  rows="3"
                  value={reason}
                  maxLength={400}
                  onChange={(e) => setReason(e.target.value)}
                />
              </Field>
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
                onClick={() => setReverse(null)}
              >
                Cancelar
              </button>
              <button className="button destructive" disabled={busy}>
                {busy ? "Anulando…" : "Confirmar anulación"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
