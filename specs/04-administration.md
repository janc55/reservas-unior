# Especificación 04: Administración de reservas

## Objetivo

Dar al administrador una vista para revisar solicitudes y decidir su aprobación o rechazo.

## Requisitos

- Listar solicitudes `pending` y permitir filtros por fecha, estado y tipo de evento.
- Mostrar detalle completo de una reserva.
- Aprobar una solicitud con una nota opcional.
- Rechazar una solicitud con motivo recomendado.
- Cancelar una reserva desde administración.
- Antes de aprobar, ejecutar una transacción o validación backend que compruebe horario y equipamiento.
- Registrar `approvedAt`, `rejectedAt` y `updatedAt` según la acción.

## Criterios de aceptación

- Un usuario normal no puede aprobar, rechazar ni modificar reservas ajenas.
- Una aprobación con conflicto nuevo falla sin cambiar el estado.
- Una aprobación cambia el estado a `approved` y dispara la notificación correspondiente.
- Un rechazo cambia el estado a `rejected` y conserva la nota administrativa.
- Las acciones muestran confirmación o error al administrador.
