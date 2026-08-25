# Plan de Trabajo por Sprints - Sistema de Reservas UNIOR

## Sprint 1: Configuración Base y Autenticación
- [x] Instalación e integración de skills con `npx skills add` (`vercel-labs/agent-skills` + skills de dominio del proyecto) en `.agents/skills/`
- [x] Inicializar proyecto React + Vite + TypeScript + Tailwind CSS con `pnpm`
- [x] Configurar Firebase Client (`src/lib/firebase.ts`) usando `.env.local`
- [x] Configurar React Router DOM v6 con layout responsive y branding UNIOR (Azul institucional / dorado / gris)
- [x] Implementar servicio de autenticación (`src/services/authService.ts`) y contexto de autenticación (`AuthContext`)
- [x] Desarrollar componentes y páginas:
  - Login (`/login`)
  - Registro (`/register`) con creación de documento en `users/{uid}` con `role: 'user'`
  - Recuperación de contraseña (`/forgot-password`)
  - Perfil de usuario (`/profile`)
- [x] Implementar Guardias de Rutas (`ProtectedRoute`, `AdminRoute`)
- [x] Pruebas y verificación de compilación (`pnpm lint` / `pnpm build`)

## Sprint 2: Vista Pública y Consulta de Disponibilidad
- [x] Desarrollar servicio de consulta de reservas públicas (`src/services/publicAvailabilityService.ts`)
- [x] Implementar vista de disponibilidad pública (`/` o `/disponibilidad`):
  - Seleccionador de fecha con zona horaria `America/La_Paz`
  - Rejilla/Línea de tiempo de horarios operativos ocupados vs disponibles
  - Filtro exclusivo para reservas con estado `approved`
  - Ocultamiento estricto de datos personales de los solicitantes (privacidad)
- [x] Responsive design y estados de carga / error / sin reservas
- [x] Pruebas de renderizado y lógica de intervalos ocupados

## Sprint 3: Solicitud de Reservas y Validaciones de Dominio
- [x] Implementar catálogo público de equipamiento disponible
- [x] Diseñar formulario de solicitud de reserva (`/reservas/nueva`):
  - Datos del evento (nombre, tipo: Académico, Cultural, Administrativo, Externo, asistentes, notas)
  - Fecha (`YYYY-MM-DD`), hora inicio (`HH:MM`), hora fin (`HH:MM`)
  - Selección de equipamiento con control de cantidad (no exceder disponibilidad)
- [x] Implementar validador de dominio de reservas (`src/utils/reservationValidation.ts`):
  - Formato y fecha futura
  - Rango `startTime < endTime`
  - Algoritmo de detección de solapamientos (`nuevoInicio < existFin AND nuevoFin > existInicio`)
- [x] Guardar reserva en Firestore con estado `pending`, timestamps y copia de datos del usuario
- [x] Dashboard / Mis Reservas (`/mis-reservas`) con opción de cancelación propia (`status: cancelled`)
- [x] Pruebas unitarias de la lógica de solapamiento de horarios

## Sprint 4: Panel de Administración y Gestión de Equipamiento
- [x] Dashboard Administrativo (`/admin`):
  - Métrica rápida de solicitudes pendientes, aprobadas, rechazadas
  - Lista de solicitudes `pending` con detalles completos
- [x] Flujo de Aprobación / Rechazo:
  - Botón Aprobar con validación backend previa de re-conflicto
  - Botón Rechazar con campo para motivo / notas administrativas
  - Transición a `approved` / `rejected` con `approvedAt`/`rejectedAt`
- [x] CRUD de Equipamiento (`/admin/equipamiento`):
  - Crear, editar, cambiar disponibilidad (`available`), ajustar cantidad (`quantity`), eliminar (si no tiene dependencias)
- [x] Historial de reservas con filtros por fecha, estado y tipo de evento
- [x] Operación administrativa controlada para asignación/inicialización del primer rol `admin`

## Sprint 5: Notificaciones SMTP y Cloud Functions / Tareas Programadas
- [x] Inicializar carpeta `functions` (Firebase Cloud Functions con TypeScript y Node.js)
- [x] Configurar Nodemailer con transporte SMTP seguro
- [x] Triggers de Firestore / Cloud Functions Callables:
  - Notificación por correo al solicitante al crear solicitud (`pending`)
  - Notificación por correo al solicitante al aprobar (`approved`) o rechazar (`rejected`)
  - Validación Backend estricta transaccional para evitar race-conditions en solapamiento
- [x] Tarea programada de recordatorios (Cloud Scheduler `*/5 * * * *` `America/La_Paz`):
  - Busca reservas `approved` a iniciar entre 15-20 minutos
  - Envía correo y marca `notificationSent.reminder = true`
- [x] Tarea programada de Reporte Diario (Cloud Scheduler `0 7 * * *` `America/La_Paz`):
  - Consulta reservas aprobadas del día
  - Genera documento PDF con PDFKit conteniendo evento, horario, solicitante y equipamiento
  - Guarda PDF en Firebase Storage (`reports/YYYY-MM-DD.pdf`)
  - Envía correo con PDF adjunto a los administradores (`ADMIN_REPORT_EMAILS`)
  - Registra auditoría en colección `dailyReports`

## Sprint 6: Reglas de Seguridad, QA, Pulido y Despliegue
- [x] Configurar `firestore.rules` definitivo (lecturas públicas limitadas, escrituras seguras por rol y propietario)
- [x] Configurar `storage.rules` para reportes PDF
- [x] Pruebas de integración y QA completo (verificación de criterios de aceptación de specs 01 a 07)
- [x] Auditoría de seguridad y fuga de secretos (asegurar que SMTP/credenciales nunca lleguen al cliente)
- [x] Configurar `firebase.json` para Firebase Hosting y Cloud Functions
- [x] Ejecutar validación de calidad: `pnpm lint`, `pnpm test`, `pnpm build`
- [x] Documentación final de despliegue y uso en `README.md`
