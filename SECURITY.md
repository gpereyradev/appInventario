# Seguridad del frontend de Inventra

La revisión de seguridad utiliza
[security-audit de Cloudflare](https://github.com/cloudflare/security-audit-skill),
origen `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`. El backend conserva el contexto y
los resultados de la revisión enfocada en
[miApi/SECURITY.md](https://github.com/gpereyradev/miApi/blob/main/SECURITY.md).

## Controles actuales

- Los campos del inventario se interpolan mediante React.
- La cookie HttpOnly gestiona la sesión; el frontend no guarda el JWT en localStorage.
- DataProvider se monta con la identidad del usuario, separando los datos entre sesiones.
- La API verifica los roles; ocultar acciones en la interfaz no sustituye esa verificación.
- downloadCSV entrecomilla campos, duplica comillas y neutraliza posibles fórmulas.
- Las gráficas consumen fechas formateadas y valores numéricos.

## Configuración

VITE_API_URL es pública y selecciona el origen de la API. Ninguna variable VITE_ debe
contener contraseñas, claves de base de datos o JWT_SECRET. Los archivos .env y sus
variantes se excluyen de Git; solo se permite publicar un ejemplo sin secretos.

## Alcance del 4 de noviembre de 2026

Se revisaron las fuentes de renderizado, gráficas, CSV, sesión y rutas. No se estableció
una ruta de XSS ni una filtración de token en esos archivos. No se realizaron pruebas
dinámicas de navegador o ataques en producción. La validación de ejecución queda
pendiente de un entorno con el aislamiento OS requerido por la metodología.

Una auditoría completa requiere reconocimiento, cobertura y verificación independiente;
esta revisión enfocada no certifica la ausencia de vulnerabilidades.

