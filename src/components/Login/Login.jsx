import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../assets/services/api";
import Icon from "../UI/Icon";

export default function Login() {
  const [credenciales, setCredenciales] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event) => {
    setCredenciales({
      ...credenciales,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const response = await api.post("/api/auth/login", credenciales);
      if (!response.data.token)
        throw new Error("El servidor no devolvió un token.");
      localStorage.setItem("token", response.data.token);
      navigate("/productos", { replace: true });
    } catch (error) {
      localStorage.removeItem("token");
      setError(
        !error.response
          ? "No pudimos conectar con el servidor. Verifica que el backend esté iniciado."
          : error.response.status === 429
            ? "Demasiados intentos. Espera unos minutos antes de volver a ingresar."
            : "Credenciales inválidas. Intente nuevamente.",
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-story" aria-labelledby="welcome-title">
        <span className="eyebrow">
          <span className="small-line" /> UN ESPACIO PARA TENERLO TODO CLARO
        </span>
        <h1 id="welcome-title">
          Tu inventario.
          <br />
          Todo bajo <span>control.</span>
        </h1>
        <p>
          Organiza tus productos, actualiza existencias y mantén cada detalle en
          su lugar.
        </p>
        <div className="inventory-art" aria-hidden="true">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-label label-top">
            <span className="art-label-icon">
              <Icon name="check" size={14} />
            </span>{" "}
            Todo en orden
          </div>
          <div className="art-package package-back">
            <span className="package-line" />
            <span className="package-sticker" />
          </div>
          <div className="art-package package-front">
            <span className="package-line" />
            <span className="package-sticker" />
            <span className="package-code">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
          </div>
          <div className="art-label label-bottom">
            <Icon name="layers" size={18} />
            <span>
              Un lugar para
              <br />
              <strong>cada producto.</strong>
            </span>
          </div>
          <span className="art-spark spark-one">✦</span>
          <span className="art-spark spark-two">✦</span>
        </div>
        <div className="story-bottom">
          <span className="story-number">01 —</span>
          <span>
            Menos desorden.
            <br />
            <strong>Más tranquilidad.</strong>
          </span>
        </div>
      </section>
      <section className="login-form-side" aria-label="Acceso al inventario">
        <div className="login-card">
          <span className="login-lock">
            <Icon name="lock" size={23} />
          </span>
          <span className="eyebrow">BIENVENIDO DE NUEVO</span>
          <h2>Iniciar sesión</h2>
          <p className="subtext">Ingresa tus credenciales para continuar.</p>
          {location.state?.mensaje && !error && (
            <div className="feedback feedback-info" role="status">
              {location.state.mensaje}
            </div>
          )}
          {error && (
            <div className="feedback feedback-error" role="alert">
              <Icon name="alert" size={18} />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="login-form">
            <label className="field-label" htmlFor="login-email">
              Correo electrónico
            </label>
            <div className="input-icon">
              <Icon name="mail" size={19} />
              <input
                id="login-email"
                type="email"
                name="email"
                value={credenciales.email}
                onChange={handleChange}
                placeholder="nombre@correo.com"
                required
                autoComplete="username"
                disabled={enviando}
              />
            </div>
            <label className="field-label" htmlFor="login-password">
              Contraseña
            </label>
            <div className="input-icon">
              <Icon name="lock" size={19} />
              <input
                id="login-password"
                type={mostrarPassword ? "text" : "password"}
                name="password"
                value={credenciales.password}
                onChange={handleChange}
                placeholder="Escribe tu contraseña"
                required
                autoComplete="current-password"
                disabled={enviando}
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                aria-label={
                  mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                aria-pressed={mostrarPassword}
              >
                <Icon name="eye" size={19} />
              </button>
            </div>
            <button
              className="button button-primary login-submit"
              disabled={enviando}
            >
              {enviando ? "Ingresando…" : "Ingresar al inventario"}
              {enviando ? (
                <span className="spinner" />
              ) : (
                <Icon name="arrow" size={19} />
              )}
            </button>
          </form>
          <div className="login-security">
            <Icon name="lock" size={14} />
            <span>Acceso exclusivo para usuarios registrados.</span>
          </div>
        </div>
        <p className="login-footnote">Un buen día empieza con todo en orden.</p>
      </section>
    </main>
  );
}
