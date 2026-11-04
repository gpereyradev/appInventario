import { useData, money, count, downloadCSV, useToast } from "../lib/context";
import { PageHeader } from "../components/ui/Shared";
import Icon from "../components/ui/Icon";
import ActivityChart from "../components/ActivityChart";
export default function Reports() {
  const { data } = useData();
  const notify = useToast();
  const s = data.dashboard;
  const active = data.productos.filter((p) => p.activo);
  const retailCents = active.reduce(
    (n, p) => n + Math.round(Number(p.precio) * 100) * p.stock,
    0,
  );
  const costCents = Math.round(s.valor_inventario * 100);
  const exportRows = () => {
    downloadCSV(
      "inventra-valorizacion.csv",
      [
        "SKU",
        "Producto",
        "Categoría",
        "Unidades",
        "Costo unitario PEN",
        "Valor al costo PEN",
        "Precio venta PEN",
        "Valor de venta PEN",
      ],
      active.map((p) => [
        p.sku,
        p.nombre,
        p.categoria.nombre,
        p.stock,
        p.costo,
        ((Math.round(Number(p.costo) * 100) * p.stock) / 100).toFixed(2),
        p.precio,
        ((Math.round(Number(p.precio) * 100) * p.stock) / 100).toFixed(2),
      ]),
    );
    notify("Reporte de valorización exportado.");
  };
  return (
    <>
      <PageHeader
        title="Reportes"
        description="Convierte las cifras del almacén en mejores decisiones."
      >
        <button className="button secondary" onClick={exportRows}>
          <Icon name="download" size={17} /> Exportar valorización
        </button>
        <button className="button primary" onClick={() => window.print()}>
          <Icon name="chart" size={17} /> Imprimir reporte
        </button>
      </PageHeader>
      <section className="kpi-strip three">
        <div className="kpi lead">
          <span>Valor al costo</span>
          <strong>{money(costCents / 100)}</strong>
          <small>{count(s.total_unidades)} unidades activas</small>
        </div>
        <div className="kpi">
          <span>Valor de venta potencial</span>
          <strong>{money(retailCents / 100)}</strong>
          <small>Al precio actual de cada artículo</small>
        </div>
        <div className="kpi">
          <span>Margen bruto potencial</span>
          <strong>{money((retailCents - costCents) / 100)}</strong>
          <small>Venta potencial menos costo; sin gastos</small>
        </div>
      </section>
      <div className="report-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Actividad de los últimos 7 días</h2>
              <p>Unidades que ingresaron o salieron del almacén</p>
            </div>
          </div>
          <ActivityChart activity={s.actividad} />
        </section>
        <section className="panel report-health">
          <div className="panel-header">
            <h2>Salud del inventario</h2>
          </div>
          <dl className="health-list">
            <div>
              <dt>Productos con stock suficiente</dt>
              <dd>{s.total_productos - s.bajo_stock.length}</dd>
            </div>
            <div>
              <dt>Productos con stock bajo</dt>
              <dd>{s.bajo_stock.length - s.agotados}</dd>
            </div>
            <div>
              <dt>Productos agotados</dt>
              <dd className={s.agotados ? "danger-text" : ""}>{s.agotados}</dd>
            </div>
            <div>
              <dt>Movimientos registrados</dt>
              <dd>{count(s.total_movimientos)}</dd>
            </div>
          </dl>
        </section>
      </div>
      <section className="panel valuation-panel">
        <div className="panel-header">
          <div>
            <h2>Valorización por categoría</h2>
            <p>Solo productos activos · Importes en soles</p>
          </div>
          <span className="muted">Inventario actual</span>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th className="numeric">Productos</th>
                <th className="numeric">Unidades</th>
                <th className="numeric">Valor al costo</th>
                <th className="numeric">Participación del valor</th>
              </tr>
            </thead>
            <tbody>
              {s.por_categoria.map((c) => (
                <tr key={c.nombre}>
                  <td>
                    <strong>{c.nombre}</strong>
                  </td>
                  <td className="numeric">{c.productos}</td>
                  <td className="numeric">{count(c.unidades)}</td>
                  <td className="numeric">{money(c.valor)}</td>
                  <td className="numeric">
                    {costCents
                      ? ((c.valor_centimos / costCents) * 100).toFixed(1)
                      : "0.0"}
                    %
                  </td>
                </tr>
              ))}
              <tr className="total-row">
                <td>Total</td>
                <td className="numeric">{s.total_productos}</td>
                <td className="numeric">{count(s.total_unidades)}</td>
                <td className="numeric">{money(costCents / 100)}</td>
                <td className="numeric">{costCents ? "100.0" : "0.0"}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <p className="table-hint">
        <Icon name="chart" size={15} /> La valorización usa el costo unitario
        actual. El margen es potencial y no representa ventas realizadas.
      </p>
    </>
  );
}
