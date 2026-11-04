import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, DataProvider, ToastProvider } from "./lib/Providers";
import { useAuth } from "./lib/context";
import { ErrorPanel, Loading } from "./components/ui/Shared";
import Shell from "./components/Shell";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Entities from "./pages/Entities";
import Kardex from "./pages/Kardex";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import "./App.css";
function Protected() {
  const { user } = useAuth();
  return user ? (
    <DataProvider key={user.id}>
      <Shell />
    </DataProvider>
  ) : (
    <Navigate to="/login" replace />
  );
}
function AppRoutes() {
  const { loading, error, retry } = useAuth();
  if (loading)
    return (
      <div className="boot">
        <Loading />
      </div>
    );
  if (error)
    return (
      <div className="boot">
        <ErrorPanel message={error} retry={retry} />
      </div>
    );
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected />}>
        <Route index element={<Dashboard />} />
        <Route path="productos" element={<Products />} />
        <Route
          path="categorias"
          element={<Entities key="categorias" kind="categorias" />}
        />
        <Route
          path="proveedores"
          element={<Entities key="proveedores" kind="proveedores" />}
        />
        <Route
          path="usuarios"
          element={<Entities key="usuarios" kind="usuarios" />}
        />
        <Route path="kardex" element={<Kardex />} />
        <Route path="alertas" element={<Alerts />} />
        <Route path="reportes" element={<Reports />} />
        <Route path="configuracion" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
