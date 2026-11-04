# Inventra · Frontend de inventario

Aplicación React del Laboratorio 9 de Fullstack SENATI, desarrollada por Guillermo Pereyra. Forma un solo proyecto con [miApi](https://github.com/gpereyradev/miApi).

## Funciones

Resumen con cifras reales del catálogo, productos con SKU y relaciones, categorías, proveedores, Kardex de entradas/salidas/ajustes, anulaciones auditadas, alertas de reposición, reportes al costo, CSV, impresión, usuarios con roles y perfil. Incluye temas claro/oscuro y diseño adaptable.

## Ejecutar localmente (Git Bash)

```bash
git clone https://github.com/gpereyradev/appInventario.git
cd appInventario
npm ci
npm run dev
```

Antes, inicia el backend en el puerto 3006 siguiendo su README. Vite abre http://localhost:5173 y reenvía `/api` al backend, por lo que la sesión funciona con la misma dirección del navegador. Requiere Node 22 o superior.

```bash
npm run lint
npm run build
```

No hay credenciales en el código. La cuenta inicial se crea mediante variables del backend. No hay registro público: el administrador crea las demás cuentas.

## Despliegue integrado

En producción, el backend sirve el `dist` de este repositorio bajo la misma dirección. `miApi/frontend-ref.txt` fija el commit exacto del frontend. Al publicar una nueva versión de este repositorio, actualiza ese SHA en `miApi` y publícalo para activar el despliegue. Así se conservan dos repositorios y una sola aplicación, sin conflictos de cookies o CORS.

`VITE_API_URL` es opcional y por defecto es `/api`. En despliegues separados se debe configurar el origen permitido y una estrategia de sesión acorde; el despliegue de este proyecto usa el mismo origen.

## Estructura

- `src/pages`: nueve vistas y login.
- `src/components`: navegación, formularios y controles reutilizables.
- `src/lib/api.js`: cliente Axios y errores de sesión.
- `src/lib/Providers.jsx`: autenticación, datos compartidos y avisos.
- `src/lib/context.js`: formatos de soles, fechas de Lima y CSV seguro.
- `src/lib/charts.js`: helper SVG para gráficos accesibles y adaptables.
- `docs/DESIGN.md`: decisiones de UI/UX y datos de demostración.

La sesión se conserva en una cookie HttpOnly del backend; el frontend solo guarda la preferencia de tema. React Router administra las rutas; el backend proporciona el fallback necesario para abrirlas o recargarlas directamente.
