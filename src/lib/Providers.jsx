import { useCallback, useEffect, useRef, useState } from "react";
import api, { errorMessage } from "./api";
import { AuthContext, DataContext, ToastContext, useAuth } from "./context";
import Icon from "../components/ui/Icon";
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const check = useCallback(
    () =>
      api
        .get("/auth/me")
        .then((response) => setUser(response.data))
        .catch((e) => {
          if (e.response?.status !== 401) setError(errorMessage(e));
        })
        .finally(() => setLoading(false)),
    [],
  );
  useEffect(() => {
    check();
    const expire = () => setUser(null);
    window.addEventListener("session-expired", expire);
    return () => window.removeEventListener("session-expired", expire);
  }, [check]);
  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data.usuario);
  };
  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        error,
        retry: () => {
          setLoading(true);
          setError("");
          check();
        },
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const notify = useCallback((message, kind = "positive") => {
    clearTimeout(timer.current);
    setToast({ message, kind });
    timer.current = setTimeout(() => setToast(null), 5000);
  }, []);
  return (
    <ToastContext.Provider value={notify}>
      {children}
      {toast && (
        <div className={`toast ${toast.kind}`} role="status">
          <Icon name={toast.kind === "danger" ? "alert" : "check"} size={19} />
          <span>{toast.message}</span>
          <button
            className="icon-button"
            aria-label="Cerrar aviso"
            onClick={() => setToast(null)}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}
export function DataProvider({ children }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(() => {
    const routes = [
      "productos",
      "categorias",
      "proveedores",
      "movimientos",
      "dashboard",
      ...(user.rol === "Administrador" ? ["usuarios"] : []),
    ];
    return Promise.all(routes.map((r) => api.get("/" + r)))
      .then((rows) => {
        setData(Object.fromEntries(routes.map((r, i) => [r, rows[i].data])));
        setError("");
        return true;
      })
      .catch((e) => {
        setError(errorMessage(e));
        return false;
      })
      .finally(() => setRefreshing(false));
  }, [user.rol]);
  useEffect(() => {
    load();
  }, [load]);
  const refresh = () => {
    setRefreshing(true);
    return load();
  };
  return (
    <DataContext.Provider value={{ data, error, refresh, refreshing }}>
      {children}
    </DataContext.Provider>
  );
}
