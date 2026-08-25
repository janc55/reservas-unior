# Constitución del proyecto

## Proyecto

**Sistema de Gestión de Reservas del Auditorio - Universidad Privada de Oruro (UNIOR)**

Esta constitución define las reglas técnicas y funcionales que deben respetarse durante el desarrollo. Si existe un conflicto con una decisión posterior aprobada explícitamente, la decisión posterior debe documentarse en el SDD y en la especificación afectada.

## Principios

### I. Alcance enfocado en el MVP

El producto resolverá registro, disponibilidad, solicitud, aprobación, equipamiento, historial, reportes y notificaciones por correo para un único auditorio. No se incorporarán pagos, reservas recurrentes, múltiples auditorios ni mensajería instantánea en el MVP.

### II. pnpm como gestor único

- Todas las dependencias se instalarán con `pnpm`.
- Los scripts se ejecutarán con `pnpm run <script>`.
- No se usarán comandos de instalación o ejecución de gestores alternativos en la documentación o automatizaciones.
- El repositorio debe mantener un único archivo de bloqueo: `pnpm-lock.yaml`.
- La versión de Node.js y pnpm debe quedar declarada en `package.json` mediante `engines` cuando el proyecto esté inicializado.

### III. Firebase como plataforma backend

Firebase será la plataforma oficial para Authentication, Firestore, Storage, Cloud Functions y Hosting. El proyecto Firebase de desarrollo es `reservasunior`.

La configuración web se cargará desde `.env.local`, tomando como referencia `.env.example`, mediante estas variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

La API key web no es un secreto, pero debe restringirse desde Google Cloud Console por dominios, APIs y aplicaciones autorizadas. Nunca se almacenarán credenciales de servicio, contraseñas SMTP o tokens privados en el frontend ni en el repositorio.

### IV. Seguridad por defecto

- El acceso se controlará por autenticación y rol.
- El rol `admin` no podrá ser asignado ni modificado por un usuario desde el cliente.
- Las reglas de Firestore limitarán lecturas y escrituras según el propietario y el rol.
- Las validaciones críticas se repetirán en Cloud Functions.
- Las operaciones de aprobación deben comprobar nuevamente conflictos de horario y disponibilidad de equipamiento.

### V. Fuente única de verdad

Las reservas aprobadas en Firestore son la fuente de verdad para la disponibilidad. La validación del frontend es una ayuda de experiencia; no reemplaza la validación del backend.

### VI. Consistencia temporal

Todas las tareas programadas usarán la zona horaria `America/La_Paz`. Las fechas se almacenarán como `YYYY-MM-DD`, las horas como `HH:MM` y los campos de auditoría como timestamps de Firestore.

### VII. Calidad verificable

Cada módulo debe incluir criterios de aceptación y pruebas para sus comportamientos críticos. Antes de integrar cambios se deben ejecutar, cuando existan, `pnpm lint`, `pnpm test` y `pnpm build`.

### VIII. Experiencia clara y accesible

La interfaz debe ser responsive, usar estados de carga y error explícitos, validar formularios con mensajes comprensibles y mantener navegación separada para visitante, solicitante y administrador.

## Estándares de implementación

- TypeScript será preferido para código nuevo.
- Los componentes de UI no deben contener directamente la lógica de acceso a Firestore si esta puede aislarse en servicios o hooks.
- Las transiciones de estado de una reserva deben estar documentadas y probadas.
- Los correos y reportes deben ser idempotentes: un reintento no debe producir duplicados.
- Los secretos de Cloud Functions se configurarán mediante el mecanismo de secretos de Firebase o del entorno de despliegue.
- El código debe evitar dependencias que no estén justificadas por una necesidad del MVP.

## Criterio de finalización

Una funcionalidad se considera terminada cuando:

1. Cumple su especificación y criterios de aceptación.
2. Tiene manejo de carga, error y estado vacío cuando corresponde.
3. Respeta las reglas de autenticación y autorización.
4. Cuenta con pruebas del comportamiento crítico.
5. Funciona con `pnpm` desde una instalación limpia.
6. No expone secretos ni introduce dependencias fuera del alcance aprobado.
