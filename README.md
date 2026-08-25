# Sistema de Gestión de Reservas del Auditorio - UNIOR

Plataforma web oficial para la gestión, control de disponibilidad y reserva del Auditorio de la **Universidad Privada de Oruro (UNIOR)**.

---

## 1. El Problema y a Quién Afecta

### El Problema
La Universidad Privada de Oruro gestionaba las solicitudes del auditorio mediante un **registro manual en cuaderno de papel**. Este proceso tradicional generaba graves inconvenientes operacionales:
- **Solapamiento y conflictos de horario:** Varias facultades o departamentos reservaban el mismo espacio en el mismo horario.
- **Falta de visibilidad de disponibilidad:** Los solicitantes debían desplazarse físicamente a la administración para consultar si el auditorio estaba libre.
- **Descontrol en equipamiento:** Pérdida de inventario y solicitudes que superaban la disponibilidad real de proyectores, micrófonos o sistemas de sonido.
- **Inexistencia de notificaciones:** Los solicitantes no recibían confirmación o motivo de rechazo formal de sus solicitudes.

### A Quién Afecta
- **Solicitantes (Docentes, Estudiantes, Directivos de Carrera y Personal Administrativo):** Dificultad para coordinar eventos académicos y culturales sin certeza de disponibilidad.
- **Administradores del Auditorio:** Carga de trabajo manual, falta de trazabilidad en las decisiones y dificultad para consolidar reportes diarios de uso.

---

## 2. Alcance del Proyecto

### Lo que INCLUYE el MVP
- **Autenticación y Perfiles:** Registro, inicio de sesión, recuperación de contraseña y perfiles con control de acceso por roles (`user` solicitante y `admin`).
- **Disponibilidad Pública:** Grilla interactiva de horarios ocupados/disponibles por fecha sin requerir autenticación y protegiendo los datos personales de los solicitantes.
- **Solicitud de Reservas:** Formulario con selección de datos del evento, rango de horas (`HH:MM`) en fecha futura y reserva de equipamiento con control de cantidad.
- **Validación de Dominio:** Detección estricta de solapamientos (`nuevoInicio < existFin AND nuevoFin > existInicio`) en frontend y backend transaccional.
- **Panel de Administración:** Revisión de solicitudes pendientes, aprobación y rechazo con notas administrativas, e historial con filtros.
- **Gestión de Equipamiento:** CRUD de inventario de recursos del auditorio.
- **Notificaciones por Correo:** Envío automático de notificaciones vía **Resend API** al crear, aprobar o rechazar reservas, más recordatorio automático 15 minutos antes.
- **Reporte Diario en PDF:** Generación automatizada a las 7:00 a. m. (`America/La_Paz`) con **PDFKit**, subida a **Firebase Storage** y envío por correo a los administradores.

### Lo que NO INCLUYE el MVP (Fuera de Alcance)
- Integración con mensajería instantánea (WhatsApp, Telegram).
- Pasarela de cobros o pagos.
- Reservas recurrentes (ej. todos los lunes del semestre).
- Gestión de múltiples auditorios o recintos universitarios.
- Aplicación móvil nativa (iOS / Android).

---

## 3. Diagrama de Arquitectura

El sistema utiliza una arquitectura **Serverless de dos capas**, ejecutando componentes específicos en el cliente, en el edge de Vercel y en la infraestructura administrada de Firebase.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENTE (Navegador)                           │
│                React 18 + Vite + TypeScript + Tailwind CSS             │
│                                                                        │
│   [Vista Pública]        [Vista Solicitante]       [Panel Admin]       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / Firebase Web SDK
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND (Firebase Cloud)                        │
│                                                                        │
│  Firebase Auth       Cloud Firestore         Firebase Storage          │
│  (Usuarios/Roles)    (Reservas/Equipos)      (Reportes PDF)            │
│                                                                        │
│                       Firebase Cloud Functions                         │
│               (Node.js 20 - Triggers & Cloud Scheduler)                │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │ API REST HTTP                  │ PDFKit
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│           SERVICIO DE EMAIL          │  │       REPORTE DIARIO         │
│             Resend Email API         │  │   PDF guardado en Storage    │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

### Ejecución de Piezas
- **Frontend SPA:** Ejecutado en el **Navegador Web del Usuario** y distribuido mediante la red CDN Edge de **Vercel**.
- **Autenticación & Base de Datos:** **Firebase Auth** y **Cloud Firestore** ejecutados en los servidores administrados de Google Firebase.
- **Lógica Backend & Triggers:** **Firebase Cloud Functions** (Node.js 20), re-validando transacciones y disparando eventos.
- **Notificaciones:** **Resend API**, ejecutado vía llamadas HTTPS REST desde las Cloud Functions.
- **Tareas Programadas:** **Cloud Scheduler** ejecutando cron jobs bajo la zona horaria `America/La_Paz`.

---

## 4. Justificación de Tecnologías y Alternativas Descartadas

| Componente | Tecnología Seleccionada | Alternativa Descartada | Motivo de la Decisión |
| --- | --- | --- | --- |
| **Frontend Core** | **React 18 + TypeScript** | Angular / Vue.js | Ecosistema maduro, manejo eficiente de estado con Hooks y tipado estricto para evitar errores en tiempo de compilación. |
| **Build Tool** | **Vite** | Create React App / Webpack | Tiempos de compilación e inicialización significativamente más rápidos (HMR instantáneo). |
| **Estilos CSS** | **Tailwind CSS v4** | CSS Puro / Bootstrap | Desarrollo ágil de interfaces responsive, adaptadas visualmente a la identidad institucional de UNIOR. |
| **Plataforma Backend** | **Firebase (Auth/Firestore)** | Supabase / AWS Lambda + DynamoDB | Integración nativa entre autenticación, base de datos en tiempo real y seguridad basada en reglas. |
| **Servidor de Correo** | **Resend API** | Nodemailer + Server SMTP | Entrega inmediata por API REST de alta disponibilidad, sin necesidad de mantener un servidor SMTP propio ni exponer credenciales. |
| **Generador de PDF** | **PDFKit** | Puppeteer / jsPDF | Generación de documentos PDF nativa y ligera en Node.js sin sobrecarga de navegadores headless. |
| **Hosting Frontend** | **Vercel** | Firebase Hosting tradicional | Despliegue continuo instantáneo (CI/CD), excelente soporte para SPA Vite y CDN global. |
| **Gestor de Paquetes** | **pnpm** | npm / yarn | Instalación ultrarrápida, ahorro de espacio en disco mediante enlace simbiótico y control estricto de lockfile. |

---

## 🛠️ Herramientas y Código de Terceros Utilizados

- **[React 18](https://react.dev/):** Librería para la construcción de interfaces de usuario.
- **[Vite](https://vitejs.dev/):** Entorno de desarrollo y empaquetador frontend.
- **[TypeScript](https://www.typescriptlang.org/):** Lenguaje tipado estricto.
- **[Tailwind CSS](https://tailwindcss.com/):** Framework CSS utilitario.
- **[Lucide React](https://lucide.dev/):** Conjunto de iconos vectoriales para UI.
- **[React Router DOM v6](https://reactrouter.com/):** Enrutamiento declarativo del lado del cliente.
- **[Firebase SDK](https://firebase.google.com/):** Módulos web de Auth, Firestore y Storage.
- **[Resend API Node SDK](https://resend.com/):** Servicio de correo electrónico transaccional.
- **[PDFKit](https://pdfkit.org/):** Generador de documentos PDF para Node.js.
- **[date-fns / date-fns-tz](https://date-fns.org/):** Utilidades para formateo y manejo de zonas horarias (`America/La_Paz`).

---

## 🚀 Instrucciones para Ejecutar el Proyecto

### Prerrequisitos
- **Node.js:** Versión 18 o superior.
- **pnpm:** Versión 8 o superior (`npm i -g pnpm`).
- **Firebase CLI:** Opcional para despliegue (`npm i -g firebase-tools`).

### 1. Clonar e Instalar Dependencias

```bash
# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd reservas

# Instalar dependencias del frontend usando únicamente pnpm
pnpm install

# Instalar dependencias de Cloud Functions
cd functions
pnpm install
cd ..
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto basándote en `.env.example`:

```bash
cp .env.example .env.local
```

Rellena las variables con tus credenciales de Firebase Console:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=reservasunior.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=reservasunior
VITE_FIREBASE_STORAGE_BUCKET=reservasunior.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=815154401826
VITE_FIREBASE_APP_ID=1:815154401826:web:...
VITE_FIREBASE_MEASUREMENT_ID=G-48Z0YS6W7X
```

Para las Cloud Functions, configura la API Key de Resend mediante Firebase CLI o variables de entorno:

```bash
firebase functions:config:set \
  resend.api_key="re_123456789..." \
  resend.from_email="auditorio@unior.edu.bo" \
  resend.from_name="Auditorio UNIOR" \
  admin.emails="admin@unior.edu.bo"
```

### 3. Ejecutar en Modo Desarrollo

```bash
# Servidor de desarrollo local del frontend (Vite en http://localhost:3000)
pnpm dev
```

### 4. Compilación y Calidad

```bash
# Verificación de tipos con TypeScript
pnpm lint

# Compilación para producción (generará la carpeta dist/)
pnpm build
```

---

## 👥 Roles de Usuario e Inicialización del Administrador

- **`user` (Solicitante):** Puede consultar disponibilidad pública, crear solicitudes de reserva, seleccionar equipamiento y cancelar sus propias solicitudes.
- **`admin` (Administrador):** Acceso completo al panel administrativo (`/admin`), revisión, aprobación/rechazo de solicitudes, notas administrativas y CRUD de equipamiento.

### Crear el Primer Administrador
1. Registra un nuevo usuario desde el formulario `/register`.
2. Dirígete a **Firebase Console** > **Firestore Database** > Colección `users`.
3. Selecciona el documento de tu usuario (`uid`) y modifica el campo `role` de `"user"` a `"admin"`.
