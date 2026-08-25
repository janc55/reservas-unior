# Especificación 07: Seguridad y QA

## Objetivo

Verificar que el sistema aplique autorización, valide las reglas de negocio y pueda ejecutarse reproduciblemente con `pnpm`.

## Seguridad

- `users`: el usuario puede leer y actualizar su perfil sin modificar su rol; los administradores pueden administrar perfiles.
- `reservations`: el solicitante crea sus propias solicitudes; el administrador gestiona cualquier reserva; la lectura pública no expone datos personales.
- `equipment`: lectura pública y escritura solo para administradores.
- `dailyReports`: lectura y escritura solo para administradores o funciones autorizadas.
- Los secretos SMTP y credenciales de servicio no llegan al navegador.

## Pruebas mínimas

- Registro, login, logout y rutas protegidas.
- Usuario normal sin permisos administrativos.
- Usuario incapaz de cambiar su rol.
- Solapamiento de `10:00-11:00` con `10:30-10:45`: rechazar.
- Intervalos adyacentes `10:00-11:00` y `11:00-12:00`: permitir.
- Fecha pasada: rechazar.
- Aprobación con conflicto nuevo: rechazar.
- Recordatorio idempotente.
- Reporte con todas las reservas aprobadas del día.
- Reglas de Firestore con Emulator Suite cuando esté configurada.

## Validación local

```bash
pnpm install
pnpm lint
pnpm test
pnpm build
```

Los comandos que no estén disponibles todavía deben declararse como scripts pendientes en `package.json`, no sustituirse por comandos de otro gestor.
