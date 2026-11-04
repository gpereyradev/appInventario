# Trabajo en el frontend de Inventra

Este repositorio y `gpereyradev/miApi` forman una sola aplicación. Consulta
`SECURITY.md` al revisar seguridad y usa la skill `security-audit` de Cloudflare.

- Mantén la referencia visual aprobada y los flujos existentes.
- React debe renderizar los datos como texto. No introduzcas HTML sin escapar.
- No guardes tokens ni respuestas privadas en localStorage; su uso actual es el tema.
- Mantén la protección de fórmulas y el escape de comillas en los CSV.
- Los controles de interfaz complementan los permisos de la API, no los reemplazan.
- Revisa los cambios de identidad y desmonta los datos del usuario anterior.
- No incluyas secretos en variables VITE_ ni en archivos publicados.
- Usa revisión enfocada por defecto y distingue candidatos pendientes de fallos comprobados.
- Ejecuta código objetivo únicamente en el aislamiento OS exigido por la skill, con
  datos ficticios y sin red externa. Si falta aislamiento, limita la revisión a fuentes.
- No pruebes ataques, movimientos de stock ni escrituras de prueba en la web publicada.

