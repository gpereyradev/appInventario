import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Icon from "../../../components/UI/Icon";

const formularioVacio = {
  id: null,
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "",
};
const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});
const moneda = (valor) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    Number(valor),
  );

export default function CrudProductos() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(formularioVacio);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let activo = true;
    api
      .get("/api/productos", getHeaders())
      .then((response) => {
        if (activo) setProductos(response.data);
      })
      .catch((error) => {
        if (!activo) return;
        if ([401, 403].includes(error.response?.status)) {
          localStorage.removeItem("token");
          navigate("/", {
            replace: true,
            state: {
              mensaje:
                "Tu sesión no es válida o ha expirado. Inicia sesión nuevamente.",
            },
          });
        } else {
          setError(
            "No pudimos cargar los productos. Verifica la conexión con el backend.",
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [navigate]);

  const obtenerProductos = async () => {
    const response = await api.get("/api/productos", getHeaders());
    setProductos(response.data);
  };

  const manejarError = (error) => {
    if ([401, 403].includes(error.response?.status)) {
      localStorage.removeItem("token");
      navigate("/", {
        replace: true,
        state: {
          mensaje:
            "Tu sesión no es válida o ha expirado. Inicia sesión nuevamente.",
        },
      });
    } else {
      setError(
        error.response?.status === 429
          ? "Se alcanzó el límite de peticiones. Espera unos minutos y vuelve a intentar."
          : "No se pudo completar la operación. Verifica tu conexión e intenta nuevamente.",
      );
    }
  };

  const handleChange = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setGuardando(true);
    setError("");
    setMensaje("");
    const editando = Boolean(form.id);
    const datos = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion,
      precio: form.precio,
      stock: Number(form.stock),
    };
    try {
      if (editando)
        await api.put(`/api/productos/${form.id}`, datos, getHeaders());
      else await api.post("/api/productos", datos, getHeaders());
      setForm(formularioVacio);
      await obtenerProductos();
      setMensaje(
        editando
          ? "Producto actualizado correctamente."
          : "Producto guardado correctamente.",
      );
    } catch (error) {
      manejarError(error);
    } finally {
      setGuardando(false);
    }
  };

  const handleEdit = (producto) => {
    setForm({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precio: producto.precio,
      stock: producto.stock ?? 0,
    });
    setMensaje("");
    setError("");
    document.getElementById("producto-nombre")?.focus();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
    setGuardando(true);
    setError("");
    setMensaje("");
    try {
      await api.delete(`/api/productos/${id}`, getHeaders());
      if (form.id === id) setForm(formularioVacio);
      await obtenerProductos();
      setMensaje("Producto eliminado correctamente.");
    } catch (error) {
      manejarError(error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <main className="dashboard-page">
      <div className="dashboard-topbar">
        <span>
          Espacio de trabajo <span className="breadcrumb-slash">/</span>{" "}
          <strong>Productos</strong>
        </span>
        <span className="topbar-label">
          <Icon name="lock" size={14} /> Acceso autorizado
        </span>
      </div>
      <div className="dashboard-content">
        <header className="page-heading">
          <div>
            <span className="eyebrow">INVENTARIO GENERAL</span>
            <h1>
              Gestión de productos<span>.</span>
            </h1>
            <p>Todo lo que necesitas, en su lugar.</p>
          </div>
          <span className="heading-mark" aria-hidden="true">
            <Icon name="box" size={32} />
          </span>
        </header>
        <section className="summary-grid" aria-label="Resumen del inventario">
          <div className="summary-card">
            <span className="summary-icon blue">
              <Icon name="box" size={22} />
            </span>
            <div>
              <span>Productos registrados</span>
              <strong>
                {cargando ? "—" : productos.length.toString().padStart(2, "0")}
              </strong>
            </div>
            <span className="summary-caption">EN EL CATÁLOGO</span>
          </div>
          <div className="summary-card">
            <span className="summary-icon purple">
              <Icon name="layers" size={22} />
            </span>
            <div>
              <span>Unidades en stock</span>
              <strong>
                {cargando
                  ? "—"
                  : productos.reduce((sum, p) => sum + Number(p.stock || 0), 0)}
              </strong>
            </div>
            <span className="summary-caption">DISPONIBLES</span>
          </div>
          <div className="summary-card">
            <span className="summary-icon amber">
              <Icon name="alert" size={22} />
            </span>
            <div>
              <span>Sin existencias</span>
              <strong>
                {cargando
                  ? "—"
                  : productos
                      .filter((p) => Number(p.stock) === 0)
                      .length.toString()
                      .padStart(2, "0")}
              </strong>
            </div>
            <span className="summary-caption">POR REPONER</span>
          </div>
        </section>
        {error && (
          <div className="feedback feedback-error" role="alert">
            <Icon name="alert" size={18} />
            <span>{error}</span>
          </div>
        )}
        {mensaje && (
          <div className="feedback feedback-success" role="status">
            <Icon name="check" size={18} />
            <span>{mensaje}</span>
          </div>
        )}
        <div className="inventory-grid">
          <section
            className="surface product-editor"
            aria-labelledby="editor-title"
          >
            <div className="section-kicker">
              <span className="section-icon">
                <Icon name={form.id ? "edit" : "plus"} size={19} />
              </span>
              <span>
                {form.id ? "ACTUALIZAR INFORMACIÓN" : "AÑADIR AL INVENTARIO"}
              </span>
            </div>
            <h2 id="editor-title">
              {form.id ? "Editar producto" : "Nuevo producto"}
            </h2>
            <p className="section-description">
              {form.id
                ? "Modifica los datos y guarda los cambios."
                : "Los pequeños detalles hacen la diferencia."}
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="producto-nombre">
                  Nombre <span>*</span>
                </label>
                <input
                  id="producto-nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  maxLength={255}
                  placeholder="Ej. Teclado inalámbrico"
                  disabled={guardando}
                />
              </div>
              <div className="form-field">
                <label htmlFor="producto-descripcion">
                  Descripción <span className="optional">opcional</span>
                </label>
                <textarea
                  id="producto-descripcion"
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Agrega los detalles del producto"
                  disabled={guardando}
                />
              </div>
              <div className="fields-row">
                <div className="form-field">
                  <label htmlFor="producto-precio">
                    Precio (S/) <span>*</span>
                  </label>
                  <input
                    id="producto-precio"
                    name="precio"
                    type="number"
                    min="0"
                    max="99999999.99"
                    step="0.01"
                    value={form.precio}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                    disabled={guardando}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="producto-stock">
                    Stock <span>*</span>
                  </label>
                  <input
                    id="producto-stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={handleChange}
                    required
                    placeholder="0"
                    disabled={guardando}
                  />
                </div>
              </div>
              <button
                className="button button-primary save-button"
                disabled={guardando || cargando}
              >
                {guardando ? (
                  <span className="spinner" />
                ) : (
                  <Icon name={form.id ? "check" : "plus"} size={18} />
                )}{" "}
                {guardando
                  ? "Procesando…"
                  : form.id
                    ? "Actualizar producto"
                    : "Guardar producto"}
              </button>
              {form.id && (
                <button
                  type="button"
                  className="button button-secondary cancel-button"
                  onClick={() => setForm(formularioVacio)}
                  disabled={guardando}
                >
                  Cancelar edición
                </button>
              )}
              <p className="required-note">* Campos obligatorios</p>
            </form>
          </section>
          <section
            className="surface product-catalog"
            aria-labelledby="catalog-title"
          >
            <div className="catalog-heading">
              <div>
                <span className="eyebrow">TU CATÁLOGO</span>
                <h2 id="catalog-title">Lista de productos</h2>
              </div>
              <span className="count-badge">
                {productos.length}{" "}
                {productos.length === 1 ? "producto" : "productos"}
              </span>
            </div>
            {cargando ? (
              <div className="empty-state" role="status">
                <span className="loading-dot" />
                <h3>Cargando tu inventario…</h3>
                <p>Un momento, estamos organizando todo.</p>
              </div>
            ) : productos.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">
                  <Icon name="box" size={38} />
                </span>
                <h3>Tu próximo producto empieza aquí.</h3>
                <p>
                  Completa el formulario para agregar
                  <br />
                  el primer producto a tu inventario.
                </p>
              </div>
            ) : (
              <div className="catalog-scroll">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((producto) => (
                      <tr key={producto.id}>
                        <td className="product-id">
                          #{String(producto.id).padStart(2, "0")}
                        </td>
                        <td className="product-name-cell">
                          <strong>{producto.nombre}</strong>
                          {producto.descripcion && (
                            <small>{producto.descripcion}</small>
                          )}
                        </td>
                        <td className="product-price">
                          {moneda(producto.precio)}
                        </td>
                        <td>
                          <span
                            className={`stock-badge ${Number(producto.stock) === 0 ? "out-of-stock" : ""}`}
                          >
                            <span />
                            {producto.stock}
                          </span>
                        </td>
                        <td>
                          <div className="product-actions">
                            <button
                              className="action-button edit-button"
                              aria-label={`Editar ${producto.nombre}`}
                              onClick={() => handleEdit(producto)}
                              disabled={guardando}
                            >
                              <Icon name="edit" size={15} />
                              <span>Editar</span>
                            </button>
                            <button
                              className="action-button delete-button"
                              aria-label={`Eliminar ${producto.nombre}`}
                              onClick={() => handleDelete(producto.id)}
                              disabled={guardando}
                            >
                              <Icon name="trash" size={15} />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="catalog-foot">
              <span className="catalog-foot-dot" />
              <span>Cada producto cuenta. Mantén tu inventario al día.</span>
            </div>
          </section>
        </div>
        <footer className="dashboard-footer">
          <span>SENATI · Sistema de inventario</span>
          <span>Hecho para trabajar con orden.</span>
        </footer>
      </div>
    </main>
  );
}
