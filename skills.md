# Skills recomendadas para el proyecto

Estas skills representan capacidades de desarrollo que conviene aplicar por módulo. No agregan servicios fuera del MVP.

## Skills prioritarias

| Skill | Uso |
| --- | --- |
| `react-vite-frontend` | Componentes React, rutas, layout responsive y configuración Vite |
| `typescript-quality` | Tipos de dominio, contratos y reducción de errores en tiempo de compilación |
| `firebase-auth` | Registro, inicio de sesión, cierre de sesión y persistencia de sesión |
| `firestore-data-modeling` | Colecciones, consultas, índices, timestamps y listeners en tiempo real |
| `firestore-security-rules` | Reglas de acceso, validación de propietario y rol administrativo |
| `reservation-domain-validation` | Fechas, horarios, solapamientos, estados y disponibilidad de equipamiento |
| `react-hook-form-validation` | Formularios, mensajes de validación y experiencia de envío |
| `admin-dashboard` | Filtros, revisión de solicitudes, acciones administrativas y estados vacíos |
| `firebase-cloud-functions` | Validaciones backend, transacciones y funciones callable o HTTP |
| `smtp-email-notifications` | Nodemailer, plantillas, reintentos, idempotencia y secretos SMTP |
| `pdf-reporting` | Reporte diario, generación de PDF y almacenamiento en Firebase Storage |
| `scheduled-tasks` | Recordatorios y reporte diario en `America/La_Paz` |
| `qa-testing` | Pruebas unitarias, integración, reglas de Firestore y flujos críticos |
| `pnpm-tooling` | Scripts, lockfile, instalación limpia y CI usando únicamente pnpm |

## Orden recomendado

1. `pnpm-tooling` y `react-vite-frontend`.
2. `typescript-quality` y `firebase-auth`.
3. `firestore-data-modeling` y `firestore-security-rules`.
4. `reservation-domain-validation` y `react-hook-form-validation`.
5. `admin-dashboard`.
6. `firebase-cloud-functions` y `scheduled-tasks`.
7. `smtp-email-notifications` y `pdf-reporting`.
8. `qa-testing`.

## Fuera de alcance

No se necesitan skills para mensajería instantánea, pagos, reservas recurrentes, múltiples auditorios ni aplicaciones móviles nativas.
