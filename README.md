# Sistema de Reservas - Auditorio UNIOR

Sistema web para la gestion de reservas del auditorio de la Universidad Regional Amazónica (UNIOR).

## Tecnologias

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS
- **Backend:** Firebase (Auth, Firestore, Storage, Cloud Functions)
- **Email:** Resend API
- **PDF:** PDFKit
- **Despliegue:** Vercel (frontend) + Firebase (functions/backend)

## Estructura

```
reservas/
├── src/                    # Frontend React
│   ├── components/         # Componentes reutilizables
│   ├── context/            # AuthContext
│   ├── pages/              # Paginas de la aplicacion
│   ├── services/           # Servicios Firebase
│   ├── types/              # Definiciones TypeScript
│   └── utils/              # Utilidades y validaciones
├── functions/              # Cloud Functions (Firebase)
│   └── src/
│       ├── config/         # Resend client + email templates
│       ├── triggers/       # Triggers de Firestore
│       └── scheduled/      # Tareas programadas
├── firestore.rules         # Reglas de Firestore
├── storage.rules           # Reglas de Storage
├── firebase.json           # Configuracion Firebase
└── vite.config.ts          # Configuracion Vite
```

## Funcionalidades por Sprint

### Sprint 1: Autenticacion
- Login, Registro, Recuperacion de contrasena
- Perfil de usuario con roles (user/admin)
- Guardias de rutas (ProtectedRoute, AdminRoute)

### Sprint 2: Disponibilidad Publica
- Calendario de horarios ocupados/disponibles
- Filtro por reservas aprobadas
- Sin datos personales visibles

### Sprint 3: Reservas
- Formulario de solicitud con equipamiento
- Validacion de dominio (solapamientos, horarios)
- Dashboard "Mis Reservas" con cancelacion

### Sprint 4: Administracion
- Metricas de solicitudes (pendientes/aprobadas/rechazadas)
- Flujo de Aprobacion/Rechazo con validacion
- CRUD de equipamiento
- Historial con filtros

### Sprint 5: Notificaciones y Cloud Functions
- Correos automaticos via Resend (pending/approved/rejected)
- Recordatorios cada 5 minutos
- Reporte diario en PDF a las 7am

### Sprint 6: Seguridad y Despliegue
- Reglas de Firestore y Storage
- Auditoria de secretos
- Documentacion

## Instalacion

```bash
# Clonar repositorio
git clone <url>
cd reservas

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales Firebase

# Ejecutar en desarrollo
pnpm dev
```

## Variables de Entorno

### .env.local (Frontend)
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

### Firebase Functions (configurado via CLI)
```bash
firebase functions:config:set \
  resend.api_key="TU_API_KEY_RESEND" \
  resend.from_email="noreply@tu-dominio.com" \
  resend.from_name="UNIOR Auditorio" \
  admin.emails="admin1@unior.edu.bo,admin2@unior.edu.bo"
```

## Comandos Utiles

```bash
# Desarrollo
pnpm dev                    # Servidor de desarrollo
pnpm build                  # Build de produccion
pnpm lint                   # Verificacion de tipos
pnpm test                   # Ejecutar pruebas

# Firebase
firebase login              # Iniciar sesion
firebase deploy             # Desplegar todo
firebase deploy --only functions   # Solo Cloud Functions
firebase deploy --only hosting     # Solo frontend
firebase deploy --only firestore:rules  # Solo reglas

# Functions
cd functions && pnpm install      # Instalar deps de functions
cd functions && pnpm build        # Compilar functions
```

## Despliegue

### Frontend (Vercel)
```bash
pnpm add -D vercel
npx vercel
```

### Cloud Functions (Firebase)
```bash
cd functions
pnpm install
pnpm build
cd ..
firebase deploy --only functions
```

## Roles de Usuario

- **user:** Puede crear reservas, ver disponibilidad, cancelar las proprias
- **admin:** Puede aprobar/rechazar reservas, gestionar equipamiento, ver historial

### Asignar primer admin
1. Registrar usuario
2. Ir a Firebase Console > Firestore > users
3. Cambiar campo `role` de `user` a `admin`
