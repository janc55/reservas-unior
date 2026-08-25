# SDD: Sistema de Gestión de Reservas del Auditorio

**Universidad Privada de Oruro (UNIOR)**

## 1. Introducción

### 1.1 Propósito

Este documento especifica el diseño arquitectónico y funcional del Sistema de Gestión de Reservas del Auditorio de la Universidad Privada de Oruro. El sistema reemplazará el registro manual en cuaderno por una plataforma digital que optimice la gestión de espacios y recursos.

### 1.2 Alcance del MVP

El sistema incluirá:

- Registro, autenticación y cierre de sesión de usuarios.
- Roles de solicitante y administrador.
- Consulta pública de disponibilidad del auditorio.
- Solicitud de reservas con selección de equipamiento.
- Validación de fechas y conflictos de horario.
- Aprobación o rechazo de solicitudes por parte de un administrador.
- Panel de administración para reservas y equipamiento.
- Historial de reservas del solicitante y del administrador.
- Reporte diario en PDF enviado por correo a los administradores.
- Notificaciones por correo para la solicitud, aprobación, rechazo y recordatorio 15 minutos antes.

El MVP no incluirá:

- Integración directa o automatización con servicios de mensajería instantánea.
- Otros canales de mensajería fuera del correo electrónico.
- Pasarela de pagos.
- Reservas recurrentes.
- Gestión de múltiples auditorios.
- Aplicación móvil nativa.

## 2. Arquitectura del sistema

### 2.1 Diagrama de arquitectura

```text
┌──────────────────────────────────────────────────────────────┐
│                         CLIENTE                              │
│                React + Vite + Tailwind CSS                   │
│                                                              │
│  Vista pública       Vista solicitante       Vista admin      │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTPS
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                         FIREBASE                             │
│                                                              │
│  Firebase Auth     Firestore       Firebase Storage            │
│  (usuarios)        (datos)         (reportes PDF)              │
│                                                              │
│              Firebase Cloud Functions                         │
│       validaciones, correos, PDF y tareas programadas          │
└──────────────────────────────┬───────────────────────────────┘
                               │ SMTP
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    SERVICIO DE CORREO                        │
│              Nodemailer con servidor SMTP                     │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Componentes y responsabilidades

| Componente | Tecnología | Ejecución | Responsabilidad |
| --- | --- | --- | --- |
| Frontend | React 18, Vite y Tailwind CSS | Navegador | Interfaz, rutas, formularios y estado de la sesión |
| Autenticación | Firebase Authentication | Firebase | Registro, inicio de sesión y gestión de sesiones |
| Base de datos | Cloud Firestore | Firebase | Usuarios, reservas, equipamiento y reportes |
| Almacenamiento | Firebase Storage | Firebase | Archivos PDF generados |
| Lógica backend | Firebase Cloud Functions | Firebase | Validaciones críticas, correos, PDF y tareas programadas |
| Correo | Nodemailer y SMTP | Cloud Function | Envío de notificaciones y reportes |
| Programación | Cloud Scheduler / tareas programadas | Firebase | Reporte diario y recordatorios |
| Hosting | Firebase Hosting | Firebase | Publicación del frontend |

### 2.3 Decisiones operativas

- La zona horaria oficial del sistema será `America/La_Paz`.
- La disponibilidad pública mostrará únicamente reservas con estado `approved`.
- La validación definitiva de conflictos se ejecutará en Cloud Functions; la validación del frontend solo mejora la experiencia de uso.
- El correo será el único canal de notificaciones del MVP.
- El primer administrador se creará mediante una operación controlada de inicialización; ningún usuario podrá asignarse el rol `admin` desde el cliente.

## 3. Modelo de datos de Firestore

### 3.1 Colección `users`

```javascript
{
  uid: string,              // ID del usuario en Firebase Auth
  email: string,            // Correo electrónico
  displayName: string,      // Nombre completo
  role: 'admin' | 'user',   // Rol del usuario
  department: string,       // Departamento o facultad
  phone: string,            // Teléfono de contacto
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3.2 Colección `equipment`

```javascript
{
  id: string,
  name: string,             // Proyector, sonido, micrófonos, WiFi, etc.
  icon: string,             // Nombre de icono utilizado por el frontend
  available: boolean,       // Disponibilidad general
  quantity: number,         // Cantidad disponible
  description: string
}
```

### 3.3 Colección `reservations`

```javascript
{
  id: string,
  userId: string,
  userName: string,         // Datos denormalizados para reportes
  userEmail: string,
  eventName: string,
  eventType: 'Académico' | 'Cultural' | 'Administrativo' | 'Externo',
  date: string,             // YYYY-MM-DD
  startTime: string,        // HH:MM
  endTime: string,          // HH:MM
  equipment: [{
    id: string,
    name: string,
    quantity: number
  }],
  attendees: number,
  additionalNotes: string,
  status: 'pending' | 'approved' | 'rejected' | 'cancelled',
  adminNotes: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  approvedAt: timestamp | null,
  rejectedAt: timestamp | null,
  notificationSent: {
    confirmation: boolean,
    reminder: boolean,
    dailyReport: boolean
  }
}
```

### 3.4 Colección `dailyReports`

Esta colección es opcional y sirve para auditoría de los reportes generados.

```javascript
{
  id: string,               // YYYY-MM-DD
  date: string,             // Fecha del reporte
  reservations: string[],   // IDs de reservas incluidas
  pdfUrl: string,           // URL del PDF en Storage
  sentTo: string[],         // Correos de administradores
  createdAt: timestamp
}
```

### 3.5 Consultas e índices

La consulta de disponibilidad filtrará por fecha y estado:

```javascript
query(
  collection(db, 'reservations'),
  where('date', '==', '2026-08-24'),
  where('status', '==', 'approved')
)
```

Se configurarán estos índices compuestos cuando Firestore los solicite:

| Colección | Campos |
| --- | --- |
| `reservations` | `date` ascendente, `status` ascendente |
| `reservations` | `date` ascendente, `status` ascendente, `startTime` ascendente |

## 4. Flujos y casos de uso

### 4.1 Actores

- **Visitante:** consulta la disponibilidad pública y puede iniciar el registro.
- **Solicitante:** crea, consulta y cancela sus propias solicitudes según las reglas del sistema.
- **Administrador:** revisa solicitudes, aprueba o rechaza reservas, administra equipamiento y genera reportes.
- **Tareas programadas:** ejecutan recordatorios y reportes diarios sin intervención manual.

### 4.2 Flujo principal: solicitud de reserva

1. El solicitante inicia sesión.
2. Selecciona fecha, hora de inicio, hora de finalización y datos del evento.
3. Selecciona el equipamiento y las cantidades requeridas.
4. El frontend valida campos obligatorios, rango horario y fecha futura.
5. Cloud Functions verifica nuevamente los datos y busca conflictos con reservas `approved`.
6. Si no existe conflicto, se crea la reserva con estado `pending`.
7. Se envía un correo de confirmación de recepción al solicitante.
8. La solicitud aparece en el panel del administrador.

Una reserva entra en conflicto cuando se cumple lo siguiente:

```text
nuevoInicio < reservaExistenteFin
AND nuevoFin > reservaExistenteInicio
```

### 4.3 Flujo de aprobación o rechazo

1. El administrador abre una solicitud pendiente.
2. Revisa evento, horario, asistentes y equipamiento.
3. Elige **Aprobar** o **Rechazar** y puede agregar una nota.
4. Antes de aprobar, el backend vuelve a comprobar conflictos y disponibilidad de equipamiento.
5. Si aprueba, cambia el estado a `approved`, registra `approvedAt` y envía un correo de confirmación.
6. Si rechaza, cambia el estado a `rejected`, registra `rejectedAt` y envía un correo con la nota.
7. La acción queda registrada mediante `updatedAt`.

### 4.4 Cancelación

- El solicitante puede cancelar una reserva propia que esté `pending` o `approved`, sujeto a la política definida por la institución.
- El administrador puede cancelar cualquier reserva.
- Una reserva cancelada no vuelve a estar disponible para aprobación y conserva su historial.

## 5. Justificación de tecnologías

### 5.1 Frontend

| Tecnología | Decisión | Alternativa descartada | Motivo |
| --- | --- | --- | --- |
| React 18 | Elegida | Angular, Vue.js | Ecosistema maduro y manejo de estado con Hooks |
| Vite | Elegida | Create React App | Desarrollo y HMR más rápidos |
| Tailwind CSS | Elegida | CSS puro, Bootstrap | Personalización rápida y estilos consistentes |
| React Router v6 | Elegida | Next.js | Suficiente para una SPA sin añadir SSR |
| React Hook Form | Elegida | Formik | Menor boilerplate y buen rendimiento en formularios |

### 5.2 Backend e infraestructura

| Tecnología | Decisión | Alternativa descartada | Motivo |
| --- | --- | --- | --- |
| Firebase Authentication | Elegida | Auth0, Supabase | Integración directa con el ecosistema Firebase |
| Firestore | Elegida | MongoDB Atlas, PostgreSQL | Consultas en tiempo real y escalabilidad administrada |
| Firebase Storage | Elegida | Amazon S3 | Integración con Firebase y almacenamiento de reportes |
| Cloud Functions | Elegida | AWS Lambda, Vercel Functions | Validaciones y tareas programadas en el mismo ecosistema |
| Firebase Hosting | Elegida | Vercel, Netlify | Hosting, SSL y despliegue integrados |

### 5.3 Servicios complementarios

| Tecnología | Decisión | Alternativa descartada | Motivo |
| --- | --- | --- | --- |
| Nodemailer + SMTP | Elegida | SendGrid, Mailgun | Suficiente para el volumen esperado y sin acoplar el dominio a un proveedor específico |
| PDFKit | Elegida | jsPDF, Puppeteer | Genera PDF en Node.js sin navegador headless |
| Cloud Scheduler | Elegida | Cron en servidor propio | No requiere infraestructura adicional |

## 6. Notificaciones y reportes

### 6.1 Notificaciones por correo

El MVP utilizará exclusivamente correo electrónico para estas notificaciones:

| Evento | Destinatario | Contenido |
| --- | --- | --- |
| Solicitud creada | Solicitante | Resumen y estado pendiente |
| Reserva aprobada | Solicitante | Confirmación, horario y equipamiento |
| Reserva rechazada | Solicitante | Motivo o nota del administrador |
| Recordatorio | Solicitante | Aviso 15 minutos antes del inicio |
| Reporte diario | Administradores | PDF con las reservas aprobadas del día |

Las credenciales SMTP se almacenarán como secretos de Cloud Functions y nunca se incluirán en el frontend ni en el repositorio.

### 6.2 Reporte diario

La tarea se ejecutará a las 7:00 a. m. de `America/La_Paz`:

1. Obtiene las reservas aprobadas del día.
2. Genera el PDF con PDFKit.
3. Guarda el archivo en `reports/YYYY-MM-DD.pdf` dentro de Storage.
4. Envía el PDF a los correos configurados de los administradores.
5. Guarda la auditoría en `dailyReports` y marca `notificationSent.dailyReport`.

### 6.3 Recordatorio de 15 minutos

Una tarea programada se ejecutará cada cinco minutos. Buscará reservas aprobadas cuyo inicio esté entre 15 y 20 minutos después de la hora actual y cuyo campo `notificationSent.reminder` sea `false`. Después de enviar el correo, actualizará ese campo para evitar duplicados.

```javascript
exports.reminderChecker = functions.pubsub
  .schedule('*/5 * * * *')
  .timeZone('America/La_Paz')
  .onRun(async () => {
    // Buscar reservas aprobadas dentro de la ventana de recordatorio.
    // Enviar el correo y marcar notificationSent.reminder como true.
  });
```

## 7. Estrategia de desarrollo: MVP por sprints

### Sprint 1: configuración y autenticación 

- [ ] Configurar el proyecto Firebase.
- [ ] Configurar React, Vite y Tailwind CSS.
- [ ] Implementar registro, inicio de sesión y cierre de sesión.
- [ ] Crear rutas pública, solicitante y administrador.
- [ ] Crear colecciones y reglas iniciales de Firestore.

### Sprint 2: vista pública y disponibilidad

- [ ] Crear calendario de disponibilidad.
- [ ] Mostrar reservas aprobadas por fecha.
- [ ] Implementar diseño responsive.

### Sprint 3: solicitud de reservas 

- [ ] Crear formulario de evento, horario y equipamiento.
- [ ] Validar fechas, horarios y conflictos en frontend y backend.
- [ ] Guardar solicitudes con estado `pending`.
- [ ] Mostrar estados de éxito y error.

### Sprint 4: panel de administración

- [ ] Mostrar solicitudes pendientes.
- [ ] Mostrar detalle de cada reserva.
- [ ] Implementar aprobación, rechazo y notas administrativas.
- [ ] Implementar CRUD de equipamiento.
- [ ] Implementar historial con filtros.

### Sprint 5: notificaciones y reportes 

- [ ] Configurar Nodemailer y SMTP mediante secretos.
- [ ] Implementar correos de solicitud, aprobación y rechazo.
- [ ] Generar el reporte diario en PDF.
- [ ] Implementar el recordatorio programado.

### Sprint 6: pulido y despliegue 

- [ ] Añadir estados de carga y manejo de errores.
- [ ] Revisar reglas de seguridad.
- [ ] Ejecutar pruebas funcionales.
- [ ] Desplegar en Firebase Hosting.
- [ ] Documentar la ejecución del proyecto.

## 8. Reglas de seguridad de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /users/{userId} {
      allow read: if isAuthenticated() &&
        (request.auth.uid == userId || isAdmin());
      allow create: if isAuthenticated() &&
        request.auth.uid == userId &&
        request.resource.data.role == 'user';
      allow update: if isAuthenticated() &&
        request.auth.uid == userId &&
        request.resource.data.role == resource.data.role;
      allow delete: if isAdmin();
    }

    match /reservations/{reservationId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() &&
        request.resource.data.userId == request.auth.uid &&
        request.resource.data.status == 'pending';
      allow update: if isAdmin() ||
        (isAuthenticated() &&
         request.auth.uid == resource.data.userId &&
         resource.data.status == 'pending');
      allow delete: if isAdmin();
    }

    match /equipment/{equipmentId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /dailyReports/{reportId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

Las validaciones de solapamiento, disponibilidad de equipamiento y transición de estados deben ejecutarse también en Cloud Functions. Las reglas de Firestore controlan acceso, pero no sustituyen la lógica transaccional del backend.

## 9. Plan de QA y pruebas

### 9.1 Validación de horarios

```javascript
describe('Validación de horarios', () => {
  test('rechaza una reserva que se solapa con otra aprobada', async () => {
    // Reserva existente: 10:00-11:00.
    // Nueva reserva: 10:30-10:45.
    // Resultado esperado: rechazo.
  });

  test('permite una reserva en un horario libre', async () => {
    // Reserva existente: 10:00-11:00.
    // Nueva reserva: 11:30-12:30.
    // Resultado esperado: aprobación de la solicitud.
  });

  test('rechaza una reserva cuya fecha ya pasó', async () => {
    // Resultado esperado: error de validación.
  });
});
```

### 9.2 Flujo de autorización

- [ ] Un usuario normal no puede aprobar ni rechazar reservas.
- [ ] Un administrador puede aprobar y rechazar reservas.
- [ ] Un usuario no puede cambiar su propio rol.
- [ ] Al aprobar, se envía un correo al solicitante.
- [ ] Al rechazar, se envía un correo al solicitante.
- [ ] No se puede aprobar una reserva que genere un conflicto nuevo.

### 9.3 Notificaciones y reportes

- [ ] El recordatorio se envía una sola vez 15 minutos antes.
- [ ] El reporte se genera a las 7:00 a. m. en la zona horaria oficial.
- [ ] El PDF contiene todas las reservas aprobadas del día.
- [ ] Un fallo del correo no genera duplicados en el siguiente intento.

## 10. Plan de entrega

### Documentación

- [ ] README con problema, alcance y arquitectura.
- [ ] Justificación de tecnologías.
- [ ] Instrucciones de instalación y ejecución.
- [ ] Variables de entorno requeridas, sin exponer secretos.
- [ ] Credenciales de prueba no productivas.

### Demostración

- Presentación del problema: 1 minuto.
- Explicación de la arquitectura: 2 minutos.
- Demostración de funcionalidades: 5 minutos.
- Explicación de decisiones técnicas: 2 minutos.

### Enlaces de entrega

- [ ] Repositorio de GitHub.
- [ ] Aplicación desplegada en Firebase Hosting.
- [ ] Colección de pruebas de Postman, si se implementan endpoints HTTP.

## 11. Mejoras posteriores al MVP

Estas características quedan fuera del MVP y podrán evaluarse después de validar el flujo principal:

- Modo oscuro.
- Internacionalización español/inglés.
- PWA.
- Dashboard con estadísticas de reservas y uso de equipamiento.
- Exportación de reservas a Google Calendar.

## 12. Resumen de decisiones

| Aspecto | Decisión | Beneficio |
| --- | --- | --- |
| Notificaciones | Correo electrónico con Nodemailer y SMTP | Canal único, trazable y suficiente para el MVP |
| Reporte diario | PDF generado y enviado automáticamente | Facilita la coordinación del personal del auditorio |
| Equipamiento | Gestión de cantidades dentro de cada reserva | Evita solicitudes que superen la disponibilidad |
| Roles | Solicitante y administrador | Permite control de acceso y aprobación |
| Mensajería instantánea | Fuera del MVP | Mantiene el alcance enfocado y reduce dependencias externas |
