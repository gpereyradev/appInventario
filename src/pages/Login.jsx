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
      <header className="login-nav">
        <Brand />
        <span className="login-nav-label">Un lugar. Todo tu inventario.</span>
        <span className="login-nav-status">
          <span /> Listo para trabajar
        </span>
      </header>
      <main className="login-layout">
        <section className="login-story">
          <div className="login-story-copy">
            <span className="outline-title" aria-hidden="true">
              Inventario.
            </span>
            <h2>
              Todo conectado.
              <br />
              Todo en orden.
            </h2>
            <p>
              Productos, personas y movimientos.
              <br />
              El control de tu almacén empieza aquí.
            </p>
            <div className="login-feature-line">
              <span>
                <Icon name="box" size={16} /> Organiza
              </span>
              <span>
                <Icon name="arrows" size={16} /> Controla
              </span>
              <span>
                <Icon name="chart" size={16} /> Decide
              </span>
            </div>
          </div>
          <div className="login-signature">
            <span className="signature-symbol">
              <Icon name="arrows" size={26} />
            </span>
            <div>
              De la primera entrada
              <br />
              <strong>al último movimiento.</strong>
            </div>
          </div>
        </section>
        <section className="login-scene" aria-label="Inicio de sesión">
          <svg
            className="login-orbits"
            viewBox="0 0 1000 1000"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="510"
              cy="510"
              r="445"
              stroke="currentColor"
              strokeWidth="35"
            />
            <circle
              cx="510"
              cy="510"
              r="351"
              stroke="currentColor"
              strokeWidth="35"
            />
            <circle
              cx="510"
              cy="510"
              r="258"
              stroke="currentColor"
              strokeWidth="35"
            />
          </svg>
          <div className="login-form-window">
            <div className="window-toolbar">
              <div className="window-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <span>Mi espacio de trabajo</span>
              <Icon name="lock" size={14} />
            </div>
            <div className="login-form-wrap">
              <div className="login-heading">
                <span className="login-welcome">Bienvenido a Inventra</span>
                <h1>Accede a tu almacén.</h1>
                <p>Ingresa tus datos para continuar.</p>
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
                  <Icon name="shield" size={14} /> Acceso seguro para tu equipo.
                </p>
              </form>
              <div className="login-support">
                <strong>¿Necesitas una cuenta?</strong>
                <p>Solicita acceso al administrador de tu almacén.</p>
              </div>
            </div>
          </div>
          <aside className="trace-preview">
            <div>
              <span className="trace-signal" />
              <strong>Trazabilidad completa</strong>
              <Icon name="check" size={16} />
            </div>
            <p>
              Un producto. Cada movimiento.
              <br />
              Una historia que siempre puedes consultar.
            </p>
            <div className="trace-tags">
              <span>
                Entrada <Icon name="in" size={13} />
              </span>
              <span>
                Salida <Icon name="out" size={13} />
              </span>
              <span>
                Ajuste <Icon name="arrows" size={13} />
              </span>
            </div>
          </aside>
        </section>
      </main>
      <footer className="login-footer">
        <span>Inventra · Gestión de inventario</span>
        <span>Diseñado para tenerlo claro.</span>
        <span>Por Guillermo Pereyra</span>
      </footer>
    </div>
  );
}
