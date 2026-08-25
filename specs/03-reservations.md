# Especificación 03: Solicitudes y cancelaciones

## Objetivo

Permitir que un solicitante cree y consulte solicitudes de reserva, con validación de negocio en frontend y backend.

## Requisitos

- Crear reservas con estado inicial `pending`.
- Capturar evento, tipo, fecha, hora de inicio, hora de fin, asistentes, notas y equipamiento.
- Rechazar fechas pasadas, horas inválidas y rangos donde inicio no sea menor que fin.
- Rechazar cantidades de equipamiento menores que uno o superiores a la disponibilidad.
- Detectar solapamiento con reservas `approved` mediante:

```text
nuevoInicio < reservaExistenteFin
AND nuevoFin > reservaExistenteInicio
```

- Permitir al solicitante ver solo sus reservas.
- Permitir cancelar reservas propias `pending` o `approved`, según la política institucional configurada.

## Criterios de aceptación

- Una solicitud válida se guarda con `status: pending` y timestamps.
- Una solicitud solapada no se guarda como aprobada ni puede saltarse la validación backend.
- La reserva guarda una copia del nombre y correo del solicitante para reportes.
- La cancelación cambia el estado a `cancelled` y conserva el historial.
- El doble envío del formulario no crea solicitudes duplicadas.
