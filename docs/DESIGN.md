# Inventra: decisiones de interfaz

La pregunta principal del resumen es: ¿qué necesita atención en el almacén? El valor al costo, las existencias y la reposición proceden de los productos activos; no hay indicadores comerciales inventados.

Se aplicó UI/UX Pro Max. La búsqueda de sistema `inventory management dashboard` devolvió Flat Design, con gris industrial y verde de stock. Su tipografía académica no correspondía a una herramienta de trabajo; una búsqueda específica `industrial dashboard sans` devolvió DM Sans, ya disponible en el proyecto. Se usa una sola familia alojada en el propio sitio.

La composición usa una hoja blanca sobre un marco verde gris, navegación neutra, líneas discretas y color reservado para stock, alertas y actividad. El símbolo de Inventra combina una caja con una línea de recorrido; la reposición es el elemento principal que une productos y Kardex. El login muestra un dibujo vectorial del almacén, sin imágenes externas.

## Vistas

| Vista         | Pregunta que resuelve                     |
| ------------- | ----------------------------------------- |
| Resumen       | ¿Qué requiere atención hoy?               |
| Productos     | ¿Qué existe y cuánto queda?               |
| Categorías    | ¿Cómo está organizado el catálogo?        |
| Proveedores   | ¿Quién suministra cada producto?          |
| Kardex        | ¿Por qué cambió el stock y quién lo hizo? |
| Alertas       | ¿Qué debo reponer y cuánto costaría?      |
| Reportes      | ¿Cuánto vale el stock actual?             |
| Usuarios      | ¿Quién puede acceder y con qué permisos?  |
| Configuración | ¿Cómo actualizo mi perfil y contraseña?   |

## Accesibilidad y estados

- Etiquetas visibles, foco de teclado, cuadros de diálogo nativos y validación del servidor.
- Indicadores con texto y signo; el color no es la única señal.
- Navegación plegable, filtros adaptables, tablas desplazables dentro de su contenedor.
- Tema claro y oscuro, movimiento reducido, mensajes de carga, error y ausencia de datos.
- Formulario de stock separado de la ficha del producto para conservar trazabilidad.

Los 15 productos, 6 categorías, 3 proveedores y movimientos iniciales son datos de demostración, no un inventario importado del equipo local. Los proveedores de ejemplo usan dominios `.example`.
