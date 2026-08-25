# Sistema de Gestión de Reservas del Auditorio — UNIOR

Aplicación web para consultar la disponibilidad y gestionar las reservas del Auditorio de la Universidad Privada de Oruro (UNIOR).

## Entrega

- Repositorio público: [github.com/janc55/reservas-unior](https://github.com/janc55/reservas-unior)
- Aplicación publicada en Firebase: [reservasunior.web.app](https://reservasunior.web.app)
- Video de presentación: pendiente de agregar el enlace de la entrega.

## 1. Problema y personas afectadas

La reserva del auditorio se realizaba mediante un cuaderno físico. Este proceso no daba visibilidad inmediata de la disponibilidad, podía producir reservas superpuestas, dificultaba el control de equipos y no dejaba una confirmación formal al solicitante.

El problema afecta a docentes, estudiantes, directivos de carrera y personal administrativo que organizan actividades académicas o culturales. También afecta a la administración del auditorio, que debe revisar solicitudes, controlar recursos y comunicar sus decisiones manualmente.

La aplicación centraliza ese proceso: muestra la disponibilidad sin exponer datos personales, registra las solicitudes y permite que un administrador las apruebe o rechace con trazabilidad.

## 2. Alcance

### Incluye

- Registro, inicio de sesión, recuperación de contraseña y control de roles (`user` y `admin`).
- Consulta pública de horarios ocupados y disponibles por fecha.
- Creación de solicitudes para fechas futuras, con rango horario y selección de equipamiento.
- Validación de cruces de horario mediante la condición `nuevoInicio < finExistente && nuevoFin > inicioExistente`.
- Panel de administración para aprobar o rechazar solicitudes, añadir notas y consultar el historial.
- CRUD de equipamiento del auditorio.
- Correos al crear, aprobar o rechazar una reserva y recordatorio previo al evento.
- Reporte diario en PDF, almacenado en Firebase Storage y enviado a los administradores.

### No incluye

- Pagos, cobros o facturación.
- Reservas recurrentes.
- Múltiples auditorios o recintos.
- Integración con WhatsApp, Telegram u otra mensajería instantánea.
- Aplicación móvil nativa para iOS o Android.

## 3. Arquitectura

```text
┌──────────────────────────────────────────────────────────────┐
│ Cliente: navegador                                            │
│ React + TypeScript + Vite + Tailwind CSS                      │
│ Disponibilidad pública | solicitudes | panel administrativo   │
└───────────────────────────┬──────────────────────────────────┘
                            │ HTTPS / Firebase Web SDK
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ Firebase Hosting                                               │
│ Distribuye la SPA compilada (CDN y HTTPS)                     │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ Firebase                                                       │
│ Auth: identidad y sesión       Firestore: usuarios, reservas  │
│ Storage: reportes PDF          Security Rules: autorización    │
└───────────────────────────┬──────────────────────────────────┘
                            │ eventos, tareas y Admin SDK
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ Cloud Functions (Node.js 20)                                  │
│ Notificaciones, recordatorios, validaciones y reporte diario  │
└─────────────────────┬─────────────────────────┬──────────────┘
                      │ HTTPS                   │ Cloud Scheduler
                      ▼                         ▼
              Resend Email API          PDFKit → Firebase Storage
```

El frontend se ejecuta en el navegador y se publica en Firebase Hosting. Firebase Authentication, Firestore y Storage se ejecutan como servicios administrados de Firebase. Cloud Functions ejecuta la lógica de servidor, los disparadores y tareas programadas; Resend entrega los correos transaccionales.

## 4. Decisiones tecnológicas

| Componente | Tecnología elegida | Alternativa descartada | Motivo |
| --- | --- | --- | --- |
| Interfaz | React 18 + TypeScript | Angular / Vue | Ecosistema maduro, componentes reutilizables y tipado para reducir errores. |
| Construcción | Vite | Create React App / Webpack | Inicio y recarga en desarrollo más rápidos, con configuración ligera. |
| Estilos | Tailwind CSS | Bootstrap / CSS tradicional | Permite una interfaz responsive e iteración visual rápida sin imponer un tema. |
| Backend | Firebase Auth, Firestore, Storage y Functions | Supabase / AWS Lambda + DynamoDB | Integra autenticación, datos, reglas y funciones serverless en una única plataforma. |
| Hosting | Firebase Hosting | Vercel / Netlify | Cumple el requisito de publicación en Firebase y se integra con el mismo proyecto y sus despliegues. |
| Correo | Resend API | SMTP propio con Nodemailer | Evita mantener infraestructura SMTP y permite el envío por API desde Functions. |
| PDF | PDFKit | Puppeteer / jsPDF | Genera el reporte en Node.js sin navegador headless ni sobrecarga adicional. |
| Dependencias | pnpm | npm / Yarn | Lockfile estricto y uso eficiente de espacio en disco. |

## 5. Recorrido de la aplicación

1. Abrir la [aplicación publicada](https://reservasunior.web.app) y consultar la disponibilidad pública.
2. Iniciar sesión o crear una cuenta de solicitante.
3. Crear una solicitud indicando actividad, fecha, horario y equipos requeridos.
4. La solicitud queda pendiente; el solicitante puede verla en **Mis reservas**.
5. Iniciar sesión con el rol administrador y abrir el panel **Administración**.
6. Revisar la solicitud, aprobarla o rechazarla con una nota. El sistema actualiza el estado y envía la notificación correspondiente.
7. Comprobar el resultado en la disponibilidad pública y en el historial administrativo.

### Acceso para revisión docente

Use estas credenciales únicamente para revisar el panel administrativo de la aplicación publicada:

| Campo | Valor |
| --- | --- |
| Correo | `adminreservas@unior.edu.bo` |
| Contraseña | `Admin123` |
| Rol | `admin` |

> Por tratarse de una cuenta de demostración publicada en el repositorio, la contraseña debe cambiarse o eliminarse después de la evaluación.

## 6. Herramientas y código de terceros

- [React](https://react.dev/) y [React Router](https://reactrouter.com/): interfaz y navegación de la SPA.
- [Vite](https://vite.dev/) y [TypeScript](https://www.typescriptlang.org/): compilación y tipado.
- [Tailwind CSS](https://tailwindcss.com/): estilos.
- [Lucide React](https://lucide.dev/): iconos.
- [Firebase Web SDK](https://firebase.google.com/docs/web/setup): Auth, Firestore y Storage en el cliente.
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions): lógica de servidor y tareas programadas.
- [Resend](https://resend.com/): correo transaccional.
- [PDFKit](https://pdfkit.org/): creación del reporte diario en PDF.
- [date-fns](https://date-fns.org/) y [date-fns-tz](https://github.com/marnusw/date-fns-tz): fechas y zona horaria `America/La_Paz`.

## Instrucciones de ejecución local

### Requisitos

- Node.js 18 o superior (las Cloud Functions usan Node.js 20).
- pnpm 8 o superior.
- Firebase CLI, solo para emuladores o despliegue.

### Instalación

```bash
git clone https://github.com/janc55/reservas-unior.git
cd reservas-unior
pnpm install
cd functions
pnpm install
cd ..
```

### Variables de entorno del frontend

Copie `.env.example` como `.env.local` y complete las variables públicas de su proyecto Firebase:

```bash
cp .env.example .env.local
```

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

Para los correos, configure las credenciales de Resend exclusivamente en el entorno de Cloud Functions; nunca use variables con prefijo `VITE_` para secretos.

### Desarrollo y comprobaciones

```bash
pnpm dev       # http://localhost:5173
pnpm lint      # verificación de tipos
pnpm build     # compilación de producción en dist/
```

Para desplegar en Firebase, primero compile el frontend y las funciones y luego ejecute el despliegue con Firebase CLI en un proyecto configurado:

```bash
pnpm build
cd functions
pnpm build
cd ..
firebase deploy
```
