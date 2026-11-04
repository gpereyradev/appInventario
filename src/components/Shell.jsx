import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth, useData, useToast, initials } from "../lib/context";
import { errorMessage } from "../lib/api";
import Brand from "./ui/Brand";
import Icon from "./ui/Icon";
import { ErrorPanel, Loading } from "./ui/Shared";
const operations = [
  ["/", "grid", "Resumen"],
  ["/productos", "box", "Productos"],
  ["/categorias", "folder", "Categorías"],
  ["/proveedores", "truck", "Proveedores"],
  ["/kardex", "arrows", "Kardex"],
];
const railLinks = [
  ["/", "grid", "Resumen"],
  ["/productos", "box", "Productos"],
  ["/kardex", "arrows", "Kardex"],
  ["/reportes", "chart", "Reportes"],
];
export default function Shell() {
  const { user, logout } = useAuth();
  const { data, error, refresh, refreshing } = useData();
  const notify = useToast();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef(null);
  const menuRef = useRef(null);
  const [mobile, setMobile] = useState(
    () => window.matchMedia("(max-width: 767px)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = (event) => setMobile(event.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("inventra-theme-v2") || "dark",
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("inventra-theme-v2", theme);
  }, [theme]);
  useEffect(() => {
    if (!open || !mobile) return;
    const focusable = () => [
      ...sidebarRef.current.querySelectorAll("a[href], button:not([disabled])"),
    ];
    const menuButton = menuRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    focusable()[0]?.focus();
    const handleKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
      if (e.key === "Tab") {
        const nodes = focusable();
        const first = nodes[0];
        const last = nodes.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      menuButton?.focus();
    };
  }, [open, mobile]);
  const management = [
    ["/alertas", "alert", "Alertas de stock"],
    ["/reportes", "chart", "Reportes"],
    ...(user.rol === "Administrador"
      ? [["/usuarios", "users", "Usuarios"]]
      : []),
  ];
  const label =
    [
      ...operations,
      ...management,
      ["/configuracion", "settings", "Configuración"],
    ].find((n) => n[0] === location.pathname)?.[2] || "Inventra";
  const navLink = ([url, icon, text]) => (
    <NavLink
      key={url}
      to={url}
      end={url === "/"}
      className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
      onClick={() => setOpen(false)}
    >
      <Icon name={icon} size={18} />
      <span>{text}</span>
      {url === "/alertas" && data?.dashboard.bajo_stock.length > 0 && (
        <span className="nav-count">{data.dashboard.bajo_stock.length}</span>
      )}
    </NavLink>
  );
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Saltar al contenido
      </a>
      <aside className="app-rail" aria-label="Accesos rápidos">
        <NavLink to="/" className="rail-brand" aria-label="Inventra, inicio">
          <Brand compact />
        </NavLink>
        <nav>
          {railLinks.map(([url, icon, text]) => (
            <NavLink
              key={url}
              to={url}
              end={url === "/"}
              title={text}
              aria-label={`Ir a ${text.toLowerCase()}`}
              className={({ isActive }) =>
                `rail-link ${isActive ? "active" : ""}`
              }
            >
              <Icon name={icon} size={19} />
            </NavLink>
          ))}
        </nav>
        <div className="rail-bottom">
          <NavLink
            to="/configuracion"
            className="rail-link"
            title="Configuración"
            aria-label="Ir a configuración"
          >
            <Icon name="settings" size={19} />
          </NavLink>
          <span className="avatar small">{initials(user.nombre)}</span>
        </div>
      </aside>
      {open && (
        <button
          className="nav-scrim"
          aria-label="Cerrar menú de navegación"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        ref={sidebarRef}
        className={`sidebar ${open ? "is-open" : ""}`}
        aria-label="Navegación principal"
        inert={mobile && !open}
      >
        <div className="sidebar-brand">
          <NavLink to="/" aria-label="Inventra, resumen">
            <Brand wordOnly />
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
          <span className="workspace-monogram">
            <Icon name="box" size={18} />
          </span>
          <div>
            <strong>Mi almacén</strong>
            <span>Espacio de trabajo</span>
          </div>
          <Icon name="lock" size={13} />
        </div>
        <nav>
          <span className="nav-group">Inventario</span>
          {operations.map(navLink)}
          <span className="nav-group">Administración</span>
          {management.map(navLink)}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <Icon name="shield" size={18} />
            <span>
              <strong>Todo queda registrado.</strong>
              <small>Tu Kardex cuida cada movimiento.</small>
            </span>
          </div>
          {navLink(["/configuracion", "settings", "Configuración"])}
          <div className="sidebar-profile">
            <span className="avatar">{initials(user.nombre)}</span>
            <div>
              <strong>{user.nombre}</strong>
              <small>{user.rol}</small>
            </div>
            <button
              className="icon-button"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
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
              ref={menuRef}
              className="icon-button mobile-menu"
              aria-label="Abrir menú"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Icon name="menu" />
            </button>
            <span className="mobile-brand">
              <Brand compact />
            </span>
            <span>Mi almacén</span>
            <Icon name="right" size={12} />
            <strong>{label}</strong>
          </div>
          <div className="topbar-actions">
            <span className={`mini-status ${error ? "connection-error" : ""}`}>
              <span />
              {error ? "Revisar conexión" : "Sesión activa"}
            </span>
            <button
              className="icon-button"
              aria-label="Actualizar datos"
              title="Actualizar datos"
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
                theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"
              }
              title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
              onClick={toggleTheme}
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
            </button>
            <NavLink
              to="/configuracion"
              className="topbar-account"
              aria-label="Abrir mi perfil"
            >
              <span className="avatar small">{initials(user.nombre)}</span>
              <span>{user.nombre.split(" ")[0]}</span>
              <Icon name="down" size={13} />
            </NavLink>
          </div>
        </header>
        <main id="main" className="content-sheet">
          {error && <ErrorPanel message={error} retry={refresh} />}{" "}
          {!data ? !error && <Loading /> : <Outlet />}
          <footer className="app-footer">
            <span>
              Inventra <span className="footer-slash">/</span> Cada unidad
              cuenta.
            </span>
            <span>PEN · America/Lima</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
