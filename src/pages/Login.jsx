import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/context";
import { errorMessage } from "../lib/api";
import Brand from "../components/ui/Brand";
import Icon from "../components/ui/Icon";
import { Field } from "../components/ui/Shared";
export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (user) return <Navigate to="/" replace />;
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-page">
      <section className="login-story">
        <Brand />
        <div className="login-visual" aria-hidden="true">
          <svg viewBox="0 0 600 390" fill="none">
            <path
              d="m85 240 215 118 215-118-215-119L85 240Z"
              className="visual-base"
            />
            <path
              d="M85 240v16l215 119 215-119v-16M300 358v17"
              className="visual-edge"
            />
            <g className="visual-box box-one">
              <path
                d="m157 180 89 49 89-49-89-49-89 49Z"
                fill="var(--box-top)"
              />
              <path d="m157 180 89 49v88l-89-49v-88Z" fill="var(--box-left)" />
              <path d="m246 229 89-49v88l-89 49v-88Z" fill="var(--box-right)" />
              <path
                d="m200 156 89 49v34"
                stroke="var(--box-tape)"
                strokeWidth="15"
              />
              <path
                d="m171 240 34 19m-34-7 20 11"
                stroke="var(--box-tape)"
                strokeWidth="3"
              />
            </g>
            <g className="visual-box">
              <path
                d="m310 156 65 36 65-36-65-36-65 36Z"
                fill="var(--box-top)"
              />
              <path d="m310 156 65 36v65l-65-36v-65Z" fill="var(--box-left)" />
              <path d="m375 192 65-36v65l-65 36v-65Z" fill="var(--box-right)" />
              <path
                d="m343 138 65 36v26"
                stroke="var(--box-tape)"
                strokeWidth="11"
              />
            </g>
            <g>
              <path
                d="m220 81 65 36 65-36-65-36-65 36Z"
                fill="var(--box-top)"
              />
              <path d="m220 81 65 36v65l-65-36V81Z" fill="var(--box-left)" />
              <path d="m285 117 65-36v65l-65 36v-65Z" fill="var(--box-right)" />
              <path
                d="m253 63 65 36v26"
                stroke="var(--box-tape)"
                strokeWidth="11"
              />
              <path
                d="m232 129 21 12"
                stroke="var(--box-tape)"
                strokeWidth="3"
              />
            </g>
            <path
              d="M129 183v-55l40-22M440 277l43-24v-35M274 27l20-11 21 11"
              stroke="var(--visual-line)"
              strokeWidth="2"
            />
          </svg>
          <div className="visual-label label-top">
            <span className="status-dot" /> Todo en su lugar
          </div>
          <div className="visual-label label-bottom">
            <Icon name="check" size={16} /> Inventario bajo control
          </div>
        </div>
        <div className="story-copy">
          <span className="story-index">Menos desorden. Más control.</span>
          <h2>
            Tu inventario,
            <br />
            con todo en orden.
          </h2>
          <p>
            Del primer producto al último movimiento.
            <br />
            Un solo lugar para gestionar tu almacén.
          </p>
        </div>
        <div className="story-footer">
          <span>Hecho para trabajar mejor.</span>
          <span>Inventario · Kardex · Reportes</span>
        </div>
      </section>
      <main className="login-main">
        <div className="login-top">
          <span>Gestión de inventario</span>
          <span className="mini-status">
            <span /> Acceso seguro
          </span>
        </div>
        <div className="login-form-wrap">
          <div className="login-heading">
            <span className="login-welcome">Tu espacio de trabajo</span>
            <h1>Todo empieza aquí.</h1>
            <p>Ingresa a tu cuenta y retoma el control.</p>
          </div>
          <form onSubmit={submit}>
            <Field label="Correo electrónico">
              <input
                type="email"
                autoComplete="username"
                placeholder="nombre@correo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={254}
              />
            </Field>
            <Field label="Contraseña">
              <div className="password-field">
                <input
                  type={visible ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  aria-label={
                    visible ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  aria-pressed={visible}
                  className="icon-button"
                  onClick={() => setVisible(!visible)}
                >
                  <Icon name="eye" size={19} />
                </button>
              </div>
            </Field>
            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}
            <button className="button primary login-submit" disabled={busy}>
              {busy ? (
                <>
                  <span className="spinner" /> Ingresando…
                </>
              ) : (
                <>
                  Iniciar sesión <Icon name="arrow" size={19} />
                </>
              )}
            </button>
            <p className="login-help">
              <Icon name="lock" size={14} /> Solo el personal autorizado puede
              ingresar.
            </p>
          </form>
          <div className="login-support">
            <strong>¿Necesitas acceso?</strong>
            <p>Solicita una cuenta al administrador de tu almacén.</p>
          </div>
        </div>
        <footer className="login-footer">
          <span>Inventra · Gestión que conecta.</span>
          <span>Por Guillermo Pereyra</span>
        </footer>
      </main>
    </div>
  );
}
