import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { count } from "../../lib/context";
export function PageHeader({ title, description, children }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="header-actions">{children}</div>
    </header>
  );
}
export function Badge({ kind = "neutral", children }) {
  return (
    <span className={`badge ${kind}`}>
      <span className="badge-dot" />
      {children}
    </span>
  );
}
export function Empty({
  title = "Todavía no hay registros",
  description = "Crea el primero para comenzar.",
  action,
}) {
  return (
    <div className="empty">
      <Icon name="box" size={32} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function Loading() {
  return (
    <div className="loading" role="status">
      <span className="spinner" /> Cargando tu inventario…
    </div>
  );
}
export function Search({ value, onChange, placeholder = "Buscar…" }) {
  return (
    <div className="search-field">
      <Icon name="search" size={18} />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          className="icon-button"
          aria-label="Limpiar búsqueda"
          onClick={() => onChange("")}
        >
          <Icon name="close" size={15} />
        </button>
      )}
    </div>
  );
}
export function Pager({ page, total, size = 8, onChange }) {
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <div className="pager">
      <span>
        {total
          ? `${(page - 1) * size + 1}–${Math.min(page * size, total)}`
          : "0"}{" "}
        de {count(total)} registros
      </span>
      <div>
        <button
          className="icon-button"
          aria-label="Página anterior"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <Icon name="left" size={17} />
        </button>
        <span>
          Página {page} de {pages}
        </span>
        <button
          className="icon-button"
          aria-label="Página siguiente"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          <Icon name="right" size={17} />
        </button>
      </div>
    </div>
  );
}
export function Modal({ title, description, onClose, children, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => {
      dialog.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "modal-wide" : ""}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) {
          const r = ref.current.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
      aria-labelledby="modal-title"
    >
      <div className="modal-header">
        <div>
          <h2 id="modal-title">{title}</h2>
          {description && <p>{description}</p>}
        </div>
        <button
          className="icon-button"
          type="button"
          aria-label="Cerrar ventana"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Field({ label, hint, error, children, ...props }) {
  return (
    <label className={`field ${error ? "field-error" : ""}`} {...props}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
      {error && <small role="alert">{error}</small>}
    </label>
  );
}
export function Confirm({
  title,
  description,
  action = "Eliminar",
  onConfirm,
  onClose,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <Modal
      title={title}
      description={description}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <div className="confirm-body">
        <Icon name="alert" size={32} />
        <p>Esta acción requiere tu confirmación.</p>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
      </div>
      <div className="form-footer">
        <button className="button secondary" disabled={busy} onClick={onClose}>
          Cancelar
        </button>
        <button
          className="button destructive"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onConfirm();
            } catch (e) {
              setError(e.message);
              setBusy(false);
            }
          }}
        >
          {busy ? "Procesando…" : action}
        </button>
      </div>
    </Modal>
  );
}
export function ErrorPanel({ message, retry }) {
  return (
    <div className="error-panel" role="alert">
      <Icon name="alert" />
      <div>
        <strong>No pudimos cargar los datos</strong>
        <p>{message}</p>
      </div>
      <button className="button secondary" onClick={retry}>
        Reintentar
      </button>
    </div>
  );
}
