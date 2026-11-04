import { useState } from "react";
import api, { errorMessage } from "../lib/api";
import { useAuth, useToast } from "../lib/context";
import { Badge, Field, PageHeader } from "../components/ui/Shared";
import Icon from "../components/ui/Icon";
export default function Settings() {
  const { user, setUser } = useAuth();
  const notify = useToast();
  const [name, setName] = useState(user.nombre);
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.put("/auth/profile", {
        nombre: name,
        current_password: current,
        password,
      });
      setUser(data);
      setCurrent("");
      setPassword("");
      setConfirm("");
      notify("Perfil actualizado.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        title="Configuración"
        description="Tu perfil y las preferencias de tu espacio de trabajo."
      />
      <section className="settings-row">
        <div>
          <h2>Mi cuenta</h2>
          <p>Actualiza tu nombre y protege el acceso a tu almacén.</p>
          <Badge kind="neutral">{user.rol}</Badge>
        </div>
        <form className="settings-form" onSubmit={save}>
          <Field label="Nombre completo">
            <input
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field
            label="Correo electrónico"
            hint="El administrador gestiona el correo y los permisos de tu cuenta."
          >
            <input type="email" value={user.email} readOnly />
          </Field>
          <div className="form-divider" />
          <h3>Cambiar contraseña</h3>
          <p className="muted">
            Completa estos campos solo si deseas cambiarla.
          </p>
          <Field label="Contraseña actual">
            <input
              type="password"
              autoComplete="current-password"
              value={current}
              required={!!password}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </Field>
          <div className="form-grid">
            <Field label="Nueva contraseña" hint="Mínimo 8 caracteres.">
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Field label="Confirmar nueva contraseña">
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                required={!!password}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </Field>
          </div>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <div className="settings-save">
            <button className="button primary" disabled={busy}>
              {busy ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </section>
      <section className="settings-row">
        <div>
          <h2>Acerca de Inventra</h2>
          <p>Un sistema construido para dar seguimiento a cada unidad.</p>
        </div>
        <div className="about-panel">
          <div>
            <Icon name="box" />
            <strong>Inventra · Gestión de inventario</strong>
          </div>
          <dl className="details">
            <dt>Moneda</dt>
            <dd>Sol peruano (PEN)</dd>
            <dt>Zona horaria</dt>
            <dd>America/Lima</dd>
            <dt>Control del stock</dt>
            <dd>Kardex transaccional</dd>
            <dt>Proyecto</dt>
            <dd>Laboratorio 9 · Fullstack SENATI</dd>
            <dt>Desarrollado por</dt>
            <dd>Guillermo Pereyra</dd>
          </dl>
        </div>
      </section>
    </>
  );
}
