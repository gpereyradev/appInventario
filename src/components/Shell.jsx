import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth, useData, useToast, initials } from "../lib/context";
import { errorMessage } from "../lib/api";
import Brand from "./ui/Brand";
import Icon from "./ui/Icon";
import { ErrorPanel, Loading } from "./ui/Shared";
const mainNav = [
  ["/", "grid", "Resumen"],
  ["/productos", "box", "Productos"],
  ["/categorias", "folder", "Categorías"],
  ["/proveedores", "truck", "Proveedores"],
  ["/kardex", "arrows", "Kardex"],
];
export default function Shell() {
  const { user, logout } = useAuth();
  const { data, error, refresh, refreshing } = useData();
  const notify = useToast();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("inventra-theme") || "light",
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("inventra-theme", theme);
  }, [theme]);
  const nav = [
    ...mainNav,
    ["/alertas", "alert", "Alertas de stock"],
    ["/reportes", "chart", "Reportes"],
    ...(user.rol === "Administrador"
      ? [["/usuarios", "users", "Usuarios"]]
      : []),
    ["/configuracion", "settings", "Configuración"],
  ];
  const label = nav.find((n) => n[0] === location.pathname)?.[2] || "Inventra";
  const navLink = ([url, icon, text]) => (
    <NavLink
      key={url}
      to={url}
      end={url === "/"}
      className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
      onClick={() => setOpen(false)}
    >
      <Icon name={icon} size={19} />
      <span>{text}</span>
      {url === "/alertas" && data?.dashboard.bajo_stock.length > 0 && (
        <span className="nav-count">{data.dashboard.bajo_stock.length}</span>
      )}
    </NavLink>
  );
  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Saltar al contenido
      </a>
      {open && (
        <button
          className="nav-scrim"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`sidebar ${open ? "is-open" : ""}`}
        aria-label="Navegación principal"
      >
        <div className="sidebar-brand">
          <NavLink to="/" aria-label="Inventra, inicio">
            <Brand />
          </NavLink>
          <button
            className="icon-button mobile-close"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="workspace">
          <span className="workspace-monogram">GP</span>
          <div>
            <strong>Mi almacén</strong>
            <span>Guillermo Pereyra</span>
          </div>
          <Icon name="down" size={14} />
        </div>
        <nav>
          <span className="nav-group">Operaciones</span>
          {mainNav.map(navLink)}
          <span className="nav-group">Gestión</span>
          {nav.slice(5, -1).map(navLink)}
        </nav>
        <div className="sidebar-bottom">
          {navLink(nav.at(-1))}
          <div className="sidebar-profile">
            <span className="avatar">{initials(user.nombre)}</span>
            <div>
              <strong>{user.nombre}</strong>
              <small>{user.rol}</small>
            </div>
            <button
              className="icon-button"
              aria-label="Cerrar sesión"
              onClick={async () => {
                try {
                  await logout();
                } catch (e) {
                  notify(errorMessage(e), "danger");
                }
              }}
            >
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </aside>
      <div className="app-body">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Abrir menú"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Icon name="menu" />
            </button>
            <span>Mi almacén</span>
            <span className="crumb-slash">/</span>
            <strong>{label}</strong>
          </div>
          <div className="topbar-actions">
            <span className="mini-status">
              <span /> Almacén conectado
            </span>
            <button
              className="icon-button"
              title="Actualizar datos"
              aria-label="Actualizar datos"
              disabled={refreshing}
              onClick={refresh}
            >
              <Icon
                name="refresh"
                size={18}
                className={refreshing ? "spin" : ""}
              />
            </button>
            <button
              className="icon-button"
              aria-label={
                theme === "light" ? "Activar modo oscuro" : "Activar modo claro"
              }
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Icon name={theme === "light" ? "moon" : "sun"} size={19} />
            </button>
            <span className="avatar small">{initials(user.nombre)}</span>
          </div>
        </header>
        <main id="main" className="content-sheet">
          {error && <ErrorPanel message={error} retry={refresh} />}{" "}
          {!data ? !error && <Loading /> : <Outlet />}
          <footer className="app-footer">
            <span>Inventra · Mi almacén</span>
            <span>Valores en soles (PEN) · Hora de Lima</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
