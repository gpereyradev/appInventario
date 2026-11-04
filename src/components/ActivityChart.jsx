import { useEffect, useRef, useState } from "react";
import "../lib/charts";
export default function ActivityChart({ activity }) {
  const ref = useRef(null);
  const [metric, setMetric] = useState("entradas");
  useEffect(() => {
    const el = ref.current;
    const draw = () =>
      window.Charts.bars(el, {
        labels: activity.map((d) =>
          new Date(d.fecha + "T12:00:00").toLocaleDateString("es-PE", {
            weekday: "short",
            day: "2-digit",
          }),
        ),
        values: activity.map((d) => d[metric]),
        highlight: activity.map((_, i) => i),
        format: (v) => new Intl.NumberFormat("es-PE").format(v),
      });
    draw();
    const observer = new MutationObserver(draw);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => {
      observer.disconnect();
      window.Charts.dispose(el);
    };
  }, [activity, metric]);
  return (
    <>
      <div className="chart-tabs">
        <button
          aria-pressed={metric === "entradas"}
          className={metric === "entradas" ? "selected" : ""}
          onClick={() => setMetric("entradas")}
        >
          Entradas
        </button>
        <button
          aria-pressed={metric === "salidas"}
          className={metric === "salidas" ? "selected" : ""}
          onClick={() => setMetric("salidas")}
        >
          Salidas
        </button>
        <span>Unidades / día</span>
      </div>
      <div className="activity-chart" ref={ref} />
    </>
  );
}
