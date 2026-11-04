import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  timeout: 30000,
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/login")
    )
      window.dispatchEvent(new Event("session-expired"));
    return Promise.reject(error);
  },
);
export const errorMessage = (error) =>
  error.response?.data?.error ||
  (error.code === "ECONNABORTED"
    ? "La conexión está tardando. Intenta nuevamente."
    : "No se pudo conectar con el servidor.");
export default api;
