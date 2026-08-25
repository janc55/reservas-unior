# Especificación 06: Notificaciones y reportes

## Objetivo

Enviar correos trazables y generar el reporte diario de reservas aprobadas.

## Canal

El único canal del MVP será correo electrónico mediante Nodemailer y un servidor SMTP. Los datos SMTP se configurarán como secretos del entorno de Cloud Functions.

## Requisitos de correo

- Enviar confirmación al crear una solicitud.
- Enviar aprobación o rechazo al finalizar la revisión administrativa.
- Enviar recordatorio 15 minutos antes del inicio.
- Registrar los indicadores `notificationSent.confirmation` y `notificationSent.reminder`.
- Reintentar errores transitorios sin enviar duplicados.

## Reporte diario

A las 7:00 a. m. de `America/La_Paz`:

1. Consultar reservas `approved` del día.
2. Generar un PDF con evento, horario, solicitante y equipamiento.
3. Guardarlo en Storage como `reports/YYYY-MM-DD.pdf`.
4. Enviarlo a los correos configurados de administradores.
5. Registrar la auditoría en `dailyReports` y marcar `notificationSent.dailyReport`.

## Criterios de aceptación

- Un correo de aprobación contiene fecha, horario y equipamiento.
- El recordatorio se envía una sola vez por reserva.
- El reporte no incluye reservas canceladas, rechazadas o pendientes.
- Una ejecución repetida del reporte no crea auditorías duplicadas para la misma fecha sin una decisión explícita de reintento.
- Un error de generación o envío queda registrado para diagnóstico.
