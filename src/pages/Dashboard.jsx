import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth, useData, count, money, date, time } from "../lib/context";
import { Badge, Empty, PageHeader } from "../components/ui/Shared";
import Icon from "../components/ui/Icon";
import ActivityChart from "../components/ActivityChart";
import MovementForm from "../components/MovementForm";
import { MovementBadge } from "./Kardex";
export default function Dashboard() {
  const { data } = useData();
  const { user } = useAuth();
  const [create, setCreate] = useState(false);
  const s = data.dashboard;
  const max = Math.max(1, ...s.por_categoria.map((c) => c.unidades));
  return (
    <>
      <PageHeader
        title="Resumen del almacén"
        description={
          s.bajo_stock.length
            ? `${s.bajo_stock.length} productos necesitan reposición. Revisa lo importante hoy.`
            : "Todo está en orden. Tu almacén, de un vistazo."
        }
      >
        {user.rol !== "Supervisor" && (
          <button className="button primary" onClick={() => setCreate(true)}>
            <Icon name="plus" size={18} /> Registrar movimiento
          </button>
        )}
      </PageHeader>
      <div className="overview-scope">
        <span className="section-tab">Vista general</span>
        <span>
          <Icon name="grid" size={15} />
          {new Intl.DateTimeFormat("es-PE", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "America/Lima",
          }).format(new Date())}
        </span>
      </div>
      <section className="kpi-strip" aria-label="Indicadores del almacén">
        <div className="kpi lead">
          <span>Valor del inventario</span>
          <strong>{money(s.valor_inventario)}</strong>
          <small>Valorizado al costo de compra</small>
        </div>
        <div className="kpi">
          <span>Productos activos</span>
          <strong>{count(s.total_productos)}</strong>
          <small>{count(s.total_unidades)} unidades disponibles</small>
        </div>
        <div className="kpi">
          <span>Por reponer</span>
          <strong className={s.bajo_stock.length ? "attention" : ""}>
            {count(s.bajo_stock.length)}
          </strong>
          <small>{s.agotados} sin stock disponible</small>
        </div>
        <div className="kpi">
          <span>Proveedores</span>
          <strong>{count(s.total_proveedores)}</strong>
          <small>{count(s.total_categorias)} categorías en catálogo</small>
        </div>
      </section>
      <div className="dashboard-grid">
        <section className="panel activity-panel">
          <div className="panel-header">
            <div>
              <h2>Movimiento del almacén</h2>
              <p>Entradas y salidas de los últimos 7 días</p>
            </div>
            <Link className="text-link" to="reportes">
              Ver reportes <Icon name="right" size={15} />
            </Link>
          </div>
          <ActivityChart activity={s.actividad} />
        </section>
        <section className="panel replenish-panel">
          <div className="panel-header">
            <h2>Atención al stock</h2>
            <Badge kind={s.bajo_stock.length ? "warning" : "positive"}>
              {s.bajo_stock.length ? "Por reponer" : "En orden"}
            </Badge>
          </div>
          {s.bajo_stock.length ? (
            <div className="replenish-list">
              {s.bajo_stock.slice(0, 3).map((p) => (
                <Link key={p.id} to="alertas">
                  <div>
                    <strong>{p.nombre}</strong>
                    <small>
                      {p.sku} · Mínimo {p.stock_minimo}
                    </small>
                  </div>
                  <span className={!p.stock ? "danger-text" : "attention"}>
                    {p.stock}
                    <small>unid.</small>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <Empty
              title="Stock saludable"
              description="Todos los productos están sobre su mínimo."
            />
          )}
          <Link className="panel-footer-link" to="alertas">
            Ver alertas de stock <Icon name="arrow" size={16} />
          </Link>
        </section>
        <section className="panel recent-panel">
          <div className="panel-header">
            <div>
              <h2>Últimos movimientos</h2>
              <p>El registro de lo que acaba de pasar</p>
            </div>
            <Link className="text-link" to="kardex">
              Ver Kardex <Icon name="right" size={15} />
            </Link>
          </div>
          {!s.movimientos_recientes.length ? (
            <Empty
              title="Tu Kardex empieza aquí"
              description="Registra el primer movimiento de tu almacén."
            />
          ) : (
            <div className="table-scroll">
              <table className="data-table compact-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Movimiento</th>
                    <th className="numeric">Cantidad</th>
                    <th className="numeric">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {s.movimientos_recientes.slice(0, 4).map((m) => (
                    <tr key={m.id}>
                      <td>
                        <strong>{m.producto.nombre}</strong>
                        <small>{m.producto.sku}</small>
                      </td>
                      <td>
                        <MovementBadge movement={m} />
                      </td>
                      <td
                        className={`numeric ${m.cantidad > 0 ? "positive-text" : ""}`}
                      >
                        {m.cantidad > 0 ? "+" : "−"}
                        {Math.abs(m.cantidad)}
                      </td>
                      <td className="numeric nowrap">
                        <span>{date(m.fecha_hora)}</span>
                        <small>{time(m.fecha_hora)}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section className="panel category-panel">
          <div className="panel-header">
            <div>
              <h2>Stock por categoría</h2>
              <p>Distribución en unidades</p>
            </div>
            <Link
              to="categorias"
              className="icon-button"
              aria-label="Ver categorías"
            >
              <Icon name="right" size={17} />
            </Link>
          </div>
          {s.por_categoria.length ? (
            <div className="category-bars">
              {s.por_categoria.slice(0, 6).map((c) => (
                <div key={c.nombre}>
                  <div className="bar-label">
                    <span>{c.nombre}</span>
                    <strong>{count(c.unidades)}</strong>
                  </div>
                  <div className="bar-track">
                    <span style={{ width: `${(c.unidades / max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title="Sin categorías con stock"
              description="Agrega productos para ver su distribución."
            />
          )}
        </section>
      </div>
      <div className="workspace-note">
        <Icon name="shield" size={18} />
        <div>
          <strong>Cada unidad tiene una historia.</strong>
          <span>
            {" "}
            Entradas, salidas y ajustes quedan vinculados a su responsable.
          </span>
        </div>
        <Link to="kardex">
          Explorar Kardex <Icon name="arrow" size={16} />
        </Link>
      </div>
      {create && <MovementForm onClose={() => setCreate(false)} />}
    </>
  );
}
