# Inventra: frontend basado en la referencia visual

La referencia proporcionada el 4 de noviembre de 2026 muestra una interfaz Rolve sobre fondo carbón, con ventanas delineadas, tipografía blanca, controles violetas, navegación en dos niveles y grandes arcos lima. Esta versión aplica esa dirección a Inventra desde el login hasta sus nueve apartados.

## Decisiones visuales

- Fondo carbón `#1e1e1e`, paneles `#222222` y superficies elevadas `#292929`.
- Acciones principales violeta `#6748ee`, texto blanco y datos destacados en lima `#ddf44c`.
- Manrope para títulos y cifras principales; DM Sans para tablas, formularios y navegación. Ambas familias se sirven desde el propio sitio.
- Un carril de accesos rápidos de 62 px junto a la navegación contextual de 208 px. En celular se convierte en un menú plegable con gestión del foco, cierre por Escape y navegación por teclado.
- Login con título contorneado, arcos SVG y formulario dentro de una ventana delineada. El panel de trazabilidad mantiene el mismo lenguaje visual y respeta el área útil del formulario.
- Color concentrado en botones, alertas y cifras. Sin degradados ni efectos de cristal.
- El modo oscuro se activa por defecto. Se conserva un modo claro alternativo y su preferencia se guarda con la clave `inventra-theme-v2`.

La composición de partida fue True-black flat, con shell Ruled T-frame (semilla 1114944357). La referencia del usuario tiene prioridad sobre las preferencias generales: se utilizan expresamente violeta, arcos lima y bordes visibles. Los arcos se reservan al acceso; las pantallas operativas priorizan los datos.

## Datos y funciones

El porcentaje de stock saludable se calcula como `(productos activos - productos por reponer) / productos activos`. No hay porcentajes comerciales inventados. Ante un catálogo vacío se muestra 0 % y las vistas conservan sus estados vacíos.

Se conservan React Router, la sesión HttpOnly, los roles y los flujos de productos, categorías, proveedores, Kardex, alertas, reportes, usuarios y configuración. El cambio del backend se limita a fijar el nuevo commit del frontend para su despliegue integrado.

## Validación

La revisión visual usa una copia de solo lectura de los datos de la API publicada y un servidor aislado para comprobar la interfaz. No escribe productos, usuarios ni movimientos en producción.

Se revisan login, nueve vistas, búsqueda, paginación, exportación CSV, apertura y cierre de formularios, prevención de una salida superior al stock, cambio y persistencia de tema, navegación móvil y tamaños 1440, 1024, 768, 390 y 375 px. Las reglas de contraste y tipografía se comprueban con los analizadores de DOM del diseño; la excepción `palette-purple` corresponde a un color solicitado expresamente por el usuario.

Resultado de la revisión: 36 comprobaciones funcionales aprobadas y ningún error de JavaScript. Sin desbordamiento de página en los tamaños revisados. El resumen de escritorio no presenta hallazgos; los avisos restantes en tablet/celular se refieren a los metadatos de 12 px y a la detección automática de cifras como títulos, con contenido revisado visualmente.
