import { createContext, useContext } from "react";
export const AuthContext = createContext(null);
export const DataContext = createContext(null);
export const ToastContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
export const useData = () => useContext(DataContext);
export const useToast = () => useContext(ToastContext);
export const money = (value) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    Number(value || 0),
  );
export const count = (value) =>
  new Intl.NumberFormat("es-PE").format(Number(value || 0));
export const date = (value) =>
  new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeZone: "America/Lima",
  }).format(new Date(value));
export const time = (value) =>
  new Intl.DateTimeFormat("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Lima",
  }).format(new Date(value));
export const initials = (value) =>
  (value || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
export const stockStatus = (p) =>
  !p.activo
    ? ["neutral", "Inactivo"]
    : p.stock === 0
      ? ["danger", "Agotado"]
      : p.stock <= p.stock_minimo
        ? ["warning", "Stock bajo"]
        : ["positive", "Disponible"];
export function downloadCSV(filename, headers, rows) {
  const escape = (value) => {
    let v = String(value ?? "");
    if (/^[\s]*[=+\-@\t\r]/.test(v)) v = "'" + v;
    return '"' + v.replaceAll('"', '""') + '"';
  };
  const blob = new Blob(
    [
      "\uFEFF" +
        [headers, ...rows].map((row) => row.map(escape).join(",")).join("\r\n"),
    ],
    { type: "text/csv;charset=utf-8;" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
