import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth, useData, money, downloadCSV, useToast } from "../lib/context";
import { Badge, Empty, PageHeader, Search } from "../components/ui/Shared";
import Icon from "../components/ui/Icon";
import MovementForm from "../components/MovementForm";
export default function Alerts() {
  const { data } = useData();
  const { user } = useAuth();
  const notify = useToast();
  const [movement, setMovement] = useState(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("todos");
  const low = data.dashboard.bajo_stock;
  const rows = low.filter(
    (p) =>
      (tab !== "agotados" || !p.stock) &&
      `${p.nombre} ${p.sku} ${p.proveedor.razon_social}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const target = (p) => Math.max(1, p.stock_minimo * 2 - p.stock);
  const total =
    low.reduce((n, p) => n + Math.round(Number(p.costo) * 100) * target(p), 0) /
    100;
  const exportRows = () => {
    downloadCSV(
      "inventra-reposicion.csv",
      [
        "SKU",
        "Producto",
        "Proveedor",
        "Correo proveedor",
        "Stock actual",
        "Stock mínimo",
        "Reposición sugerida",
        "Costo estimado PEN",
      ],
      rows.map((p) => [
        p.sku,
        p.nombre,
        p.proveedor.razon_social,
        p.proveedor.email,
        p.stock,
        p.stock_minimo,
        target(p),
        ((Math.round(Number(p.costo) * 100) * target(p)) / 100).toFixed(2),
      ]),
    );
    notify("Lista de reposición exportada.");
  };
  return (
    <>
      <PageHeader
        title="Alertas de stock"
        description="Repón a tiempo y mantén tu almacén en movimiento."
      >
        <button className="button secondary" onClick={exportRows}>
          <Icon name="download" size={17} /> Exportar reposición
        </button>
      </PageHeader>
      <section className="kpi-strip three">
        <div className="kpi">
          <span>Necesitan reposición</span>
          <strong>{low.length}</strong>
          <small>Stock igual o menor al mínimo</small>
        </div>
        <div className="kpi">
          <span>Productos agotados</span>
          <strong className={data.dashboard.agotados ? "danger-text" : ""}>
            {data.dashboard.agotados}
          </strong>
          <small>Sin unidades disponibles</small>
        </div>
        <div className="kpi">
          <span>Reposición estimada</span>
          <strong>{money(total)}</strong>
          <small>Objetivo: el doble del stock mínimo</small>
        </div>
      </section>
      <div className="tabs" role="group" aria-label="Nivel de alerta">
        {[
          ["todos", "Todas las alertas"],
          ["agotados", "Agotados"],
        ].map(([key, label]) => (
          <button
            key={key}
            aria-pressed={tab === key}
            className={tab === key ? "selected" : ""}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="table-toolbar">
        <Search
          value={search}
          onChange={setSearch}
          placeholder="Buscar producto o proveedor…"
        />
        <span className="muted">{rows.length} productos por revisar</span>
      </div>
      {!rows.length ? (
        <Empty
          title={
            low.length ? "No encontramos coincidencias" : "Todo está en orden"
          }
          description={
            low.length
              ? "Prueba otro nombre o filtro."
              : "Tus productos tienen stock suficiente. Las nuevas alertas aparecerán aquí."
          }
        />
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Proveedor</th>
                <th>Estado</th>
                <th className="numeric">Stock / mínimo</th>
                <th className="numeric">Sugerencia</th>
                <th className="actions-heading">Acción</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.nombre}</strong>
                    <small>{p.sku}</small>
                  </td>
                  <td>
                    <span>{p.proveedor.razon_social}</span>
                    <small>{p.proveedor.telefono || "Sin teléfono"}</small>
                  </td>
                  <td>
                    <Badge kind={!p.stock ? "danger" : "warning"}>
                      {!p.stock ? "Agotado" : "Stock bajo"}
                    </Badge>
                  </td>
                  <td className="numeric">
                    <strong>{p.stock}</strong>
                    <span className="muted"> / {p.stock_minimo}</span>
                  </td>
                  <td className="numeric">
                    +{target(p)}{" "}
                    <small>
                      {money(
                        (Math.round(Number(p.costo) * 100) * target(p)) / 100,
                      )}
                    </small>
                  </td>
                  <td>
                    {user.rol !== "Supervisor" ? (
                      <button
                        className="button secondary compact"
                        onClick={() => setMovement(p)}
                      >
                        <Icon name="in" size={16} /> Reponer
                      </button>
                    ) : (
                      <Link to="/productos" className="text-link">
                        Ver catálogo
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="table-hint">
        <Icon name="alert" size={15} /> La reposición es una sugerencia al costo
        actual; no envía pedidos ni avisos externos.
      </p>
      {movement && (
        <MovementForm
          productId={movement.id}
          onClose={() => setMovement(null)}
        />
      )}
    </>
  );
}
