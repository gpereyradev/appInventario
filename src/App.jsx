import {
  BrowserRouter as Router,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Login from "./components/Login/Login";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import CrudProductos from "./assets/components/Productos/crudProductos";
import Icon from "./components/UI/Icon";
import "./App.css";

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const esPanel = location.pathname === "/productos" && token;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  return (
    <nav
      className={
        esPanel ? "navigation navigation-panel" : "navigation navigation-login"
      }
      aria-label="Navegación principal"
    >
      <div className="navigation-top">
        <NavLink
          className="brand"
          to={esPanel ? "/productos" : "/"}
          aria-label="SENATI Inventario, inicio"
        >
          <span className="brand-symbol">
            <Icon name="box" size={24} />
          </span>
          <span>
            <strong>
              inventario<span className="brand-period">.</span>
            </strong>
            <small>SENATI · GESTIÓN DE PRODUCTOS</small>
          </span>
        </NavLink>
        {esPanel && <span className="workspace-label">ESPACIO DE TRABAJO</span>}
        {esPanel && (
          <NavLink to="/productos" className="sidebar-link">
            <Icon name="box" size={20} />
            <span>Productos</span>
            <span className="nav-dot" />
          </NavLink>
        )}
      </div>
      {esPanel ? (
        <div className="navigation-bottom">
          <span className="session-label">
            <span /> Sesión activa
          </span>
          <button className="logout-button" onClick={handleLogout}>
            <Icon name="logout" size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      ) : (
        <span className="navigation-caption">
          <span /> Simple. Claro. Organizado.
        </span>
      )}
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/productos"
          element={
            <ProtectedRoute>
              <CrudProductos />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
